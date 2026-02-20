'use client';

import { useAppStore } from '@/lib/store';
import { CopilotSidebar } from '@copilotkit/react-ui';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import LeftSidebar from '@/components/LeftSidebar';
import GraphCanvas from '@/components/GraphCanvas';
import RightPanel from '@/components/RightPanel';
import ApprovalBanner from '@/components/ApprovalBanner';
import CopilotProvider from '@/components/CopilotProvider';

export default function HomePage() {
  const { rightPanelView } = useAppStore();

  return (
    <>
      {/* Headless: registers CopilotKit readable state + actions */}
      <CopilotProvider />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
        <Header />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <LeftSidebar />

          {/* Center: Graph Canvas — always visible, hero element */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <GraphCanvas />
            <ApprovalBanner />
          </div>

          {/* Right Panel — slides in when a node/task/analytics is selected */}
          {rightPanelView !== 'none' && <RightPanel />}
        </div>

        <StatusBar />
      </div>

      {/* CopilotKit AI Assistant Sidebar */}
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
