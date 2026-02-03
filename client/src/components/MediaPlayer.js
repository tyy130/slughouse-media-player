import React, { useState, useRef, useEffect } from 'react';
import './MediaPlayer.css';

function MediaPlayer({ tracks, onLoginClick, apiUrl }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (isRepeat) {
      setCurrentTrackIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else if (isRepeat) {
      setCurrentTrackIndex(tracks.length - 1);
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
    if (isRepeat && !isShuffle) {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setCurrentTrackIndex(0);
      }
    } else if (isShuffle) {
      handleNext();
    } else if (currentTrackIndex < tracks.length - 1) {
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

      <div className="playback-bar">
        <div className="playback-left">
          <span className="playback-status">
            SHUFFLE {isShuffle ? 'ON' : 'OFF'} · REPEAT {isRepeat ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="playback-center">
          <div className="playback-controls">
            <button 
              className={`pb-icon-btn ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
            </button>
            <button className="pb-icon-btn" onClick={handlePrevious}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20L9 12l10-8v16zM5 19V5"/></svg>
            </button>
            <button className="pb-play-btn" onClick={togglePlayPause}>
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft: '4px'}}><path d="M5 3l14 9-14 9V3z"/></svg>
              )}
            </button>
            <button className="pb-icon-btn" onClick={handleNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4l10 8-10 8V4zM19 5v14"/></svg>
            </button>
            <button 
              className={`pb-icon-btn ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
            </button>
          </div>

          <div className="playback-progress">
            <span className="pb-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="pb-range"
            />
            <span className="pb-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="playback-right">
          <button className="pb-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
          </button>
          <div className="volume-control">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="pb-volume-range"
            />
          </div>
          <div className="web-address">
            <span className="address-text">PLAYBACK.SLUGHOUSE.COM</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="external-icon"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            <span className="brand-msg">KEEP IT CLOSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaPlayer;
