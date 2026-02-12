import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';

let socket;

export function getChatSocket() {
  if (!socket) {
    socket = io(API_BASE_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
  }
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
