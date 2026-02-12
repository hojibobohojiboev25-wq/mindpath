import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MindMapVisualization from '../components/MindMapVisualization';
import Recommendations from '../components/Recommendations';
import AppLayout from '../components/AppLayout';
import { getLatestResult } from '../services/api/analysis';

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
      let profile = null;
      if (storedProfile) {
        profile = JSON.parse(storedProfile);
        setUser(profile);
      }

      // Load latest results
      if (!profile?.id) {
        setError('Профиль не найден. Создайте профиль заново.');
      } else {
        const resultsData = await getLatestResult(profile.id);
        setResult(resultsData.result);
      }

    } catch (error) {
      console.error('Error loading results:', error);
      if (error?.status === 404) {
        setError('Результаты анализа не найдены. Сначала пройдите опрос.');
      } else {
        setError(error?.data?.error || 'Ошибка сети');
      }
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
      <AppLayout title="Ошибка результатов - MindPath" description="Ошибка загрузки анализа" user={user} active="results">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="card max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Ошибка</h2>
            <p className="mb-6 text-slate-600">{error}</p>
            <button
              onClick={() => router.push('/questionnaire')}
              className="btn-primary"
            >
              Пройти опрос заново
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Результаты анализа - MindPath"
      description="Ваш персональный AI-отчёт и карта мышления"
      user={user}
      active="results"
    >
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="app-nav-link inline-flex">
          ← Назад
        </button>
      </div>
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
                      src={result.mindMapImageUrl}
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
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Результаты еще не готовы</h2>
          <p className="mb-6 text-slate-600">
            Ваш анализ находится в процессе. Обычно это занимает 1-2 минуты.
          </p>
          <button
            onClick={loadProfileAndResults}
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
    </AppLayout>
  );
}