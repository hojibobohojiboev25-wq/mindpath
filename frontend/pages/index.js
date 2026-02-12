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
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Добро пожаловать в Карту Мышления! 🧠
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Создайте персональную карту мышления с помощью ИИ и общайтесь в глобальном чате со всего мира!
            </p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                🚀 Что вы можете сделать:
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/questionnaire" className="block">
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Анализ личности</h4>
                    <p className="text-gray-600 text-sm">
                      Пройдите тест и получите подробный анализ вашей личности с рекомендациями
                    </p>
                  </div>
                </Link>

                <Link href="/chat" className="block">
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary-200 hover:border-primary-400">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Глобальный чат</h4>
                    <p className="text-gray-600 text-sm">
                      Общайтесь с людьми со всего мира в реальном времени
                    </p>
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                        Популярно 🔥
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="card">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Персонализация</h4>
                  <p className="text-gray-600 text-sm">
                    Создайте уникальный профиль с именем и аватаром
                  </p>
                  {user && (
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-purple-500 text-white text-sm px-3 py-1 rounded-full">
                        Профиль готов ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                🌟 Начните прямо сейчас!
              </h3>
              <p className="text-gray-700 mb-6">
                Выберите, что вас интересует больше - анализ личности или общение в глобальном чате.
                Все функции доступны бесплатно и без регистрации!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/chat" className="btn-primary text-lg px-8 py-3">
                  💬 Открыть глобальный чат
                </Link>
                <Link href="/questionnaire" className="btn-secondary text-lg px-8 py-3">
                  🧠 Пройти анализ личности
                </Link>
              </div>
            </div>
          </div>
        </div>
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