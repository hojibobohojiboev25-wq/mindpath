import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MindMapVisualization from '../components/MindMapVisualization';
import Recommendations from '../components/Recommendations';

export default function Results() {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfileAndResults();
  }, []);

  const loadProfileAndResults = async () => {
    try {
      // Load user profile
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      }

      // Load latest results
      const resultsResponse = await fetch('/api/results/latest');

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResult(resultsData.result);
      } else if (resultsResponse.status === 404) {
        setError('Результаты анализа не найдены. Сначала пройдите опрос.');
      } else {
        setError('Ошибка загрузки результатов');
      }

    } catch (error) {
      console.error('Error loading results:', error);
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <AuthCheck user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="card max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/questionnaire')}
              className="btn-primary"
            >
              Пройти опрос заново
            </button>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Результаты - Карта Мышления</title>
          <meta name="description" content="Ваши результаты анализа личности и карта мышления" />
        </Head>

        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900 mr-4"
                >
                  ← Назад
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Ваши результаты
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {result ? (
            <div className="space-y-8">
              {/* Personality Analysis */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Анализ личности
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Основные черты характера
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {result.personalityAnalysis.traits}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Сильные стороны
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {result.personalityAnalysis.strengths}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Области для развития
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.personalityAnalysis.development_areas}
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Карьерные рекомендации
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.personalityAnalysis.career_recommendations}
                  </p>
                </div>
              </div>

              {/* Mind Map Visualization */}
              {result.mindMapData && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Интерактивная карта мышления
                  </h2>
                  <MindMapVisualization data={result.mindMapData} />
                </div>
              )}

              {/* Generated Mind Map Image */}
              {result.mindMapImageUrl && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Сгенерированная карта мышления
                  </h2>
                  <div className="text-center">
                    <img
                      src={`http://localhost:3001${result.mindMapImageUrl}`}
                      alt="Mind Map"
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <Recommendations recommendations={result.recommendations} />
            </div>
          ) : (
            <div className="card text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Результаты еще не готовы
              </h2>
              <p className="text-gray-600 mb-6">
                Ваш анализ находится в процессе. Обычно это занимает 1-2 минуты.
              </p>
              <button
                onClick={checkAuthAndLoadResults}
                className="btn-primary mr-4"
              >
                Проверить снова
              </button>
              <button
                onClick={() => router.push('/questionnaire')}
                className="btn-secondary"
              >
                Пройти опрос заново
              </button>
            </div>
          )}
        </main>
      </div>
  );
}