'use client';

import type { ComplianceItem } from '@/types';

export function ComplianceTimeline({ items }: { items: ComplianceItem[] }) {
  const sorted = [...items].sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Compliance Timeline — {items.length} obligations
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sorted.map((item, i) => {
          const color = item.daysUntilDue <= 15 ? 'var(--red)' : item.daysUntilDue <= 45 ? 'var(--amber)' : 'var(--green)';
          const isLast = i === sorted.length - 1;
          return (
            <div key={item.id} style={{ display: 'flex', gap: 10 }}>
              {/* Timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {!isLast && <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{item.daysUntilDue}d</span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>
                  {item.authority} · Due: {item.dueDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
