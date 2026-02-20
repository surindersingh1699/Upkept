/**
 * In-memory graph state — represents the world model as a property graph.
 * Nodes: Asset, Compliance, Vendor, Task
 * Edges: requires, handles, assigned_to, links_to
 *
 * This is the single source of truth for all agent decisions.
 * In production this would be Neo4j; for the hackathon this is a typed Map store.
 */

import type { SystemState, Analytics } from '@/types';

// Use global to persist across hot-reloads and route module boundaries in Next.js
declare global {
  // eslint-disable-next-line no-var
  var _upkeptSessions: Map<string, SystemState> | undefined;
}

const EMPTY_ANALYTICS: Analytics = {
  complianceScore: 0,
  upcomingRisks: [],
  estimatedSavings: 0,
  totalCost: 0,
  maintenanceTimeline: [],
  totalTasks: 0,
  approvedTasks: 0,
  criticalItems: 0,
  historicalDecisions: [],
};

function emptyState(sessionId: string): SystemState {
  return {
    sessionId,
    phase: 'idle',
    inputDescription: '',
    assets: [],
    complianceItems: [],
    tasks: [],
    agentSteps: [],
    graph: { nodes: [], edges: [] },
    analytics: { ...EMPTY_ANALYTICS },
    lastUpdated: new Date().toISOString(),
  };
}

// Server-side singleton store (per-session via Map)
// globalThis persists across Next.js hot-reloads and route module boundaries
const sessions: Map<string, SystemState> =
  global._upkeptSessions ?? (global._upkeptSessions = new Map());

export const DEMO_SESSION = 'demo';

export function getSession(id: string = DEMO_SESSION): SystemState {
  if (!sessions.has(id)) {
    sessions.set(id, emptyState(id));
  }
  return sessions.get(id)!;
}

export function updateSession(id: string, patch: Partial<SystemState>): SystemState {
  const current = getSession(id);
  const updated: SystemState = {
    ...current,
    ...patch,
    lastUpdated: new Date().toISOString(),
  };
  sessions.set(id, updated);
  return updated;
}

export function resetSession(id: string = DEMO_SESSION): SystemState {
  const fresh = emptyState(id);
  sessions.set(id, fresh);
  return fresh;
}

/** Compute graph edges from assets, compliance, and tasks */
export function buildGraph(state: SystemState): SystemState['graph'] {
  const nodes: SystemState['graph']['nodes'] = [];
  const edges: SystemState['graph']['edges'] = [];

  // Asset nodes
  state.assets.forEach((asset) => {
    nodes.push({
      id: asset.id,
      type: 'asset',
      label: asset.name,
      status: asset.status,
    });
  });

  // Compliance nodes
  state.complianceItems.forEach((c) => {
    nodes.push({
      id: c.id,
      type: 'compliance',
      label: c.name,
      status: c.status,
      riskLevel: c.riskLevel,
    });
    // edges to linked assets
    c.linkedAssetIds.forEach((assetId) => {
      edges.push({
        id: `${c.id}->${assetId}`,
        source: c.id,
        target: assetId,
        label: 'governs',
        edgeType: 'links_to',
      });
    });
  });

  // Task nodes + edges to assets/compliance
  state.tasks.forEach((task) => {
    nodes.push({
      id: task.id,
      type: 'task',
      label: task.title,
      status: task.status,
    });

    if (task.assetId) {
      edges.push({
        id: `${task.id}->${task.assetId}`,
        source: task.id,
        target: task.assetId,
        label: 'services',
        edgeType: 'handles',
      });
    }
    if (task.complianceId) {
      edges.push({
        id: `${task.id}->${task.complianceId}`,
        source: task.id,
        target: task.complianceId,
        label: 'resolves',
        edgeType: 'handles',
      });
    }

    // Vendor node + edge
    if (task.selectedVendor) {
      const vendorNodeId = task.selectedVendor.id;
      if (!nodes.find((n) => n.id === vendorNodeId)) {
        nodes.push({
          id: vendorNodeId,
          type: 'vendor',
          label: task.selectedVendor.name,
          status: 'ok',
        });
      }
      edges.push({
        id: `${vendorNodeId}->${task.id}`,
        source: vendorNodeId,
        target: task.id,
        label: 'assigned',
        edgeType: 'assigned_to',
      });
    }
  });

  return { nodes, edges };
}

/** Compute analytics from current state */
export function computeAnalytics(state: SystemState): Analytics {
  // Weighted compliance score: penalise by risk level of non-compliant items
  const riskPenalty: Record<string, number> = { critical: 25, high: 15, medium: 8, low: 3 };
  const baseScore = 100;
  const penalty = state.complianceItems
    .filter((c) => c.status !== 'compliant')
    .reduce((sum, c) => sum + (riskPenalty[c.riskLevel] ?? 5), 0)
    + state.assets.filter((a) => a.status === 'critical').length * 10
    + state.assets.filter((a) => a.status === 'attention').length * 4;
  const complianceScore = Math.max(10, Math.min(100, baseScore - penalty));

  const upcomingRisks = [
    ...state.complianceItems
      .filter((c) => c.daysUntilDue <= 90)
      .map((c) => ({
        label: c.name,
        daysUntil: c.daysUntilDue,
        severity: c.riskLevel,
      })),
    ...state.assets
      .filter((a) => a.status === 'critical' || a.status === 'attention')
      .map((a) => ({
        label: `${a.name} maintenance`,
        daysUntil: a.status === 'critical' ? 14 : 45,
        severity: (a.status === 'critical' ? 'critical' : 'medium') as 'critical' | 'medium',
      })),
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  const totalCost = state.tasks.reduce((sum, t) => sum + t.estimatedCost, 0);
  const marketTotal = state.tasks.reduce((sum, t) => sum + t.marketPrice, 0);
  const estimatedSavings = Math.max(0, marketTotal - totalCost);

  const criticalItems = state.assets.filter((a) => a.status === 'critical').length +
    state.complianceItems.filter((c) => c.riskLevel === 'critical').length;

  const historicalDecisions = state.tasks
    .filter((t) => t.status === 'approved' || t.status === 'scheduled')
    .map((t) => ({
      date: new Date().toISOString().split('T')[0],
      action: `Selected ${t.selectedVendor?.name ?? 'vendor'} for ${t.title}`,
      outcome: `Scheduled for ${t.scheduledDate ?? 'TBD'}`,
      savings: t.marketPrice - t.estimatedCost,
    }));

  // Simple 6-month timeline
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const maintenanceTimeline = months.map((month, i) => ({
    month,
    tasks: Math.max(0, state.tasks.length - i * 1),
    cost: Math.round((totalCost / 6) * (1 + (5 - i) * 0.1)),
  }));

  return {
    complianceScore,
    upcomingRisks,
    estimatedSavings,
    totalCost,
    maintenanceTimeline,
    totalTasks: state.tasks.length,
    approvedTasks: state.tasks.filter((t) => t.status !== 'pending').length,
    criticalItems,
    historicalDecisions,
  };
}
