import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Music, Shield, Trash2, Ban, Crown } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      setUsers([
        {
          id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          role: 'user',
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        },
        {
          id: '2',
          username: 'premium_user',
          email: 'premium@example.com',
          role: 'premium',
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      ]);

      setMessages([
        {
          id: '1',
          username: 'john_doe',
          message: 'Great music selection!',
          timestamp: new Date().toISOString()
        }
      ]);

      setPlaylists([
        {
          id: '1',
          name: 'My Favorites',
          owner: 'john_doe',
          song_count: 25,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      // API call to change user role
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Failed to change user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // API call to delete user
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // API call to delete message
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        // API call to delete playlist
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      } catch (error) {
        console.error('Failed to delete playlist:', error);
      }
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Chat Messages', icon: MessageSquare },
    { id: 'playlists', label: 'Playlists', icon: Music }
  ];

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <div className="text-sm text-spotify-light-gray">
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-spotify-dark-gray rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-spotify-gray font-semibold text-spotify-light-gray text-sm">
          <div>Username</div>
          <div>Email</div>
          <div>Role</div>
          <div>Created</div>
          <div>Last Active</div>
          <div>Actions</div>
        </div>

        {users.map((userData) => (
          <div key={userData.id} className="grid grid-cols-6 gap-4 p-4 border-b border-spotify-gray hover:bg-spotify-gray transition-colors duration-200">
            <div className="text-white font-medium">{userData.username}</div>
            <div className="text-spotify-light-gray text-sm">{userData.email}</div>
            <div>
              <select
                value={userData.role}
                onChange={(e) => handleUserRoleChange(userData.id, e.target.value)}
                className="bg-spotify-black border border-spotify-gray rounded px-2 py-1 text-white text-sm"
              >
                <option value="user">User</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="text-spotify-light-gray text-sm">
              {new Date(userData.created_at).toLocaleDateString()}
            </div>
            <div className="text-spotify-light-gray text-sm">
              {new Date(userData.last_active).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUserRoleChange(userData.id, 'premium')}
                className="p-1 hover:bg-spotify-green hover:text-black rounded transition-colors duration-200"
                title="Make Premium"
              >
                <Crown className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteUser(userData.id)}
                className="p-1 hover:bg-red-500 rounded transition-colors duration-200"
                title="Delete User"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chat Moderation</h2>
        <div className="text-sm text-spotify-light-gray">
          Total Messages: {messages.length}
        </div>
      </div>

      <div className="bg-spotify-dark-gray rounded-lg">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-spotify-light-gray">
            No messages to moderate
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start justify-between p-3 bg-spotify-black rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white">{message.username}</span>
                    <span className="text-spotify-light-gray text-xs">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white">{message.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-2 hover:bg-red-500 rounded transition-colors duration-200 ml-4"
                  title="Delete Message"
                >
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaylists = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Playlist Management</h2>
        <div className="text-sm text-spotify-light-gray">
          Total Playlists: {playlists.length}
        </div>
      </div>

      <div className="bg-spotify-dark-gray rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-spotify-gray font-semibold text-spotify-light-gray text-sm">
          <div>Name</div>
          <div>Owner</div>
          <div>Songs</div>
          <div>Created</div>
          <div>Actions</div>
        </div>

        {playlists.map((playlist) => (
          <div key={playlist.id} className="grid grid-cols-5 gap-4 p-4 border-b border-spotify-gray hover:bg-spotify-gray transition-colors duration-200">
            <div className="text-white font-medium">{playlist.name}</div>
            <div className="text-spotify-light-gray">{playlist.owner}</div>
            <div className="text-spotify-light-gray">{playlist.song_count}</div>
            <div className="text-spotify-light-gray text-sm">
              {new Date(playlist.created_at).toLocaleDateString()}
            </div>
            <div>
              <button
                onClick={() => handleDeletePlaylist(playlist.id)}
                className="p-1 hover:bg-red-500 rounded transition-colors duration-200"
                title="Delete Playlist"
              >
                <Trash2 className="h-4 w-4 text-red-400 hover:text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-spotify-green" />
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-spotify-light-gray">Manage users, moderate content, and oversee platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-medium">Total Users</h3>
              <p className="text-white text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-100 text-sm font-medium">Chat Messages</h3>
              <p className="text-white text-2xl font-bold">{messages.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-sm font-medium">Total Playlists</h3>
              <p className="text-white text-2xl font-bold">{playlists.length}</p>
            </div>
            <Music className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-spotify-gray mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-4 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-spotify-green'
                  : 'text-spotify-light-gray hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'playlists' && renderPlaylists()}
      </div>
    </div>
  );
};

export default AdminDashboard;