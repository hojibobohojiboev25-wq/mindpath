// Simple in-memory storage for chat messages
// In production, use a database
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
    content: 'Привет всем! Рады видеть вас в нашем сообществе. Попробуйте пройти анализ личности!',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '3',
    userId: 'demo1',
    userName: 'Алексей',
    userAvatar: '🧑‍💻',
    content: 'Привет! Я прошел анализ личности, очень интересно. Рекомендую всем!',
    timestamp: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: '4',
    userId: 'demo2',
    userName: 'Мария',
    userAvatar: '👩‍🎨',
    content: 'Карта мышления помогла мне лучше понять свои сильные стороны. Спасибо разработчикам!',
    timestamp: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: '5',
    userId: 'demo3',
    userName: 'Дмитрий',
    userAvatar: '👨‍🚀',
    content: 'Крутой проект! Чат работает в реальном времени, все сообщения обновляются автоматически.',
    timestamp: new Date(Date.now() - 300000).toISOString()
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clean old messages (keep only last 100)
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }

    res.json({
      messages: chatMessages,
      total: chatMessages.length
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}