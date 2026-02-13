'use client';

import { useEffect, useState } from 'react';
import { getQuestionnaireQuestions, getQuestionnaireStatus, submitQuestionnaire } from '../../../../services/api/analysis';

function profileFromStorage() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user_profile');
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return { id: p.id || `user_${Date.now()}`, name: p.name || 'Guest', avatar: p.avatar || '👤' };
  } catch {
    return null;
  }
}

export default function AiAnalysisPage() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getQuestionnaireQuestions();
        setQuestions(data.questions || []);
      } catch (e) {
        setStatus(e.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit() {
    const profile = profileFromStorage();
    if (!profile) {
      setStatus('Profile not found');
      return;
    }
    setStatus('Submitting...');
    setProgress(10);
    try {
      const data = await submitQuestionnaire({ profile, responses });
      for (let i = 0; i < 40; i += 1) {
        const s = await getQuestionnaireStatus(data.submissionId);
        setStatus(`${s.status} (${s.progress || 0}%)`);
        setProgress(s.progress || 0);
        if (s.status === 'COMPLETED') {
          setStatus('Completed. Open AI Mind Map or Results section.');
          break;
        }
        if (s.status === 'FAILED') {
          setStatus('Processing failed');
          break;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (e) {
      setStatus(e.message || 'Submit failed');
    }
  }

  if (loading) return <div className="app-card p-6">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="app-card p-5">
        <h1 className="text-2xl font-semibold text-slate-900">AI Analysis</h1>
        <p className="mt-2 text-sm text-slate-600">Submit questionnaire and track async processing.</p>
      </div>
      <div className="app-card space-y-4 p-5">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{q.question}</label>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={responses[q.id] || ''}
              onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          </div>
        ))}
        <button className="btn-primary" onClick={handleSubmit}>Run AI Analysis</button>
        {status && (
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {status} {progress ? `- ${progress}%` : ''}
          </div>
        )}
      </div>
    </div>
  );
}
