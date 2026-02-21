'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { SystemState } from '@/types';

export default function ApprovalBanner() {
  const { state, setState, setSelectedTaskId, setRightPanelView } = useAppStore();
  const [approving, setApproving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!state || dismissed) return null;

  const pending = state.tasks.filter((t) => t.status === 'pending' && t.requiresApproval);
  if (pending.length === 0) return null;

  const approveAll = async () => {
    setApproving(true);
    try {
      for (const task of pending) {
        const res = await fetch('/api/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, action: 'approve' }),
        });
        const updated: SystemState = await res.json();
        setState(updated);
      }
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="floating-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--primary)',
        }} className="animate-pulse-amber" />
        <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {pending.length} pending approval{pending.length > 1 ? 's' : ''}
        </span>
        <button
          onClick={() => { setSelectedTaskId(pending[0].id); setRightPanelView('tasks'); }}
          style={{
            background: 'none', border: 'none', color: 'var(--primary)',
            cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)',
            textDecoration: 'underline',
          }}
        >
          Review
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary"
          style={{ padding: '4px 14px', fontSize: 11 }}
          onClick={approveAll}
          disabled={approving}
        >
          {approving ? 'Approving...' : `Approve All (${pending.length})`}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 16, padding: '2px 6px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
