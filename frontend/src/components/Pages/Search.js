import React, { useState } from 'react';
import { Search as SearchIcon, Play, Heart } from 'lucide-react';
import { musicService } from '../../services/musicService';

const Search = ({ user, onPlaySong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await musicService.searchSongs(query);
      setResults(response.songs || []);
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (duration === 'Unknown') return duration;
    // Add duration formatting logic here
    return duration;
  };

  return (
    <div className="p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-spotify-gray" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full pl-10 pr-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-full text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors duration-200"
            />
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md max-w-2xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && !loading && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
          <div className="space-y-2">
            {results.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-spotify-dark-gray transition-colors duration-200 group cursor-pointer"
                onClick={() => onPlaySong(song, results)}
              >
                {/* Track Number */}
                <div className="w-6 text-center">
                  <span className="text-spotify-light-gray text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <Play className="h-4 w-4 text-white hidden group-hover:block" />
                </div>

                {/* Song Thumbnail */}
                <div className="relative">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{song.title}</h3>
                  <p className="text-spotify-light-gray text-sm truncate">{song.artist}</p>
                </div>

                {/* Duration */}
                <div className="text-spotify-light-gray text-sm">
                  {formatDuration(song.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to liked songs logic
                    }}
                    className="p-2 hover:bg-spotify-gray rounded-full transition-colors duration-200"
                  >
                    <Heart className="h-4 w-4 text-spotify-light-gray hover:text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && query && !loading && (
        <div className="text-center py-12">
          <SearchIcon className="h-16 w-16 text-spotify-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-spotify-light-gray">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Browse Categories */}
      {!query && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Pop', color: 'from-pink-500 to-purple-600' },
              { name: 'Rock', color: 'from-red-500 to-orange-600' },
              { name: 'Hip Hop', color: 'from-yellow-500 to-red-600' },
              { name: 'Electronic', color: 'from-blue-500 to-purple-600' },
              { name: 'Classical', color: 'from-green-500 to-blue-600' },
              { name: 'Jazz', color: 'from-purple-500 to-pink-600' },
            ].map((category) => (
              <div
                key={category.name}
                className={`bg-gradient-to-br ${category.color} rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform duration-200`}
                onClick={() => setQuery(category.name)}
              >
                <h3 className="text-white font-bold text-lg">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;