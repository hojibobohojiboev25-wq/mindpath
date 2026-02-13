import '../../styles/globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'MindPath',
  description: 'AI personality platform with realtime chat'
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/chat', label: 'Chat' },
  { href: '/ai-analysis', label: 'AI Analysis' },
  { href: '/ai-mindmap', label: 'AI Mind Map' },
  { href: '/ai-assistant', label: 'AI Assistant' },
  { href: '/admin', label: 'Admin' }
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-bg min-h-screen">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="app-logo">
              MindPath
            </Link>
            <nav className="hidden gap-3 md:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="app-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
