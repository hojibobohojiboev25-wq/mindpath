import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AuthCheck from '../components/AuthCheck';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    checkAuthAndLoadResults();
  }, []);

  const checkAuthAndLoadResults = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        return;
      }
      const authData = await authResponse.json();
      setUser(authData.user);

      // Load user results
      const resultsResponse = await fetch('/api/results/all');
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResults(resultsData.results || []);
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthCheck user={user}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Личный кабинет - Карта Мышления</title>
          <meta name="description" content="Управление вашими анализами и картами мышления" />
        </Head>

        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← На главную
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  🧠 Личный кабинет
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.firstName || user?.username}
                </span>
                <Link href="/questionnaire" className="btn-primary text-sm">
                  Новый анализ
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Добро пожаловать в ваш личный кабинет!
                </h1>
                <p className="text-lg text-gray-700 mb-4">
                  Здесь вы можете управлять своими анализами и картами мышления
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {results.length} анализ(ов) завершено
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Персональные рекомендации доступны
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/questionnaire" className="block">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  Новый анализ
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  Создайте новую карту мышления на основе свежих ответов
                </p>
              </div>
            </Link>

            <div className="card">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Статистика
              </h3>
              <p className="text-gray-600 text-sm text-center">
                {results.length} завершенных анализов
              </p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Настройки
              </h3>
              <p className="text-gray-600 text-sm text-center">
                Управление профилем и предпочтениями
              </p>
            </div>
          </div>

          {/* Results History */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                История анализов
              </h2>
              <span className="text-sm text-gray-500">
                {results.length} результат(ов)
              </span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Анализов пока нет
                </h3>
                <p className="text-gray-600 mb-6">
                  Пройдите опрос, чтобы создать свою первую карту мышления
                </p>
                <Link href="/questionnaire" className="btn-primary">
                  Начать анализ
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">🧠</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Анализ #{results.length - index}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(result.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/results?id=${result.id}`}
                        className="btn-primary text-sm"
                      >
                        Просмотреть
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Сильные стороны:</span>
                        <p className="text-gray-600 mt-1">
                          {result.personalityAnalysis?.strengths?.substring(0, 100)}...
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Рекомендации:</span>
                        <p className="text-gray-600 mt-1">
                          {result.recommendations?.[0]?.title || 'Доступны рекомендации'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}