'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import type { AgentStep } from '@/types';

const AGENT_COLORS: Record<AgentStep['agentName'], string> = {
  Orchestrator:    'var(--purple)',
  AssetExtractor:  'var(--blue)',
  ComplianceMapper:'var(--amber)',
  VendorDiscovery: 'var(--green)',
  Scheduler:       'var(--text)',
};

const AGENT_ICONS: Record<AgentStep['agentName'], string> = {
  Orchestrator:    '◈',
  AssetExtractor:  '◉',
  ComplianceMapper:'◎',
  VendorDiscovery: '◇',
  Scheduler:       '◆',
};

function StepRow({ step, index }: { step: AgentStep; index: number }) {
  const color = AGENT_COLORS[step.agentName] ?? 'var(--text-muted)';
  const icon = AGENT_ICONS[step.agentName] ?? '·';

  return (
    <div
      className="animate-slide-in"
      style={{
        display: 'flex',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
        animationDelay: `${index * 20}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {/* Icon + connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
        <span style={{ fontSize: 14, color, lineHeight: 1 }}>{icon}</span>
        <div style={{ flex: 1, width: 1, background: 'var(--border)', marginTop: 4 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {step.agentName}
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {step.action}
          </span>
        </div>

        {step.detail && (
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {step.detail}
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
          {new Date(step.timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>

      {/* Status indicator */}
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        {step.status === 'running' && (
          <div className="status-dot dot-attention animate-pulse-amber" />
        )}
        {step.status === 'complete' && (
          <div className="status-dot dot-ok" />
        )}
        {step.status === 'error' && (
          <div className="status-dot dot-critical" />
        )}
      </div>
    </div>
  );
}

export default function AgentStream() {
  const { agentSteps, isPlanning } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentSteps.length]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          className={isPlanning ? 'status-dot dot-attention animate-pulse-amber' : 'status-dot dot-ok'}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Agent Reasoning
        </span>
        {agentSteps.length > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {agentSteps.length} ops
          </span>
        )}
      </div>

      {/* Steps */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 16px',
        }}
      >
        {agentSteps.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: 'var(--text-dim)',
            }}
          >
            <div style={{ fontSize: 32, opacity: 0.3 }}>⟳</div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              AWAITING INPUT
            </span>
          </div>
        ) : (
          <>
            {agentSteps.map((step, i) => (
              <StepRow key={step.id} step={step} index={i} />
            ))}
            {isPlanning && (
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  padding: '12px 0',
                  alignItems: 'center',
                }}
              >
                <div className="status-dot dot-attention animate-pulse-amber" />
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--amber)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Processing
                  <span className="animate-blink">_</span>
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Agent legend */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px 12px',
          }}
        >
          {Object.entries(AGENT_COLORS).map(([name, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color }}>{AGENT_ICONS[name as AgentStep['agentName']]}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
