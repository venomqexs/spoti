import api from './authService';

export const musicService = {
  searchSongs: async (query, maxResults = 20) => {
    const response = await api.get(`/api/search?q=${encodeURIComponent(query)}&max_results=${maxResults}`);
    return response.data;
  },

  // Add song to liked songs
  likeSong: async (songId) => {
    const response = await api.post(`/api/songs/${songId}/like`);
    return response.data;
  },

  // Remove song from liked songs
  unlikeSong: async (songId) => {
    const response = await api.delete(`/api/songs/${songId}/like`);
    return response.data;
  },

  // Get user's liked songs
  getLikedSongs: async () => {
    const response = await api.get('/api/songs/liked');
    return response.data;
  },

  // Add to listening history
  addToHistory: async (songData) => {
    const response = await api.post('/api/songs/history', songData);
    return response.data;
  },

  // Get listening history
  getHistory: async (limit = 50) => {
    const response = await api.get(`/api/songs/history?limit=${limit}`);
    return response.data;
  },
};