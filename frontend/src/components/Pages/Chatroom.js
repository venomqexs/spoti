import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, UserX } from 'lucide-react';
import { chatService } from '../../services/chatService';

const Chatroom = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatService.getMessages();
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const websocket = chatService.connectWebSocket(user.id, (message) => {
      setMessages(prev => [...prev, message]);
    });

    setWs(websocket);

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    chatService.sendMessage(ws, newMessage.trim());
    setNewMessage('');
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Global Chatroom</h1>
        <p className="text-spotify-light-gray">Connect with music lovers worldwide</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-spotify-dark-gray rounded-lg border border-spotify-gray flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 ? (
            <div className="text-center text-spotify-light-gray py-8">
              <p>No messages yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="chat-message">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="h-8 w-8 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-semibold text-sm">
                      {message.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white text-sm">
                        {message.username}
                      </span>
                      <span className="text-spotify-light-gray text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-white text-sm break-words">{message.message}</p>
                  </div>

                  {/* Actions (for admins) */}
                  {user.role === 'admin' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 hover:bg-spotify-gray rounded transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-spotify-gray p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-spotify-black border border-spotify-gray rounded-full px-4 py-2 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors duration-200"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !ws}
              className="bg-spotify-green hover:bg-green-400 disabled:bg-spotify-gray disabled:cursor-not-allowed text-black font-semibold p-2 rounded-full transition-colors duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-spotify-light-gray">
              {newMessage.length}/500 characters
            </span>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${ws ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-spotify-light-gray">
                {ws ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Rules */}
      <div className="mt-4 bg-spotify-dark-gray rounded-lg p-4 border border-spotify-gray">
        <h3 className="font-semibold text-white mb-2">Chat Rules</h3>
        <ul className="text-sm text-spotify-light-gray space-y-1">
          <li>• Be respectful to all members</li>
          <li>• No spam or repetitive messages</li>
          <li>• Keep discussions music-related when possible</li>
          <li>• Admins have the right to moderate content</li>
        </ul>
      </div>
    </div>
  );
};

export default Chatroom;