// Real-time chat API with polling (Vercel compatible)
// In production, this would use a database
let chatHistory = [
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

let activeUsers = new Map();
let lastUpdate = Date.now();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get chat history and active users
    const now = Date.now();

    // Simulate user activity decay (remove inactive users after 5 minutes)
    for (const [userId, user] of activeUsers.entries()) {
      if (now - new Date(user.lastSeen).getTime() > 300000) { // 5 minutes
        activeUsers.delete(userId);
      }
    }

    res.json({
      messages: chatHistory,
      activeUsers: activeUsers.size,
      lastUpdate: lastUpdate
    });

  } else if (req.method === 'POST') {
    const { action, userData, messageData } = req.body;

    if (action === 'join') {
      // User joined chat
      const user = {
        id: userData.userId || `user_${Date.now()}`,
        name: userData.name,
        avatar: userData.avatar,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
      activeUsers.set(user.id, user);

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

      lastUpdate = Date.now();
      res.json({ success: true, message: joinMessage });

    } else if (action === 'send_message') {
      // Send message
      const user = activeUsers.get(messageData.userId);
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Update user activity
      user.lastSeen = new Date().toISOString();
      activeUsers.set(user.id, user);

      // Basic spam protection
      const recentMessages = chatHistory.filter(msg =>
        msg.userName === user.name &&
        msg.type === 'message' &&
        (Date.now() - new Date(msg.timestamp).getTime()) < 10000 // 10 seconds
      );

      if (recentMessages.length >= 3) {
        return res.status(429).json({ error: 'Too many messages. Please wait.' });
      }

      const message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userName: user.name,
        userAvatar: user.avatar,
        content: messageData.content.trim(),
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      chatHistory.push(message);
      if (chatHistory.length > 100) {
        chatHistory.shift();
      }

      lastUpdate = Date.now();
      res.json({ success: true, message });

    } else if (action === 'leave') {
      // User left chat
      const user = activeUsers.get(userData.userId);
      if (user) {
        activeUsers.delete(userData.userId);

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

        lastUpdate = Date.now();
        res.json({ success: true, message: leaveMessage });
      } else {
        res.json({ success: true });
      }

    } else if (action === 'heartbeat') {
      // Update user activity
      const user = activeUsers.get(userData.userId);
      if (user) {
        user.lastSeen = new Date().toISOString();
        activeUsers.set(user.id, user);
      }
      res.json({ success: true });

    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}