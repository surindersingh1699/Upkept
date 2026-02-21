'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatShortDate(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'var(--red)', text: '#fff' },
  high: { bg: 'var(--amber)', text: 'var(--bg-base)' },
  medium: { bg: 'var(--primary)', text: '#fff' },
  low: { bg: 'var(--teal)', text: '#fff' },
};

export default function Timeline() {
  const { state, setSelectedTaskId, setRightPanelView } = useAppStore();

  const { timelineStart, days, rows } = useMemo(() => {
    if (!state?.tasks.length) {
      return { timelineStart: new Date(), days: [], rows: [] };
    }

    const tasks = state.tasks;
    const compliance = state.complianceItems ?? [];

    // Find the date range
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 3); // Start 3 days ago
    start.setHours(0, 0, 0, 0);

    // Span 6 weeks
    const totalDays = 42;
    const dayArr: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      dayArr.push(addDays(start, i));
    }

    // Build rows from tasks
    const taskRows = tasks.map((task) => {
      const dueDate = new Date(task.dueDate);
      const scheduledDate = task.scheduledDate ? new Date(task.scheduledDate) : addDays(dueDate, -7);
      return {
        id: task.id,
        label: task.title,
        type: 'task' as const,
        priority: task.priority,
        status: task.status,
        startDate: scheduledDate,
        endDate: dueDate,
        cost: task.estimatedCost,
        vendor: task.selectedVendor?.name,
      };
    });

    // Build rows from compliance items
    const complianceRows = compliance.map((c) => {
      const dueDate = new Date(c.dueDate);
      const startDate = addDays(dueDate, -14); // Show 2 weeks before due
      return {
        id: c.id,
        label: c.name,
        type: 'compliance' as const,
        priority: c.riskLevel === 'critical' ? 'urgent' as const : c.riskLevel === 'high' ? 'high' as const : 'medium' as const,
        status: c.status,
        startDate,
        endDate: dueDate,
        cost: 0,
        vendor: c.authority,
      };
    });

    return {
      timelineStart: start,
      days: dayArr,
      rows: [...taskRows, ...complianceRows],
    };
  }, [state]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleRowClick = (row: (typeof rows)[0]) => {
    if (row.type === 'task') {
      setSelectedTaskId(row.id);
      setRightPanelView('task');
    }
  };

  if (!state?.tasks.length && !state?.complianceItems?.length) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'var(--text-dim)', background: 'var(--bg-surface)',
      }}>
        <svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="var(--text-dim)" strokeWidth="1" opacity="0.4">
          <rect x="1" y="3" width="14" height="2" rx="1" /><rect x="3" y="7" width="10" height="2" rx="1" /><rect x="1" y="11" width="8" height="2" rx="1" />
        </svg>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
          No scheduled events yet
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-dim)' }}>
          Run the AI agent to generate tasks and compliance items
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container" style={{ height: '100%', background: 'var(--bg-surface)' }}>
      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px',
        background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginRight: 8 }}>
          Priority:
        </span>
        {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 12, height: 4, borderRadius: 2,
              background: PRIORITY_COLORS[p].bg,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>
              {p}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 12 }}>
          <div style={{ width: 12, height: 4, borderRadius: 2, background: 'var(--green-bright)', opacity: 0.7 }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Approved</span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {/* Header Row */}
        <div className="timeline-header">
          <div className="timeline-header-label">Task / Item</div>
          <div className="timeline-dates">
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              const isMonday = d.getDay() === 1;
              return (
                <div key={i} className={`timeline-date-col ${isToday ? 'today' : ''}`} style={{ borderLeft: isMonday ? '1px solid var(--border)' : undefined }}>
                  <div style={{ fontSize: 9, color: isToday ? 'var(--primary)' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                  </div>
                  <div className="date-day">
                    {d.getDate()}
                  </div>
                  {d.getDate() === 1 && (
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>
                      {formatShortDate(d).split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        {rows.map((row) => {
          const startOffset = Math.max(0, daysBetween(days[0], row.startDate));
          const endOffset = Math.min(days.length, daysBetween(days[0], row.endDate) + 1);
          const barLeft = startOffset;
          const barWidth = Math.max(1, endOffset - startOffset);
          const colors = row.status === 'approved' || row.status === 'compliant'
            ? { bg: 'var(--green-bright)', text: '#fff' }
            : PRIORITY_COLORS[row.priority] ?? PRIORITY_COLORS.medium;

          return (
            <div key={row.id} className="timeline-row" onClick={() => handleRowClick(row)} style={{ cursor: row.type === 'task' ? 'pointer' : 'default' }}>
              <div className="timeline-row-label">
                <div style={{
                  width: 6, height: 6, borderRadius: row.type === 'task' ? 2 : '50%',
                  background: row.type === 'task' ? 'var(--purple)' : 'var(--amber)',
                  flexShrink: 0,
                }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {row.label}
                </div>
                {row.vendor && (
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {row.vendor}
                  </span>
                )}
              </div>
              <div className="timeline-row-cells" style={{ position: 'relative' }}>
                {days.map((d, i) => {
                  const isToday = d.getTime() === today.getTime();
                  return (
                    <div key={i} className="timeline-cell" style={{
                      background: isToday ? 'var(--primary-glow)' : undefined,
                    }} />
                  );
                })}
                {/* Bar */}
                {barLeft < days.length && barWidth > 0 && (
                  <div
                    className={`timeline-bar ${row.status === 'approved' || row.status === 'compliant' ? 'approved' : `priority-${row.priority}`}`}
                    style={{
                      left: `${(barLeft / days.length) * 100}%`,
                      width: `${(barWidth / days.length) * 100}%`,
                    }}
                  >
                    {barWidth >= 3 && (
                      <span>{row.label}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
