import React from 'react';
import { Play, Music, Clock } from 'lucide-react';

const Home = ({ user, onPlaySong }) => {
  // Mock data for demonstration
  const recentlyPlayed = [
    {
      id: '1',
      title: 'Sample Song 1',
      artist: 'Sample Artist',
      thumbnail: 'https://via.placeholder.com/150x150/1DB954/FFFFFF?text=Music',
      duration: '3:45'
    },
    {
      id: '2', 
      title: 'Sample Song 2',
      artist: 'Another Artist',
      thumbnail: 'https://via.placeholder.com/150x150/1DB954/FFFFFF?text=Music',
      duration: '4:20'
    }
  ];

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.username}!
        </h1>
        <p className="text-spotify-light-gray">Welcome to your music streaming experience</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 hover-lift cursor-pointer">
          <div className="flex items-center space-x-4">
            <Music className="h-12 w-12 text-white" />
            <div>
              <h3 className="text-white font-semibold">Discover Music</h3>
              <p className="text-blue-100 text-sm">Find your next favorite song</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-6 hover-lift cursor-pointer">
          <div className="flex items-center space-x-4">
            <Play className="h-12 w-12 text-white" />
            <div>
              <h3 className="text-white font-semibold">Your Playlists</h3>
              <p className="text-green-100 text-sm">Access your saved music</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-red-600 rounded-lg p-6 hover-lift cursor-pointer">
          <div className="flex items-center space-x-4">
            <Clock className="h-12 w-12 text-white" />
            <div>
              <h3 className="text-white font-semibold">Recently Played</h3>
              <p className="text-pink-100 text-sm">Continue where you left off</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Played Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyPlayed.map((song) => (
            <div
              key={song.id}
              className="bg-spotify-dark-gray rounded-lg p-4 hover:bg-spotify-gray transition-colors duration-200 cursor-pointer group"
              onClick={() => onPlaySong(song)}
            >
              <div className="relative mb-3">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full aspect-square rounded-md object-cover"
                />
                <button className="absolute bottom-2 right-2 bg-spotify-green rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                  <Play className="h-4 w-4 text-black fill-current" />
                </button>
              </div>
              <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
              <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Message for New Users */}
      <div className="bg-spotify-dark-gray rounded-lg p-6 border border-spotify-gray">
        <h3 className="text-xl font-semibold text-white mb-2">Welcome to Spotify Clone!</h3>
        <p className="text-spotify-light-gray mb-4">
          Start by searching for your favorite songs, creating playlists, or joining the community chat.
        </p>
        <div className="flex space-x-4">
          <button className="btn-primary">Start Exploring</button>
          <button className="btn-secondary">Join Chat</button>
        </div>
      </div>
    </div>
  );
};

export default Home;