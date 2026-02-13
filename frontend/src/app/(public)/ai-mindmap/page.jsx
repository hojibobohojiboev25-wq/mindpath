'use client';

import { useEffect, useState } from 'react';
import { getLatestResult, updateMindMap } from '../../../../services/api/analysis';

function profileId() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user_profile') || '{}').id || null;
  } catch {
    return null;
  }
}

export default function AiMindMapPage() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const id = profileId();
      if (!id) {
        setStatus('Profile not found');
        return;
      }
      try {
        const data = await getLatestResult(id);
        setResult(data.result);
      } catch (e) {
        setStatus(e.message || 'No analysis result');
      }
    })();
  }, []);

  async function addNode() {
    if (!result?.id || !result?.mindMapData) return;
    const nodeId = `custom_${Date.now()}`;
    const next = {
      ...result.mindMapData,
      nodes: [...(result.mindMapData.nodes || []), { id: nodeId, text: 'New Node', type: 'item' }],
      edges: [...(result.mindMapData.edges || []), { from: 'center', to: nodeId }]
    };
    try {
      const updated = await updateMindMap(result.id, next);
      setResult(updated.result);
      setStatus('Mind map updated');
    } catch (e) {
      setStatus(e.message || 'Update failed');
    }
  }

  return (
    <div className="space-y-4">
      <div className="app-card p-5">
        <h1 className="text-2xl font-semibold text-slate-900">AI Mind Map</h1>
        <p className="mt-2 text-sm text-slate-600">View and edit saved mind map revisions.</p>
      </div>
      <div className="app-card p-5">
        {!result ? (
          <p className="text-slate-600">{status || 'Loading latest result...'}</p>
        ) : (
          <>
            <button className="btn-secondary mb-4" onClick={addNode}>Add demo node</button>
            <pre className="overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(result.mindMapData || {}, null, 2)}
            </pre>
          </>
        )}
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </div>
    </div>
  );
}
