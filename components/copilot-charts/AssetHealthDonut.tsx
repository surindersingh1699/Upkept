'use client';

import type { Asset } from '@/types';

export function AssetHealthDonut({ assets }: { assets: Asset[] }) {
  const counts = {
    ok: assets.filter((a) => a.status === 'ok').length,
    attention: assets.filter((a) => a.status === 'attention').length,
    critical: assets.filter((a) => a.status === 'critical').length,
    overdue: assets.filter((a) => a.status === 'overdue').length,
  };

  const total = assets.length || 1;
  const colors = { ok: 'var(--green-bright)', attention: 'var(--amber)', critical: 'var(--red)', overdue: 'var(--red)' };

  // Build SVG donut segments
  const segments: { color: string; pct: number; label: string; count: number }[] = [
    { color: colors.ok, pct: (counts.ok / total) * 100, label: 'OK', count: counts.ok },
    { color: colors.attention, pct: (counts.attention / total) * 100, label: 'Attention', count: counts.attention },
    { color: colors.critical, pct: (counts.critical / total) * 100, label: 'Critical', count: counts.critical },
    { color: colors.overdue, pct: (counts.overdue / total) * 100, label: 'Overdue', count: counts.overdue },
  ].filter((s) => s.count > 0);

  let offset = 0;
  const circumference = 2 * Math.PI * 42;

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Asset Health — {assets.length} assets
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
            {segments.map((seg) => {
              const dash = (seg.pct / 100) * circumference;
              const gap = circumference - dash;
              const currentOffset = offset;
              offset += dash;
              return (
                <circle
                  key={seg.label}
                  cx="50" cy="50" r="42" fill="none"
                  stroke={seg.color} strokeWidth="8"
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{assets.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {segments.map((seg) => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{seg.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: seg.color, fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
