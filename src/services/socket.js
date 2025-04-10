import { io } from 'socket.io-client';

// Replace with your Render backend URL
const SOCKET_URL = 'https://lms-ufss.onrender.com';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});