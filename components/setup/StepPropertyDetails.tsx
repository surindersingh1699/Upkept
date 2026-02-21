'use client';

import type { SetupData } from '@/types';

interface Props {
  data: SetupData;
  onChange: (patch: Partial<SetupData>) => void;
}

const QUICK_TAGS = [
  'HVAC system', 'Water heater', 'Roof', 'Electrical panel',
  'Plumbing', 'Fire safety systems', 'Elevator', 'Parking lot',
  'SSL certificate', 'Cloud backups', 'Security cameras', 'Landscaping',
];

export default function StepPropertyDetails({ data, onChange }: Props) {
  const addTag = (tag: string) => {
    const current = data.description;
    if (current.toLowerCase().includes(tag.toLowerCase())) return;
    onChange({ description: current ? `${current}\n${tag}` : tag });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, width: '100%' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Describe your property
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          List assets, systems, and anything that needs maintenance. The more detail, the better our analysis.
        </p>
      </div>

      {/* Quick-add chips */}
      <div>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
          Quick-add common assets
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_TAGS.map((tag) => {
            const active = data.description.toLowerCase().includes(tag.toLowerCase());
            return (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                style={{
                  padding: '5px 12px', borderRadius: 'var(--radius)',
                  fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 500,
                  background: active ? 'var(--primary-dim)' : 'var(--bg-surface)',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {active ? '✓ ' : '+ '}{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Property Description
        </label>
        <textarea
          rows={8}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={`Describe your property's assets and systems...\n\nExample:\nHVAC system installed 2008, last serviced March 2021.\nWater heater in garage, 9 years old.\n3 smoke detectors, last tested June 2022.\nRoof: asphalt shingles, no inspection since 2019.`}
          style={{ fontSize: 13, lineHeight: 1.6 }}
        />
      </div>
    </div>
  );
}
