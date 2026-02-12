import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';

const sections = [
  {
    id: 'chat',
    href: '/chat',
    title: 'Глобальный чат',
    icon: '💬',
    desc: 'Общение в реальном времени с автосохранением сообщений.'
  },
  {
    id: 'questionnaire',
    href: '/questionnaire',
    title: 'Опрос личности',
    icon: '🧠',
    desc: 'Глубокий профиль личности с анализом поведенческих паттернов.'
  },
  {
    id: 'results',
    href: '/results',
    title: 'Результаты и карта',
    icon: '📈',
    desc: 'Персональный отчёт, рекомендации и визуальная карта мышления.'
  },
  {
    id: 'admin',
    href: '/admin/login',
    title: 'Админ-панель',
    icon: '🔐',
    desc: 'Минималистичный контроль пользователей и активности системы.'
  }
];

export default function SectionsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user_profile');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem('user_profile');
      }
    }
  }, []);

  return (
    <AppLayout
      title="Разделы платформы - MindPath"
      description="Все разделы веб-приложения MindPath"
      user={user}
      active="sections"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Разделы приложения</h1>
        <p className="mt-2 text-slate-600">
          Отдельные страницы для каждого модуля. Переключайтесь между ними через верхнее меню.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((item) => (
          <Link key={item.id} href={item.href} className="group app-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                {item.icon}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-700">
                {item.title}
              </h2>
            </div>
            <p className="text-slate-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}

