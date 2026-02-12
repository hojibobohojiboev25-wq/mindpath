import Head from 'next/head';
import Link from 'next/link';

export default function AppLayout({
  title,
  description,
  user,
  children,
  rightSlot,
  active = ''
}) {
  const nav = [
    { id: 'home', href: '/', label: 'Главная', icon: '🏠' },
    { id: 'sections', href: '/sections', label: 'Разделы', icon: '🧩' },
    { id: 'chat', href: '/chat', label: 'Чат', icon: '💬' },
    { id: 'questionnaire', href: '/questionnaire', label: 'Анализ', icon: '🧠' },
    { id: 'results', href: '/results', label: 'Результаты', icon: '📈' }
  ];

  return (
    <div className="min-h-screen app-bg">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="app-logo">🧠</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">MindPath</p>
              <p className="text-xs text-slate-500">AI Personality & Mind Map</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`app-nav-link ${active === item.id ? 'app-nav-link-active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 sm:flex">
                <span className="text-lg">{user.avatar || '👤'}</span>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
            )}
            {rightSlot}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

