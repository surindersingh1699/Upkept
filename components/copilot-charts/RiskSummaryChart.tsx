'use client';

interface Risk {
  label: string;
  severity: string;
  daysUntil: number;
}

export function RiskSummaryChart({ risks }: { risks: Risk[] }) {
  const sorted = [...risks].sort((a, b) => a.daysUntil - b.daysUntil);
  const colorMap: Record<string, string> = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--primary)', low: 'var(--green-bright)' };

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Upcoming Risks — {risks.length} items
      </div>
      {sorted.length === 0 ? (
        <div style={{ color: 'var(--green)', fontSize: 11, textAlign: 'center', padding: 12 }}>No immediate risks detected</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((risk, i) => {
            const color = colorMap[risk.severity] || 'var(--text-muted)';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                background: 'var(--bg-base)', border: `1px solid ${color}30`, borderRadius: 'var(--radius)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>
                  {risk.daysUntil}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>DAYS</div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>{risk.label}</div>
                </div>
                <span style={{
                  fontSize: 8, padding: '2px 6px', borderRadius: 3, fontWeight: 600,
                  background: `${color}20`, color, textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                }}>
                  {risk.severity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
