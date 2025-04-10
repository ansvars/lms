import { io } from 'socket.io-client';

// Replace with your Render backend URL
const SOCKET_URL = 'https://lms-ufss.onrender.com';

export const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    withCredentials: true
  });