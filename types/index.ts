export type AssetType = 'physical' | 'digital' | 'compliance_only';
export type AssetStatus = 'ok' | 'attention' | 'critical' | 'overdue';
export type TaskStatus = 'pending' | 'approved' | 'scheduled' | 'completed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PhaseType = 'idle' | 'intake' | 'planning' | 'review' | 'approved' | 'complete';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  location?: string;
  installedYear?: number;
  lastServiced?: string;
  description: string;
  tags: string[];
  riskScore: number; // 0-100
}

export interface ComplianceItem {
  id: string;
  name: string;
  dueDate: string;
  daysUntilDue: number;
  status: 'compliant' | 'due_soon' | 'overdue' | 'unknown';
  linkedAssetIds: string[];
  riskLevel: RiskLevel;
  authority?: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  priceRange: 'low' | 'medium' | 'high';
  reliabilityScore: number;
  sources: string[];
  estimatedPrice: number;
  availability: string;
  location: string;
  yearsInBusiness: number;
  licensed: boolean;
  insured: boolean;
}

export interface TaskReasoning {
  summary: string;
  dataUsed: string[];
  vendorSelectionReason: string;
  priceJustification: string;
  riskAvoided: string;
  confidenceScore: number;
  alternativesRejected: { vendorName: string; reason: string }[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assetId?: string;
  complianceId?: string;
  status: TaskStatus;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedCost: number;
  marketPrice: number;
  selectedVendor?: Vendor;
  alternativeVendors: Vendor[];
  reasoning: TaskReasoning;
  scheduledDate?: string;
  requiresApproval: boolean;
  approvedAt?: string;
}

export interface AgentStep {
  id: string;
  agentName: 'AssetExtractor' | 'ComplianceMapper' | 'VendorDiscovery' | 'Scheduler' | 'Orchestrator';
  action: string;
  detail?: string;
  timestamp: string;
  durationMs?: number;
  status: 'running' | 'complete' | 'error';
}

export interface GraphNode {
  id: string;
  type: 'asset' | 'compliance' | 'vendor' | 'task';
  label: string;
  status: string;
  riskLevel?: RiskLevel;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  edgeType: 'requires' | 'handles' | 'assigned_to' | 'links_to';
}

export interface Analytics {
  complianceScore: number;
  upcomingRisks: { label: string; daysUntil: number; severity: RiskLevel }[];
  estimatedSavings: number;
  totalCost: number;
  maintenanceTimeline: { month: string; tasks: number; cost: number }[];
  totalTasks: number;
  approvedTasks: number;
  criticalItems: number;
  historicalDecisions: { date: string; action: string; outcome: string; savings?: number }[];
}

export interface SystemState {
  sessionId: string;
  phase: PhaseType;
  inputDescription: string;
  assets: Asset[];
  complianceItems: ComplianceItem[];
  tasks: Task[];
  agentSteps: AgentStep[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  analytics: Analytics;
  lastUpdated: string;
}
