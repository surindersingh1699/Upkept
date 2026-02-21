'use client';

import type { SetupData, PropertyType } from '@/types';

interface Props {
  data: SetupData;
  onChange: (patch: Partial<SetupData>) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'residential', label: 'Residential', icon: '🏠' },
  { value: 'commercial', label: 'Commercial', icon: '🏢' },
  { value: 'industrial', label: 'Industrial', icon: '🏭' },
  { value: 'mixed_use', label: 'Mixed Use', icon: '🏗' },
];

export default function StepPropertyInfo({ data, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, width: '100%' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Tell us about your property
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          We'll use this to identify maintenance needs and compliance requirements.
        </p>
      </div>

      {/* Site Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Site Name *
        </label>
        <input
          type="text"
          value={data.siteName}
          onChange={(e) => onChange({ siteName: e.target.value })}
          placeholder="e.g. Downtown Office, Elm Street Apartments"
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Address */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Address *
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="e.g. 1400 Congress Ave, Austin TX 78701"
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Property Type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Property Type *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => onChange({ propertyType: pt.value })}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                background: data.propertyType === pt.value ? 'var(--primary-dim)' : 'var(--bg-base)',
                border: `2px solid ${data.propertyType === pt.value ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
                color: data.propertyType === pt.value ? 'var(--primary)' : 'var(--text)',
              }}
            >
              <span style={{ fontSize: 20 }}>{pt.icon}</span>
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional details row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sq. Footage
          </label>
          <input
            type="number"
            value={data.squareFootage ?? ''}
            onChange={(e) => onChange({ squareFootage: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 5000"
            style={{ fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Year Built
          </label>
          <input
            type="number"
            value={data.yearBuilt ?? ''}
            onChange={(e) => onChange({ yearBuilt: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 2008"
            style={{ fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Units
          </label>
          <input
            type="number"
            value={data.numberOfUnits ?? ''}
            onChange={(e) => onChange({ numberOfUnits: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 12"
            style={{ fontSize: 13 }}
          />
        </div>
      </div>
    </div>
  );
}
