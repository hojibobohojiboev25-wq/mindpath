'use client';

export default function GlobalError({ error, reset }) {
  return (
    <div className="app-card p-6">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">{error?.message || 'Unexpected error'}</p>
      <button className="btn-primary mt-4" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
