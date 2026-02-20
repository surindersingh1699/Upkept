'use client';

import type { Task } from '@/types';

export function VendorComparisonTable({ tasks }: { tasks: Task[] }) {
  const vendorMap = new Map<string, { name: string; rating: number; reliability: number; reviews: number; tasks: number; totalCost: number }>();

  for (const t of tasks) {
    if (!t.selectedVendor) continue;
    const v = t.selectedVendor;
    const existing = vendorMap.get(v.name);
    if (existing) {
      existing.tasks++;
      existing.totalCost += t.estimatedCost;
    } else {
      vendorMap.set(v.name, {
        name: v.name,
        rating: v.rating,
        reliability: v.reliabilityScore,
        reviews: v.reviewCount,
        tasks: 1,
        totalCost: t.estimatedCost,
      });
    }
  }

  const vendors = Array.from(vendorMap.values()).sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
        Vendor Comparison — {vendors.length} vendors
      </div>
      {vendors.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', padding: 12 }}>No vendors assigned yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {vendors.map((v) => (
            <div key={v.name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{v.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>
                  {v.reviews} reviews · {v.tasks} task{v.tasks > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
                  {v.rating}★
                </div>
                <div style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                  {v.reliability}%
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font-mono)', minWidth: 60, textAlign: 'right' }}>
                ${v.totalCost.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
