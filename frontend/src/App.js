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
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
        showNotification('Welcome back to Foxenfy!', 'success');
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
    showNotification(`Welcome to Foxenfy, ${userData.username}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentSong(null);
    setIsPlaying(false);
    setPlaylist([]);
    showNotification('See you soon!', 'info');
  };

  const playSong = (song, newPlaylist = null) => {
    setCurrentSong(song);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      setCurrentIndex(newPlaylist.findIndex(s => s.id === song.id));
    }
    setIsPlaying(true);
    showNotification(`Now playing: ${song.title}`, 'info');
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

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-foxenfy-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-foxenfy-primary opacity-20 rounded-2xl blur-xl"></div>
            <div className="relative h-16 w-16 mx-auto bg-gradient-to-br from-foxenfy-primary to-foxenfy-accent rounded-2xl flex items-center justify-center">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          </div>
          <h2 className="text-2xl font-foxenfy-display font-bold bg-gradient-to-r from-foxenfy-primary to-foxenfy-accent bg-clip-text text-transparent">
            Foxenfy
          </h2>
          <p className="text-foxenfy-gray-400 text-sm mt-2">Loading your music experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-foxenfy-black">
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
      <div className="min-h-screen bg-foxenfy-black text-white flex overflow-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col">
          <TopBar user={user} onLogout={handleLogout} />
          
          <main className="flex-1 overflow-auto pb-24 bg-gradient-to-b from-foxenfy-black to-foxenfy-dark">
            <Routes>
              <Route 
                path="/" 
                element={<Home user={user} onPlaySong={playSong} showNotification={showNotification} />} 
              />
              <Route 
                path="/search" 
                element={<Search user={user} onPlaySong={playSong} showNotification={showNotification} />} 
              />
              <Route 
                path="/library" 
                element={<Library user={user} onPlaySong={playSong} showNotification={showNotification} />} 
              />
              <Route 
                path="/chatroom" 
                element={<Chatroom user={user} showNotification={showNotification} />} 
              />
              {user.role === 'admin' && (
                <Route 
                  path="/admin" 
                  element={<AdminDashboard user={user} showNotification={showNotification} />} 
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

        {/* Notification System */}
        {notification && (
          <div className={`notification ${notification.type} animate-slide-down`}>
            <div className="flex items-center space-x-3">
              <div className={`h-2 w-2 rounded-full ${
                notification.type === 'success' ? 'bg-green-400' :
                notification.type === 'error' ? 'bg-red-400' : 
                'bg-foxenfy-primary'
              }`}></div>
              <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;