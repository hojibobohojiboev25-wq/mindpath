'use client';

import { useEffect, useRef, useState } from 'react';
import { getChatSocket, disconnectChatSocket } from '../../../../services/socket/chatSocket';
import { getChatHistory, joinChat, markDelivered, markRead, sendChatMessage } from '../../../../services/api/chat';

function getProfile() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user_profile');
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return {
      id: p.id || `user_${Date.now()}`,
      name: p.name || p.firstName || p.username || 'Guest',
      avatar: p.avatar || '👤'
    };
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');
  const [activeUsers, setActiveUsers] = useState(0);
  const [sending, setSending] = useState(false);
  const knownIds = useRef(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (!p) return undefined;

    let mounted = true;
    (async () => {
      try {
        await joinChat(p);
        const history = await getChatHistory(120);
        if (!mounted) return;
        const msgs = history.messages || [];
        knownIds.current = new Set(msgs.map((m) => m.id));
        setMessages(msgs);
      } catch {
        setStatus('Cannot load chat history');
      }
    })();

    const socket = getChatSocket();
    socket.emit('chat:join', p);
    socket.on('chat:message', (msg) => {
      setMessages((prev) => {
        if (knownIds.current.has(msg.id)) return prev;
        knownIds.current.add(msg.id);
        return [...prev, msg].slice(-200);
      });
      if (msg.profileId !== p.id) {
        markDelivered(msg.id, p.id).catch(() => null);
        markRead(msg.id, p.id).catch(() => null);
        socket.emit('chat:delivered', { messageId: msg.id, profileId: p.id });
        socket.emit('chat:read', { messageId: msg.id, profileId: p.id });
      }
    });
    socket.on('chat:presence', () => {
      setActiveUsers((v) => Math.max(v, 1));
    });
    socket.on('chat:receipt', (receipt) => {
      setMessages((prev) => prev.map((m) => (m.id === receipt.messageId ? { ...m, status: receipt.status } : m)));
    });
    socket.on('connect_error', () => {
      setStatus('Socket disconnected, fallback mode enabled');
    });

    return () => {
      mounted = false;
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    const uniqueUsers = new Set(messages.map((m) => m.profileId).filter(Boolean));
    if (uniqueUsers.size) setActiveUsers(uniqueUsers.size);
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!profile || !input.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage({
        profileId: profile.id,
        profileName: profile.name,
        profileAvatar: profile.avatar,
        content: input.trim()
      });
      const socket = getChatSocket();
      if (socket.connected) socket.emit('chat:send', { content: input.trim() });
      setInput('');
      setStatus('');
    } catch (err) {
      setStatus(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (!profile) {
    return (
      <div className="app-card p-6">
        <h1 className="text-xl font-semibold text-slate-900">Create profile first</h1>
        <p className="mt-2 text-slate-600">Set `user_profile` in localStorage from home profile setup.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="app-card flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-slate-900">Realtime Chat</h1>
        <span className="text-sm text-slate-600">{activeUsers} online</span>
      </div>
      <div className="app-card h-[60vh] overflow-auto p-4">
        {status && <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">{status}</div>}
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={m.profileId === profile.id ? 'text-right' : ''}>
              <div className={`inline-block rounded-xl px-3 py-2 text-sm ${m.profileId === profile.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                <div className="text-[11px] opacity-80">{m.userName || 'User'}</div>
                <div>{m.content}</div>
                {m.profileId === profile.id && <div className="text-[10px] uppercase opacity-80">{m.status || 'SENT'}</div>}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <form onSubmit={handleSend} className="app-card flex gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          maxLength={500}
        />
        <button type="submit" className="btn-primary" disabled={sending || !input.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
