'use client';

import { useAppStore } from '@/lib/store';
import SiteSelector from '@/components/SiteSelector';

const PHASE_COLORS: Record<string, string> = {
  idle: 'var(--text-muted)',
  intake: 'var(--blue)',
  planning: 'var(--amber)',
  review: 'var(--amber)',
  approved: 'var(--green)',
  complete: 'var(--green)',
};

export default function Header() {
  const { state, isPlanning, agentSteps } = useAppStore();
  const phase = state?.phase ?? 'idle';
  const phaseColor = PHASE_COLORS[phase] ?? 'var(--text-muted)';
  const activeAgent = isPlanning ? agentSteps[agentSteps.length - 1] : null;

  return (
    <header
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'linear-gradient(135deg, var(--amber) 0%, #D48900 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#07090C', fontFamily: 'var(--font-display)',
        }}>
          U
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
          letterSpacing: '0.08em', color: 'var(--text)',
        }}>
          UPKEPT
        </span>
      </div>

      {/* Site Selector */}
      <div style={{ marginLeft: 16 }}>
        <SiteSelector />
      </div>

      {/* Active agent status */}
      {activeAgent && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--amber)',
          }} className="animate-pulse-amber" />
          <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            {activeAgent.agentName}: {activeAgent.action}
          </span>
        </div>
      )}

      {/* Phase indicator */}
      <div style={{ marginLeft: activeAgent ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: phaseColor,
          boxShadow: `0 0 6px ${phaseColor}`,
        }} />
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.1em', color: phaseColor, textTransform: 'uppercase',
        }}>
          {phase}
        </span>
      </div>
    </header>
  );
}
