'use client';

export function CostBarChart({ estimated, market, savings }: { estimated: number; market: number; savings: number }) {
  const max = Math.max(estimated, market, 1);

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Cost Analysis
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Bar label="Agent Estimate" value={estimated} max={max} color="var(--green)" />
        <Bar label="Market Rate" value={market} max={max} color="var(--text-muted)" />
        <Bar label="Savings" value={savings} max={max} color="var(--amber)" />
      </div>
      <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--green-glow)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>TOTAL SAVINGS </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>${savings.toLocaleString()}</span>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>${value.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
