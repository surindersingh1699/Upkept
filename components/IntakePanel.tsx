'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { AgentStep, SystemState } from '@/types';

const DEMO_INPUT = `A 2-story house (built 2008) in Austin, TX:

PHYSICAL ASSETS:
- HVAC system (last serviced: March 2021)
- Water heater (installed: 2015, 10-year warranty now expired)
- Smoke detectors ×3 (last tested: June 2022)
- Roof — asphalt shingles (last inspected: 2019)
- Electrical panel (original 2008 install, never updated)

DIGITAL ASSETS:
- Company website SSL certificate (expires in 45 days)
- AWS S3 cloud backup system (last verified: 6 months ago)

COMPLIANCE OBLIGATIONS:
- Annual fire safety inspection (required by lease, due in 30 days)
- Business license renewal (due in 60 days)
- GDPR data retention policy audit (no physical asset, due in 90 days)`;

export default function IntakePanel() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addAgentStep, setIsPlanning, setState, setPhase } = useAppStore();

  const handleSubmit = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setIsPlanning(true);
    setPhase('planning');

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'step') {
              addAgentStep(data.step as AgentStep);
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Fetch final state
      const stateRes = await fetch('/api/state');
      const finalState: SystemState = await stateRes.json();
      setState(finalState);
      setPhase('review');
    } catch (err) {
      console.error('Intake error:', err);
    } finally {
      setLoading(false);
      setIsPlanning(false);
    }
  };

  const loadDemo = () => setDescription(DEMO_INPUT);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 24px',
        width: '100%',
      }}
    >
      {/* Title block */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            padding: '4px 12px',
            background: 'var(--amber-glow)',
            border: '1px solid var(--amber-dim)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="status-dot dot-attention" />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              fontWeight: 600,
            }}
          >
            Agent Ready
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          Describe Your Assets
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Paste any description of your property, digital infrastructure, or compliance obligations.
          The agent will extract assets, map risks, find vendors, and build a plan — autonomously.
        </p>
      </div>

      {/* Input area */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. A 2-story house with HVAC (last serviced 2021), roof not inspected since 2019, SSL cert expiring in 45 days, annual fire inspection due next month..."
          rows={12}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: `1px solid ${description ? 'var(--border-bright)' : 'var(--border)'}`,
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            lineHeight: 1.7,
            padding: 16,
            borderRadius: 'var(--radius)',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
          onBlur={(e) => (e.target.style.borderColor = description ? 'var(--border-bright)' : 'var(--border)')}
          disabled={loading}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            fontSize: 11,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {description.length} chars
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          className="btn btn-amber"
          onClick={handleSubmit}
          disabled={!description.trim() || loading}
          style={{
            opacity: !description.trim() || loading ? 0.5 : 1,
            cursor: !description.trim() || loading ? 'not-allowed' : 'pointer',
            padding: '10px 24px',
            fontSize: 12,
          }}
        >
          {loading ? (
            <>
              <span className="animate-spin-slow" style={{ display: 'inline-block' }}>⟳</span>
              Running Agent Pipeline...
            </>
          ) : (
            <>▶ &nbsp;Run Autonomous Agent</>
          )}
        </button>

        <button className="btn btn-ghost" onClick={loadDemo} disabled={loading}>
          Load Demo Data
        </button>
      </div>

      {/* What happens next */}
      <div
        className="card"
        style={{ padding: 16 }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          AGENT PIPELINE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: '01', label: 'AssetExtractor', desc: 'Parses physical, digital & compliance items' },
            { icon: '02', label: 'ComplianceMapper', desc: 'Maps obligations & identifies risks' },
            { icon: '03', label: 'VendorDiscovery', desc: 'Finds & evaluates vendors from public data' },
            { icon: '04', label: 'Scheduler', desc: 'Proposes optimal timing & pricing' },
          ].map((step) => (
            <div
              key={step.icon}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--border-bright)',
                  lineHeight: 1,
                  minWidth: 24,
                }}
              >
                {step.icon}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--amber)',
                    letterSpacing: '0.05em',
                    marginBottom: 2,
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
