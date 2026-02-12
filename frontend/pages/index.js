import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProfileSetup from '../components/ProfileSetup';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // Check if user has profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try {
        const profileData = JSON.parse(storedProfile);
        setUser(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        localStorage.removeItem('user_profile');
        setShowProfileSetup(true);
      }
    } else {
      setShowProfileSetup(true);
    }
  }, []);

  const handleProfileComplete = (profileData) => {
    setUser(profileData);
    setShowProfileSetup(false);
    localStorage.setItem('user_profile', JSON.stringify(profileData));
  };

  if (showProfileSetup) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Карта Мышления - Глобальный Чат</title>
        <meta name="description" content="Создайте свою карту мышления и общайтесь в глобальном чате" />
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

            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {user.name}
                  </span>
                </div>
                <Link href="/chat" className="btn-primary text-sm">
                  💬 Глобальный чат
                </Link>
                <Link href="/questionnaire" className="btn-secondary text-sm">
                  🧠 Анализ личности
                </Link>
                <button
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem('user_profile');
                    setShowProfileSetup(true);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Изменить профиль
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