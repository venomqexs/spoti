import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

const TopBar = ({ user, onLogout }) => {
  return (
    <div className="h-16 bg-spotify-dark-gray bg-opacity-80 backdrop-blur-sm border-b border-spotify-gray flex items-center justify-between px-6">
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="h-8 w-8 bg-spotify-black bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="h-8 w-8 bg-spotify-black bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        {user.role === 'user' && (
          <button className="btn-secondary text-sm">
            Upgrade to Premium
          </button>
        )}
        
        <div className="relative group">
          <button className="flex items-center space-x-2 bg-spotify-black bg-opacity-70 hover:bg-opacity-100 rounded-full px-3 py-1 transition-all duration-200">
            <div className="h-6 w-6 bg-spotify-green rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-medium">{user.username}</span>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-spotify-dark-gray rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-spotify-light-gray border-b border-spotify-gray">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-xs capitalize">{user.role} Account</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-spotify-light-gray hover:text-white hover:bg-spotify-gray transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;