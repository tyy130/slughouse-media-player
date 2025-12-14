import React, { useState, useEffect } from 'react';
import './App.css';
import MediaPlayer from './components/MediaPlayer';
import AdminPanel from './components/AdminPanel';

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
      const response = await fetch('http://localhost:3001/api/tracks');
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
        <MediaPlayer tracks={tracks} onLoginClick={() => setIsAdmin(true)} />
      ) : (
        <AdminPanel 
          token={token} 
          onLogin={handleLogin}
          onLogout={handleLogout}
          onTracksUpdate={fetchTracks}
        />
      )}
    </div>
  );
}

export default App;
