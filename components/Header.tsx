'use client';

import { useAppStore } from '@/lib/store';

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  idle:     { label: 'STANDBY',  color: 'var(--text-muted)' },
  intake:   { label: 'INTAKE',   color: 'var(--amber)' },
  planning: { label: 'PLANNING', color: 'var(--amber)' },
  review:   { label: 'REVIEW',   color: 'var(--blue)' },
  approved: { label: 'APPROVED', color: 'var(--green)' },
  complete: { label: 'COMPLETE', color: 'var(--green)' },
};

export default function Header() {
  const { state, isPlanning, agentSteps } = useAppStore();
  const phase = state?.phase ?? 'idle';
  const { label, color } = PHASE_LABELS[phase] ?? PHASE_LABELS.idle;
  const lastStep = agentSteps[agentSteps.length - 1];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '48px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--amber-glow)',
              border: '1px solid var(--amber)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--amber)',
              letterSpacing: '0.05em',
            }}
          >
            U
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}
          >
            UPKEPT
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          Asset &amp; Compliance Autopilot
        </span>
      </div>

      {/* Center: live agent status */}
      {isPlanning && lastStep && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="status-dot dot-attention animate-pulse-amber" />
          <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            {lastStep.agentName} · {lastStep.action}
          </span>
        </div>
      )}

      {/* Right: system status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {state && (
          <>
            <StatusPill label="Assets" value={state.assets.length} />
            <StatusPill label="Tasks" value={state.tasks.length} />
            <StatusPill
              label="Score"
              value={`${state.analytics.complianceScore}%`}
              color={
                state.analytics.complianceScore >= 70
                  ? 'var(--green)'
                  : state.analytics.complianceScore >= 40
                  ? 'var(--amber)'
                  : 'var(--red)'
              }
            />
          </>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            border: '1px solid',
            borderColor: color,
            borderRadius: 'var(--radius)',
            background: `${color}15`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              boxShadow: isPlanning ? `0 0 8px ${color}` : 'none',
              animation: isPlanning ? 'pulse-amber 1s ease-in-out infinite' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color,
            }}
          >
            {label}
          </span>
        </div>

        {/* Bedrock badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            AMAZON BEDROCK
          </span>
        </div>
      </div>
    </header>
  );
}

function StatusPill({
  label,
  value,
  color = 'var(--text-muted)',
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 12, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
