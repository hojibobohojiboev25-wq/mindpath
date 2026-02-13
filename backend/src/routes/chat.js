const { z } = require('zod');
const { profileSchema, sendMessageSchema, receiptSchema } = require('../validators/chat');
const { upsertProfile, createMessage, getHistory, markDelivered, markRead } = require('../services/chatService');
const { ok, fail } = require('../lib/response');

async function chatRoutes(app) {
  app.get('/chat/history', async (req, reply) => {
    const q = z.object({ limit: z.string().optional() }).safeParse(req.query || {});
    const limit = q.success ? Number(q.data.limit || 100) : 100;
    const messages = await getHistory(limit);
    return ok(reply, { messages }, { limit });
  });

  app.post('/chat/join', async (req, reply) => {
    const parsed = profileSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return fail(reply, 400, 'BAD_REQUEST', 'Invalid profile');
    }
    await upsertProfile(parsed.data);
    return ok(reply, { joined: true });
  });

  app.post('/chat/messages', async (req, reply) => {
    const parsed = sendMessageSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return fail(reply, 400, 'BAD_REQUEST', 'Invalid message payload');
    }
    const profile = await upsertProfile({
      id: parsed.data.profileId,
      name: parsed.data.profileName || `user_${String(parsed.data.profileId).slice(-6)}`,
      avatar: parsed.data.profileAvatar || '👤'
    });
    const message = await createMessage({
      profileId: profile.id,
      content: parsed.data.content
    });
    app.io.to('global').emit('chat:message', {
      id: message.id,
      profileId: message.profileId,
      userName: message.profile.name,
      userAvatar: message.profile.avatar || '👤',
      content: message.content,
      status: message.status,
      timestamp: message.createdAt.toISOString()
    });
    return ok(reply, {
      message: {
        id: message.id,
        profileId: message.profileId,
        userName: message.profile.name,
        userAvatar: message.profile.avatar || '👤',
        content: message.content,
        status: message.status,
        timestamp: message.createdAt.toISOString()
      }
    });
  });

  app.post('/chat/receipts/delivered', async (req, reply) => {
    const parsed = receiptSchema.safeParse(req.body || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'Invalid receipt payload');
    await markDelivered(parsed.data.messageId, parsed.data.profileId);
    app.io.to('global').emit('chat:receipt', { ...parsed.data, status: 'DELIVERED' });
    return ok(reply, { updated: true });
  });

  app.post('/chat/receipts/read', async (req, reply) => {
    const parsed = receiptSchema.safeParse(req.body || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'Invalid receipt payload');
    await markRead(parsed.data.messageId, parsed.data.profileId);
    app.io.to('global').emit('chat:receipt', { ...parsed.data, status: 'READ' });
    return ok(reply, { updated: true });
  });
}

module.exports = { chatRoutes };
