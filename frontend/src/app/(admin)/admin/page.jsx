'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminUsers, verifyAdminToken } from '../../../../services/api/admin';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      try {
        await verifyAdminToken(token);
        const data = await getAdminUsers(token);
        setUsers(data.users || []);
        setStats(data.stats || null);
      } catch (err) {
        localStorage.removeItem('admin_token');
        setError(err.message || 'Unauthorized');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div className="app-card p-5">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="app-card p-5">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        {stats && (
          <p className="mt-2 text-sm text-slate-600">
            Users: {stats.totalUsers} | Active: {stats.activeUsers} | Messages: {stats.totalMessages}
          </p>
        )}
      </div>
      <div className="app-card overflow-auto p-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Name</th>
              <th className="py-2">Status</th>
              <th className="py-2">Messages</th>
              <th className="py-2">Analyses</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="py-2">{u.avatar} {u.name}</td>
                <td className="py-2">{u.status}</td>
                <td className="py-2">{u.messagesCount}</td>
                <td className="py-2">{u.analysesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
