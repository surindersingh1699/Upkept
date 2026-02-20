'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/Header';
import AgentStream from '@/components/AgentStream';
import IntakePanel from '@/components/IntakePanel';
import TaskList from '@/components/TaskList';
import TaskDetail from '@/components/TaskDetail';
import ApprovalPanel from '@/components/ApprovalPanel';
import AssetGraph from '@/components/AssetGraph';
import Analytics from '@/components/Analytics';

const TABS = [
  { id: 'tasks', label: 'Tasks & Approval' },
  { id: 'graph', label: 'Asset Graph' },
  { id: 'analytics', label: 'Analytics' },
] as const;

export default function HomePage() {
  const { state, activeTab, setActiveTab } = useAppStore();
  const hasState = state && state.assets.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}
    >
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Agent Reasoning Stream */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <AgentStream />
        </div>

        {/* Right: Main content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {!hasState ? (
            /* ── PHASE 0: Intake ── */
            <div style={{ flex: 1, overflowY: 'auto' }} className="grid-bg">
              <IntakePanel />
            </div>
          ) : (
            /* ── PHASE 1+: Dashboard ── */
            <>
              {/* Tab bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  padding: '0 16px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  flexShrink: 0,
                }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid var(--amber)' : '2px solid transparent',
                      color: activeTab === tab.id ? 'var(--amber)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      marginBottom: '-1px',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    {tab.label}
                    {tab.id === 'tasks' && state.tasks.filter((t) => t.status === 'pending').length > 0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          background: 'var(--red)',
                          color: 'white',
                          borderRadius: 10,
                          padding: '1px 6px',
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {state.tasks.filter((t) => t.status === 'pending').length}
                      </span>
                    )}
                  </button>
                ))}

                {/* Reset button */}
                <button
                  className="btn btn-ghost"
                  style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 10 }}
                  onClick={() => {
                    useAppStore.getState().reset();
                    fetch('/api/state', { method: 'PATCH', body: JSON.stringify({ phase: 'idle', assets: [], tasks: [], complianceItems: [] }), headers: { 'Content-Type': 'application/json' } });
                  }}
                >
                  ↺ Reset
                </button>
              </div>

              {/* Tab content */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {activeTab === 'tasks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <TaskList />
                    </div>
                    <ApprovalPanel />
                  </div>
                )}
                {activeTab === 'graph' && <AssetGraph />}
                {activeTab === 'analytics' && <Analytics />}

                {/* Task Detail overlay (z-index modal) */}
                <TaskDetail />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
