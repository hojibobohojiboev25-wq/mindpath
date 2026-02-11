import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AuthCheck from '../components/AuthCheck';
import TelegramLogin from '../components/TelegramLogin';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Карта Мышления и Личности</title>
        <meta name="description" content="Интерактивная карта мышления и анализ личности с помощью ИИ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🧠 Карта Мышления
              </h1>
            </div>

            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Привет, {user?.firstName || user?.username}!
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthenticated ? (
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Откройте свою внутреннюю карту мышления
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Пройдите персонализированный анализ личности с помощью искусственного интеллекта
                и получите визуальную карту вашего мышления и рекомендации по саморазвитию.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Что вы получите:
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Анализ личности</h4>
                    <p className="text-gray-600 text-sm">
                      Подробный анализ ваших черт характера и особенностей мышления
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Визуальная карта</h4>
                    <p className="text-gray-600 text-sm">
                      Красивая интерактивная карта мышления, созданная ИИ
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Персональные советы</h4>
                    <p className="text-gray-600 text-sm">
                      Индивидуальные рекомендации по саморазвитию и достижению целей
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Войдите через Telegram
                </h3>
                <p className="text-gray-600 mb-6">
                  Для начала анализа нам нужно знать немного о вас. Авторизуйтесь через Telegram для быстрого доступа.
                </p>

                <TelegramLogin onLogin={handleLogin} />
              </div>
            </div>
          </div>
        ) : (
          <AuthCheck user={user}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Добро пожаловать, {user?.firstName || user?.username}!
              </h2>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Link href="/questionnaire" className="block">
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Пройти опрос
                    </h3>
                    <p className="text-gray-600">
                      Заполните анкету для создания вашей персональной карты мышления
                    </p>
                  </div>
                </Link>

                <Link href="/results" className="block">
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Мои результаты
                    </h3>
                    <p className="text-gray-600">
                      Просмотрите свои карты мышления и рекомендации
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </AuthCheck>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Карта Мышления и Личности. Создано с помощью ИИ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}