const { Server } = require('socket.io');
const { upsertProfile, createMessage, markDelivered, markRead } = require('./services/chatService');

function registerWebsocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: {
      origin: app.config.corsOrigin.split(',').map((v) => v.trim()),
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('chat:join', async (profile) => {
      try {
        await upsertProfile({
          id: profile.id,
          name: profile.name || `user_${String(profile.id).slice(-6)}`,
          avatar: profile.avatar || '👤'
        });
        socket.data.profileId = profile.id;
        socket.join('global');
        io.to('global').emit('chat:presence', { profileId: profile.id, online: true });
      } catch (err) {
        app.log.error({ err }, 'chat:join failed');
      }
    });

    socket.on('chat:send', async (payload) => {
      try {
        if (!socket.data.profileId || !payload?.content?.trim()) return;
        const message = await createMessage({
          profileId: socket.data.profileId,
          content: payload.content
        });
        io.to('global').emit('chat:message', {
          id: message.id,
          profileId: message.profileId,
          userName: message.profile.name,
          userAvatar: message.profile.avatar || '👤',
          content: message.content,
          status: message.status,
          timestamp: message.createdAt.toISOString()
        });
      } catch (err) {
        app.log.error({ err }, 'chat:send failed');
      }
    });

    socket.on('chat:delivered', async ({ messageId, profileId }) => {
      if (!messageId || !profileId) return;
      await markDelivered(messageId, profileId);
      io.to('global').emit('chat:receipt', { messageId, profileId, status: 'DELIVERED' });
    });

    socket.on('chat:read', async ({ messageId, profileId }) => {
      if (!messageId || !profileId) return;
      await markRead(messageId, profileId);
      io.to('global').emit('chat:receipt', { messageId, profileId, status: 'READ' });
    });

    socket.on('disconnect', () => {
      if (socket.data.profileId) {
        io.to('global').emit('chat:presence', { profileId: socket.data.profileId, online: false });
      }
    });
  });

  return io;
}

module.exports = { registerWebsocket };
