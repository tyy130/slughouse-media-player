const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs').promises;
const fsSync = require('fs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db');
const authMiddleware = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Create upload directories if they don't exist
const uploadDirs = ['uploads/tracks', 'uploads/artwork'];
uploadDirs.forEach(dir => {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
});

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.'
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit uploads to 20 per hour
  message: 'Too many uploads, please try again later.'
});

// Middleware
app.use(cors({
  origin: ['https://tyy130.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/', generalLimiter); // Apply rate limiting to all API routes

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = file.fieldname === 'track' ? 'uploads/tracks/' : 'uploads/artwork/';
    console.log(`Multer: Uploading ${file.originalname} to ${dest}`);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'track') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for tracks'), false);
    }
  } else if (file.fieldname === 'artwork') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for artwork'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

app.get('/api/health', generalLimiter, async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', version: '1.0.1' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Public routes - Get all tracks
app.get('/api/tracks', generalLimiter, async (req, res) => {
  try {
    const [tracks] = await db.query('SELECT * FROM tracks ORDER BY track_order ASC, created_at DESC');
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Admin login
app.post('/api/admin/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [users] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected admin routes
app.post('/api/admin/tracks', authMiddleware, uploadLimiter, generalLimiter, upload.fields([
  { name: 'track', maxCount: 1 },
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    const trackFile = req.files['track'] ? req.files['track'][0] : null;
    const artworkFile = req.files['artwork'] ? req.files['artwork'][0] : null;
    
    if (!trackFile) {
      return res.status(400).json({ error: 'Track file is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO tracks (title, artist, album, duration, file_path, artwork_path) VALUES (?, ?, ?, ?, ?, ?)',
      [title, artist, album || null, duration || null, trackFile.path, artworkFile ? artworkFile.path : null]
    );
    
    res.json({ id: result.insertId, message: 'Track uploaded successfully' });
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
});

app.put('/api/admin/tracks/:id', authMiddleware, generalLimiter, upload.fields([
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, album, duration } = req.body;
    const artworkFile = req.files && req.files['artwork'] ? req.files['artwork'][0] : null;
    
    // Get existing track to delete old artwork if new one is uploaded
    const [existingTracks] = await db.query('SELECT artwork_path FROM tracks WHERE id = ?', [id]);
    
    if (existingTracks.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    let query = 'UPDATE tracks SET title = ?, artist = ?, album = ?, duration = ?';
    let params = [title, artist, album || null, duration || null];
    
    if (artworkFile) {
      // Delete old artwork if it exists
      if (existingTracks[0].artwork_path) {
        try {
          await fs.access(existingTracks[0].artwork_path);
          await fs.unlink(existingTracks[0].artwork_path);
        } catch (err) {
          // File doesn't exist, ignore error
        }
      }
      query += ', artwork_path = ?';
      params.push(artworkFile.path);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.query(query, params);
    
    res.json({ message: 'Track updated successfully' });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ error: `Update failed: ${error.message}` });
  }
});

app.delete('/api/admin/tracks/:id', authMiddleware, generalLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get track to delete files
    const [tracks] = await db.query('SELECT file_path, artwork_path FROM tracks WHERE id = ?', [id]);
    
    if (tracks.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    const track = tracks[0];
    
    // Delete files asynchronously
    const deletePromises = [];
    if (track.file_path) {
      deletePromises.push(
        fs.access(track.file_path)
          .then(() => fs.unlink(track.file_path))
          .catch(() => {}) // Ignore if file doesn't exist
      );
    }
    if (track.artwork_path) {
      deletePromises.push(
        fs.access(track.artwork_path)
          .then(() => fs.unlink(track.artwork_path))
          .catch(() => {}) // Ignore if file doesn't exist
      );
    }
    
    await Promise.all(deletePromises);
    
    // Delete from database
    await db.query('DELETE FROM tracks WHERE id = ?', [id]);
    
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

app.put('/api/admin/tracks/reorder', authMiddleware, generalLimiter, async (req, res) => {
  try {
    const { tracks } = req.body;
    
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    
    // Update track orders
    for (let i = 0; i < tracks.length; i++) {
      await db.query('UPDATE tracks SET track_order = ? WHERE id = ?', [i, tracks[i].id]);
    }
    
    res.json({ message: 'Tracks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tracks:', error);
    res.status(500).json({ error: 'Failed to reorder tracks' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', generalLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  console.error('Server error:', err);
  res.status(500).json({ error: `Server error: ${err.message || 'Internal Server Error'}` });
});

// Test database connection and start server
const startServer = async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('CRITICAL: Database connection failed. Server not started.');
    console.error(err);
    // Exit if in production, or just log in dev
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      // Still start server in dev to allow debugging via API
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (WARNING: DB disconnected)`);
      });
    }
  }
};

startServer();
