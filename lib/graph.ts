/**
 * Graph state store — Neo4j-backed with in-memory fallback.
 *
 * Nodes: Asset, Compliance, Vendor, Task
 * Edges: requires, handles, assigned_to, links_to
 *
 * When NEO4J_URI is set, entities are persisted as labeled nodes with
 * typed relationships. The in-memory Map acts as a fast cache.
 * Without credentials the system runs purely in-memory (demo mode).
 */

import type {
  SystemState,
  Analytics,
  Asset,
  ComplianceItem,
  Task,
  Vendor,
  AgentStep,
  GraphNode,
  GraphEdge,
  RiskLevel,
} from '@/types';
import { isNeo4jAvailable, runWrite, runRead } from '@/lib/neo4j';

// ── In-memory cache (always active) ────────────────────────────────

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

const sessions: Map<string, SystemState> =
  global._upkeptSessions ?? (global._upkeptSessions = new Map());

export const DEMO_SESSION = 'demo';

// ── Neo4j sync helpers ─────────────────────────────────────────────

async function syncToNeo4j(state: SystemState): Promise<void> {
  if (!isNeo4jAvailable()) return;

  const sid = state.sessionId;

  // Clear previous data for this session then write fresh
  await runWrite(
    `MATCH (n)-[:BELONGS_TO]->(s:Session {id: $sid}) DETACH DELETE n, s`,
    { sid },
  );

  // Create session node
  await runWrite(
    `CREATE (s:Session {
      id: $sid,
      phase: $phase,
      inputDescription: $inputDescription,
      optimizationMode: $optimizationMode,
      lastUpdated: $lastUpdated,
      agentStepsJson: $agentStepsJson
    })`,
    {
      sid,
      phase: state.phase,
      inputDescription: state.inputDescription,
      optimizationMode: state.optimizationMode ?? 'quality',
      lastUpdated: state.lastUpdated,
      agentStepsJson: JSON.stringify(state.agentSteps),
    },
  );

  // Create asset nodes
  for (const a of state.assets) {
    await runWrite(
      `MATCH (s:Session {id: $sid})
       CREATE (n:Asset {
         id: $id, name: $name, type: $type, status: $status,
         location: $location, installedYear: $installedYear,
         lastServiced: $lastServiced, description: $description,
         tagsJson: $tagsJson, riskScore: $riskScore
       })-[:BELONGS_TO]->(s)`,
      {
        sid,
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        location: a.location ?? '',
        installedYear: a.installedYear ?? 0,
        lastServiced: a.lastServiced ?? '',
        description: a.description,
        tagsJson: JSON.stringify(a.tags),
        riskScore: a.riskScore,
      },
    );
  }

  // Create compliance nodes + GOVERNS edges
  for (const c of state.complianceItems) {
    await runWrite(
      `MATCH (s:Session {id: $sid})
       CREATE (n:Compliance {
         id: $id, name: $name, dueDate: $dueDate,
         daysUntilDue: $daysUntilDue, status: $status,
         riskLevel: $riskLevel, authority: $authority,
         description: $description,
         linkedAssetIdsJson: $linkedAssetIdsJson
       })-[:BELONGS_TO]->(s)`,
      {
        sid,
        id: c.id,
        name: c.name,
        dueDate: c.dueDate,
        daysUntilDue: c.daysUntilDue,
        status: c.status,
        riskLevel: c.riskLevel,
        authority: c.authority ?? '',
        description: c.description,
        linkedAssetIdsJson: JSON.stringify(c.linkedAssetIds),
      },
    );

    // GOVERNS relationships to linked assets
    for (const assetId of c.linkedAssetIds) {
      await runWrite(
        `MATCH (c:Compliance {id: $cid})-[:BELONGS_TO]->(s:Session {id: $sid})
         MATCH (a:Asset {id: $aid})-[:BELONGS_TO]->(s)
         CREATE (c)-[:GOVERNS]->(a)`,
        { sid, cid: c.id, aid: assetId },
      );
    }
  }

  // Create task nodes + relationships
  for (const t of state.tasks) {
    await runWrite(
      `MATCH (s:Session {id: $sid})
       CREATE (n:Task {
         id: $id, title: $title, description: $description,
         status: $status, priority: $priority, dueDate: $dueDate,
         estimatedCost: $estimatedCost, marketPrice: $marketPrice,
         scheduledDate: $scheduledDate,
         requiresApproval: $requiresApproval,
         approvedAt: $approvedAt,
         assetId: $assetId, complianceId: $complianceId,
         reasoningJson: $reasoningJson,
         alternativeVendorsJson: $alternativeVendorsJson
       })-[:BELONGS_TO]->(s)`,
      {
        sid,
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        estimatedCost: t.estimatedCost,
        marketPrice: t.marketPrice,
        scheduledDate: t.scheduledDate ?? '',
        requiresApproval: t.requiresApproval,
        approvedAt: t.approvedAt ?? '',
        assetId: t.assetId ?? '',
        complianceId: t.complianceId ?? '',
        reasoningJson: JSON.stringify(t.reasoning),
        alternativeVendorsJson: JSON.stringify(t.alternativeVendors),
      },
    );

    // SERVICES relationship to asset
    if (t.assetId) {
      await runWrite(
        `MATCH (t:Task {id: $tid})-[:BELONGS_TO]->(s:Session {id: $sid})
         MATCH (a:Asset {id: $aid})-[:BELONGS_TO]->(s)
         CREATE (t)-[:SERVICES]->(a)`,
        { sid, tid: t.id, aid: t.assetId },
      );
    }

    // RESOLVES relationship to compliance
    if (t.complianceId) {
      await runWrite(
        `MATCH (t:Task {id: $tid})-[:BELONGS_TO]->(s:Session {id: $sid})
         MATCH (c:Compliance {id: $cid})-[:BELONGS_TO]->(s)
         CREATE (t)-[:RESOLVES]->(c)`,
        { sid, tid: t.id, cid: t.complianceId },
      );
    }

    // Vendor node + ASSIGNED_TO
    if (t.selectedVendor) {
      const v = t.selectedVendor;
      await runWrite(
        `MATCH (s:Session {id: $sid})
         MATCH (t:Task {id: $tid})-[:BELONGS_TO]->(s)
         MERGE (v:Vendor {id: $vid})-[:BELONGS_TO]->(s)
         ON CREATE SET v.name = $name, v.specialtyJson = $specialtyJson,
           v.rating = $rating, v.reviewCount = $reviewCount,
           v.priceRange = $priceRange, v.reliabilityScore = $reliabilityScore,
           v.sourcesJson = $sourcesJson, v.estimatedPrice = $estimatedPrice,
           v.availability = $availability, v.location = $location,
           v.yearsInBusiness = $yearsInBusiness,
           v.licensed = $licensed, v.insured = $insured
         CREATE (v)-[:ASSIGNED_TO]->(t)`,
        {
          sid,
          tid: t.id,
          vid: v.id,
          name: v.name,
          specialtyJson: JSON.stringify(v.specialty),
          rating: v.rating,
          reviewCount: v.reviewCount,
          priceRange: v.priceRange,
          reliabilityScore: v.reliabilityScore,
          sourcesJson: JSON.stringify(v.sources),
          estimatedPrice: v.estimatedPrice,
          availability: v.availability,
          location: v.location,
          yearsInBusiness: v.yearsInBusiness,
          licensed: v.licensed,
          insured: v.insured,
        },
      );
    }
  }
}

async function loadFromNeo4j(sessionId: string): Promise<SystemState | null> {
  if (!isNeo4jAvailable()) return null;

  // Load session
  const sRes = await runRead(
    `MATCH (s:Session {id: $sid}) RETURN s`,
    { sid: sessionId },
  );
  if (sRes.records.length === 0) return null;
  const sp = sRes.records[0].get('s').properties;

  // Load assets
  const aRes = await runRead(
    `MATCH (a:Asset)-[:BELONGS_TO]->(s:Session {id: $sid}) RETURN a`,
    { sid: sessionId },
  );
  const assets: Asset[] = aRes.records.map((r) => {
    const p = r.get('a').properties;
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      location: p.location || undefined,
      installedYear: toNum(p.installedYear) || undefined,
      lastServiced: p.lastServiced || undefined,
      description: p.description,
      tags: JSON.parse(p.tagsJson),
      riskScore: toNum(p.riskScore),
    };
  });

  // Load compliance
  const cRes = await runRead(
    `MATCH (c:Compliance)-[:BELONGS_TO]->(s:Session {id: $sid}) RETURN c`,
    { sid: sessionId },
  );
  const complianceItems: ComplianceItem[] = cRes.records.map((r) => {
    const p = r.get('c').properties;
    return {
      id: p.id,
      name: p.name,
      dueDate: p.dueDate,
      daysUntilDue: toNum(p.daysUntilDue),
      status: p.status,
      linkedAssetIds: JSON.parse(p.linkedAssetIdsJson),
      riskLevel: p.riskLevel,
      authority: p.authority || undefined,
      description: p.description,
    };
  });

  // Load vendors keyed by id
  const vRes = await runRead(
    `MATCH (v:Vendor)-[:BELONGS_TO]->(s:Session {id: $sid}) RETURN v`,
    { sid: sessionId },
  );
  const vendorMap = new Map<string, Vendor>();
  vRes.records.forEach((r) => {
    const p = r.get('v').properties;
    vendorMap.set(p.id, {
      id: p.id,
      name: p.name,
      specialty: JSON.parse(p.specialtyJson),
      rating: toNum(p.rating),
      reviewCount: toNum(p.reviewCount),
      priceRange: p.priceRange,
      reliabilityScore: toNum(p.reliabilityScore),
      sources: JSON.parse(p.sourcesJson),
      estimatedPrice: toNum(p.estimatedPrice),
      availability: p.availability,
      location: p.location,
      yearsInBusiness: toNum(p.yearsInBusiness),
      licensed: p.licensed,
      insured: p.insured,
    });
  });

  // Load tasks + resolve vendor assignments
  const tRes = await runRead(
    `MATCH (t:Task)-[:BELONGS_TO]->(s:Session {id: $sid})
     OPTIONAL MATCH (v:Vendor)-[:ASSIGNED_TO]->(t)
     RETURN t, v`,
    { sid: sessionId },
  );
  const tasks: Task[] = tRes.records.map((r) => {
    const p = r.get('t').properties;
    const vNode = r.get('v');
    const selectedVendor = vNode ? vendorMap.get(vNode.properties.id) : undefined;
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      assetId: p.assetId || undefined,
      complianceId: p.complianceId || undefined,
      status: p.status,
      priority: p.priority,
      dueDate: p.dueDate,
      estimatedCost: toNum(p.estimatedCost),
      marketPrice: toNum(p.marketPrice),
      selectedVendor,
      alternativeVendors: JSON.parse(p.alternativeVendorsJson),
      reasoning: JSON.parse(p.reasoningJson),
      scheduledDate: p.scheduledDate || undefined,
      requiresApproval: p.requiresApproval,
      approvedAt: p.approvedAt || undefined,
    };
  });

  const agentSteps: AgentStep[] = sp.agentStepsJson
    ? JSON.parse(sp.agentStepsJson)
    : [];

  const state: SystemState = {
    sessionId,
    phase: sp.phase,
    inputDescription: sp.inputDescription,
    optimizationMode: sp.optimizationMode,
    assets,
    complianceItems,
    tasks,
    agentSteps,
    graph: { nodes: [], edges: [] },
    analytics: { ...EMPTY_ANALYTICS },
    lastUpdated: sp.lastUpdated,
  };

  // Derive graph and analytics from the loaded entities
  state.graph = buildGraph(state);
  state.analytics = computeAnalytics(state);

  return state;
}

async function clearNeo4jSession(sessionId: string): Promise<void> {
  if (!isNeo4jAvailable()) return;
  await runWrite(
    `OPTIONAL MATCH (n)-[:BELONGS_TO]->(s:Session {id: $sid})
     DETACH DELETE n, s`,
    { sid: sessionId },
  );
}

/** Convert Neo4j Integer to JS number */
function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && 'toNumber' in (v as Record<string, unknown>)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v) || 0;
}

// ── Public API (signatures unchanged) ──────────────────────────────

export function getSession(id: string = DEMO_SESSION): SystemState {
  if (!sessions.has(id)) {
    sessions.set(id, emptyState(id));
  }
  return sessions.get(id)!;
}

/**
 * Async version that checks Neo4j first, then falls back to in-memory.
 * Use this in API routes for persistent reads.
 */
export async function getSessionAsync(id: string = DEMO_SESSION): Promise<SystemState> {
  // Return from cache if available
  if (sessions.has(id)) return sessions.get(id)!;

  // Try loading from Neo4j
  const fromDb = await loadFromNeo4j(id);
  if (fromDb) {
    sessions.set(id, fromDb);
    return fromDb;
  }

  // Empty state
  const fresh = emptyState(id);
  sessions.set(id, fresh);
  return fresh;
}

export function updateSession(id: string, patch: Partial<SystemState>): SystemState {
  const current = getSession(id);
  const updated: SystemState = {
    ...current,
    ...patch,
    lastUpdated: new Date().toISOString(),
  };
  sessions.set(id, updated);

  // Fire-and-forget sync to Neo4j
  syncToNeo4j(updated).catch((err) =>
    console.error('[neo4j] sync error:', err),
  );

  return updated;
}

export function resetSession(id: string = DEMO_SESSION): SystemState {
  const fresh = emptyState(id);
  sessions.set(id, fresh);

  // Fire-and-forget clear in Neo4j
  clearNeo4jSession(id).catch((err) =>
    console.error('[neo4j] clear error:', err),
  );

  return fresh;
}

// ── Graph builder (pure function, unchanged logic) ─────────────────

export function buildGraph(state: SystemState): SystemState['graph'] {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  state.assets.forEach((asset) => {
    nodes.push({
      id: asset.id,
      type: 'asset',
      label: asset.name,
      status: asset.status,
    });
  });

  state.complianceItems.forEach((c) => {
    nodes.push({
      id: c.id,
      type: 'compliance',
      label: c.name,
      status: c.status,
      riskLevel: c.riskLevel,
    });
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

// ── Analytics (pure function, unchanged logic) ─────────────────────

export function computeAnalytics(state: SystemState): Analytics {
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
        severity: (a.status === 'critical' ? 'critical' : 'medium') as RiskLevel,
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
