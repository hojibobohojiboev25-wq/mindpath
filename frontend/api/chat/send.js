// Import the messages array from messages.js
// In a real app, this would be in a database
let chatMessages = [
  {
    id: '1',
    userId: 'system',
    userName: 'Система',
    userAvatar: '🤖',
    content: 'Добро пожаловать в глобальный чат! Здесь можно общаться с людьми со всего мира.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    userId: 'admin',
    userName: 'Администратор',
    userAvatar: '👑',
    content: 'Привет всем! Рады видеть вас в нашем сообществе. Не забудьте пройти анализ личности!',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userName, userAvatar, content, timestamp } = req.body;

    // Validate input
    if (!userName || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid message data' });
    }

    // Check message length
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    // Basic spam protection - check for repeated messages
    const recentMessages = chatMessages.filter(msg =>
      msg.userId === userId &&
      new Date() - new Date(msg.timestamp) < 10000 // Within 10 seconds
    );

    if (recentMessages.length >= 3) {
      return res.status(429).json({ error: 'Too many messages. Please wait.' });
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: userId || 'anonymous',
      userName: userName.trim(),
      userAvatar: userAvatar || '👤',
      content: content.trim(),
      timestamp: timestamp || new Date().toISOString()
    };

    // Add to messages array
    chatMessages.push(newMessage);

    // Keep only last 100 messages
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }

    console.log('New message added:', {
      user: userName,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });

    res.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}