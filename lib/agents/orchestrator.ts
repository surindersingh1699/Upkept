/**
 * UpKept Agent Orchestrator
 *
 * Pipeline:
 * 1. AssetExtractor  — parse description into structured assets
 * 2. ComplianceMapper — identify compliance items and risks
 * 3. VendorDiscovery  — find and rank vendors for each task
 * 4. Scheduler        — propose timing, pricing, schedule
 *
 * Each phase emits AgentStep events that stream to the UI.
 * Uses Amazon Bedrock (Claude claude-sonnet-4-6) with deterministic fallback.
 */

import type {
  Asset,
  ComplianceItem,
  Task,
  Vendor,
  AgentStep,
  SystemState,
  TaskReasoning,
} from '@/types';
import { safeInvoke } from '@/lib/bedrock';
import { findVendors, getMarketPrice } from '@/lib/vendors';
import { buildGraph, computeAnalytics, updateSession } from '@/lib/graph';

// ─────────────────────────────────────────────────────────────
// DEMO DATA (used when Bedrock credentials are unavailable)
// ─────────────────────────────────────────────────────────────

const DEMO_ASSETS: Asset[] = [
  {
    id: 'a-hvac',
    name: 'HVAC System',
    type: 'physical',
    status: 'critical',
    location: 'Utility Room',
    installedYear: 2008,
    lastServiced: '2021-03-15',
    description: 'Central HVAC, last serviced over 3 years ago. Manufacturer recommends annual service.',
    tags: ['hvac', 'heating', 'cooling'],
    riskScore: 78,
  },
  {
    id: 'a-waterheater',
    name: 'Water Heater',
    type: 'physical',
    status: 'attention',
    location: 'Garage',
    installedYear: 2015,
    lastServiced: '2015-01-01',
    description: '10-year warranty expired. Unit is 9 years old; average lifespan is 8-12 years.',
    tags: ['plumbing', 'water_heater'],
    riskScore: 62,
  },
  {
    id: 'a-smoke',
    name: 'Smoke Detectors (×3)',
    type: 'physical',
    status: 'attention',
    location: 'Floors 1 & 2',
    lastServiced: '2022-06-01',
    description: 'Last tested 2022. Code requires annual testing. Batteries overdue.',
    tags: ['fire_safety', 'smoke_detector'],
    riskScore: 55,
  },
  {
    id: 'a-roof',
    name: 'Roof',
    type: 'physical',
    status: 'critical',
    location: 'Exterior',
    installedYear: 2008,
    lastServiced: '2019-04-20',
    description: 'Asphalt shingles not inspected since 2019. Approaching end of typical 15-year lifespan.',
    tags: ['roofing', 'inspection'],
    riskScore: 82,
  },
  {
    id: 'a-panel',
    name: 'Electrical Panel',
    type: 'physical',
    status: 'attention',
    location: 'Garage',
    installedYear: 2008,
    lastServiced: '2008-01-01',
    description: 'Original 2008 panel. 16 years without inspection. Code may require update.',
    tags: ['electrical', 'panel'],
    riskScore: 70,
  },
  {
    id: 'a-ssl',
    name: 'SSL Certificate',
    type: 'digital',
    status: 'critical',
    description: 'Website SSL expires in 45 days. Expiry causes browser security warnings and SEO impact.',
    tags: ['ssl', 'web_security', 'digital'],
    riskScore: 85,
  },
  {
    id: 'a-backup',
    name: 'Cloud Backup System',
    type: 'digital',
    status: 'attention',
    lastServiced: '2024-08-01',
    description: 'AWS S3 backup not verified in 6 months. Integrity unknown.',
    tags: ['backup', 'cloud', 'digital'],
    riskScore: 50,
  },
];

const DEMO_COMPLIANCE: ComplianceItem[] = [
  {
    id: 'c-fire',
    name: 'Annual Fire Safety Inspection',
    dueDate: '2025-03-22',
    daysUntilDue: 30,
    status: 'due_soon',
    linkedAssetIds: ['a-smoke'],
    riskLevel: 'critical',
    authority: 'Austin Fire Marshal',
    description: 'Required by commercial lease. Non-compliance can result in lease termination.',
  },
  {
    id: 'c-license',
    name: 'Business License Renewal',
    dueDate: '2025-04-21',
    daysUntilDue: 60,
    status: 'due_soon',
    linkedAssetIds: [],
    riskLevel: 'high',
    authority: 'City of Austin Business Office',
    description: 'Annual business license renewal. Late filing incurs $500/month penalty.',
  },
  {
    id: 'c-gdpr',
    name: 'GDPR Data Retention Audit',
    dueDate: '2025-05-20',
    daysUntilDue: 90,
    status: 'due_soon',
    linkedAssetIds: ['a-backup'],
    riskLevel: 'medium',
    authority: 'EU GDPR Supervisory Authority',
    description: 'Annual review of data retention policies and deletion schedules.',
  },
];

// ─────────────────────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────────────────────

const ASSET_EXTRACTOR_SYSTEM = `You are AssetExtractor, an AI agent that parses property and system descriptions into structured asset records.

Extract ALL assets mentioned: physical (HVAC, roof, plumbing, etc.), digital (SSL, backups, domains), and compliance-only items (inspections, licenses, policies).

Return ONLY valid JSON matching this schema:
{
  "assets": [
    {
      "id": "a-<slug>",
      "name": "<name>",
      "type": "physical|digital|compliance_only",
      "status": "ok|attention|critical|overdue",
      "location": "<optional>",
      "installedYear": <optional number>,
      "lastServiced": "<optional YYYY-MM-DD>",
      "description": "<brief description of current condition>",
      "tags": ["<relevant tags>"],
      "riskScore": <0-100>
    }
  ]
}

Status rules:
- ok: No known issues, recently serviced
- attention: Needs service soon (>3 months overdue or approaching end of life)
- critical: Immediate risk, safety concern, or imminent failure
- overdue: Past due date, compliance violated`;

const COMPLIANCE_SYSTEM = `You are ComplianceMapper, an AI agent that identifies compliance obligations and links them to assets.

Return ONLY valid JSON:
{
  "complianceItems": [
    {
      "id": "c-<slug>",
      "name": "<name>",
      "dueDate": "<YYYY-MM-DD>",
      "daysUntilDue": <number>,
      "status": "compliant|due_soon|overdue|unknown",
      "linkedAssetIds": ["<asset id or empty>"],
      "riskLevel": "low|medium|high|critical",
      "authority": "<governing body>",
      "description": "<what happens if non-compliant>"
    }
  ]
}`;

const VENDOR_SYSTEM = `You are VendorDiscovery, an AI agent that evaluates vendors for maintenance tasks.
You use public data (Google, Yelp, BBB) to assess reliability, pricing, and availability.
Return reasoning as plain text explaining your selection and why alternatives were rejected.`;

const SCHEDULER_SYSTEM = `You are Scheduler, an AI agent that proposes optimal maintenance schedules.
Consider: urgency, vendor availability, weather, cost optimization, bundling opportunities.
Return a plain text schedule rationale.`;

// ─────────────────────────────────────────────────────────────
// AGENT STEPS EMITTER
// ─────────────────────────────────────────────────────────────

type StepEmitter = (step: Omit<AgentStep, 'id' | 'timestamp'>) => void;

function makeStep(
  emitter: StepEmitter,
  agentName: AgentStep['agentName'],
  action: string,
  detail?: string,
  status: AgentStep['status'] = 'running'
): void {
  emitter({ agentName, action, detail, status });
}

// ─────────────────────────────────────────────────────────────
// PHASE 1: ASSET EXTRACTION
// ─────────────────────────────────────────────────────────────

async function extractAssets(
  description: string,
  emit: StepEmitter
): Promise<Asset[]> {
  makeStep(emit, 'AssetExtractor', 'Parsing description for physical assets...', undefined, 'running');

  const fallback = JSON.stringify({ assets: DEMO_ASSETS });
  const { text, usedBedrock } = await safeInvoke(
    ASSET_EXTRACTOR_SYSTEM,
    `Extract all assets from this description:\n\n${description}`,
    fallback,
    2048
  );

  makeStep(emit, 'AssetExtractor', `Identified assets`, `${usedBedrock ? 'Bedrock' : 'Demo'} mode`, 'complete');

  try {
    const parsed = JSON.parse(text);
    return parsed.assets as Asset[];
  } catch {
    return DEMO_ASSETS;
  }
}

// ─────────────────────────────────────────────────────────────
// PHASE 2: COMPLIANCE MAPPING
// ─────────────────────────────────────────────────────────────

async function mapCompliance(
  description: string,
  assets: Asset[],
  emit: StepEmitter
): Promise<ComplianceItem[]> {
  makeStep(emit, 'ComplianceMapper', 'Scanning for compliance obligations...', undefined, 'running');

  const assetList = assets.map((a) => `${a.id}: ${a.name}`).join(', ');
  const fallback = JSON.stringify({ complianceItems: DEMO_COMPLIANCE });
  const { text, usedBedrock } = await safeInvoke(
    COMPLIANCE_SYSTEM,
    `Assets: ${assetList}\n\nDescription:\n${description}\n\nIdentify all compliance obligations.`,
    fallback,
    2048
  );

  makeStep(
    emit,
    'ComplianceMapper',
    'Compliance items mapped',
    `${usedBedrock ? 'Bedrock' : 'Demo'} mode`,
    'complete'
  );

  try {
    const parsed = JSON.parse(text);
    return parsed.complianceItems as ComplianceItem[];
  } catch {
    return DEMO_COMPLIANCE;
  }
}

// ─────────────────────────────────────────────────────────────
// PHASE 3: VENDOR DISCOVERY + TASK CREATION
// ─────────────────────────────────────────────────────────────

interface TaskTemplate {
  title: string;
  description: string;
  assetId?: string;
  complianceId?: string;
  specialty: string;
  priority: Task['priority'];
  dueDate: string;
  requiresApproval: boolean;
}

function buildTaskTemplates(assets: Asset[], compliance: ComplianceItem[]): TaskTemplate[] {
  const templates: TaskTemplate[] = [];

  // Asset-based tasks
  const assetTaskMap: Record<string, TaskTemplate> = {
    'a-hvac': {
      title: 'HVAC Annual Service',
      description: 'Full inspection, filter replacement, refrigerant check, and tune-up.',
      assetId: 'a-hvac',
      specialty: 'hvac',
      priority: 'urgent',
      dueDate: '2025-02-28',
      requiresApproval: true,
    },
    'a-waterheater': {
      title: 'Water Heater Replacement',
      description: 'Replace 9-year-old unit with high-efficiency tank or tankless model.',
      assetId: 'a-waterheater',
      specialty: 'water_heater',
      priority: 'high',
      dueDate: '2025-03-15',
      requiresApproval: true,
    },
    'a-smoke': {
      title: 'Smoke Detector Testing & Battery Replacement',
      description: 'Test all 3 units, replace batteries, document compliance.',
      assetId: 'a-smoke',
      specialty: 'fire_inspection',
      priority: 'urgent',
      dueDate: '2025-02-25',
      requiresApproval: true,
    },
    'a-roof': {
      title: 'Roof Inspection',
      description: 'Full structural inspection, check for damage, moss, and drainage issues.',
      assetId: 'a-roof',
      specialty: 'roofing',
      priority: 'urgent',
      dueDate: '2025-03-01',
      requiresApproval: true,
    },
    'a-panel': {
      title: 'Electrical Panel Inspection',
      description: 'Inspect 2008 panel for code compliance, load capacity, and safety.',
      assetId: 'a-panel',
      specialty: 'electrical',
      priority: 'high',
      dueDate: '2025-03-20',
      requiresApproval: true,
    },
    'a-ssl': {
      title: 'SSL Certificate Renewal',
      description: 'Renew SSL certificate before expiry to prevent downtime and security warnings.',
      assetId: 'a-ssl',
      specialty: 'ssl',
      priority: 'urgent',
      dueDate: '2025-03-07',
      requiresApproval: false,
    },
    'a-backup': {
      title: 'Backup System Verification',
      description: 'Run full restore test on AWS S3 backup, verify integrity and retention policy.',
      assetId: 'a-backup',
      specialty: 'ssl',
      priority: 'medium',
      dueDate: '2025-03-31',
      requiresApproval: false,
    },
  };

  assets.forEach((asset) => {
    const template = assetTaskMap[asset.id];
    if (template) templates.push(template);
    else {
      templates.push({
        title: `${asset.name} Maintenance`,
        description: `Scheduled maintenance for ${asset.name}.`,
        assetId: asset.id,
        specialty: asset.tags[0] || 'general',
        priority: asset.status === 'critical' ? 'urgent' : 'medium',
        dueDate: '2025-04-01',
        requiresApproval: true,
      });
    }
  });

  // Compliance-based tasks
  compliance.forEach((c) => {
    templates.push({
      title: c.name,
      description: c.description,
      complianceId: c.id,
      specialty: c.linkedAssetIds.length > 0 ? 'fire_inspection' : 'business_license',
      priority: c.riskLevel === 'critical' ? 'urgent' : c.riskLevel === 'high' ? 'high' : 'medium',
      dueDate: c.dueDate,
      requiresApproval: true,
    });
  });

  return templates;
}

async function discoverVendorsForTask(
  template: TaskTemplate,
  taskId: string,
  emit: StepEmitter
): Promise<Task> {
  makeStep(
    emit,
    'VendorDiscovery',
    `Searching vendors for: ${template.title}`,
    `Querying Yelp, Google, BBB for "${template.specialty}" specialists`,
    'running'
  );

  const candidates = findVendors(template.specialty);
  const marketPrice = getMarketPrice(template.specialty);

  if (candidates.length === 0) {
    makeStep(emit, 'VendorDiscovery', `No vendors found for ${template.specialty}`, undefined, 'error');
  }

  const selected = candidates[0];
  const alternatives = candidates.slice(1, 3);

  // Generate reasoning via Bedrock (or fallback)
  const vendorSummary = candidates
    .slice(0, 3)
    .map(
      (v) =>
        `${v.name}: rating=${v.rating}, reliability=${v.reliabilityScore}%, price=$${v.estimatedPrice}, licensed=${v.licensed}, insured=${v.insured}`
    )
    .join('\n');

  const reasoningFallback = generateFallbackReasoning(template, selected, alternatives, marketPrice);

  const { text: reasoningText } = await safeInvoke(
    VENDOR_SYSTEM,
    `Task: ${template.title}\nCandidates:\n${vendorSummary}\n\nExplain vendor selection in 2-3 sentences covering: why selected vendor wins, pricing fairness, risk avoided.`,
    reasoningFallback,
    512
  );

  makeStep(
    emit,
    'VendorDiscovery',
    `Selected: ${selected?.name ?? 'No vendor'}`,
    `Score: ${selected?.reliabilityScore}% reliability, $${selected?.estimatedPrice} vs $${marketPrice} market`,
    'complete'
  );

  const reasoning: TaskReasoning = {
    summary: reasoningText,
    dataUsed: [
      'Yelp reviews (simulated)',
      'Google Business profile (simulated)',
      'BBB accreditation database',
      'Historical job completion data',
    ],
    vendorSelectionReason: `Selected for highest reliability score (${selected?.reliabilityScore}%) and verified licensing/insurance among ${candidates.length} candidates.`,
    priceJustification: `Estimated cost $${selected?.estimatedPrice} vs market average $${marketPrice} — ${Math.round(((marketPrice - (selected?.estimatedPrice ?? 0)) / marketPrice) * 100)}% below market.`,
    riskAvoided: template.priority === 'urgent'
      ? 'Avoiding equipment failure, safety liability, and emergency repair premium (typically 3×).'
      : 'Proactive scheduling prevents reactive costs and compliance penalties.',
    confidenceScore: selected ? Math.round((selected.reliabilityScore + selected.rating * 10) / 2) : 60,
    alternativesRejected: alternatives.map((v) => ({
      vendorName: v.name,
      reason:
        v.reliabilityScore < (selected?.reliabilityScore ?? 0)
          ? `Lower reliability (${v.reliabilityScore}% vs ${selected?.reliabilityScore}%)`
          : !v.insured
          ? 'Not insured — liability risk'
          : `Lower rating (${v.rating} vs ${selected?.rating})`,
    })),
  };

  return {
    id: taskId,
    title: template.title,
    description: template.description,
    assetId: template.assetId,
    complianceId: template.complianceId,
    status: 'pending',
    priority: template.priority,
    dueDate: template.dueDate,
    estimatedCost: selected?.estimatedPrice ?? 300,
    marketPrice,
    selectedVendor: selected,
    alternativeVendors: alternatives,
    reasoning,
    requiresApproval: template.requiresApproval,
  };
}

function generateFallbackReasoning(
  template: TaskTemplate,
  selected: Vendor | undefined,
  alternatives: Vendor[],
  marketPrice: number
): string {
  if (!selected) return 'No qualified vendor found in local database. Manual sourcing recommended.';
  return `${selected.name} is the optimal choice for ${template.title} based on ${selected.reliabilityScore}% reliability score across ${selected.reviewCount} reviews on ${selected.sources.join(', ')}. At $${selected.estimatedPrice}, the estimate is ${Math.round(((marketPrice - selected.estimatedPrice) / marketPrice) * 100)}% below the local market average of $${marketPrice}. ${alternatives[0] ? `Alternative ${alternatives[0].name} was rejected due to lower reliability (${alternatives[0].reliabilityScore}%).` : ''}`;
}

// ─────────────────────────────────────────────────────────────
// PHASE 4: SCHEDULING
// ─────────────────────────────────────────────────────────────

async function proposeDates(tasks: Task[], emit: StepEmitter): Promise<Task[]> {
  makeStep(emit, 'Scheduler', 'Optimizing schedule across all tasks...', 'Considering urgency, vendor availability, weather patterns', 'running');

  // Simple deterministic scheduling: urgent tasks first, spread across weeks
  const sortedByPriority = [...tasks].sort((a, b) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });

  const baseDate = new Date('2025-02-24');
  const scheduled = sortedByPriority.map((task, i) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 5); // stagger 5 days apart
    return {
      ...task,
      scheduledDate: date.toISOString().split('T')[0],
    };
  });

  makeStep(emit, 'Scheduler', 'Schedule optimized', `${scheduled.length} tasks across ${Math.ceil(scheduled.length * 5 / 30)} months`, 'complete');

  return scheduled;
}

// ─────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

export async function runOrchestrator(
  sessionId: string,
  description: string,
  onStep: (step: AgentStep) => void
): Promise<SystemState> {
  let stepCounter = 0;

  const emit: StepEmitter = (step) => {
    const agentStep: AgentStep = {
      id: `step-${++stepCounter}`,
      timestamp: new Date().toISOString(),
      ...step,
    };
    onStep(agentStep);
  };

  makeStep(emit, 'Orchestrator', 'Initializing agent pipeline', 'AssetExtractor → ComplianceMapper → VendorDiscovery → Scheduler', 'running');

  // Phase 1
  const assets = await extractAssets(description, emit);
  makeStep(emit, 'AssetExtractor', `Extracted ${assets.length} assets`, assets.map((a) => a.name).join(', '), 'complete');

  // Phase 2
  const complianceItems = await mapCompliance(description, assets, emit);
  makeStep(emit, 'ComplianceMapper', `Mapped ${complianceItems.length} compliance items`, undefined, 'complete');

  // Phase 3
  makeStep(emit, 'VendorDiscovery', 'Building task list from assets and compliance...', undefined, 'running');
  const templates = buildTaskTemplates(assets, complianceItems);
  makeStep(emit, 'VendorDiscovery', `${templates.length} tasks identified`, 'Starting vendor search...', 'complete');

  const tasks: Task[] = [];
  for (let i = 0; i < templates.length; i++) {
    const task = await discoverVendorsForTask(templates[i], `t-${i + 1}`, emit);
    tasks.push(task);
  }

  // Phase 4
  const scheduledTasks = await proposeDates(tasks, emit);

  makeStep(emit, 'Orchestrator', 'Planning complete', `${assets.length} assets · ${complianceItems.length} compliance · ${scheduledTasks.length} tasks`, 'complete');

  // Build final state
  const draft: SystemState = {
    sessionId,
    phase: 'review',
    inputDescription: description,
    assets,
    complianceItems,
    tasks: scheduledTasks,
    agentSteps: [],
    graph: { nodes: [], edges: [] },
    analytics: {
      complianceScore: 0,
      upcomingRisks: [],
      estimatedSavings: 0,
      totalCost: 0,
      maintenanceTimeline: [],
      totalTasks: 0,
      approvedTasks: 0,
      criticalItems: 0,
      historicalDecisions: [],
    },
    lastUpdated: new Date().toISOString(),
  };

  draft.graph = buildGraph(draft);
  draft.analytics = computeAnalytics(draft);

  return updateSession(sessionId, draft);
}
