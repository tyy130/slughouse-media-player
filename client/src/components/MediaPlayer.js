import React, { useState, useRef, useEffect } from 'react';
import './MediaPlayer.css';

function MediaPlayer({ tracks, onLoginClick, apiUrl }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, currentTrack]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="media-player">
        <div className="no-tracks">No tracks available</div>
        <button onClick={onLoginClick} className="admin-link">
          Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="media-player">
      <div className="player-container">
        <div className="artwork-container">
          {currentTrack.artwork_path ? (
            <img 
              src={`${apiUrl}/${currentTrack.artwork_path}`} 
              alt={currentTrack.title}
              className="artwork"
            />
          ) : (
            <div className="artwork-placeholder">
              <span>♫</span>
            </div>
          )}
        </div>

        <div className="track-info">
          <h2>{currentTrack.title}</h2>
          <h3>{currentTrack.artist}</h3>
          {currentTrack.album && <p className="album">{currentTrack.album}</p>}
        </div>

        <div className="controls">
          <button 
            onClick={handlePrevious} 
            disabled={currentTrackIndex === 0}
            className="control-btn"
          >
            ⏮
          </button>
          <button onClick={togglePlayPause} className="control-btn play-btn">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={handleNext} 
            disabled={currentTrackIndex === tracks.length - 1}
            className="control-btn"
          >
            ⏭
          </button>
        </div>

        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.file_path ? `${apiUrl}/${currentTrack.file_path}` : ''}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnd}
        />
      </div>

      <div className="playlist">
        <h3>Playlist</h3>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`playlist-item ${index === currentTrackIndex ? 'active' : ''}`}
            onClick={() => setCurrentTrackIndex(index)}
          >
            <span className="track-number">{index + 1}</span>
            <div className="track-details">
              <div className="track-title">{track.title}</div>
              <div className="track-artist">{track.artist}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onLoginClick} className="admin-link">
        Admin Login
      </button>
    </div>
  );
}

export default MediaPlayer;
