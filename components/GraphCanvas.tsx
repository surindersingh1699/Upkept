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

// ─── Custom node renderers ─────────────────────────────────

function AssetNode({ data, id, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const statusColors: Record<string, string> = { ok: 'var(--green)', attention: 'var(--amber)', critical: 'var(--red)', overdue: 'var(--red)' };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  const commitEdit = () => {
    setEditing(false);
    useAppStore.getState().updateGraphNode(id, { label });
  };

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-elevated)', border: `1.5px solid ${color}`,
        borderRadius: 8, padding: '8px 14px', minWidth: 130,
        boxShadow: selected ? `0 0 16px ${color}40` : `0 0 8px ${color}20`,
        position: 'relative', transition: 'box-shadow 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 2 }}>ASSET</div>
      {editing ? (
        <input
          value={label} onChange={(e) => setLabel(e.target.value)}
          onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
          autoFocus
          style={{ background: 'var(--bg-base)', border: '1px solid var(--amber)', padding: '2px 4px', fontSize: 12, width: '100%', fontFamily: 'var(--font-display)' }}
        />
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>{data.label}</div>
      )}
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{data.status}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function ComplianceNode({ data, id, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const riskColors: Record<string, string> = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--blue)', low: 'var(--green)' };
  const color = riskColors[data.riskLevel ?? 'medium'] ?? 'var(--amber)';

  const commitEdit = () => { setEditing(false); useAppStore.getState().updateGraphNode(id, { label }); };

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-elevated)', border: `1.5px solid ${color}`,
        borderRadius: 4, padding: '8px 14px', minWidth: 140,
        boxShadow: selected ? `0 0 16px ${color}40` : 'none',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--amber)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 2 }}>COMPLIANCE</div>
      {editing ? (
        <input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()} autoFocus style={{ background: 'var(--bg-base)', border: '1px solid var(--amber)', padding: '2px 4px', fontSize: 11, width: '100%' }} />
      ) : (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      )}
      <div style={{ marginTop: 4 }}>
        <span className={`badge badge-${data.riskLevel ?? 'medium'}`} style={{ fontSize: 9 }}>{data.riskLevel ?? 'medium'} risk</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function VendorNode({ data, id, selected }: NodeProps) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1.5px solid var(--green)',
      borderRadius: 24, padding: '10px 16px', minWidth: 100, textAlign: 'center',
      boxShadow: selected ? '0 0 16px var(--green-glow)' : '0 0 8px var(--green-glow)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--green)', border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 2 }}>VENDOR</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--green)', border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

function TaskNode({ data, id, selected }: NodeProps) {
  const statusColors: Record<string, string> = { pending: 'var(--text-muted)', approved: 'var(--green)', scheduled: 'var(--blue)', completed: 'var(--green)' };
  const color = statusColors[data.status] ?? 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: `1.5px dashed ${color}`,
      borderRadius: 6, padding: '8px 14px', minWidth: 130, position: 'relative',
      opacity: data.status === 'pending' ? 0.8 : 1,
      boxShadow: selected ? `0 0 16px ${color}40` : 'none',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 9, color: 'var(--purple)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 2 }}>TASK</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{data.label}</div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{data.status}</span>
        {data.confidenceScore != null && (
          <span className="node-badge" style={{
            position: 'static', background: data.confidenceScore >= 80 ? 'var(--green-glow)' : 'var(--amber-glow)',
            color: data.confidenceScore >= 80 ? 'var(--green)' : 'var(--amber)',
            borderColor: data.confidenceScore >= 80 ? 'var(--green-dim)' : 'var(--amber-dim)',
          }}>
            {data.confidenceScore}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
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

  // Sync from store when graph data changes
  useEffect(() => {
    if (!state?.graph) {
      if (hasInitialized.current) return;
      setNodes([]);
      setEdges([]);
      return;
    }

    const positions = calculateLayout(state.graph.nodes);
    const edgeColors: Record<string, string> = {
      requires: 'var(--amber)', handles: 'var(--blue)', assigned_to: 'var(--green)', links_to: 'var(--purple)',
    };

    // Find confidence scores from tasks
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
      style: { stroke: edgeColors[e.edgeType] ?? 'var(--border-bright)', strokeWidth: 1.5, opacity: 0.7 },
      labelStyle: { fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
      labelBgStyle: { fill: 'var(--bg-elevated)', fillOpacity: 0.8 },
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
      style: { stroke: 'var(--purple)', strokeWidth: 1.5, opacity: 0.7 },
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
        <div style={{ fontSize: 48, opacity: 0.2 }}>◈</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          Upload a document or describe your assets
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>
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
        borderRadius: 'var(--radius)', padding: '6px 12px', display: 'flex', gap: 14,
      }}>
        {[
          { label: 'Asset', color: 'var(--blue)' },
          { label: 'Compliance', color: 'var(--amber)' },
          { label: 'Task', color: 'var(--purple)' },
          { label: 'Vendor', color: 'var(--green)' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              {l.label.toUpperCase()}
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
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
        <Controls style={{ background: 'var(--bg-elevated)' }} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = { asset: '#4A90E2', compliance: '#F0A000', vendor: '#00CC6A', task: '#9B6DFF' };
            return colors[n.type ?? ''] ?? '#253048';
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
