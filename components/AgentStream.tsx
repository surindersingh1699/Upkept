'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { AgentStep } from '@/types';

const AGENT_COLORS: Record<string, string> = {
  Orchestrator: 'var(--purple)',
  AssetExtractor: 'var(--blue)',
  ComplianceMapper: 'var(--amber)',
  VendorDiscovery: 'var(--green)',
  Scheduler: 'var(--text)',
};

export default function AgentStream() {
  const { agentSteps, isPlanning, orderHistory, loadHistoryEntry, activeSiteId } = useAppStore();
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentSteps.length]);

  const siteHistory = orderHistory.filter((h) => h.siteId === activeSiteId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with history toggle */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em',
          color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500,
        }}>
          {isPlanning ? '⟳ Running' : `${agentSteps.length} operations`}
        </span>

        {siteHistory.length > 0 && (
          <button
            className="btn btn-ghost"
            style={{ padding: '2px 8px', fontSize: 9 }}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Current' : 'History'}
          </button>
        )}
      </div>

      {/* History dropdown */}
      {showHistory && (
        <div style={{ borderBottom: '1px solid var(--border)', maxHeight: 160, overflowY: 'auto', flexShrink: 0 }}>
          {siteHistory.map((entry) => (
            <button
              key={entry.id}
              onClick={() => { loadHistoryEntry(entry.id); setShowHistory(false); }}
              style={{
                display: 'block', width: '100%', padding: '8px 12px',
                background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                color: 'var(--text)', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11,
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
              <div>{entry.summary}</div>
            </button>
          ))}
        </div>
      )}

      {/* Steps list */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {agentSteps.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 8,
            color: 'var(--text-dim)', fontSize: 11,
          }}>
            <span style={{ fontSize: 16 }}>⟳</span>
            <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>AWAITING INPUT</span>
          </div>
        ) : (
          agentSteps.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} />
          ))
        )}

        {isPlanning && (
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="animate-blink" style={{ color: 'var(--amber)', fontSize: 10 }}>▮</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({ step, index }: { step: AgentStep; index: number }) {
  const color = AGENT_COLORS[step.agentName] ?? 'var(--text-muted)';
  const time = new Date(step.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div
      className="animate-slide-in"
      style={{ padding: '6px 12px', animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0,
          boxShadow: step.status === 'running' ? `0 0 6px ${color}` : 'none',
        }} className={step.status === 'running' ? 'animate-pulse-amber' : ''} />
        <span style={{ fontSize: 10, color, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', fontWeight: 500 }}>
          {step.agentName}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
          {timeStr}
        </span>
      </div>
      <div style={{ marginLeft: 14, marginTop: 2 }}>
        <div style={{ fontSize: 11, color: 'var(--text)' }}>{step.action}</div>
        {step.detail && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{step.detail}</div>
        )}
      </div>
    </div>
  );
}
