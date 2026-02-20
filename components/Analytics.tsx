'use client';

import { useAppStore } from '@/lib/store';

export default function Analytics() {
  const { state } = useAppStore();

  if (!state) {
    return (
      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 12 }}>
        No data yet. Run the agent first.
      </div>
    );
  }

  const { analytics, assets, complianceItems } = state;
  const score = analytics.complianceScore;
  const scoreColor = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Compliance Score */}
      <div>
        <div className="section-label">Compliance Score</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${(score / 100) * 264} 264`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${scoreColor})`, transition: 'all 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: scoreColor }}>{score}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
            <StatBox label="Assets" value={assets.length} />
            <StatBox label="Critical" value={analytics.criticalItems} color="var(--red)" />
            <StatBox label="Tasks" value={analytics.totalTasks} />
            <StatBox label="Approved" value={analytics.approvedTasks} color="var(--green)" />
          </div>
        </div>
      </div>

      {/* Cost Optimization */}
      <div>
        <div className="section-label">Cost Optimization</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StatRow label="Total Estimated" value={`$${analytics.totalCost.toLocaleString()}`} color="var(--text)" />
          <StatRow label="Market Rate" value={`$${(analytics.totalCost + analytics.estimatedSavings).toLocaleString()}`} color="var(--text-muted)" />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              SAVINGS
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
              ${analytics.estimatedSavings.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${Math.min(100, (analytics.estimatedSavings / (analytics.totalCost + analytics.estimatedSavings)) * 100)}%`,
              background: 'var(--green)',
            }} />
          </div>
        </div>
      </div>

      {/* Asset Health */}
      <div>
        <div className="section-label">Asset Health</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(['ok', 'attention', 'critical', 'overdue'] as const).map((status) => {
            const count = assets.filter((a) => a.status === status).length;
            const pct = assets.length > 0 ? (count / assets.length) * 100 : 0;
            const color = status === 'ok' ? 'var(--green)' : status === 'attention' ? 'var(--amber)' : 'var(--red)';
            return (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>
                    {status}
                  </span>
                  <span style={{ fontSize: 10, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {count}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Risks */}
      <div>
        <div className="section-label">Upcoming Risks</div>
        {analytics.upcomingRisks.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', padding: 12 }}>
            No immediate risks
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analytics.upcomingRisks.slice(0, 5).map((risk, i) => {
              const riskColor = risk.severity === 'critical' ? 'var(--red)'
                : risk.severity === 'high' ? 'var(--amber)'
                : risk.severity === 'medium' ? 'var(--blue)' : 'var(--green)';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', background: 'var(--bg-base)',
                  border: `1px solid ${riskColor}30`, borderRadius: 'var(--radius)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                    color: riskColor, minWidth: 28, textAlign: 'right',
                  }}>
                    {risk.daysUntil}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>DAYS</div>
                    <div style={{ fontSize: 11, color: 'var(--text)' }}>{risk.label}</div>
                  </div>
                  <span className={`badge badge-${risk.severity}`} style={{ fontSize: 8 }}>{risk.severity}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compliance Obligations */}
      <div>
        <div className="section-label">Compliance Obligations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {complianceItems.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div className={`status-dot dot-${c.riskLevel === 'critical' ? 'critical' : c.riskLevel === 'high' ? 'attention' : 'ok'}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{c.authority}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: c.daysUntilDue <= 30 ? 'var(--red)' : 'var(--amber)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {c.daysUntilDue}d
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bedrock note */}
      <div style={{
        padding: '8px 10px', background: 'var(--bg-elevated)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} />
        <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>
          {state.agentSteps?.length ?? 0} agent operations · Amazon Bedrock
        </span>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'var(--text)' }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg-base)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '6px 8px',
    }}>
      <div style={{ fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}
