const { getStore, updateStore } = require('../../lib/runtimeStore');

const MAX_MESSAGES = 500;
const USER_IDLE_MS = 5 * 60 * 1000;

function toActiveUsersMap(usersObject) {
  return new Map(Object.entries(usersObject || {}));
}

function toUsersObject(usersMap) {
  return Object.fromEntries(usersMap.entries());
}

async function handler(req, res) {
  if (req.method === 'GET') {
    const now = Date.now();
    const since = Number(req.query.since || 0);

    const store = await updateStore((draft) => {
      const users = toActiveUsersMap(draft.chat.users);
      for (const [userId, user] of users.entries()) {
        if (now - new Date(user.lastSeen).getTime() > USER_IDLE_MS) {
          users.delete(userId);
        }
      }
      draft.chat.users = toUsersObject(users);
      return draft;
    });

    const allMessages = store.chat.messages || [];
    const messages = since
      ? allMessages.filter((m) => new Date(m.timestamp).getTime() > since)
      : allMessages.slice(-80);

    return res.json({
      messages,
      activeUsers: Object.keys(store.chat.users || {}).length,
      lastUpdate: now
    });

  } else if (req.method === 'POST') {
    const { action, userData, messageData } = req.body;

    if (action === 'join') {
      if (!userData?.userId) {
        return res.status(400).json({ error: 'Invalid user data' });
      }
      const safeName = userData?.name || `user_${String(userData.userId).slice(-6)}`;
      const nowIso = new Date().toISOString();
      await updateStore((draft) => {
        const users = toActiveUsersMap(draft.chat.users);
        users.set(userData.userId, {
          id: userData.userId,
          name: safeName,
          avatar: userData.avatar || '👤',
          joinedAt: nowIso,
          lastSeen: nowIso
        });
        draft.chat.users = toUsersObject(users);
        return draft;
      });
      return res.json({ success: true });

    } else if (action === 'send_message') {
      if (!messageData?.userId || !messageData?.content?.trim()) {
        return res.status(400).json({ error: 'Invalid message' });
      }

      let responsePayload = null;
      const now = Date.now();
      const nowIso = new Date(now).toISOString();

      await updateStore((draft) => {
        const users = toActiveUsersMap(draft.chat.users);
        let user = users.get(messageData.userId);
        if (!user) {
          const safeName = messageData.userName || `user_${String(messageData.userId).slice(-6)}`;
          user = {
            id: messageData.userId,
            name: safeName,
            avatar: messageData.userAvatar || '👤',
            joinedAt: nowIso,
            lastSeen: nowIso
          };
          users.set(user.id, user);
        }

        const recentMessages = (draft.chat.messages || []).filter(
          (m) =>
            m.userId === user.id &&
            m.type === 'message' &&
            now - new Date(m.timestamp).getTime() < 10000
        );
        if (recentMessages.length >= 5) {
          responsePayload = { status: 429, body: { error: 'Too many messages. Slow down.' } };
          return draft;
        }

        users.set(user.id, { ...user, lastSeen: nowIso });
        draft.chat.users = toUsersObject(users);

        const message = {
          id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content: String(messageData.content).trim().slice(0, 500),
          timestamp: nowIso,
          type: 'message'
        };
        draft.chat.messages = [...(draft.chat.messages || []), message].slice(-MAX_MESSAGES);
        responsePayload = { status: 200, body: { success: true, message } };
        return draft;
      });

      return res.status(responsePayload.status).json(responsePayload.body);

    } else if (action === 'leave') {
      await updateStore((draft) => {
        const users = toActiveUsersMap(draft.chat.users);
        users.delete(userData?.userId);
        draft.chat.users = toUsersObject(users);
        return draft;
      });
      return res.json({ success: true });

    } else if (action === 'heartbeat') {
      await updateStore((draft) => {
        const users = toActiveUsersMap(draft.chat.users);
        const user = users.get(userData?.userId);
        if (user) {
          users.set(user.id, { ...user, lastSeen: new Date().toISOString() });
          draft.chat.users = toUsersObject(users);
        }
        return draft;
      });
      return res.json({ success: true });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = handler;