import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    // Load user profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try {
        const profileData = JSON.parse(storedProfile);
        setUser(profileData);
        userIdRef.current = `user_${profileData.name}_${Date.now()}`;

        // Join chat
        joinChat(profileData);

        // Start polling for messages
        startPolling();

        // Start heartbeat
        startHeartbeat();

      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    setIsLoading(false);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Leave chat
      if (user && userIdRef.current) {
        leaveChat();
      }
    };
  }, []);

  const joinChat = async (profileData) => {
    try {
      const response = await fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          userData: {
            userId: userIdRef.current,
            name: profileData.name,
            avatar: profileData.avatar
          }
        }),
      });

      if (response.ok) {
        console.log('Joined chat successfully');
        loadMessages(); // Load initial messages
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const leaveChat = async () => {
    try {
      await fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'leave',
          userData: {
            userId: userIdRef.current
          }
        }),
      });
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const startPolling = () => {
    // Poll every 2 seconds for new messages
    pollIntervalRef.current = setInterval(loadMessages, 2000);
  };

  const startHeartbeat = () => {
    // Send heartbeat every 30 seconds to stay active
    heartbeatIntervalRef.current = setInterval(() => {
      fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'heartbeat',
          userData: {
            userId: userIdRef.current
          }
        }),
      }).catch(error => console.error('Heartbeat error:', error));
    }, 30000);
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/chat/socket');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setActiveUsers(data.activeUsers || 0);
        setLastUpdate(data.lastUpdate || 0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          messageData: {
            userId: userIdRef.current,
            content: newMessage.trim()
          }
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(); // Refresh messages immediately
      } else {
        const errorData = await response.json();
        alert('Ошибка отправки: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка подключения');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-6">Создайте профиль, чтобы участвовать в чате</p>
          <Link href="/" className="btn-primary">
            Создать профиль
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Глобальный чат - Карта Мышления</title>
        <meta name="description" content="Общайтесь с людьми со всего мира в реальном времени" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← На главную
              </Link>
              <div className="flex items-center space-x-2">
                {user.avatar && (
                  <span className="text-2xl">{user.avatar}</span>
                )}
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
            </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{activeUsers} онлайн</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{messages.length} сообщений</span>
                </div>
                <Link href="/questionnaire" className="btn-secondary text-sm">
                  🧠 Анализ
                </Link>
              </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">💬 Глобальный чат</h1>
                <p className="text-blue-100">Общайтесь с людьми со всего мира</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{messages.length}</div>
                <div className="text-sm text-blue-100">сообщений</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Чат пуст
                </h3>
                <p className="text-gray-600">
                  Будьте первым, кто напишет сообщение!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id || message.timestamp}
                  className={`flex items-start space-x-3 ${
                    message.userName === user.name ? 'justify-end' : ''
                  }`}
                >
                  {message.userName !== user.name && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm">{message.userAvatar || '👤'}</span>
                      </div>
                    </div>
                  )}

                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.userName === user.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${
                        message.userName === user.name ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.userName}
                      </span>
                      <span className={`text-xs ${
                        message.userName === user.name ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      message.userName === user.name ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.content}
                    </p>
                  </div>

                  {message.userName === user.name && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white">{message.userAvatar || '👤'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
                onBlur={handleTypingStop}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{isSending ? '⏳' : '📤'}</span>
                <span className="hidden sm:inline">{isSending ? 'Отправка...' : 'Отправить'}</span>
              </button>
            </form>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Real-time чат с обновлением каждые 2 сек</span>
              <span>{newMessage.length}/500</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Правила чата
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Будьте вежливы и уважительны к другим участникам</li>
                  <li>Не используйте оскорбительные выражения</li>
                  <li>Общайтесь на русском или английском языке</li>
                  <li>Не спамьте и не рекламируйте</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}