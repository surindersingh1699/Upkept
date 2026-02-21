# UpKept — Autonomous Property Management Autopilot

> AI-powered system that analyzes properties, discovers vendors, enforces compliance, and schedules maintenance — with full decision transparency and an interactive AI assistant.

## Features

- **Interactive Property Graph** — React Flow canvas where assets, compliance, tasks, and vendors are visualized as connected nodes. Drag, click, right-click to add, edit labels inline, connect nodes.
- **AI Agent Pipeline** — Multi-stage Bedrock (Claude 3.5 Sonnet) pipeline: property analysis → compliance mapping → vendor discovery → task planning → risk assessment. All streamed in real-time via SSE.
- **CopilotKit AI Assistant** — Natural language sidebar chat with **generative UI** — asks like "show me cost savings" render inline bar charts; "approve all tasks" executes actions.
- **Multi-Site Management** — Manage multiple properties with isolated state per site, persisted in localStorage.
- **File Upload** — Drag & drop documents (txt, csv, pdf) for AI analysis to build the property graph.
- **Optimization Modes** — Toggle between "Cost Savings" (lowest price vendors) and "Best Quality" (highest reliability).
- **Decision Transparency** — Click any graph node to see full AI reasoning: pricing analysis, vendor selection rationale, alternatives rejected, confidence scores, risk avoided.
- **Order History** — Past sessions saved and restorable from the agent stream panel.

## Quick Start

```bash
# Prerequisites: Node.js >= 20, Docker

git clone https://github.com/surindersingh1699/Upkept.git
cd Upkept

# Start Neo4j (local, no cloud account needed)
docker compose up -d
# Neo4j Browser: http://localhost:7474

cd upkept
npm install

# Configure environment
cp .env.example .env.local
# Add AWS Bedrock credentials to .env.local (see SETUP.md)
# Neo4j is pre-configured for local Docker (bolt://localhost:7687)
# Without Neo4j running, the system falls back to in-memory graph

npm run dev
# Open http://localhost:3000
```

## Documentation

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, data model, agent pipeline, CopilotKit integration |
| [SETUP.md](SETUP.md) | Detailed setup, configuration, and deployment guide |
| [API.md](API.md) | API endpoint reference with request/response schemas |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (React 19)                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Left     │  │ Graph Canvas │  │ Right Panel            │ │
│  │ Sidebar  │  │ (React Flow) │  │ (Node detail / Tasks / │ │
│  │ Upload + │  │ Interactive  │  │  Analytics)            │ │
│  │ Agent    │  │ hero element │  │ AI decision reasoning  │ │
│  │ Stream   │  │              │  │                        │ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
│  CopilotKit Sidebar ─── AI Chat + Generative UI Charts      │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / SSE
┌──────────────────────────────┴───────────────────────────────┐
│  Next.js 16 API Routes                                       │
│  /api/intake (SSE) · /api/approve · /api/copilotkit          │
│  /api/upload · /api/state · /api/analytics                   │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────┐
│  Amazon Bedrock (Claude 3.5 Sonnet)                          │
│  Property Analyzer → Vendor Discovery → Task Planner → Risk  │
│  Fallback: deterministic demo data when no AWS credentials   │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, React Flow 11 |
| State | Zustand 5 + localStorage persistence |
| Graph DB | Neo4j 5 Community (Docker, in-memory fallback for demo) |
| AI Assistant | CopilotKit 1.51 (generative UI) |
| LLM | Amazon Bedrock (Claude 3.5 Sonnet) |
| Streaming | Server-Sent Events |
| Testing | TestSprite (MCP) |
| Fonts | Chakra Petch + JetBrains Mono |

## CopilotKit AI Assistant

The sidebar chat uses `useCopilotReadable` to expose all app state and `useCopilotAction` with `render` for generative UI:

**Visualization Actions** — ask and get inline charts:
- "Show me cost savings" → cost analysis bar chart
- "What's my task status?" → task breakdown chart
- "When are compliance deadlines?" → compliance timeline
- "How are my assets?" → asset health donut
- "Compare vendors" → vendor comparison table
- "What risks do I have?" → risk summary cards

**Management Actions** — natural language control:
- "Approve all pending tasks"
- "Add a new HVAC asset"
- "Switch to cost savings mode"
- "Create a new site called Downtown Office"

## Agent Pipeline

| Agent | Responsibility |
|-------|---------------|
| Property Analyzer | Parses description into structured Asset + Compliance nodes |
| Vendor Discovery | Finds and ranks vendors by cost or quality mode |
| Task Planner | Generates maintenance plan with pricing and scheduling |
| Risk Assessor | Evaluates risks, computes compliance scores |
| Orchestrator | Chains all agents, streams reasoning to UI via SSE |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/intake` | POST | Runs agent pipeline, streams SSE events |
| `/api/approve` | POST | Approves a task, updates system state |
| `/api/copilotkit` | POST | CopilotKit runtime (Bedrock adapter) |
| `/api/upload` | POST | Extracts text from uploaded files |
| `/api/state` | GET | Returns current system state |
| `/api/analytics` | GET | Returns analytics summary |

## License

MIT
