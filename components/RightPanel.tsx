'use client';

import { useAppStore } from '@/lib/store';
import NodeEditPanel from '@/components/NodeEditPanel';
import TaskDetail from '@/components/TaskDetail';
import TaskList from '@/components/TaskList';
import Analytics from '@/components/Analytics';

type View = 'node' | 'task' | 'tasks' | 'analytics';

const TABS: { id: View; label: string }[] = [
  { id: 'node', label: 'Node' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'analytics', label: 'Analytics' },
];

export default function RightPanel() {
  const { rightPanelView, setRightPanelView, selectedNodeId, selectedTaskId } = useAppStore();

  const activeView = rightPanelView as View;

  return (
    <div className="right-panel">
      {/* Header */}
      <div className="right-panel-header">
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em',
          color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500,
        }}>
          {activeView === 'node' ? 'Details' : activeView === 'task' ? 'Task Detail' : activeView === 'tasks' ? 'All Tasks' : 'Analytics'}
        </span>
        <button
          onClick={() => setRightPanelView('none')}
          style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 16, padding: '2px 6px',
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="right-panel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`right-panel-tab ${activeView === tab.id || (tab.id === 'node' && activeView === 'task') ? 'active' : ''}`}
            onClick={() => setRightPanelView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="right-panel-body">
        {activeView === 'node' && <NodeEditPanel />}
        {activeView === 'task' && <TaskDetail />}
        {activeView === 'tasks' && <TaskList />}
        {activeView === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}
