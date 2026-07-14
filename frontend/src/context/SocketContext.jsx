import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken } from '../services/api';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Connect to the socket server using the absolute URL and auth token
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      const socketInstance = io(`${socketUrl}/chat`, {
        auth: {
          token: getAccessToken(),
        },
        transports: ['websocket'],
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      // Presence tracking
      socketInstance.on('presence:online', (data) => {
        // e.g. { userId }
        setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
      });

      socketInstance.on('presence:offline', (data) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      });

      return () => {
        socketInstance.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
