'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../../../../services/api/admin';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(username, password);
      localStorage.setItem('admin_token', data.token);
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md app-card p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
