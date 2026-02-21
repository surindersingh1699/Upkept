'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { DashboardView } from '@/types';

const NAV_ITEMS: { view: DashboardView; label: string; icon: React.ReactNode }[] = [
  {
    view: 'chat',
    label: 'Chat',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V4a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    view: 'graph',
    label: 'Graph',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="4" r="2.5" /><circle cx="12" cy="4" r="2.5" /><circle cx="8" cy="12" r="2.5" />
        <line x1="6" y1="4.5" x2="10" y2="4.5" /><line x1="5" y1="6" x2="7" y2="10" /><line x1="11" y1="6" x2="9" y2="10" />
      </svg>
    ),
  },
  {
    view: 'timeline',
    label: 'Timeline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="14" height="2" rx="1" /><rect x="3" y="7" width="10" height="2" rx="1" /><rect x="1" y="11" width="8" height="2" rx="1" />
      </svg>
    ),
  },
  {
    view: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="2" width="14" height="13" rx="2" /><line x1="1" y1="6" x2="15" y2="6" />
        <line x1="5" y1="1" x2="5" y2="3" /><line x1="11" y1="1" x2="11" y2="3" />
      </svg>
    ),
  },
];

export default function ChatSidebar() {
  const router = useRouter();
  const { dashboardView, setDashboardView, state, sites, activeSiteId } = useAppStore();
  const activeSite = sites.find((s) => s.id === activeSiteId);

  return (
    <div style={{
      width: 60, flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 0', gap: 4,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-sidebar)',
    }}>
      {/* Navigation */}
      {NAV_ITEMS.map((item) => (
        <button
          key={item.view}
          onClick={() => setDashboardView(item.view)}
          title={item.label}
          style={{
            width: 44, height: 44, borderRadius: 'var(--radius)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, border: 'none', cursor: 'pointer',
            background: dashboardView === item.view ? 'var(--primary-dim)' : 'transparent',
            color: dashboardView === item.view ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          {item.icon}
          <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {item.label}
          </span>
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Quick stats */}
      {state && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: '8px 0', borderTop: '1px solid var(--border)', width: '100%',
        }}>
          <div title={`${state.analytics?.complianceScore ?? 0}% compliance`} style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `3px solid ${(state.analytics?.complianceScore ?? 0) >= 80 ? 'var(--green)' : (state.analytics?.complianceScore ?? 0) >= 50 ? 'var(--amber)' : 'var(--red)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}>
            {state.analytics?.complianceScore ?? 0}
          </div>
        </div>
      )}

      {/* Edit site */}
      <button
        onClick={() => router.push(`/dashboard/setup?edit=${activeSiteId}`)}
        title="Edit site info"
        style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'var(--text-muted)',
          transition: 'all 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 14H14" /><path d="M11.5 2.5a1.414 1.414 0 012 2L5 13l-3 1 1-3 8.5-8.5z" />
        </svg>
      </button>

      {/* Add site */}
      <button
        onClick={() => router.push('/dashboard/setup')}
        title="Add new site"
        style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'var(--text-muted)',
          transition: 'all 0.15s', marginBottom: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
        </svg>
      </button>
    </div>
  );
}
