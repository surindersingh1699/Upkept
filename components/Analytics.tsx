'use client';

import { useAppStore } from '@/lib/store';

export default function Analytics() {
  const { state } = useAppStore();

  if (!state) return null;
  const { analytics, assets, complianceItems } = state;

  const score = analytics.complianceScore;
  const scoreColor =
    score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        padding: 16,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {/* Compliance Score */}
      <div className="card" style={{ padding: 20, gridColumn: 'span 2' }}>
        <SectionTitle>Compliance Score</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 264} 264`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor})`, transition: 'all 0.5s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: scoreColor }}>{score}</span>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>SCORE</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <StatBox label="Total Assets" value={assets.length} />
            <StatBox label="Critical" value={analytics.criticalItems} color="var(--red)" />
            <StatBox label="Total Tasks" value={analytics.totalTasks} />
            <StatBox label="Approved" value={analytics.approvedTasks} color="var(--green)" />
          </div>
        </div>
      </div>

      {/* Savings */}
      <div className="card" style={{ padding: 20 }}>
        <SectionTitle>Cost Optimization</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StatRow label="Total Estimated" value={`$${analytics.totalCost.toLocaleString()}`} color="var(--text)" />
          <StatRow label="Market Rate" value={`$${(analytics.totalCost + analytics.estimatedSavings).toLocaleString()}`} color="var(--text-muted)" />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ESTIMATED SAVINGS
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.05em' }}>
              ${analytics.estimatedSavings.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (analytics.estimatedSavings / (analytics.totalCost + analytics.estimatedSavings)) * 100)}%`,
                background: 'var(--green)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming risks */}
      <div className="card" style={{ padding: 20 }}>
        <SectionTitle>Upcoming Risks</SectionTitle>
        {analytics.upcomingRisks.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No immediate risks
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analytics.upcomingRisks.slice(0, 5).map((risk, i) => {
              const riskColor =
                risk.severity === 'critical' ? 'var(--red)'
                : risk.severity === 'high' ? 'var(--amber)'
                : risk.severity === 'medium' ? 'var(--blue)'
                : 'var(--green)';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    background: 'var(--bg-base)',
                    border: `1px solid ${riskColor}30`,
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: riskColor,
                      minWidth: 36,
                      textAlign: 'right',
                    }}
                  >
                    {risk.daysUntil}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                      DAYS
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{risk.label}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge badge-${risk.severity}`}>{risk.severity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset status breakdown */}
      <div className="card" style={{ padding: 20 }}>
        <SectionTitle>Asset Health</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['ok', 'attention', 'critical', 'overdue'] as const).map((status) => {
            const count = assets.filter((a) => a.status === status).length;
            const pct = assets.length > 0 ? (count / assets.length) * 100 : 0;
            const color =
              status === 'ok' ? 'var(--green)'
              : status === 'attention' ? 'var(--amber)'
              : 'var(--red)';
            return (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
                    {status}
                  </span>
                  <span style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {count}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance items */}
      <div className="card" style={{ padding: 20 }}>
        <SectionTitle>Compliance Obligations</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {complianceItems.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className={`status-dot dot-${c.riskLevel === 'critical' ? 'critical' : c.riskLevel === 'high' ? 'attention' : 'ok'}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.authority}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.daysUntilDue <= 30 ? 'var(--red)' : 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  {c.daysUntilDue}d
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                  REMAINING
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical decisions */}
      {analytics.historicalDecisions.length > 0 && (
        <div className="card" style={{ padding: 20, gridColumn: 'span 2' }}>
          <SectionTitle>Decision Log</SectionTitle>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Outcome</th>
                <th style={{ textAlign: 'right' }}>Savings</th>
              </tr>
            </thead>
            <tbody>
              {analytics.historicalDecisions.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{d.date}</td>
                  <td style={{ color: 'var(--text)', fontSize: 11 }}>{d.action}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.outcome}</td>
                  <td style={{ textAlign: 'right', color: 'var(--green)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {d.savings ? `$${d.savings.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Datadog observability note */}
      <div
        style={{
          gridColumn: '1 / -1',
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Datadog LLM observability traces active — all agent decisions, tool calls, and state transitions are recorded.{' '}
          <span style={{ color: 'var(--text-dim)' }}>Spans: {state.agentSteps?.length ?? 0} operations · Model: anthropic.claude-3-5-sonnet-20241022-v2:0 via Amazon Bedrock</span>
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  );
}

function StatBox({ label, value, color = 'var(--text)' }: { label: string; value: number | string; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}
