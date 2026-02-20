'use client';

import { useAppStore } from '@/lib/store';
import Header from '@/components/Header';
import StatusBar from '@/components/StatusBar';
import LeftSidebar from '@/components/LeftSidebar';
import GraphCanvas from '@/components/GraphCanvas';
import RightPanel from '@/components/RightPanel';
import ApprovalBanner from '@/components/ApprovalBanner';

export default function HomePage() {
  const { rightPanelView } = useAppStore();

  return (
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
  );
}
