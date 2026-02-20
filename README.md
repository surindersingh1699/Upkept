# UpKept — Autonomous Asset & Compliance Autopilot

> A fully autonomous AI system that maintains assets, enforces compliance, selects vendors, and proves every decision — with humans approving only when required.

## Hackathon Demo

### Closing Line

"This system doesn't track work — it decides, acts, and proves compliance automatically."

### Demo Flow (90 seconds)

1. **Intake** — Paste any property/system description. Agent extracts assets autonomously.
2. **Planning** — Agent pipeline finds vendors, simulates pricing, builds a schedule. No user input.
3. **Explanation** — Click any task to see data used, vendor rationale, risk avoided, confidence score.
4. **Approval** — One-click approve vendor scheduling (required). Compliance actions optional.
5. **Graph** — Visual asset → compliance → task → vendor relationship map.
6. **Analytics** — Compliance score, savings estimate, upcoming risks, decision log.

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│  Next.js 14 App Router + TypeScript                 │
├─────────────────────────────────────────────────────┤
│  Agent Pipeline (Amazon Bedrock / Claude Sonnet)    │
│  ┌────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │AssetExtract│→ │ComplianceMap │→ │VendorDisc. │  │
│  └────────────┘  └──────────────┘  └────────────┘  │
│                                    ┌────────────┐   │
│                                    │ Scheduler  │   │
│                                    └────────────┘   │
├─────────────────────────────────────────────────────┤
│  Graph State (in-memory, Neo4j-compatible model)    │
│  Nodes: Asset | Compliance | Vendor | Task          │
│  Edges: requires | handles | assigned_to | links_to │
├─────────────────────────────────────────────────────┤
│  CopilotKit — Human-in-the-loop approval UI         │
│  Datadog — LLM observability + agent traces         │
│  React Flow — Visual asset graph                    │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS v4 + custom CSS vars |
| AI / Agents | Amazon Bedrock (Claude claude-sonnet-4-6) |
| State Graph | In-memory graph (Neo4j model) |
| Visualization | React Flow |
| Human Approval | CopilotKit |
| State Management | Zustand |
| Observability | Datadog LLM tracing |

## Getting Started

```bash
cp .env.example .env.local
# Fill in AWS credentials for real Bedrock calls
# Without credentials, system uses deterministic demo data

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Design Decisions

- **Graph model**: Every entity (asset, compliance, vendor, task) is a node. Relationships are typed edges.
- **Autonomy by default**: The system plans, finds vendors, and schedules without user input.
- **Explainability first**: Every decision shows data sources, confidence score, why alternatives were rejected.
- **Graceful fallback**: Works fully without AWS credentials using deterministic demo data.

## Agent Pipeline

| Agent | Responsibility |
| --- | --- |
| `AssetExtractor` | Parses description into structured Asset nodes |
| `ComplianceMapper` | Links compliance obligations to assets, scores risk |
| `VendorDiscovery` | Searches public data (Yelp/Google/BBB), ranks vendors |
| `Scheduler` | Proposes optimal dates considering urgency and availability |
| `Orchestrator` | Chains all agents, streams reasoning to UI |

## API Routes

- `POST /api/intake` — Accepts description, streams SSE agent events
- `GET /api/state` — Returns current system state
- `PATCH /api/state` — Update phase or partial state
- `POST /api/approve` — Approve single task or all pending tasks
- `GET /api/analytics` — Returns computed analytics
- `POST /api/copilotkit` — CopilotKit AI assistant endpoint
