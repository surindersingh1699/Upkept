'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import SiteSelector from '@/components/SiteSelector';

type ViewType = 'graph' | 'timeline' | 'calendar';

const PHASE_COLORS: Record<string, string> = {
  idle: 'var(--text-muted)',
  intake: 'var(--primary)',
  planning: 'var(--amber)',
  review: 'var(--amber)',
  approved: 'var(--green-bright)',
  complete: 'var(--green-bright)',
};

interface HeaderProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Header({ activeView, onViewChange }: HeaderProps) {
  const { state, isPlanning, agentSteps } = useAppStore();
  const phase = state?.phase ?? 'idle';
  const phaseColor = PHASE_COLORS[phase] ?? 'var(--text-muted)';
  const activeAgent = isPlanning ? agentSteps[agentSteps.length - 1] : null;

  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? undefined,
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0],
          avatar: data.user.user_metadata?.avatar_url,
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        gap: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'var(--bg-base)', fontFamily: 'var(--font-display)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          U
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.01em',
        }}>
          UpKept
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border)', marginRight: 12 }} />

      {/* Site Selector */}
      <SiteSelector />

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 12px' }} />

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'graph' ? 'active' : ''}`}
          onClick={() => onViewChange('graph')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="4" cy="4" r="2.5" /><circle cx="12" cy="4" r="2.5" /><circle cx="8" cy="12" r="2.5" />
            <line x1="6" y1="4.5" x2="10" y2="4.5" /><line x1="5" y1="6" x2="7" y2="10" /><line x1="11" y1="6" x2="9" y2="10" />
          </svg>
          Graph
        </button>
        <button
          className={`view-tab ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => onViewChange('timeline')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="2" rx="1" /><rect x="3" y="7" width="10" height="2" rx="1" /><rect x="1" y="11" width="8" height="2" rx="1" />
          </svg>
          Timeline
        </button>
        <button
          className={`view-tab ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => onViewChange('calendar')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2" width="14" height="13" rx="2" /><line x1="1" y1="6" x2="15" y2="6" />
            <line x1="5" y1="1" x2="5" y2="3" /><line x1="11" y1="1" x2="11" y2="3" />
          </svg>
          Calendar
        </button>
      </div>

      {/* Active agent status */}
      {activeAgent && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginLeft: 'auto', marginRight: 16,
          padding: '4px 12px',
          background: 'var(--primary-dim)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--primary)',
          }} className="animate-pulse-amber" />
          <span style={{ fontSize: 11, color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {activeAgent.agentName}: {activeAgent.action}
          </span>
        </div>
      )}

      {/* Phase indicator */}
      <div style={{ marginLeft: activeAgent ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: phaseColor,
          }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            color: phaseColor, textTransform: 'capitalize',
          }}>
            {phase}
          </span>
        </div>
      </div>

      {/* User menu */}
      {user && (
        <div style={{ position: 'relative', marginLeft: 12 }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 8px', borderRadius: 'var(--radius)',
              background: 'none', border: '1px solid transparent',
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            onMouseLeave={(e) => { if (!showMenu) e.currentTarget.style.borderColor = 'transparent'; }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{ width: 26, height: 26, borderRadius: '50%' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}>
                {(user.name ?? 'U')[0].toUpperCase()}
              </div>
            )}
          </button>

          {showMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                minWidth: 200, zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    background: 'none', border: 'none', textAlign: 'left',
                    fontSize: 13, color: 'var(--red)', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
