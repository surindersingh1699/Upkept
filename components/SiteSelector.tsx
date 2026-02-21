'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function SiteSelector() {
  const router = useRouter();
  const { sites, activeSiteId, setActiveSite, removeSite } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddNew = () => {
    setOpen(false);
    router.push('/dashboard/setup');
  };

  return (
    <div className="site-selector" ref={ref}>
      <button className="site-selector-trigger" onClick={() => setOpen(!open)}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
        <span>{activeSite?.name ?? 'Select Site'}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <div className="site-selector-dropdown">
          {sites.map((site) => (
            <div key={site.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className={`site-selector-item ${site.id === activeSiteId ? 'active' : ''}`}
                onClick={() => { setActiveSite(site.id); setOpen(false); }}
                style={{ flex: 1 }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: site.id === activeSiteId ? 'var(--amber)' : 'var(--text-dim)',
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 12 }}>{site.name}</div>
                  {site.address && <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{site.address}</div>}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/setup?edit=${site.id}`); setOpen(false); }}
                style={{ padding: '6px 8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10 }}
                title="Edit site"
              >
                Edit
              </button>
              {sites.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSite(site.id); }}
                  style={{ padding: '6px 8px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12 }}
                  title="Delete site"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="context-menu-divider" />

          <button
            className="site-selector-item"
            onClick={handleAddNew}
            style={{ color: 'var(--amber)' }}
          >
            + Add New Site
          </button>
        </div>
      )}
    </div>
  );
}
