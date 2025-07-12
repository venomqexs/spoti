import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Pages/Home';
import Search from './components/Pages/Search';
import Library from './components/Pages/Library';
import Chatroom from './components/Pages/Chatroom';
import AdminDashboard from './components/Pages/AdminDashboard';
import Player from './components/Player/Player';

// Services
import { authService } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentSong(null);
    setIsPlaying(false);
    setPlaylist([]);
  };

  const playSong = (song, newPlaylist = null) => {
    setCurrentSong(song);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      setCurrentIndex(newPlaylist.findIndex(s => s.id === song.id));
    }
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(playlist[nextIndex]);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(playlist[prevIndex]);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-spotify-black">
          <Routes>
            <Route 
              path="/login" 
              element={<Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={<Register onLogin={handleLogin} />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/login" replace />} 
            />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-spotify-black text-white flex">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col">
          <TopBar user={user} onLogout={handleLogout} />
          
          <main className="flex-1 overflow-auto pb-20">
            <Routes>
              <Route 
                path="/" 
                element={<Home user={user} onPlaySong={playSong} />} 
              />
              <Route 
                path="/search" 
                element={<Search user={user} onPlaySong={playSong} />} 
              />
              <Route 
                path="/library" 
                element={<Library user={user} onPlaySong={playSong} />} 
              />
              <Route 
                path="/chatroom" 
                element={<Chatroom user={user} />} 
              />
              {user.role === 'admin' && (
                <Route 
                  path="/admin" 
                  element={<AdminDashboard user={user} />} 
                />
              )}
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </main>
        </div>

        {currentSong && (
          <Player
            song={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={playNext}
            onPrevious={playPrevious}
            canPlayNext={currentIndex < playlist.length - 1}
            canPlayPrevious={currentIndex > 0}
          />
        )}
      </div>
    </Router>
  );
}

export default App;