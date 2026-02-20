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

function statusBadgeClass(status: Task['status']) {
  return `badge badge-${status}`;
}

function TaskRow({ task, selected, onClick }: { task: Task; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: selected ? 'var(--amber-glow)' : 'transparent',
        borderLeft: selected ? '2px solid var(--amber)' : '2px solid transparent',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Priority dot */}
      <div style={{ paddingTop: 3 }}>
        <div
          className={`status-dot dot-${task.priority === 'urgent' ? 'critical' : task.priority === 'high' ? 'attention' : 'ok'}`}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: selected ? 'var(--amber-bright)' : 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
          <span className={priorityBadgeClass(task.priority)}>{task.priority}</span>
          <span className={statusBadgeClass(task.status)}>{task.status}</span>
          {task.selectedVendor && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              → {task.selectedVendor.name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Due: {task.dueDate}</span>
          <span style={{ color: 'var(--green)' }}>${task.estimatedCost.toLocaleString()}</span>
          {task.marketPrice > task.estimatedCost && (
            <span style={{ color: 'var(--text-dim)' }}>
              vs ${task.marketPrice.toLocaleString()} market
            </span>
          )}
        </div>
      </div>

      {/* Confidence */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color:
              task.reasoning.confidenceScore >= 80
                ? 'var(--green)'
                : task.reasoning.confidenceScore >= 60
                ? 'var(--amber)'
                : 'var(--red)',
          }}
        >
          {task.reasoning.confidenceScore}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
          CONF
        </div>
      </div>
    </div>
  );
}

export default function TaskList() {
  const { state, selectedTaskId, setSelectedTaskId } = useAppStore();

  if (!state || state.tasks.length === 0) return null;

  const sorted = [...state.tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  const totalCost = state.tasks.reduce((s, t) => s + t.estimatedCost, 0);
  const totalMarket = state.tasks.reduce((s, t) => s + t.marketPrice, 0);
  const savings = totalMarket - totalCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Summary row */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 20,
          flexShrink: 0,
          background: 'var(--bg-surface)',
        }}
      >
        <SummaryItem label="Tasks" value={state.tasks.length} />
        <SummaryItem label="Total Est." value={`$${totalCost.toLocaleString()}`} valueColor="var(--text)" />
        <SummaryItem label="Market" value={`$${totalMarket.toLocaleString()}`} valueColor="var(--text-dim)" />
        <SummaryItem label="Savings" value={`$${savings.toLocaleString()}`} valueColor="var(--green)" />
        <SummaryItem
          label="Pending Approval"
          value={state.tasks.filter((t) => t.status === 'pending').length}
          valueColor="var(--amber)"
        />
      </div>

      {/* Task rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sorted.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            selected={task.id === selectedTaskId}
            onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  valueColor = 'var(--text)',
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: valueColor, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
