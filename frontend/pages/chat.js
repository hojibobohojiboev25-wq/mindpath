import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const userIdRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const getSafeName = (profile) =>
    profile?.name || profile?.firstName || profile?.username || 'Гость';

  useEffect(() => {
    // Load user profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try {
        const profileData = JSON.parse(storedProfile);
        const normalized = {
          ...profileData,
          name: getSafeName(profileData),
          avatar: profileData?.avatar || '👤'
        };
        setUser(normalized);
        userIdRef.current = profileData.id || `user_${normalized.name}`;

        // Join chat
        joinChat(normalized);

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
      if (userIdRef.current) {
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
            name: getSafeName(profileData),
            avatar: profileData.avatar || '👤'
          }
        }),
      });

      if (response.ok) {
        loadMessages();
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
    pollIntervalRef.current = setInterval(loadMessages, 2000);
  };

  const startHeartbeat = () => {
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
      const sinceQuery = lastTimestampRef.current ? `?since=${lastTimestampRef.current}` : '';
      const response = await fetch(`/api/chat/socket${sinceQuery}`);
      if (response.ok) {
        const data = await response.json();
        const incoming = data.messages || [];
        if (!incoming.length) {
          setActiveUsers(data.activeUsers || 0);
          return;
        }
        setMessages((prev) => {
          const merged = [...prev, ...incoming];
          const seen = new Set();
          const unique = merged.filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          return unique.slice(-200);
        });
        setActiveUsers(data.activeUsers || 0);
        lastTimestampRef.current = new Date(incoming[incoming.length - 1].timestamp).getTime();
        setStatusMessage(null);
      } else {
        setStatusMessage('Не удалось получить сообщения. Проверьте соединение.');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setStatusMessage('Ошибка сети при получении сообщений');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
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
            userName: getSafeName(user),
            userAvatar: user.avatar || '👤',
            content: newMessage.trim()
          }
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();
        setStatusMessage(null);
      } else {
        const errorData = await response.json();
        setStatusMessage('Ошибка отправки: ' + (errorData.error || 'Попробуйте ещё раз'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage('Ошибка подключения');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
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
    <AppLayout
      title="Глобальный чат - MindPath"
      description="Профессиональный глобальный чат MindPath"
      user={user}
      active="chat"
      rightSlot={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-slate-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span>{activeUsers} онлайн</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {messages.length} сообщений
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="app-nav-link inline-flex">← На главную</Link>
          <Link href="/questionnaire" className="btn-secondary text-sm">🧠 Анализ</Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-4">
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
            className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {statusMessage && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
                {statusMessage}
              </div>
            )}
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

                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.userName === user.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${
                      message.userName === user.name ? 'text-blue-100' : 'text-slate-600'
                      }`}>
                        {message.userName}
                      </span>
                      <span className={`text-xs ${
                      message.userName === user.name ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      message.userName === user.name ? 'text-white' : 'text-slate-900'
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
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{isSending ? '⏳' : '📤'}</span>
                <span className="hidden sm:inline">{isSending ? 'Отправка...' : 'Отправить'}</span>
              </button>
            </form>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Real-time чат: автообновление каждые 2 сек</span>
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
      </div>
    </AppLayout>
  );
}