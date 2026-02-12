import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileSetup from '../components/ProfileSetup';
import AppLayout from '../components/AppLayout';

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
    <AppLayout
      title="MindPath - AI приложение для анализа личности"
      description="Профессиональная платформа анализа личности и mind map"
      user={user}
      active="home"
      rightSlot={
        <button
          onClick={() => {
            setUser(null);
            localStorage.removeItem('user_profile');
            setShowProfileSetup(true);
          }}
          className="btn-secondary text-xs sm:text-sm"
        >
          Изменить профиль
        </button>
      }
    >
      <section className="app-card mb-6 p-8 text-center">
        <h1 className="mb-3 text-3xl font-bold text-slate-900 sm:text-5xl">
          MindPath Platform
        </h1>
        <p className="mx-auto max-w-3xl text-slate-600 sm:text-lg">
          Полноценное веб-приложение: глобальный чат, AI-анализ личности, карта мышления и отдельные страницы модулей.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/sections" className="btn-primary">Открыть разделы</Link>
          <Link href="/chat" className="btn-secondary">Перейти в чат</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link href="/chat" className="app-card p-6">
          <p className="mb-2 text-3xl">💬</p>
          <h3 className="text-xl font-semibold">Чат</h3>
          <p className="mt-2 text-slate-600">Стабильная отправка сообщений, автообновление и сохранение истории.</p>
        </Link>
        <Link href="/questionnaire" className="app-card p-6">
          <p className="mb-2 text-3xl">🧠</p>
          <h3 className="text-xl font-semibold">AI-анализ</h3>
          <p className="mt-2 text-slate-600">OpenAI анализирует личность по анкете, выдаёт структурированный отчёт.</p>
        </Link>
        <Link href="/results" className="app-card p-6">
          <p className="mb-2 text-3xl">📈</p>
          <h3 className="text-xl font-semibold">Результаты</h3>
          <p className="mt-2 text-slate-600">Карта мышления, рекомендации и персональные выводы в отдельном разделе.</p>
        </Link>
      </section>
    </AppLayout>
  );
}