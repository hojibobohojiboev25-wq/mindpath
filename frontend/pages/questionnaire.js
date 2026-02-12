import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QuestionnaireForm from '../components/QuestionnaireForm';
import AppLayout from '../components/AppLayout';

export default function Questionnaire() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProfileAndQuestions();
  }, []);

  const loadProfileAndQuestions = async () => {
    try {
      // Load user profile
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      }

      // Load questionnaire questions
      const questionsResponse = await fetch('/api/questionnaire/questions');

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
    <AppLayout
      title="Опрос личности - MindPath"
      description="Психологическая анкета для AI-анализа личности"
      user={user}
      active="questionnaire"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <button
            onClick={() => router.push('/')}
            className="app-nav-link inline-flex"
          >
            ← Назад
          </button>
        </div>
        <div className="card">
          <div className="mb-8">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Анкета личности</h2>
            <p className="text-slate-600">
              Ответьте максимально честно. На основе этой анкеты ИИ построит ваш профиль и карту мышления.
            </p>
          </div>

          <QuestionnaireForm
            questions={questions}
            onComplete={() => router.push('/results')}
          />
        </div>
      </div>
    </AppLayout>
  );
}