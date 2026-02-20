'use client';

import type { Task } from '@/types';

export function TaskBreakdownChart({ tasks }: { tasks: Task[] }) {
  const priorities = ['urgent', 'high', 'medium', 'low'] as const;
  const statuses = ['pending', 'approved', 'scheduled', 'completed'] as const;

  const statusColors: Record<string, string> = {
    pending: 'var(--amber)',
    approved: 'var(--green)',
    scheduled: 'var(--blue)',
    completed: 'var(--text-muted)',
  };

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Task Breakdown — {tasks.length} tasks
      </div>

      {/* By priority */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {priorities.map((p) => {
          const count = tasks.filter((t) => t.priority === p).length;
          const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
          const color = p === 'urgent' ? 'var(--red)' : p === 'high' ? 'var(--amber)' : p === 'medium' ? 'var(--blue)' : 'var(--text-muted)';
          return (
            <div key={p}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{p}</span>
                <span style={{ fontSize: 10, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count}</span>
              </div>
              <div style={{ height: 5, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(2, pct)}%`, background: color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* By status */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: 6 }}>BY STATUS</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {statuses.map((s) => {
          const count = tasks.filter((t) => t.status === s).length;
          if (count === 0) return null;
          return (
            <div key={s} style={{
              padding: '4px 8px', background: 'var(--bg-base)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[s] }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColors[s], fontFamily: 'var(--font-mono)' }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
