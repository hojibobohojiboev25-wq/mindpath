import { useState, useEffect } from 'react';
import Head from 'next/head';

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    telegram_id: 123456789,
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    analysesCount: 2,
    status: 'online'
  },
  {
    id: 2,
    telegram_id: 987654321,
    username: 'jane_smith',
    firstName: 'Jane',
    lastName: 'Smith',
    avatarUrl: null,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    analysesCount: 1,
    status: 'away'
  },
  {
    id: 3,
    telegram_id: 555666777,
    username: null,
    firstName: 'Алексей',
    lastName: 'Иванов',
    avatarUrl: null,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    analysesCount: 0,
    status: 'offline'
  }
];

const mockStats = {
  totalUsers: 1247,
  activeToday: 89,
  analysesToday: 156,
  avgSessionTime: '12 мин 34 сек'
};

export default function AdminPanel() {
  const [users, setUsers] = useState(mockUsers);
  const [stats, setStats] = useState(mockStats);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is admin (in real app, check admin role)
    const storedAuth = localStorage.getItem('telegram_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // For demo, allow access if user exists
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setUsers(prevUsers =>
        prevUsers.map(user => ({
          ...user,
          lastActivity: new Date(user.lastActivity.getTime() + Math.random() * 60000) // Add random time
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} д назад`;
  };

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegram_id?.toString().includes(searchTerm)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав доступа к админ панели</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Админ панель - Карта Мышления</title>
        <meta name="description" content="Администрирование пользователей и аналитики" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                ← Личный кабинет
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                🔧 Админ панель
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Обновлено: {new Date().toLocaleTimeString('ru-RU')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активных сегодня</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Анализов сегодня</p>
                <p className="text-2xl font-bold text-gray-900">{stats.analysesToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Среднее время сессии</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgSessionTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Пользователи онлайн</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск пользователей..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {filteredUsers.length} из {users.length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Анализы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Последняя активность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.firstName?.[0] || user.username?.[0] || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || 'без username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.telegram_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`}></div>
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {user.status === 'online' ? 'онлайн' :
                           user.status === 'away' ? 'недавно' : 'оффлайн'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.analysesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastActivity(user.lastActivity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Просмотр
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Статистика
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Пользователи не найдены</h3>
              <p className="mt-1 text-sm text-gray-500">
                Попробуйте изменить критерии поиска
              </p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Детали пользователя
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-700">
                      {selectedUser.firstName?.[0] || selectedUser.username?.[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h4>
                    <p className="text-gray-600">@{selectedUser.username || 'без username'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.telegram_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Статус</label>
                    <div className="mt-1 flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedUser.status)}`}></div>
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {selectedUser.status === 'online' ? 'онлайн' :
                         selectedUser.status === 'away' ? 'недавно' : 'оффлайн'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Анализов пройдено</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.analysesCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Последняя активность</label>
                    <p className="mt-1 text-sm text-gray-900">{formatLastActivity(selectedUser.lastActivity)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Закрыть
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  Связаться
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}