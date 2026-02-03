import React, { useState, useEffect } from 'react';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import MediaPlayer from './components/MediaPlayer';
import AdminPanel from './components/AdminPanel';

// Use environment variable if present, otherwise default to playback.slughouse.com for prod
const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://playback.slughouse.com');

function App() {
  const [tracks, setTracks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setIsAdmin(true);
    }
    fetchTracks();
  }, [token]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tracks`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SLUGHOUSE RECORDS</h1>
        {isAdmin && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>
      
      {!isAdmin ? (
        <MediaPlayer tracks={tracks} onLoginClick={() => setIsAdmin(true)} apiUrl={API_URL} />
      ) : (
        <AdminPanel 
          token={token} 
          onLogin={handleLogin}
          onLogout={handleLogout}
          onTracksUpdate={fetchTracks}
          apiUrl={API_URL}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
