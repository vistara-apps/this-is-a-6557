import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket'],
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Real-time event handlers
      newSocket.on('post_published', (data) => {
        toast.success(`Post published successfully to ${data.platforms.join(', ')}`);
      });

      newSocket.on('post_failed', (data) => {
        toast.error(`Failed to publish post: ${data.error}`);
      });

      newSocket.on('new_engagement', (data) => {
        toast.success(`New ${data.type} from ${data.author} on ${data.platform}`);
      });

      newSocket.on('analytics_updated', (data) => {
        // Handle analytics updates
        console.log('Analytics updated:', data);
      });

      newSocket.on('subscription_updated', (data) => {
        toast.success(`Subscription updated: ${data.plan}`);
      });

      newSocket.on('account_connected', (data) => {
        toast.success(`${data.platform} account connected successfully`);
      });

      newSocket.on('account_disconnected', (data) => {
        toast.info(`${data.platform} account disconnected`);
      });

      newSocket.on('ai_suggestion_ready', (data) => {
        toast.success('AI suggestions are ready!');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  // Socket utility functions
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
