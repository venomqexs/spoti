import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, MessageCircle, Shield, Music } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  return (
    <div className="w-64 bg-spotify-black border-r border-spotify-gray h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Music className="h-8 w-8 text-spotify-green" />
          <span className="text-xl font-bold">Spotify Clone</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-spotify-dark-gray text-white'
                    : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray'
                }`
              }
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-spotify-dark-gray text-white'
                    : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray'
                }`
              }
            >
              <Search className="h-5 w-5" />
              <span className="font-medium">Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-spotify-dark-gray text-white'
                    : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray'
                }`
              }
            >
              <Library className="h-5 w-5" />
              <span className="font-medium">Your Library</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chatroom"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-spotify-dark-gray text-white'
                    : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray'
                }`
              }
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Chatroom</span>
            </NavLink>
          </li>
          {user.role === 'admin' && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-spotify-dark-gray text-white'
                      : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray'
                  }`
                }
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Dashboard</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Premium Upgrade */}
        {user.role === 'user' && (
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-gray-200 mb-3">Get unlimited playlists and ad-free experience</p>
            <button className="w-full bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-gray-100 transition-colors duration-200">
              Upgrade Now
            </button>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-spotify-gray">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-spotify-green rounded-full flex items-center justify-center">
            <span className="text-black font-semibold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.username}</p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-spotify-light-gray capitalize">{user.role}</span>
              {user.role === 'premium' && (
                <span className="premium-badge text-xs">PREMIUM</span>
              )}
              {user.role === 'admin' && (
                <span className="admin-badge">ADMIN</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-3 text-sm text-spotify-light-gray hover:text-white transition-colors duration-200"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;