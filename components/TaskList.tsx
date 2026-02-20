'use client';

import { useAppStore } from '@/lib/store';
import type { Task } from '@/types';

const PRIORITY_ORDER: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function priorityBadgeClass(priority: Task['priority']) {
  return {
    urgent: 'badge badge-critical',
    high: 'badge badge-high',
    medium: 'badge badge-medium',
    low: 'badge badge-low',
  }[priority];
}

export default function TaskList() {
  const { state, selectedTaskId, setSelectedTaskId, setRightPanelView } = useAppStore();

  if (!state || state.tasks.length === 0) {
    return (
      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 12 }}>
        No tasks yet. Run the agent to generate tasks.
      </div>
    );
  }

  const sorted = [...state.tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  const totalCost = state.tasks.reduce((s, t) => s + t.estimatedCost, 0);
  const totalMarket = state.tasks.reduce((s, t) => s + t.marketPrice, 0);
  const savings = totalMarket - totalCost;

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setRightPanelView('task');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
        padding: '0 0 12px', borderBottom: '1px solid var(--border)', marginBottom: 12,
      }}>
        <MiniStat label="Tasks" value={state.tasks.length} />
        <MiniStat label="Est. Cost" value={`$${totalCost.toLocaleString()}`} color="var(--text)" />
        <MiniStat label="Savings" value={`$${savings.toLocaleString()}`} color="var(--green)" />
      </div>

      {/* Task cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((task) => {
          const isSelected = task.id === selectedTaskId;
          return (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                padding: '10px 12px', textAlign: 'left',
                background: isSelected ? 'var(--amber-glow)' : 'var(--bg-base)',
                border: `1px solid ${isSelected ? 'var(--amber-dim)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`status-dot dot-${task.priority === 'urgent' ? 'critical' : task.priority === 'high' ? 'attention' : 'ok'}`} />
                <span style={{
                  fontSize: 12, fontWeight: 500, color: 'var(--text)',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {task.title}
                </span>
                <span style={{
                  fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: task.reasoning.confidenceScore >= 80 ? 'var(--green)' : task.reasoning.confidenceScore >= 60 ? 'var(--amber)' : 'var(--red)',
                }}>
                  {task.reasoning.confidenceScore}
                </span>
              </div>

              {/* Badges + price row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className={priorityBadgeClass(task.priority)} style={{ fontSize: 9 }}>{task.priority}</span>
                <span className={`badge badge-${task.status}`} style={{ fontSize: 9 }}>{task.status}</span>
                {task.selectedVendor && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {task.selectedVendor.name}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  ${task.estimatedCost.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = 'var(--text-muted)' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      padding: '6px 8px', background: 'var(--bg-base)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 4px)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
