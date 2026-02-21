'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CopilotSidebar } from '@copilotkit/react-ui';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import LeftSidebar from '@/components/LeftSidebar';
import GraphCanvas from '@/components/GraphCanvas';
import RightPanel from '@/components/RightPanel';
import ApprovalBanner from '@/components/ApprovalBanner';
import Timeline from '@/components/Timeline';
import Calendar from '@/components/Calendar';
import CopilotProvider from '@/components/CopilotProvider';

type ViewType = 'graph' | 'timeline' | 'calendar';

export default function DashboardPage() {
  const { rightPanelView } = useAppStore();
  const [activeView, setActiveView] = useState<ViewType>('graph');

  return (
    <>
      <CopilotProvider />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
        <Header activeView={activeView} onViewChange={setActiveView} />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <LeftSidebar />

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {activeView === 'graph' && (
              <>
                <GraphCanvas />
                <ApprovalBanner />
              </>
            )}
            {activeView === 'timeline' && <Timeline />}
            {activeView === 'calendar' && <Calendar />}
          </div>

          {rightPanelView !== 'none' && <RightPanel />}
        </div>

        <StatusBar />
      </div>

      <CopilotSidebar
        defaultOpen={false}
        instructions="You are UpKept's AI property management assistant. You help users understand and manage their property maintenance, compliance, and vendors. When users ask about costs, savings, budgets, task status, compliance deadlines, asset health, vendor performance, or risks — use the visualization actions to generate interactive charts inline. You can also approve tasks, add/remove graph nodes, switch between property sites, and change optimization modes. Be concise, helpful, and proactive."
        labels={{
          title: 'UpKept AI',
          initial: 'Ask me about your property — costs, tasks, compliance, risks. I can generate charts and take actions for you.',
        }}
      />
    </>
  );
}
