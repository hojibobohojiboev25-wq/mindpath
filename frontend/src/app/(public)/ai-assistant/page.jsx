'use client';

import { useEffect, useState } from 'react';
import {
  createAssistantThread,
  listAssistantMessages,
  listAssistantThreads,
  sendAssistantMessage
} from '../../../../services/api/assistant';

function getProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return { id: p.id || null, name: p.name || 'Guest' };
  } catch {
    return null;
  }
}

export default function AiAssistantPage() {
  const [profile, setProfile] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (!p?.id) return;
    (async () => {
      try {
        const data = await listAssistantThreads(p.id);
        setThreads(data.threads || []);
        if (data.threads?.length) setThreadId(data.threads[0].id);
      } catch (e) {
        setStatus(e.message || 'Failed to load threads');
      }
    })();
  }, []);

  useEffect(() => {
    if (!threadId) return;
    (async () => {
      try {
        const data = await listAssistantMessages(threadId);
        setMessages(data.messages || []);
      } catch (e) {
        setStatus(e.message || 'Failed to load messages');
      }
    })();
  }, [threadId]);

  async function handleNewThread() {
    if (!profile?.id) return;
    const data = await createAssistantThread(profile.id, `Thread ${threads.length + 1}`);
    const next = [data.thread, ...threads];
    setThreads(next);
    setThreadId(data.thread.id);
    setMessages([]);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!profile?.id || !threadId || !input.trim()) return;
    try {
      const data = await sendAssistantMessage(profile.id, threadId, input.trim());
      setMessages((prev) => [...prev, { role: 'USER', content: input.trim(), id: `tmp_${Date.now()}` }, data.message]);
      setInput('');
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Assistant request failed');
    }
  }

  if (!profile?.id) {
    return <div className="app-card p-5">Create profile first to use AI Assistant.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <aside className="app-card p-4">
        <button className="btn-primary w-full" onClick={handleNewThread}>New Thread</button>
        <div className="mt-4 space-y-2">
          {threads.map((t) => (
            <button
              key={t.id}
              className={`w-full rounded border px-3 py-2 text-left text-sm ${threadId === t.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
              onClick={() => setThreadId(t.id)}
            >
              {t.title || 'Untitled'}
            </button>
          ))}
        </div>
      </aside>
      <section className="app-card flex h-[70vh] flex-col p-4">
        <h1 className="text-xl font-semibold text-slate-900">AI Assistant</h1>
        <div className="mt-3 flex-1 space-y-3 overflow-auto rounded border border-slate-200 p-3">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'USER' ? 'text-right' : 'text-left'}>
              <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input className="flex-1 rounded border border-slate-300 px-3 py-2" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn-primary" type="submit">Send</button>
        </form>
        {status && <p className="mt-2 text-sm text-amber-700">{status}</p>}
      </section>
    </div>
  );
}
