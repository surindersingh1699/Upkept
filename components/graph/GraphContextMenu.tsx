'use client';

import { useEffect, useRef } from 'react';
import type { GraphNode } from '@/types';

interface Props {
  x: number;
  y: number;
  onAddNode: (type: GraphNode['type']) => void;
  onClose: () => void;
}

const NODE_OPTIONS: { type: GraphNode['type']; label: string; icon: string; color: string }[] = [
  { type: 'asset', label: 'Add Asset', icon: '◉', color: 'var(--blue)' },
  { type: 'compliance', label: 'Add Compliance', icon: '◎', color: 'var(--amber)' },
  { type: 'task', label: 'Add Task', icon: '◇', color: 'var(--purple)' },
  { type: 'vendor', label: 'Add Vendor', icon: '○', color: 'var(--green)' },
];

export default function GraphContextMenu({ x, y, onAddNode, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ position: 'absolute', left: x, top: y }}
    >
      {NODE_OPTIONS.map((opt) => (
        <button key={opt.type} onClick={() => onAddNode(opt.type)}>
          <span style={{ color: opt.color, fontSize: 14 }}>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
