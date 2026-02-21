'use client';

import { useState } from 'react';
import type { SetupData } from '@/types';

interface Props {
  data: SetupData;
  onChange: (patch: Partial<SetupData>) => void;
}

const COMPLIANCE_OPTIONS = [
  { id: 'fire_safety', label: 'Fire Safety Inspection', desc: 'Annual fire code and extinguisher inspection' },
  { id: 'business_license', label: 'Business License', desc: 'Operating permit renewal' },
  { id: 'ada_compliance', label: 'ADA Compliance', desc: 'Americans with Disabilities Act requirements' },
  { id: 'gdpr', label: 'GDPR / Data Privacy', desc: 'Data retention and privacy audits' },
  { id: 'building_code', label: 'Building Code', desc: 'Local building code compliance' },
  { id: 'environmental', label: 'Environmental', desc: 'Environmental and waste management regulations' },
  { id: 'health_safety', label: 'Health & Safety', desc: 'Occupational health and safety standards' },
  { id: 'electrical', label: 'Electrical Inspection', desc: 'Electrical system safety certification' },
  { id: 'elevator', label: 'Elevator Certification', desc: 'Annual elevator inspection and certification' },
  { id: 'insurance', label: 'Insurance Requirements', desc: 'Property and liability insurance compliance' },
];

export default function StepCompliance({ data, onChange }: Props) {
  const [customNeed, setCustomNeed] = useState('');

  const toggle = (id: string) => {
    const needs = data.complianceNeeds.includes(id)
      ? data.complianceNeeds.filter((n) => n !== id)
      : [...data.complianceNeeds, id];
    onChange({ complianceNeeds: needs });
  };

  const addCustom = () => {
    if (!customNeed.trim()) return;
    onChange({ complianceNeeds: [...data.complianceNeeds, customNeed.trim()] });
    setCustomNeed('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, width: '100%' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Compliance requirements
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          Select all regulations and compliance obligations that apply to your property.
        </p>
      </div>

      {/* Compliance checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPLIANCE_OPTIONS.map((opt) => {
          const selected = data.complianceNeeds.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: selected ? 'var(--primary-dim)' : 'var(--bg-base)',
                border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'pointer', transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-bright)'}`,
                background: selected ? 'var(--primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M3 8l3.5 3.5L13 5" />
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: selected ? 'var(--primary)' : 'var(--text)' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom compliance */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={customNeed}
          onChange={(e) => setCustomNeed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add custom compliance need..."
          style={{ flex: 1, fontSize: 13 }}
        />
        <button className="btn btn-ghost" onClick={addCustom} style={{ padding: '6px 14px', fontSize: 12 }}>
          Add
        </button>
      </div>

      {/* Custom items */}
      {data.complianceNeeds.filter((n) => !COMPLIANCE_OPTIONS.some((o) => o.id === n)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.complianceNeeds
            .filter((n) => !COMPLIANCE_OPTIONS.some((o) => o.id === n))
            .map((n) => (
              <div key={n} className="file-chip">
                <span>{n}</span>
                <button onClick={() => toggle(n)}>×</button>
              </div>
            ))}
        </div>
      )}

      {/* Jurisdiction */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Jurisdiction (optional)
        </label>
        <input
          type="text"
          value={data.jurisdiction ?? ''}
          onChange={(e) => onChange({ jurisdiction: e.target.value || undefined })}
          placeholder="e.g. Austin, TX or State of California"
          style={{ fontSize: 13 }}
        />
      </div>
    </div>
  );
}
