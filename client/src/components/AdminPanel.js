import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ token, onLogin, onLogout, onTracksUpdate, apiUrl }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tracks, setTracks] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [trackFile, setTrackFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchTracks();
    }
  }, [token]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tracks`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
        setIsLoggedIn(true);
        fetchTracks();
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    if (trackFile) formData.append('track', trackFile);
    if (artworkFile) formData.append('artwork', artworkFile);

    try {
      const response = await fetch(`${apiUrl}/api/admin/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        resetForm();
        setShowUploadForm(false);
        fetchTracks();
        onTracksUpdate();
      } else {
        setError('Failed to upload track');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    if (artworkFile) formData.append('artwork', artworkFile);

    try {
      const response = await fetch(`${apiUrl}/api/admin/tracks/${editingTrack.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        resetForm();
        setEditingTrack(null);
        fetchTracks();
        onTracksUpdate();
      } else {
        setError('Failed to update track');
      }
    } catch (error) {
      setError('Update failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/admin/tracks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTracks();
        onTracksUpdate();
      } else {
        setError('Failed to delete track');
      }
    } catch (error) {
      setError('Delete failed. Please try again.');
    }
  };

  const moveTrack = async (index, direction) => {
    const newTracks = [...tracks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newTracks.length) return;
    
    [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];

    try {
      const response = await fetch(`${apiUrl}/api/admin/tracks/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracks: newTracks }),
      });

      if (response.ok) {
        setTracks(newTracks);
        onTracksUpdate();
      }
    } catch (error) {
      setError('Failed to reorder tracks');
    }
  };

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setTrackFile(null);
    setArtworkFile(null);
  };

  const startEdit = (track) => {
    setEditingTrack(track);
    setTitle(track.title);
    setArtist(track.artist);
    setAlbum(track.album || '');
    setShowUploadForm(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-panel">
        <div className="login-form">
          <h2>Admin Login</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <p className="default-creds">Default credentials: admin / admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Track Management</h2>
        <button 
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            setEditingTrack(null);
            resetForm();
          }}
          className="add-btn"
        >
          {showUploadForm ? 'Cancel' : '+ Add Track'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showUploadForm && (
        <div className="upload-form">
          <h3>Upload New Track</h3>
          <form onSubmit={handleUpload}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Album (optional)"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
            />
            <div className="file-input">
              <label>
                Audio File *
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setTrackFile(e.target.files[0])}
                  required
                />
              </label>
            </div>
            <div className="file-input">
              <label>
                Artwork (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtworkFile(e.target.files[0])}
                />
              </label>
            </div>
            <button type="submit">Upload Track</button>
          </form>
        </div>
      )}

      {editingTrack && (
        <div className="upload-form">
          <h3>Edit Track</h3>
          <form onSubmit={handleEdit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Album (optional)"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
            />
            <div className="file-input">
              <label>
                New Artwork (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtworkFile(e.target.files[0])}
                />
              </label>
            </div>
            <div className="form-buttons">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => {
                setEditingTrack(null);
                resetForm();
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tracks-list">
        <h3>All Tracks</h3>
        {tracks.length === 0 ? (
          <p className="no-tracks">No tracks uploaded yet</p>
        ) : (
          tracks.map((track, index) => (
            <div key={track.id} className="track-item">
              <div className="track-order-controls">
                <button 
                  onClick={() => moveTrack(index, 'up')}
                  disabled={index === 0}
                  className="order-btn"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveTrack(index, 'down')}
                  disabled={index === tracks.length - 1}
                  className="order-btn"
                >
                  ▼
                </button>
              </div>
              <div className="track-info-admin">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
                {track.album && <div className="track-album">{track.album}</div>}
              </div>
              <div className="track-actions">
                <button onClick={() => startEdit(track)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(track.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
