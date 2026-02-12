import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';
import { getChatHistory, joinChat, sendChatMessage, markDelivered, markRead } from '../services/api/chat';
import { getChatSocket, disconnectChatSocket } from '../services/socket/chatSocket';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const userIdRef = useRef(null);
  const knownMessageIdsRef = useRef(new Set());
  const getSafeName = (profile) =>
    profile?.name || profile?.firstName || profile?.username || 'Гость';

  useEffect(() => {
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
        connectToChat(normalized);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    setIsLoading(false);

    return () => {
      disconnectChatSocket();
    };
  }, []);

  const connectToChat = async (profileData) => {
    try {
      await joinChat({
        id: userIdRef.current,
        name: getSafeName(profileData),
        avatar: profileData.avatar || '👤'
      });
      const history = await getChatHistory(120);
      const incoming = history.messages || [];
      const knownIds = new Set();
      incoming.forEach((m) => knownIds.add(m.id));
      knownMessageIdsRef.current = knownIds;
      setMessages(incoming);

      const socket = getChatSocket();
      socket.emit('chat:join', {
        id: userIdRef.current,
        name: getSafeName(profileData),
        avatar: profileData.avatar || '👤'
      });

      socket.on('chat:message', (message) => {
        setMessages((prev) => {
          if (knownMessageIdsRef.current.has(message.id)) return prev;
          knownMessageIdsRef.current.add(message.id);
          const next = [...prev, message].slice(-200);
          return next;
        });
        if (message.profileId !== userIdRef.current) {
          markDelivered(message.id, userIdRef.current).catch(() => null);
          markRead(message.id, userIdRef.current).catch(() => null);
          socket.emit('chat:delivered', { messageId: message.id, profileId: userIdRef.current });
          socket.emit('chat:read', { messageId: message.id, profileId: userIdRef.current });
        }
      });

      socket.on('chat:receipt', (receipt) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === receipt.messageId ? { ...msg, status: receipt.status } : msg))
        );
      });

      socket.on('chat:presence', () => {
        setActiveUsers((prev) => Math.max(1, prev));
      });

      socket.on('connect_error', () => {
        setStatusMessage('WebSocket недоступен, работаем через API fallback');
      });

      setStatusMessage(null);
    } catch (error) {
      console.error('Error connecting chat:', error);
      setStatusMessage('Не удалось подключиться к чату');
    }
  };

  const refreshChatFallback = async () => {
    try {
      const history = await getChatHistory(120);
      const incoming = history.messages || [];
      const knownIds = new Set();
      incoming.forEach((m) => knownIds.add(m.id));
      knownMessageIdsRef.current = knownIds;
      setMessages(incoming.slice(-200));
      setStatusMessage(null);
    } catch {
      setStatusMessage('Не удалось получить сообщения. Проверьте соединение.');
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      const socket = getChatSocket();
      if (!socket.connected) {
        refreshChatFallback();
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const uniqueUsers = new Set(messages.map((m) => m.profileId || m.userId).filter(Boolean));
    if (uniqueUsers.size) {
      setActiveUsers(uniqueUsers.size);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    setIsSending(true);
    const content = newMessage.trim();
    try {
      await sendChatMessage({
        profileId: userIdRef.current,
        profileName: getSafeName(user),
        profileAvatar: user.avatar || '👤',
        content
      });
      const socket = getChatSocket();
      if (socket.connected) {
        socket.emit('chat:send', { content });
      } else {
        await refreshChatFallback();
      }
      setNewMessage('');
      setStatusMessage(null);
    } catch (error) {
      const message = error?.data?.error || error?.message || 'Попробуйте ещё раз';
      setStatusMessage('Ошибка отправки: ' + message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                    {message.userName === user.name && (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-blue-200">
                        {message.status === 'READ' ? 'прочитано' : message.status === 'DELIVERED' ? 'доставлено' : 'отправлено'}
                      </p>
                    )}
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