import React, { useState, useEffect } from 'react';
import { Plus, Music, Heart, Clock, Play, MoreHorizontal } from 'lucide-react';

const Library = ({ user, onPlaySong }) => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading user's library data
    setPlaylists([
      {
        id: '1',
        name: 'My Favorites',
        description: 'Songs I love the most',
        songCount: 25,
        thumbnail: 'https://via.placeholder.com/150x150/1DB954/FFFFFF?text=Fav',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Workout Mix',
        description: 'High energy songs for workouts',
        songCount: 18,
        thumbnail: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Gym',
        created_at: new Date().toISOString()
      }
    ]);

    setLikedSongs([
      {
        id: '1',
        title: 'Liked Song 1',
        artist: 'Popular Artist',
        thumbnail: 'https://via.placeholder.com/150x150/1DB954/FFFFFF?text=Music',
        duration: '3:45'
      }
    ]);

    setRecentlyPlayed([
      {
        id: '1',
        title: 'Recent Song 1',
        artist: 'Recent Artist',
        thumbnail: 'https://via.placeholder.com/150x150/1DB954/FFFFFF?text=Music',
        duration: '4:20',
        played_at: new Date().toISOString()
      }
    ]);
  }, []);

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: Music },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'recent', label: 'Recently Played', icon: Clock }
  ];

  const renderPlaylists = () => (
    <div>
      {/* Create Playlist Button */}
      <div className="mb-6">
        <button className="flex items-center space-x-2 bg-spotify-dark-gray hover:bg-spotify-gray rounded-lg p-4 transition-colors duration-200 w-full md:w-auto">
          <Plus className="h-5 w-5 text-spotify-green" />
          <span className="font-medium">Create Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-spotify-dark-gray rounded-lg p-4 hover:bg-spotify-gray transition-colors duration-200 cursor-pointer group"
          >
            <div className="relative mb-4">
              <img
                src={playlist.thumbnail}
                alt={playlist.name}
                className="w-full aspect-square rounded-md object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-spotify-green rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                <Play className="h-4 w-4 text-black fill-current" />
              </button>
            </div>
            <h3 className="font-semibold text-white truncate mb-1">{playlist.name}</h3>
            <p className="text-spotify-light-gray text-sm truncate mb-2">{playlist.description}</p>
            <p className="text-spotify-light-gray text-xs">{playlist.songCount} songs</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLikedSongs = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Liked Songs</h2>
        <p className="text-spotify-light-gray">{likedSongs.length} songs</p>
      </div>

      <div className="space-y-2">
        {likedSongs.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-spotify-dark-gray transition-colors duration-200 group cursor-pointer"
            onClick={() => onPlaySong(song, likedSongs)}
          >
            <div className="w-6 text-center">
              <span className="text-spotify-light-gray text-sm group-hover:hidden">
                {index + 1}
              </span>
              <Play className="h-4 w-4 text-white hidden group-hover:block" />
            </div>

            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 rounded object-cover"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{song.title}</h3>
              <p className="text-spotify-light-gray text-sm truncate">{song.artist}</p>
            </div>

            <div className="text-spotify-light-gray text-sm">
              {song.duration}
            </div>

            <button className="p-2 hover:bg-spotify-gray rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4 text-spotify-light-gray" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecentlyPlayed = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Recently Played</h2>
        <p className="text-spotify-light-gray">Your listening history</p>
      </div>

      <div className="space-y-2">
        {recentlyPlayed.map((song, index) => (
          <div
            key={`${song.id}-${index}`}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-spotify-dark-gray transition-colors duration-200 group cursor-pointer"
            onClick={() => onPlaySong(song)}
          >
            <div className="w-6 text-center">
              <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
            </div>

            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 rounded object-cover"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{song.title}</h3>
              <p className="text-spotify-light-gray text-sm truncate">{song.artist}</p>
            </div>

            <div className="text-spotify-light-gray text-sm">
              {new Date(song.played_at).toLocaleDateString()}
            </div>

            <div className="text-spotify-light-gray text-sm">
              {song.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Your Library</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-6 border-b border-spotify-gray">
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
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'playlists' && renderPlaylists()}
        {activeTab === 'liked' && renderLikedSongs()}
        {activeTab === 'recent' && renderRecentlyPlayed()}
      </div>
    </div>
  );
};

export default Library;