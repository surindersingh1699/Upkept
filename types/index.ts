export type AssetType = 'physical' | 'digital' | 'compliance_only';
export type AssetStatus = 'ok' | 'attention' | 'critical' | 'overdue';
export type TaskStatus = 'pending' | 'approved' | 'scheduled' | 'completed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PhaseType = 'idle' | 'intake' | 'planning' | 'review' | 'approved' | 'complete';
export type OptimizationMode = 'cost' | 'quality';
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'mixed_use';
export type DashboardView = 'chat' | 'graph' | 'timeline' | 'calendar';

export type VendorCategory =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'roofing'
  | 'fire_safety'
  | 'it_security'
  | 'it_ops'
  | 'compliance'
  | 'general';

export interface ServiceProfile {
  category: VendorCategory;
  subcategory?: string;
  keywords: string[];
  onsite: boolean;
  requiresLicense?: string[];
  urgency: 'emergency' | 'urgent' | 'standard';
}

export interface VendorServiceArea {
  city?: string;
  state?: string;
  radiusMiles?: number;
}

export interface VendorSearchContext {
  city: string;
  state: string;
  zip?: string;
  radiusMiles: number;
  propertyType?: 'residential' | 'commercial';
}

export interface VendorSearchRequest {
  service: ServiceProfile;
  location: VendorSearchContext;
  queries: string[];
  mode: OptimizationMode;
}

export interface VendorScoreBreakdown {
  total: number;
  relevance: number;
  trust: number;
  compliance: number;
  price: number;
  availability: number;
}

export interface ScoredVendor {
  vendor: Vendor;
  score: VendorScoreBreakdown;
}

export interface SetupData {
  siteName: string;
  address: string;
  propertyType: PropertyType;
  squareFootage?: number;
  yearBuilt?: number;
  numberOfUnits?: number;
  description: string;
  complianceNeeds: string[];
  jurisdiction?: string;
  uploadedFiles: { name: string; size: number; extractedText: string }[];
  completed: boolean;
  completedAt?: string;
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  description?: string;
  createdAt: string;
  setupData?: SetupData;
  setupCompleted?: boolean;
}

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
  // Extended fields for richer vendor matching
  bbbStatus?: 'unknown' | 'ok' | 'warning';
  categories?: VendorCategory[];
  services?: string[];
  serviceArea?: VendorServiceArea;
  availabilityScore?: number;
  matchScore?: number;
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
  userAdded?: boolean;
  notes?: string;
  confidenceScore?: number;
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
  siteId?: string;
  phase: PhaseType;
  inputDescription: string;
  optimizationMode?: OptimizationMode;
  assets: Asset[];
  complianceItems: ComplianceItem[];
  tasks: Task[];
  agentSteps: AgentStep[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  analytics: Analytics;
  lastUpdated: string;
}

export interface OrderHistoryEntry {
  id: string;
  siteId: string;
  timestamp: string;
  inputDescription: string;
  summary: string;
  state: SystemState;
  agentSteps: AgentStep[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  role_title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
