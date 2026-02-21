'use client';

import { useState } from 'react';
import { useAppStore, composeDescription } from '@/lib/store';
import type { SetupData } from '@/types';

interface Props {
  data: SetupData;
  onComplete: () => void;
}

export default function StepGenerate({ data, onComplete }: Props) {
  const {
    setState, addAgentStep, setIsPlanning, optimizationMode, setOptimizationMode,
    addToHistory, activeSiteId, completeSetup, agentSteps,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setIsPlanning(true);
    setError(null);

    const description = composeDescription(data);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, optimizationMode }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'step') addAgentStep(evt.step);
          } catch { /* ignore parse errors */ }
        }
      }

      const stateRes = await fetch('/api/state');
      const newState = await stateRes.json();
      setState(newState);

      addToHistory({
        id: `hist-${Date.now()}`,
        siteId: activeSiteId,
        timestamp: new Date().toISOString(),
        inputDescription: description,
        summary: `${newState.assets?.length ?? 0} assets, ${newState.tasks?.length ?? 0} tasks`,
        state: newState,
        agentSteps: useAppStore.getState().agentSteps,
      });

      completeSetup(activeSiteId);
      setDone(true);

      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      console.error('Generate error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setIsPlanning(false);
    }
  };

  const visibleSteps = useAppStore((s) => s.agentSteps);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, width: '100%' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {done ? 'Your plan is ready!' : loading ? 'Generating your plan...' : 'Review & generate'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          {done
            ? 'Redirecting you to your dashboard...'
            : loading
              ? 'Our AI agents are analyzing your property, mapping compliance, and finding vendors.'
              : 'Review your setup details and generate your maintenance plan.'
          }
        </p>
      </div>

      {!loading && !done && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SummaryRow label="Property" value={`${data.siteName} — ${data.propertyType.replace('_', ' ')}`} />
            <SummaryRow label="Address" value={data.address} />
            {data.squareFootage && <SummaryRow label="Size" value={`${data.squareFootage.toLocaleString()} sq ft`} />}
            {data.yearBuilt && <SummaryRow label="Year Built" value={String(data.yearBuilt)} />}
            <SummaryRow label="Compliance" value={data.complianceNeeds.length > 0 ? data.complianceNeeds.join(', ') : 'None selected'} />
            <SummaryRow label="Documents" value={data.uploadedFiles.length > 0 ? `${data.uploadedFiles.length} file(s)` : 'None'} />
          </div>

          {/* Optimization toggle */}
          <div>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              Optimization Preference
            </label>
            <div className="opt-toggle" style={{ alignSelf: 'stretch', display: 'flex' }}>
              <button
                className={`opt-btn ${optimizationMode === 'cost' ? 'active' : ''}`}
                onClick={() => setOptimizationMode('cost')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                $ Cost
              </button>
              <button
                className={`opt-btn ${optimizationMode === 'quality' ? 'active' : ''}`}
                onClick={() => setOptimizationMode('quality')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                ★ Quality
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            style={{ justifyContent: 'center', padding: '12px 24px', fontSize: 14 }}
          >
            Generate Maintenance Plan
          </button>
        </>
      )}

      {/* Agent stream during generation */}
      {loading && visibleSteps.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: 16, borderRadius: 'var(--radius)',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          maxHeight: 300, overflowY: 'auto',
        }}>
          {visibleSteps.map((step) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: step.status === 'complete' ? 'var(--green)' : step.status === 'error' ? 'var(--red)' : 'var(--primary)',
              }} className={step.status === 'running' ? 'animate-pulse-amber' : ''} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', minWidth: 100 }}>
                {step.agentName}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{step.action}</span>
              {step.durationMs && (
                <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, marginLeft: 'auto' }}>
                  {step.durationMs}ms
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Done state */}
      {done && (
        <div style={{
          textAlign: 'center', padding: 32,
          background: 'var(--green-dim)', borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(16,124,16,0.2)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
            Plan generated successfully
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, borderRadius: 'var(--radius)', background: 'var(--red-dim)', border: '1px solid rgba(197,15,31,0.2)', color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 14px', background: 'var(--bg-surface)',
      borderRadius: 'var(--radius)', border: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>
        {value}
      </span>
    </div>
  );
}
