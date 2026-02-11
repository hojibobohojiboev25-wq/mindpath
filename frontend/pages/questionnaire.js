import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AuthCheck from '../components/AuthCheck';
import QuestionnaireForm from '../components/QuestionnaireForm';

export default function Questionnaire() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadQuestions();
  }, []);

  const checkAuthAndLoadQuestions = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!authResponse.ok) {
        router.push('/');
        return;
      }

      const authData = await authResponse.json();
      setUser(authData.user);

      // Load questionnaire questions
      const questionsResponse = await fetch('/api/questionnaire/questions', {
        credentials: 'include'
      });

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions);
      }

    } catch (error) {
      console.error('Error loading questionnaire:', error);
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

  return (
    <AuthCheck user={user}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Опрос - Карта Мышления</title>
          <meta name="description" content="Заполните анкету для создания вашей карты мышления" />
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
                  Анкета личности
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Расскажите о себе
              </h2>
              <p className="text-gray-600">
                Для создания персональной карты мышления нам нужно лучше узнать вас.
                Ответьте на вопросы максимально честно - это поможет получить точный анализ.
              </p>
            </div>

            <QuestionnaireForm
              questions={questions}
              onComplete={() => router.push('/results')}
            />
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}