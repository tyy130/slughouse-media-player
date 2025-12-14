# Slughouse Media Player

Slughouse media player to showcase audio projects released by Slughouse Records.

## Features

- 🎵 **Frontend Media Player**: Full-featured audio player with controls, track art, playlist
- 🎨 **Slughouse Theming**: Custom dark theme with brand colors (pink #e94560, dark blues)
- 🔐 **Admin Authentication**: Secure login system for admin access
- 📤 **Track Upload**: Upload audio files with artwork
- ✏️ **Track Management**: Edit track metadata and artwork
- 🔄 **Drag & Reorder**: Rearrange track order
- 💾 **MySQL Database**: Persistent storage for tracks and admin users

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slughouse-media-player
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up MySQL Database**
   
   Create the database and tables:
   ```bash
   mysql -u root -p < schema.sql
   ```

4. **Configure Environment Variables**
   
   **Server configuration:**
   
   Copy the example env file and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=slughouse_media
   DB_PORT=3306
   
   JWT_SECRET=your-secret-key-change-this
   PORT=3001
   ```
   
   **Client configuration (optional):**
   
   For production or custom API URL:
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `client/.env`:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

5. **Create upload directories**
   ```bash
   mkdir -p uploads/tracks uploads/artwork
   ```

### Running the Application

**Development Mode** (runs both server and client):
```bash
npm run dev
```

**Production Mode**:
```bash
# Build the client
npm run build

# Start the server
npm run server
```

The application will be available at:
- Frontend: http://localhost:3000 (development) or http://localhost:3001 (production)
- Backend API: http://localhost:3001

### Default Admin Credentials

- Username: `admin`
- Password: `admin123`

**⚠️ Important**: Change the default admin password in production by updating the database directly or creating a new admin user.

## Project Structure

```
slughouse-media-player/
├── server/
│   ├── index.js       # Express server and API routes
│   ├── db.js          # Database connection
│   └── auth.js        # Authentication middleware
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── MediaPlayer.js    # Frontend media player
│       │   ├── MediaPlayer.css
│       │   ├── AdminPanel.js     # Admin interface
│       │   └── AdminPanel.css
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── uploads/           # Uploaded files (not in git)
│   ├── tracks/
│   └── artwork/
├── schema.sql         # Database schema
├── .env.example       # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Public Endpoints

- `GET /api/tracks` - Get all tracks

### Admin Endpoints (require authentication)

- `POST /api/admin/login` - Admin login
- `POST /api/admin/tracks` - Upload new track
- `PUT /api/admin/tracks/:id` - Update track
- `DELETE /api/admin/tracks/:id` - Delete track
- `PUT /api/admin/tracks/reorder` - Reorder tracks

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL2
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- multer (file uploads)
- cors
- dotenv

### Frontend
- React
- HTML5 Audio API
- CSS3 (custom styling)

## Theme Colors

The Slughouse theme uses:
- Primary: `#e94560` (Pink/Red)
- Background: `#1a1a2e` (Dark blue)
- Secondary: `#16213e` (Navy blue)
- Accent: `#0f3460` (Deep blue)

## Usage Guide

### For Listeners (Public View)

1. Visit the application URL
2. Browse the playlist of available tracks
3. Click on any track to play it
4. Use the media player controls:
   - **Play/Pause**: Toggle playback
   - **Previous/Next**: Navigate between tracks
   - **Progress bar**: Seek to any position in the track
5. View track artwork, title, artist, and album information

### For Admins

1. **Login**:
   - Click "Admin Login" button at the bottom of the player
   - Enter your admin credentials (default: admin/admin123)

2. **Upload New Tracks**:
   - Click "+ Add Track" button
   - Fill in track details (Title, Artist, Album)
   - Select audio file (required)
   - Optionally select artwork image
   - Click "Upload Track"

3. **Edit Tracks**:
   - Click "Edit" button on any track
   - Update track details or replace artwork
   - Click "Save Changes"

4. **Delete Tracks**:
   - Click "Delete" button on any track
   - Confirm deletion (this removes the track and its files permanently)

5. **Reorder Tracks**:
   - Use the ▲ and ▼ buttons next to each track
   - Changes are saved immediately
   - Track order is reflected in the public player

6. **Logout**:
   - Click "Logout" button in the header to return to public view

## Security

See [SECURITY.md](SECURITY.md) for detailed security information including:
- Authentication & authorization
- Rate limiting
- File upload security
- Input validation
- Production recommendations

## License

ISC
 
