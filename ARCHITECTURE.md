# UpKept Architecture

## Overview

UpKept is an **autonomous property management autopilot** that uses AI to analyze property maintenance needs, discover vendors, evaluate compliance risks, and generate optimized maintenance plans. Users interact with the system through an interactive property graph and an AI assistant powered by CopilotKit.

```
┌──────────────────────────────────────────────────────┐
│                     Browser (React)                   │
│                                                       │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Left    │  │ Graph Canvas │  │  Right Panel    │ │
│  │ Sidebar  │  │ (React Flow) │  │ (Node/Task/     │ │
│  │          │  │              │  │  Analytics)     │ │
│  │ Intake + │  │  Interactive │  │                 │ │
│  │ Agent    │  │  nodes, edges│  │  AI decision    │ │
│  │ Stream   │  │  + overlays  │  │  details        │ │
│  └─────────┘  └──────────────┘  └─────────────────┘ │
│                                                       │
│  CopilotKit Sidebar ──── AI Chat + Generative UI     │
│  (useCopilotReadable / useCopilotAction)              │
└──────────────────────────────┬────────────────────────┘
                               │ HTTP / SSE
                               ▼
┌──────────────────────────────────────────────────────┐
│               Next.js API Routes (Node.js)           │
│                                                       │
│  /api/intake      SSE stream — agent orchestration    │
│  /api/approve     POST — task approval                │
│  /api/copilotkit  POST — CopilotKit runtime (Bedrock)│
│  /api/upload      POST — file text extraction         │
│  /api/state       GET  — current system state         │
│  /api/analytics   GET  — analytics summary            │
└──────────────────────────────┬────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────┐
│            Amazon Bedrock (Claude Sonnet 3.5)         │
│                                                       │
│  Multi-agent pipeline:                                │
│  1. Property Analyzer — identifies assets + compliance│
│  2. Vendor Discovery  — finds & ranks vendors         │
│  3. Task Planner      — generates maintenance plan    │
│  4. Risk Assessor     — evaluates risks + scoring     │
│                                                       │
│  Fallback: deterministic demo data when no AWS creds  │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, React Flow 11 (graph), inline CSS |
| State Management | Zustand 5 with localStorage persistence |
| AI Assistant | CopilotKit 1.51 (react-core, react-ui, runtime) |
| LLM Backend | Amazon Bedrock (Claude 3.5 Sonnet) via BedrockAdapter |
| Streaming | Server-Sent Events (SSE) for agent pipeline |
| Testing | TestSprite (MCP integration) |
| Fonts | Chakra Petch (display), JetBrains Mono (code) |

---

## Directory Structure

```
upkept/
├── app/
│   ├── layout.tsx              # Root layout with CopilotKit provider
│   ├── page.tsx                # Main page: 3-column layout + CopilotSidebar
│   ├── globals.css             # Global styles, CSS variables, theme
│   └── api/
│       ├── intake/route.ts     # SSE agent orchestration endpoint
│       ├── approve/route.ts    # Task approval endpoint
│       ├── copilotkit/route.ts # CopilotKit runtime (Bedrock)
│       ├── upload/route.ts     # File upload text extraction
│       ├── state/route.ts      # Get current system state
│       └── analytics/route.ts  # Get analytics summary
│
├── components/
│   ├── Header.tsx              # Top bar: logo + site selector + phase
│   ├── StatusBar.tsx           # Bottom bar: metrics summary
│   ├── SiteSelector.tsx        # Multi-site dropdown in header
│   ├── LeftSidebar.tsx         # Collapsible sidebar container
│   ├── IntakePanel.tsx         # File upload + text input + run agent
│   ├── AgentStream.tsx         # Real-time agent reasoning stream
│   ├── GraphCanvas.tsx         # Interactive React Flow graph (hero)
│   ├── OptimizationToggle.tsx  # Cost vs quality selector
│   ├── RightPanel.tsx          # Sliding panel container
│   ├── NodeEditPanel.tsx       # Node details + AI decision reasoning
│   ├── TaskList.tsx            # Compact task cards in right panel
│   ├── TaskDetail.tsx          # Full task detail with approval
│   ├── Analytics.tsx           # Compact analytics for right panel
│   ├── ApprovalBanner.tsx      # Floating approval bar on graph
│   ├── CopilotKitWrapper.tsx   # CopilotKit provider wrapper
│   ├── CopilotProvider.tsx     # Headless: registers all CopilotKit hooks
│   ├── graph/
│   │   ├── GraphContextMenu.tsx # Right-click menu to add nodes
│   │   └── GraphToolbar.tsx     # Floating graph controls
│   └── copilot-charts/
│       ├── CostBarChart.tsx     # Cost analysis visualization
│       ├── TaskBreakdownChart.tsx # Task priority/status breakdown
│       ├── ComplianceTimeline.tsx # Compliance deadline timeline
│       ├── AssetHealthDonut.tsx   # Asset health SVG donut
│       ├── VendorComparisonTable.tsx # Vendor comparison
│       └── RiskSummaryChart.tsx     # Risk summary cards
│
├── lib/
│   ├── store.ts                # Zustand store: state, sites, graph, history
│   ├── bedrock.ts              # Amazon Bedrock client wrapper
│   ├── graph.ts                # In-memory graph state engine
│   ├── vendors.ts              # Vendor discovery + ranking
│   └── agents/
│       └── orchestrator.ts     # Multi-agent pipeline coordinator
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── .env.local                  # AWS keys, TestSprite key (not committed)
```

---

## Data Model

### Core Types (types/index.ts)

```
SystemState
├── phase: 'intake' | 'analyzing' | 'planning' | 'complete'
├── assets: Asset[]
├── complianceItems: ComplianceItem[]
├── tasks: Task[]
├── graph: { nodes: GraphNode[], edges: GraphEdge[] }
├── analytics: AnalyticsSummary
└── agentSteps: AgentStep[]

Asset { id, name, type, status, riskScore, location, description, ... }
ComplianceItem { id, name, authority, dueDate, daysUntilDue, riskLevel, ... }
Task { id, title, priority, status, estimatedCost, marketPrice, selectedVendor, reasoning, ... }
GraphNode { id, label, type, status, userAdded?, notes?, confidenceScore? }
GraphEdge { id, source, target, type, label? }
Site { id, name, address?, createdAt }
```

### Graph Node Types
- **asset** — physical property components (HVAC, roof, plumbing)
- **compliance** — regulatory obligations (fire safety, elevator certs)
- **task** — maintenance work items generated by AI
- **vendor** — service providers selected by the agent

### Edge Types
- `has_compliance` — asset → compliance
- `needs_task` — asset/compliance → task
- `assigned_to` — task → vendor
- `links_to` — user-created connections

---

## Agent Pipeline

The orchestrator (`lib/agents/orchestrator.ts`) runs a 4-stage pipeline via SSE:

```
1. PROPERTY ANALYSIS
   Input: user description + uploaded documents
   Output: assets[], complianceItems[]
   LLM: Bedrock Claude 3.5 Sonnet

2. VENDOR DISCOVERY
   Input: tasks derived from assets/compliance
   Output: vendor matches ranked by mode (cost or quality)
   LLM: Bedrock + vendor database

3. TASK PLANNING
   Input: assets, compliance, vendors
   Output: tasks[] with pricing, scheduling, reasoning
   LLM: Bedrock generates structured decisions

4. RISK ASSESSMENT
   Input: full system state
   Output: analytics summary, risk scores, compliance scoring
   Computation: weighted penalty algorithm
```

Each stage streams `AgentStep` events to the frontend via SSE.

**Fallback**: When Bedrock credentials are missing/expired, the system returns deterministic demo data.

---

## CopilotKit Integration

### Provider Chain
```
layout.tsx
  └── CopilotKitWrapper (runtimeUrl="/api/copilotkit")
        └── page.tsx
              ├── CopilotProvider (hooks — no UI)
              └── CopilotSidebar (chat UI)
```

### Readable State (useCopilotReadable)
The AI has access to:
- All assets with status, risk scores, locations
- All tasks with costs, vendors, AI reasoning
- Compliance items with deadlines and risk levels
- Analytics summary (scores, savings, risks)
- Managed sites list
- Current optimization mode

### Generative UI Actions (useCopilotAction with render)
When users ask questions, the AI generates inline visualizations:

| Action | Trigger Phrases | Renders |
|--------|----------------|---------|
| `showCostAnalysis` | "show costs", "how much saved" | Bar chart: estimated vs market vs savings |
| `showTaskBreakdown` | "task status", "show tasks" | Priority/status breakdown chart |
| `showComplianceTimeline` | "compliance deadlines", "when due" | Timeline sorted by urgency |
| `showAssetHealth` | "asset condition", "health overview" | SVG donut chart |
| `showVendorComparison` | "compare vendors", "who's best" | Comparison table |
| `showRiskSummary` | "upcoming risks", "what's urgent" | Risk cards with countdown |

### Management Actions
| Action | What It Does |
|--------|-------------|
| `approveTask` | Approves a pending task by title/ID |
| `approveAllTasks` | Batch approves all pending tasks |
| `addGraphNode` | Adds a node to the graph |
| `removeNode` | Removes a node by label |
| `switchSite` | Switches to a different property site |
| `createSite` | Creates a new site |
| `setOptimizationMode` | Toggles cost/quality preference |

---

## State Management (Zustand)

The store (`lib/store.ts`) manages:

- **Core**: `state` (SystemState), `agentSteps`, `isPlanning`
- **Multi-site**: `sites[]`, `activeSiteId` with per-site localStorage isolation
- **UI panels**: `leftCollapsed`, `rightPanelView`, `selectedNodeId`, `selectedTaskId`
- **Optimization**: `optimizationMode` ('cost' | 'quality')
- **History**: `orderHistory[]` persisted to localStorage (max 50 entries)
- **Graph mutations**: `addGraphNode`, `removeGraphNode`, `updateGraphNode`, `addGraphEdge`, `removeGraphEdge`

Site switching saves current state to `localStorage[upkept-site-{id}]` and loads the target site's state.

---

## Styling

- **Theme**: Dark industrial (`--bg-base: #07090C`)
- **Fonts**: Chakra Petch (display/headings), JetBrains Mono (data/code)
- **Accent colors**: Amber (#F0A000), Green (#00CC6A), Red (#FF3B3B), Blue (#4A90E2)
- **All styling is inline CSS** — no Tailwind utility classes used in components
- **CSS variables** defined in `globals.css` for consistency
- **CopilotKit theme** overridden via CSS custom properties to match dark theme

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/intake` | POST | Runs agent pipeline, streams SSE events |
| `/api/approve` | POST | Approves a task, updates system state |
| `/api/copilotkit` | POST | CopilotKit runtime (Bedrock adapter) |
| `/api/upload` | POST | Extracts text from uploaded files |
| `/api/state` | GET | Returns current system state |
| `/api/analytics` | GET | Returns analytics summary |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AWS_DEFAULT_REGION` | Bedrock region (us-west-2) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_SESSION_TOKEN` | AWS session token (temporary creds) |
| `TESTSPRITE_API_KEY` | TestSprite automated testing |
| `DD_API_KEY` | Datadog observability |
| `NEXT_PUBLIC_COPILOT_CLOUD_API_KEY` | Optional: CopilotKit Cloud key |
