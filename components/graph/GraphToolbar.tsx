'use client';

import { useState } from 'react';
import type { GraphNode } from '@/types';

interface Props {
  onAddNode: (type: GraphNode['type']) => void;
  onFitView: () => void;
  onResetLayout: () => void;
}

export default function GraphToolbar({ onAddNode, onFitView, onResetLayout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Add node button */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-amber"
          style={{ padding: '6px 10px', fontSize: 14, lineHeight: 1 }}
          onClick={() => setMenuOpen(!menuOpen)}
          title="Add node"
        >
          +
        </button>
        {menuOpen && (
          <div className="context-menu" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6 }}>
            {[
              { type: 'asset' as const, label: 'Asset', icon: '◉', color: 'var(--blue)' },
              { type: 'compliance' as const, label: 'Compliance', icon: '◎', color: 'var(--amber)' },
              { type: 'task' as const, label: 'Task', icon: '◇', color: 'var(--purple)' },
              { type: 'vendor' as const, label: 'Vendor', icon: '○', color: 'var(--green)' },
            ].map((opt) => (
              <button key={opt.type} onClick={() => { onAddNode(opt.type); setMenuOpen(false); }}>
                <span style={{ color: opt.color }}>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-ghost"
        style={{ padding: '6px 10px', fontSize: 10 }}
        onClick={onFitView}
        title="Fit view"
      >
        ⊞
      </button>

      <button
        className="btn btn-ghost"
        style={{ padding: '6px 10px', fontSize: 10 }}
        onClick={onResetLayout}
        title="Reset layout"
      >
        ↺
      </button>
    </div>
  );
}
