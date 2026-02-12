// Socket.IO server for real-time chat
import { Server } from 'socket.io';

let io;

const chatHistory = [
  {
    id: '1',
    userName: 'Система',
    userAvatar: '🤖',
    content: 'Добро пожаловать в глобальный чат! Здесь можно общаться в реальном времени.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'system'
  },
  {
    id: '2',
    userName: 'Администратор',
    userAvatar: '👑',
    content: 'Привет всем! Общайтесь вежливо и уважительно.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'admin'
  }
];

const activeUsers = new Map();

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('*First use, starting Socket.IO server...');

    io = new Server(res.socket.server, {
      path: '/api/chat/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Send chat history to new user
      socket.emit('chat_history', chatHistory);

      // Send current active users count
      socket.emit('active_users', activeUsers.size + 1);

      socket.on('join_chat', (userData) => {
        const user = {
          id: socket.id,
          name: userData.name,
          avatar: userData.avatar,
          joinedAt: new Date().toISOString()
        };
        activeUsers.set(socket.id, user);

        // Broadcast updated user count
        io.emit('active_users', activeUsers.size);

        // Broadcast join message
        const joinMessage = {
          id: Date.now().toString(),
          userName: userData.name,
          userAvatar: userData.avatar,
          content: `${userData.name} присоединился к чату`,
          timestamp: new Date().toISOString(),
          type: 'join'
        };

        chatHistory.push(joinMessage);
        if (chatHistory.length > 100) {
          chatHistory.shift();
        }

        socket.broadcast.emit('message', joinMessage);
      });

      socket.on('send_message', (messageData) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;

        const message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          userName: user.name,
          userAvatar: user.avatar,
          content: messageData.content,
          timestamp: new Date().toISOString(),
          type: 'message'
        };

        // Add to history
        chatHistory.push(message);
        if (chatHistory.length > 100) {
          chatHistory.shift();
        }

        // Broadcast to all users
        io.emit('message', message);
      });

      socket.on('disconnect', () => {
        const user = activeUsers.get(socket.id);
        if (user) {
          activeUsers.delete(socket.id);

          // Broadcast updated user count
          io.emit('active_users', activeUsers.size);

          // Broadcast leave message
          const leaveMessage = {
            id: Date.now().toString(),
            userName: user.name,
            userAvatar: user.avatar,
            content: `${user.name} покинул чат`,
            timestamp: new Date().toISOString(),
            type: 'leave'
          };

          chatHistory.push(leaveMessage);
          if (chatHistory.length > 100) {
            chatHistory.shift();
          }

          socket.broadcast.emit('message', leaveMessage);
        }

        console.log('User disconnected:', socket.id);
      });

      socket.on('typing_start', (userData) => {
        socket.broadcast.emit('user_typing', {
          userName: userData.name,
          isTyping: true
        });
      });

      socket.on('typing_stop', (userData) => {
        socket.broadcast.emit('user_typing', {
          userName: userData.name,
          isTyping: false
        });
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already running');
  }

  res.end();
}