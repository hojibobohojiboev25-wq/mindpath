'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const cards = [
  { href: '/chat', title: 'Realtime Chat', text: 'Global websocket chat with delivery receipts.' },
  { href: '/ai-analysis', title: 'AI Analysis', text: 'Questionnaire to personality report pipeline.' },
  { href: '/ai-mindmap', title: 'AI Mind Map', text: 'Editable mind map revisions backed by API.' },
  { href: '/ai-assistant', title: 'AI Assistant', text: 'Dedicated assistant with separate threads.' }
];

export default function HomePage() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      setProfile(null);
    }
  }, []);

  function saveProfile() {
    if (!name.trim()) return;
    const p = {
      id: `profile_${Date.now()}`,
      name: name.trim(),
      avatar
    };
    localStorage.setItem('user_profile', JSON.stringify(p));
    setProfile(p);
    setName('');
  }

  return (
    <div className="space-y-6">
      <section className="app-card p-8">
        <h1 className="text-3xl font-bold text-slate-900">MindPath Rebuild</h1>
        <p className="mt-3 text-slate-600">
          Production-ready architecture with separate frontend and backend services.
        </p>
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Profile Setup</h2>
          {profile ? (
            <p className="mt-2 text-sm text-slate-600">
              Active profile: {profile.avatar} {profile.name}
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Your name"
              />
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-20 rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="😀"
              />
              <button className="btn-primary text-sm" onClick={saveProfile}>
                Save Profile
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="app-card block p-5 transition hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
