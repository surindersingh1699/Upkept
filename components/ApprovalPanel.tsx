'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { SystemState } from '@/types';

export default function ApprovalPanel() {
  const { state, setState, setSelectedTaskId } = useAppStore();
  const [approvingAll, setApprovingAll] = useState(false);

  if (!state) return null;

  const pendingTasks = state.tasks.filter((t) => t.status === 'pending' && t.requiresApproval);
  const approvedTasks = state.tasks.filter((t) => t.status === 'approved');

  const approveAll = async () => {
    setApprovingAll(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_all' }),
      });
      const updated: SystemState = await res.json();
      setState(updated);
    } finally {
      setApprovingAll(false);
    }
  };

  const approveSingle = async (taskId: string, scheduledDate?: string) => {
    const res = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action: 'approve', scheduledDate }),
    });
    const updated: SystemState = await res.json();
    setState(updated);
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pendingTasks.length > 0 && (
            <div className="status-dot dot-critical" />
          )}
          {pendingTasks.length === 0 && approvedTasks.length > 0 && (
            <div className="status-dot dot-ok" />
          )}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
            }}
          >
            HUMAN APPROVAL REQUIRED
          </span>
          {pendingTasks.length > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                background: 'var(--red-dim)',
                color: 'var(--red)',
                padding: '2px 6px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--red-dim)',
              }}
            >
              {pendingTasks.length} PENDING
            </span>
          )}
        </div>

        {pendingTasks.length > 0 && (
          <button
            className="btn btn-green"
            onClick={approveAll}
            disabled={approvingAll}
            style={{ padding: '6px 18px', fontSize: 11 }}
          >
            {approvingAll ? '⟳' : '✓'} Approve All ({pendingTasks.length})
          </button>
        )}

        {pendingTasks.length === 0 && approvedTasks.length > 0 && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              color: 'var(--green)',
              letterSpacing: '0.1em',
            }}
          >
            ✓ ALL APPROVED — System proceeding autonomously
          </div>
        )}
      </div>

      {/* Pending task chips */}
      {pendingTasks.length > 0 && (
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            flexWrap: 'nowrap',
          }}
        >
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius)',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div
                className={`status-dot dot-${task.priority === 'urgent' ? 'critical' : 'attention'}`}
              />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  {task.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {task.selectedVendor?.name ?? 'No vendor'} · ${task.estimatedCost.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="btn btn-green"
                  style={{ padding: '3px 10px', fontSize: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    approveSingle(task.id, task.scheduledDate);
                  }}
                >
                  ✓
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '3px 10px', fontSize: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTaskId(task.id);
                  }}
                >
                  ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
