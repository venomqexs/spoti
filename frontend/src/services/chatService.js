import api from './authService';

export const chatService = {
  getMessages: async (limit = 50) => {
    const response = await api.get(`/api/chat/messages?limit=${limit}`);
    return response.data;
  },

  connectWebSocket: (userId, onMessage) => {
    const wsUrl = `ws://localhost:8001/api/chat/ws/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };

    return ws;
  },

  sendMessage: (ws, message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message }));
    }
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/api/chat/messages/${messageId}`);
    return response.data;
  },
};