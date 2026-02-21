'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type Connection,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '@/lib/store';
import type { GraphNode, RiskLevel } from '@/types';
import GraphContextMenu from '@/components/graph/GraphContextMenu';
import GraphToolbar from '@/components/graph/GraphToolbar';
import OptimizationToggle from '@/components/OptimizationToggle';

// ─── Custom node renderers (Fluent Design) ──────────────

function AssetNode({ data, id, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const statusColors: Record<string, string> = { ok: 'var(--green-bright)', attention: 'var(--amber)', critical: 'var(--red)', overdue: 'var(--red)' };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  const commitEdit = () => {
    setEditing(false);
    useAppStore.getState().updateGraphNode(id, { label });
  };

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-elevated)', border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-bright)'}`,
        borderRadius: 8, padding: '10px 14px', minWidth: 130,
        boxShadow: selected ? '0 0 0 2px var(--primary-dim)' : 'var(--shadow-sm)',
        position: 'relative', transition: 'all 0.15s', borderLeft: `3px solid var(--primary)`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--primary)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
      <div style={{ fontSize: 9, color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 3 }}>ASSET</div>
      {editing ? (
        <input
          value={label} onChange={(e) => setLabel(e.target.value)}
          onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
          autoFocus
          style={{ background: 'var(--bg-base)', border: '1px solid var(--primary)', padding: '2px 6px', fontSize: 12, width: '100%', fontFamily: 'var(--font-display)', borderRadius: 4 }}
        />
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      )}
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{data.status}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--primary)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
    </div>
  );
}

function ComplianceNode({ data, id, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const riskColors: Record<string, string> = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--primary)', low: 'var(--green-bright)' };
  const color = riskColors[data.riskLevel ?? 'medium'] ?? 'var(--amber)';

  const commitEdit = () => { setEditing(false); useAppStore.getState().updateGraphNode(id, { label }); };

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-elevated)', border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-bright)'}`,
        borderRadius: 8, padding: '10px 14px', minWidth: 140,
        boxShadow: selected ? '0 0 0 2px var(--primary-dim)' : 'var(--shadow-sm)',
        position: 'relative', borderLeft: `3px solid var(--amber)`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--amber)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
      <div style={{ fontSize: 9, color: 'var(--amber)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 3 }}>COMPLIANCE</div>
      {editing ? (
        <input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()} autoFocus style={{ background: 'var(--bg-base)', border: '1px solid var(--primary)', padding: '2px 6px', fontSize: 11, width: '100%', borderRadius: 4 }} />
      ) : (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      )}
      <div style={{ marginTop: 5 }}>
        <span className={`badge badge-${data.riskLevel ?? 'medium'}`} style={{ fontSize: 9 }}>{data.riskLevel ?? 'medium'} risk</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--amber)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
    </div>
  );
}

function VendorNode({ data, id, selected }: NodeProps) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-bright)'}`,
      borderRadius: 20, padding: '10px 16px', minWidth: 100, textAlign: 'center',
      boxShadow: selected ? '0 0 0 2px var(--primary-dim)' : 'var(--shadow-sm)',
      borderLeft: '3px solid var(--green-bright)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--green-bright)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
      <div style={{ fontSize: 9, color: 'var(--green-bright)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 3 }}>VENDOR</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--green-bright)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
    </div>
  );
}

function TaskNode({ data, id, selected }: NodeProps) {
  const statusColors: Record<string, string> = { pending: 'var(--text-muted)', approved: 'var(--green-bright)', scheduled: 'var(--primary)', completed: 'var(--green-bright)' };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: `1.5px ${data.status === 'pending' ? 'dashed' : 'solid'} ${selected ? 'var(--primary)' : 'var(--border-bright)'}`,
      borderRadius: 8, padding: '10px 14px', minWidth: 130, position: 'relative',
      opacity: data.status === 'pending' ? 0.85 : 1,
      boxShadow: selected ? '0 0 0 2px var(--primary-dim)' : 'var(--shadow-sm)',
      borderLeft: '3px solid var(--purple)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--purple)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
      <div style={{ fontSize: 9, color: 'var(--purple)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 3 }}>TASK</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color, textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{data.status}</span>
        {data.confidenceScore != null && (
          <span className="node-badge" style={{
            position: 'static', background: data.confidenceScore >= 80 ? 'var(--green-dim)' : 'var(--amber-dim)',
            color: data.confidenceScore >= 80 ? 'var(--green-bright)' : 'var(--amber)',
            borderColor: data.confidenceScore >= 80 ? 'var(--green)' : 'var(--amber)',
          }}>
            {data.confidenceScore}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--purple)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
    </div>
  );
}

const nodeTypes = { asset: AssetNode, compliance: ComplianceNode, vendor: VendorNode, task: TaskNode };

// ─── Layout calculation ────────────────────────────────────

function calculateLayout(graphNodes: GraphNode[]) {
  const byType: Record<string, GraphNode[]> = { asset: [], compliance: [], task: [], vendor: [] };
  graphNodes.forEach((n) => { if (byType[n.type]) byType[n.type].push(n); });

  const COL_X: Record<string, number> = { asset: 80, compliance: 340, task: 600, vendor: 880 };
  const ROW_HEIGHT = 130;
  const START_Y = 60;
  const positioned: Record<string, { x: number; y: number }> = {};

  (['asset', 'compliance', 'task', 'vendor'] as const).forEach((type) => {
    byType[type].forEach((node, i) => {
      positioned[node.id] = { x: COL_X[type], y: START_Y + i * ROW_HEIGHT };
    });
  });

  return positioned;
}

// ─── Main component ─────────────────────────────────────────

export default function GraphCanvas() {
  const { state, setSelectedNodeId, selectedNodeId } = useAppStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!state?.graph) {
      if (hasInitialized.current) return;
      setNodes([]);
      setEdges([]);
      return;
    }

    const positions = calculateLayout(state.graph.nodes);
    const edgeColors: Record<string, string> = {
      requires: 'var(--amber)', handles: 'var(--primary)', assigned_to: 'var(--green-bright)', links_to: 'var(--purple)',
    };

    const taskConfidence: Record<string, number> = {};
    state.tasks.forEach((t) => {
      const nodeId = state.graph.nodes.find((n) => n.type === 'task' && n.label === t.title)?.id;
      if (nodeId) taskConfidence[nodeId] = t.reasoning.confidenceScore;
    });

    setNodes(state.graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position ?? positions[n.id] ?? { x: 0, y: 0 },
      data: { label: n.label, status: n.status, riskLevel: n.riskLevel, confidenceScore: taskConfidence[n.id] },
      draggable: true,
      selected: n.id === selectedNodeId,
    })));

    setEdges(state.graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      style: { stroke: edgeColors[e.edgeType] ?? 'var(--border-bright)', strokeWidth: 1.5, opacity: 0.6 },
      labelStyle: { fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' },
      labelBgStyle: { fill: 'var(--bg-elevated)', fillOpacity: 0.9 },
      animated: e.edgeType === 'assigned_to',
    })));

    if (!hasInitialized.current && state.graph.nodes.length > 0) {
      hasInitialized.current = true;
      setTimeout(() => rfInstance.current?.fitView({ padding: 0.2 }), 100);
    }
  }, [state?.graph, selectedNodeId]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      label: 'links_to',
      style: { stroke: 'var(--purple)', strokeWidth: 1.5, opacity: 0.6 },
      animated: false,
    }, eds));

    if (connection.source && connection.target) {
      useAppStore.getState().addGraphEdge({
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        label: 'links_to',
        edgeType: 'links_to',
      });
    }
  }, [setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
    if (bounds) {
      setContextMenu({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    }
  }, []);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    deleted.forEach((n) => useAppStore.getState().removeGraphNode(n.id));
  }, []);

  const handleAddNode = (type: GraphNode['type'], position: { x: number; y: number }) => {
    const flowPos = rfInstance.current?.screenToFlowPosition(position) ?? position;
    const id = `user-${type}-${Date.now()}`;
    const node: GraphNode = {
      id, type, label: `New ${type}`, status: type === 'task' ? 'pending' : 'ok',
      position: flowPos, userAdded: true,
    };
    useAppStore.getState().addGraphNode(node);
    setContextMenu(null);
  };

  // Empty state
  if (!state || state.graph.nodes.length === 0) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, color: 'var(--text-dim)', background: 'var(--bg-surface)',
      }}>
        <svg width="56" height="56" viewBox="0 0 16 16" fill="none" stroke="var(--text-dim)" strokeWidth="0.8" opacity="0.3">
          <circle cx="4" cy="4" r="2.5" /><circle cx="12" cy="4" r="2.5" /><circle cx="8" cy="12" r="2.5" />
          <line x1="6" y1="4.5" x2="10" y2="4.5" /><line x1="5" y1="6" x2="7" y2="10" /><line x1="11" y1="6" x2="9" y2="10" />
        </svg>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>
          Upload a document or describe your assets
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-dim)' }}>
          The AI agent will build your asset graph automatically
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '6px 14px', display: 'flex', gap: 14,
        boxShadow: 'var(--shadow-md)',
      }}>
        {[
          { label: 'Asset', color: 'var(--primary)' },
          { label: 'Compliance', color: 'var(--amber)' },
          { label: 'Task', color: 'var(--purple)' },
          { label: 'Vendor', color: 'var(--green-bright)' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 3, borderRadius: 1, background: l.color }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Optimization Toggle */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <OptimizationToggle />
      </div>

      {/* Graph Toolbar */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
        <GraphToolbar
          onAddNode={(type) => handleAddNode(type, { x: window.innerWidth / 2, y: window.innerHeight / 2 })}
          onFitView={() => rfInstance.current?.fitView({ padding: 0.2 })}
          onResetLayout={() => {
            if (state?.graph) {
              const positions = calculateLayout(state.graph.nodes);
              setNodes((nds) => nds.map((n) => ({ ...n, position: positions[n.id] ?? n.position })));
              setTimeout(() => rfInstance.current?.fitView({ padding: 0.2 }), 50);
            }
          }}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        onInit={(instance) => { rfInstance.current = instance; }}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg-surface)' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border-subtle)" />
        <Controls style={{ background: 'var(--bg-elevated)' }} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = { asset: '#0F6CBD', compliance: '#F7630C', vendor: '#107C10', task: '#7160E8' };
            return colors[n.type ?? ''] ?? '#D1D5DB';
          }}
          style={{ background: 'var(--bg-elevated)' }}
        />
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu && (
        <GraphContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddNode={(type) => handleAddNode(type, { x: contextMenu.x, y: contextMenu.y })}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
