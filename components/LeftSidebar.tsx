'use client';

import { useAppStore } from '@/lib/store';
import IntakePanel from '@/components/IntakePanel';
import AgentStream from '@/components/AgentStream';

export default function LeftSidebar() {
  const { leftCollapsed, toggleLeftSidebar } = useAppStore();

  if (leftCollapsed) {
    return (
      <div
        className="left-sidebar collapsed"
        style={{ alignItems: 'center', paddingTop: 8, gap: 12 }}
      >
        <button
          onClick={toggleLeftSidebar}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 16, padding: 8,
          }}
          title="Expand sidebar"
        >
          ▸
        </button>
      </div>
    );
  }

  return (
    <div className="left-sidebar">
      {/* Collapse button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em',
          color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500,
        }}>
          Intake & Reasoning
        </span>
        <button
          onClick={toggleLeftSidebar}
          style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 14, padding: '2px 4px',
          }}
          title="Collapse sidebar"
        >
          ◂
        </button>
      </div>

      {/* Intake Panel — top section */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <IntakePanel />
      </div>

      {/* Agent Stream — bottom section, fills remaining space */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AgentStream />
      </div>
    </div>
  );
}
