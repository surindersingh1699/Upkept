'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { Site } from '@/types';

export default function SiteSelector() {
  const { sites, activeSiteId, addSite, setActiveSite, removeSite, renameSite } = useAppStore();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const site: Site = {
      id: `site-${Date.now()}`,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
    };
    addSite(site);
    setActiveSite(site.id);
    setNewName('');
    setAdding(false);
    setOpen(false);
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
              {sites.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSite(site.id); }}
                  style={{ padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12 }}
                  title="Delete site"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="context-menu-divider" />

          {adding ? (
            <div style={{ padding: '8px 14px', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Site name..."
                autoFocus
                style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}
              />
              <button className="btn btn-green" style={{ padding: '4px 10px', fontSize: 10 }} onClick={handleAdd}>
                Add
              </button>
            </div>
          ) : (
            <button
              className="site-selector-item"
              onClick={() => setAdding(true)}
              style={{ color: 'var(--amber)' }}
            >
              + Add New Site
            </button>
          )}
        </div>
      )}
    </div>
  );
}
