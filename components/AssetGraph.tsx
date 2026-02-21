'use client';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '@/lib/store';
import type { GraphNode } from '@/types';
import { useMemo } from 'react';

// ─── Custom node renderers ─────────────────────────────────

function AssetNode({ data }: NodeProps) {
  const statusColors: Record<string, string> = {
    ok:        'var(--green)',
    attention: 'var(--amber)',
    critical:  'var(--red)',
    overdue:   'var(--red)',
  };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${color}`,
        borderRadius: 6,
        padding: '8px 14px',
        minWidth: 120,
        boxShadow: `0 0 12px ${color}30`,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 3 }}>
        ASSET
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
        {data.label}
      </div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.status}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function ComplianceNode({ data }: NodeProps) {
  const riskColors: Record<string, string> = {
    critical: 'var(--red)',
    high:     'var(--amber)',
    medium:   'var(--blue)',
    low:      'var(--green)',
  };
  const color = riskColors[data.riskLevel ?? 'medium'] ?? 'var(--amber)';

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${color}`,
        borderRadius: 0,
        padding: '8px 14px',
        minWidth: 130,
        transform: 'rotate(-1deg)',
        boxShadow: `0 0 12px ${color}20`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--amber)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 3 }}>
        COMPLIANCE
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
        {data.label}
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {data.riskLevel ?? 'medium'} risk
        </span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function VendorNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--green)',
        borderRadius: '50%',
        padding: '10px 16px',
        minWidth: 100,
        textAlign: 'center',
        boxShadow: '0 0 14px var(--green-glow)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--green)', border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 3 }}>
        VENDOR
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--green)', border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function TaskNode({ data }: NodeProps) {
  const statusColors: Record<string, string> = {
    pending:   'var(--text-muted)',
    approved:  'var(--green)',
    scheduled: 'var(--blue)',
    completed: 'var(--green)',
  };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: `1px dashed ${color}`,
        borderRadius: 4,
        padding: '8px 14px',
        minWidth: 120,
        opacity: data.status === 'pending' ? 0.7 : 1,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--purple)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', marginBottom: 3 }}>
        TASK
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
        {data.label}
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.status}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = {
  asset:      AssetNode,
  compliance: ComplianceNode,
  vendor:     VendorNode,
  task:       TaskNode,
};

// ─── Layout calculation ────────────────────────────────────

function calculateLayout(graphNodes: GraphNode[]) {
  const byType: Record<string, GraphNode[]> = {
    asset:      [],
    compliance: [],
    task:       [],
    vendor:     [],
  };

  graphNodes.forEach((n) => {
    if (byType[n.type]) byType[n.type].push(n);
  });

  const COL_X: Record<string, number> = {
    asset:      80,
    compliance: 320,
    task:       560,
    vendor:     800,
  };
  const ROW_HEIGHT = 120;
  const START_Y = 60;

  const positioned: Record<string, { x: number; y: number }> = {};

  (['asset', 'compliance', 'task', 'vendor'] as const).forEach((type) => {
    byType[type].forEach((node, i) => {
      positioned[node.id] = {
        x: COL_X[type],
        y: START_Y + i * ROW_HEIGHT,
      };
    });
  });

  return positioned;
}

// ─── Main component ─────────────────────────────────────────

export default function AssetGraph() {
  const { state } = useAppStore();

  const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    if (!state?.graph) return { nodes: [], edges: [] };

    const positions = calculateLayout(state.graph.nodes);

    const rfNodes: Node[] = state.graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: positions[n.id] ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        status: n.status,
        riskLevel: n.riskLevel,
      },
      draggable: true,
    }));

    const rfEdges: Edge[] = state.graph.edges.map((e) => {
      const edgeColors: Record<string, string> = {
        requires:    'var(--amber)',
        handles:     'var(--blue)',
        assigned_to: 'var(--green)',
        links_to:    'var(--purple)',
      };

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        style: {
          stroke: edgeColors[e.edgeType] ?? 'var(--border-bright)',
          strokeWidth: 1.5,
          opacity: 0.7,
        },
        labelStyle: {
          fontSize: 9,
          fill: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        },
        labelBgStyle: {
          fill: 'var(--bg-elevated)',
          fillOpacity: 0.8,
        },
        animated: e.edgeType === 'assigned_to',
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [state?.graph]);

  if (!state || state.graph.nodes.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          color: 'var(--text-dim)',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.3 }}>◈</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.12em' }}>
          GRAPH WILL APPEAR AFTER INTAKE
        </span>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          display: 'flex',
          gap: 16,
        }}
      >
        {[
          { label: 'Asset', color: 'var(--blue)' },
          { label: 'Compliance', color: 'var(--amber)' },
          { label: 'Task', color: 'var(--purple)' },
          { label: 'Vendor', color: 'var(--green)' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              {l.label.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg-surface)' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
        <Controls style={{ background: 'var(--bg-elevated)' }} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              asset: '#0F6CBD',
              compliance: '#F7630C',
              vendor: '#107C10',
              task: '#7160E8',
            };
            return colors[n.type ?? ''] ?? '#D1D5DB';
          }}
          style={{ background: 'var(--bg-elevated)' }}
        />
      </ReactFlow>
    </div>
  );
}
