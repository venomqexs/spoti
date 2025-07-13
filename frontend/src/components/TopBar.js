import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Settings, Crown, Bell } from 'lucide-react';

const TopBar = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="h-20 bg-foxenfy-black bg-opacity-80 backdrop-blur-xl border-b border-foxenfy-gray-800 flex items-center justify-between px-8 relative z-30">
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="h-10 w-10 bg-foxenfy-gray-800 hover:bg-foxenfy-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="h-5 w-5 text-foxenfy-gray-300" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="h-10 w-10 bg-foxenfy-gray-800 hover:bg-foxenfy-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <ChevronRight className="h-5 w-5 text-foxenfy-gray-300" />
        </button>
      </div>

      {/* Center Content - Could be search or title */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="music-visualizer">
            <div className="music-bar"></div>
            <div className="music-bar"></div>
            <div className="music-bar"></div>
            <div className="music-bar"></div>
            <div className="music-bar"></div>
          </div>
          <span className="text-foxenfy-gray-400 text-sm font-medium">Now Playing</span>
        </div>
      </div>

      {/* Right Side - User Actions */}
      <div className="flex items-center space-x-4">
        {/* Premium Upgrade for regular users */}
        {user.role === 'user' && (
          <button className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>Upgrade</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-10 w-10 bg-foxenfy-gray-800 hover:bg-foxenfy-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 relative"
          >
            <Bell className="h-5 w-5 text-foxenfy-gray-300" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-foxenfy-primary rounded-full"></div>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-foxenfy-gray-900 rounded-xl shadow-smooth-lg border border-foxenfy-gray-700 z-50 animate-fade-in-scale">
              <div className="p-4 border-b border-foxenfy-gray-700">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                <div className="flex space-x-3">
                  <div className="h-2 w-2 bg-foxenfy-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-white">Welcome to Foxenfy!</p>
                    <p className="text-xs text-foxenfy-gray-400">Start exploring your favorite music</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-2 w-2 bg-foxenfy-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foxenfy-gray-300">New features available</p>
                    <p className="text-xs text-foxenfy-gray-400">Check out the latest updates</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-foxenfy-gray-700">
                <button className="text-sm text-foxenfy-primary hover:text-foxenfy-accent transition-colors duration-200">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 bg-foxenfy-gray-800 hover:bg-foxenfy-gray-700 rounded-full px-3 py-2 transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <div className="h-8 w-8 bg-gradient-to-br from-foxenfy-primary to-foxenfy-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {user.role === 'premium' && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-2 w-2 text-yellow-900" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-white hidden md:block">{user.username}</span>
            <ChevronRight className="h-4 w-4 text-foxenfy-gray-400 transform transition-transform duration-200" />
          </button>
          
          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-foxenfy-gray-900 rounded-xl shadow-smooth-lg border border-foxenfy-gray-700 z-50 animate-fade-in-scale">
              <div className="p-4 border-b border-foxenfy-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-12 w-12 bg-gradient-to-br from-foxenfy-primary to-foxenfy-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {user.role === 'premium' && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-sm text-foxenfy-gray-400 capitalize">{user.role} Account</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-foxenfy-gray-300 hover:text-white hover:bg-foxenfy-gray-800 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-foxenfy-gray-300 hover:text-white hover:bg-foxenfy-gray-800 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </button>
                {user.role === 'user' && (
                  <button className="w-full text-left px-3 py-2 text-sm text-foxenfy-gray-300 hover:text-white hover:bg-foxenfy-gray-800 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Premium</span>
                  </button>
                )}
              </div>
              
              <div className="p-2 border-t border-foxenfy-gray-700">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default TopBar;