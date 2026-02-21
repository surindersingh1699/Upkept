'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';

interface CalendarEvent {
  id: string;
  label: string;
  date: Date;
  type: 'task' | 'compliance';
  priority: string;
  status: string;
}

function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from the Sunday before the first day
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  // End on the Saturday after the last day
  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { state, setSelectedTaskId, setRightPanelView } = useAppStore();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const events = useMemo<CalendarEvent[]>(() => {
    if (!state) return [];
    const evts: CalendarEvent[] = [];

    state.tasks.forEach((t) => {
      evts.push({
        id: t.id,
        label: t.title,
        date: new Date(t.dueDate),
        type: 'task',
        priority: t.priority,
        status: t.status,
      });
      if (t.scheduledDate) {
        evts.push({
          id: `${t.id}-sched`,
          label: `${t.title} (Start)`,
          date: new Date(t.scheduledDate),
          type: 'task',
          priority: t.priority,
          status: t.status,
        });
      }
    });

    state.complianceItems.forEach((c) => {
      evts.push({
        id: c.id,
        label: c.name,
        date: new Date(c.dueDate),
        type: 'compliance',
        priority: c.riskLevel === 'critical' ? 'urgent' : c.riskLevel,
        status: c.status,
      });
    });

    return evts;
  }, [state]);

  const calendarDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const todayStr = now.toISOString().split('T')[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const goToday = () => { setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); };

  const handleEventClick = (evt: CalendarEvent) => {
    if (evt.type === 'task') {
      const taskId = evt.id.replace('-sched', '');
      setSelectedTaskId(taskId);
      setRightPanelView('task');
    }
  };

  const getEventClass = (evt: CalendarEvent) => {
    if (evt.status === 'approved' || evt.status === 'compliant') return 'approved-event';
    if (evt.priority === 'urgent' || evt.priority === 'critical') return 'urgent-event';
    if (evt.type === 'compliance') return 'compliance-event';
    return 'task-event';
  };

  if (!state?.tasks.length && !state?.complianceItems?.length) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'var(--text-dim)', background: 'var(--bg-surface)',
      }}>
        <svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="var(--text-dim)" strokeWidth="1" opacity="0.4">
          <rect x="1" y="2" width="14" height="13" rx="2" /><line x1="1" y1="6" x2="15" y2="6" />
          <line x1="5" y1="1" x2="5" y2="3" /><line x1="11" y1="1" x2="11" y2="3" />
        </svg>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
          No events scheduled
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-dim)' }}>
          Run the AI agent to populate the calendar
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', overflow: 'hidden' }}>
      {/* Calendar Header / Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevMonth} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: 12,
            fontFamily: 'var(--font-display)', fontWeight: 600,
          }}>
            ‹
          </button>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            color: 'var(--text)', minWidth: 160, textAlign: 'center',
          }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: 12,
            fontFamily: 'var(--font-display)', fontWeight: 600,
          }}>
            ›
          </button>
        </div>

        <button onClick={goToday} className="btn btn-subtle" style={{ fontSize: 11, padding: '4px 12px' }}>
          Today
        </button>

        {/* Event count summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--purple)', opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{state?.tasks.length ?? 0} tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{state?.complianceItems.length ?? 0} compliance</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
        <div className="calendar-grid">
          {/* Day headers */}
          {DAYS.map((d) => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}

          {/* Date cells */}
          {calendarDays.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const isOtherMonth = day.getMonth() !== viewMonth;
            const dayEvents = events.filter((e) => e.date.toISOString().split('T')[0] === dateStr);

            return (
              <div
                key={i}
                className={`calendar-cell ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
              >
                <div className="day-number">
                  {day.getDate()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className={`calendar-event ${getEventClass(evt)}`}
                      onClick={() => handleEventClick(evt)}
                      title={evt.label}
                    >
                      {evt.label}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{
                      fontSize: 9, color: 'var(--text-muted)', padding: '1px 5px',
                      fontFamily: 'var(--font-body)', fontWeight: 600,
                    }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
