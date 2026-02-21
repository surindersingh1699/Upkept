'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { CopilotChat } from '@copilotkit/react-ui';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import ChatSidebar from '@/components/ChatSidebar';
import GraphCanvas from '@/components/GraphCanvas';
import RightPanel from '@/components/RightPanel';
import ApprovalBanner from '@/components/ApprovalBanner';
import Timeline from '@/components/Timeline';
import Calendar from '@/components/Calendar';
import CopilotProvider from '@/components/CopilotProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { dashboardView, rightPanelView, state, sites, activeSiteId } = useAppStore();
  const activeSite = sites.find((s) => s.id === activeSiteId);
  const hasCompletedSetup = activeSite?.setupCompleted === true;

  // Redirect to setup if no completed setup and no existing state
  useEffect(() => {
    if (!hasCompletedSetup && !state) {
      router.push('/dashboard/setup');
    }
  }, [hasCompletedSetup, state, router]);

  return (
    <>
      <CopilotProvider />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
        <Header />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ChatSidebar />

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {dashboardView === 'chat' && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <div className="upkept-chat-center" style={{ width: '100%', maxWidth: 800, height: '100%' }}>
                  <CopilotChat
                    instructions="You are UpKept's AI property management assistant. You help users understand and manage their property maintenance, compliance, and vendors. When users ask about costs, savings, budgets, task status, compliance deadlines, asset health, vendor performance, or risks — use the visualization actions to generate interactive charts inline. You can also approve tasks, add/remove graph nodes, switch between property sites, and change optimization modes. You can switch dashboard views when asked. Be concise, helpful, and proactive."
                    labels={{
                      title: 'UpKept AI',
                      initial: 'Ask me anything about your property — compliance status, upcoming tasks, costs, vendor recommendations. I can generate charts and take actions for you.',
                    }}
                  />
                </div>
              </div>
            )}
            {dashboardView === 'graph' && (
              <>
                <div style={{ flex: 1, position: 'relative' }}>
                  <GraphCanvas />
                  <ApprovalBanner />
                </div>
                {rightPanelView !== 'none' && <RightPanel />}
              </>
            )}
            {dashboardView === 'timeline' && <Timeline />}
            {dashboardView === 'calendar' && <Calendar />}
          </div>
        </div>

        <StatusBar />
      </div>
    </>
  );
}
