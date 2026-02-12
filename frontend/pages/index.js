import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthCheck from '../components/AuthCheck';
import TelegramLogin from '../components/TelegramLogin';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for auth state
    console.log('🔍 Checking auth state on page load...');
    const storedAuth = localStorage.getItem('telegram_auth');
    console.log('Stored auth data:', storedAuth);

    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        console.log('Parsed auth data:', authData);
        setUser(authData.user);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', authData.user);

        // Auto-redirect to dashboard after authentication
        setTimeout(() => {
          console.log('🚀 Auto-redirecting to dashboard...');
          router.push('/dashboard');
        }, 3000); // Give user time to see the welcome message

      } catch (error) {
        console.error('❌ Error parsing stored auth:', error);
        localStorage.removeItem('telegram_auth');
      }
    } else {
      console.log('ℹ️ No stored auth data found');
    }
    setLoading(false);
  }, [router]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Store auth data in localStorage
    localStorage.setItem('telegram_auth', JSON.stringify({
      user: userData,
      timestamp: Date.now()
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('telegram_auth');
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
                <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Личный кабинет
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Выйти
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('telegram_auth');
                    console.log('🗑️ Auth data cleared from localStorage');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Сбросить
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
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 mb-8 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Добро пожаловать, {user?.firstName || user?.username}!
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  Ваш аккаунт успешно активирован. Начинаем создание персональной карты мышления...
                </p>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="text-green-700 font-medium">Загрузка личного кабинета</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Авторизация проверена
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      Загрузка профиля
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      Подготовка опроса
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Если автоматическое перенаправление не произошло через 5 секунд,
                  <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
                    перейти в личный кабинет →
                  </Link>
                </p>
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