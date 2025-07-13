import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, MessageCircle, Shield, Music2, Crown, Sparkles } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  return (
    <div className="w-72 bg-foxenfy-black border-r border-foxenfy-gray-800 h-screen flex flex-col relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-foxenfy-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-foxenfy-secondary opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 p-6 border-b border-foxenfy-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-foxenfy-primary opacity-20 rounded-2xl blur-lg"></div>
            <Music2 className="relative h-10 w-10 text-foxenfy-primary" />
          </div>
          <div>
            <span className="text-2xl font-foxenfy-display font-bold bg-gradient-to-r from-foxenfy-primary to-foxenfy-accent bg-clip-text text-transparent">
              Foxenfy
            </span>
            <div className="text-xs text-foxenfy-gray-400 font-medium tracking-widest uppercase">
              Premium Music
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
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
                `nav-link ${isActive ? 'active' : ''}`
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
                `nav-link ${isActive ? 'active' : ''}`
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
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Community</span>
              <span className="ml-auto bg-foxenfy-primary text-xs text-white px-2 py-1 rounded-full">
                Live
              </span>
            </NavLink>
          </li>
          {user.role === 'admin' && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Panel</span>
                <span className="ml-auto admin-badge text-xs">ADMIN</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Premium Upgrade Section */}
        {user.role === 'user' && (
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foxenfy-primary via-foxenfy-accent to-foxenfy-secondary p-6 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <Crown className="h-6 w-6" />
                  <span className="font-bold text-lg">Go Premium</span>
                </div>
                <p className="text-sm text-white text-opacity-90 mb-4 leading-relaxed">
                  Unlock unlimited playlists, ad-free listening, and exclusive features
                </p>
                <button className="w-full bg-white text-foxenfy-primary font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Features Showcase */}
        {user.role === 'premium' && (
          <div className="mt-8">
            <div className="bg-foxenfy-gray-900 border border-foxenfy-gray-700 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">Premium Active</span>
              </div>
              <div className="space-y-2 text-sm text-foxenfy-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Unlimited playlists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>High-quality audio</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="relative z-10 p-6 border-t border-foxenfy-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-foxenfy-primary to-foxenfy-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {user.role === 'premium' && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="h-2.5 w-2.5 text-yellow-900" />
              </div>
            )}
            {user.role === 'admin' && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <Shield className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{user.username}</p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-foxenfy-gray-400 capitalize">{user.role}</span>
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
          className="w-full mt-4 text-sm text-foxenfy-gray-400 hover:text-white transition-colors duration-200 text-left"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;