'use client';

import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useAppStore } from '@/lib/store';
import { CostBarChart } from '@/components/copilot-charts/CostBarChart';
import { TaskBreakdownChart } from '@/components/copilot-charts/TaskBreakdownChart';
import { ComplianceTimeline } from '@/components/copilot-charts/ComplianceTimeline';
import { AssetHealthDonut } from '@/components/copilot-charts/AssetHealthDonut';
import { VendorComparisonTable } from '@/components/copilot-charts/VendorComparisonTable';
import { RiskSummaryChart } from '@/components/copilot-charts/RiskSummaryChart';
import type { SystemState, DashboardView } from '@/types';

/**
 * Headless component that registers all CopilotKit readable state and actions.
 * Renders no visible UI — add to page.tsx alongside CopilotChat.
 */
export default function CopilotProvider() {
  const store = useAppStore();
  const { state, sites, activeSiteId, optimizationMode, dashboardView } = store;

  // ── Readable State ──
  // Expose all app data so the copilot can answer questions about it

  useCopilotReadable({
    description: 'Property assets with name, type, status, risk score, location, installed year, last serviced date, and description',
    value: state?.assets ?? [],
  });

  useCopilotReadable({
    description: 'Maintenance tasks with title, description, priority, status, estimated cost, market price, due date, selected vendor, and AI reasoning (confidence score, vendor selection reason, alternatives rejected, risk avoided, data sources)',
    value: state?.tasks ?? [],
  });

  useCopilotReadable({
    description: 'Compliance obligations with name, authority, due date, days until due, risk level, and description',
    value: state?.complianceItems ?? [],
  });

  useCopilotReadable({
    description: 'Analytics summary with compliance score, total cost, estimated savings, critical items count, total tasks, approved tasks, upcoming risks, and historical decisions',
    value: state?.analytics ?? null,
  });

  useCopilotReadable({
    description: 'Managed property sites. Each site has an id, name, optional address, and creation date',
    value: sites,
  });

  useCopilotReadable({
    description: 'Current optimization mode: "cost" for lowest price or "quality" for highest reliability vendor selection',
    value: optimizationMode,
  });

  useCopilotReadable({
    description: 'Current active site ID',
    value: activeSiteId,
  });

  useCopilotReadable({
    description: 'Current dashboard view: chat, graph, timeline, or calendar',
    value: dashboardView,
  });

  // ── Generative UI Actions — Charts & Visualizations ──

  useCopilotAction({
    name: 'showCostAnalysis',
    description: 'Generate a visual cost analysis chart showing agent estimates vs market prices and total savings. Use when user asks about costs, savings, budget, or spending.',
    parameters: [],
    render: () => {
      const s = useAppStore.getState().state;
      if (!s) return <div style={{ color: 'var(--text-dim)', padding: 12, fontSize: 12 }}>No data available yet. Run the agent first.</div>;
      const tasks = s.tasks;
      const totalEst = tasks.reduce((sum, t) => sum + t.estimatedCost, 0);
      const totalMarket = tasks.reduce((sum, t) => sum + t.marketPrice, 0);
      return <CostBarChart estimated={totalEst} market={totalMarket} savings={totalMarket - totalEst} />;
    },
    handler: () => 'Cost analysis chart rendered',
  });

  useCopilotAction({
    name: 'showTaskBreakdown',
    description: 'Show a visual breakdown of all maintenance tasks by priority and status. Use when user asks about task status, progress, or workload.',
    parameters: [],
    render: () => {
      const tasks = useAppStore.getState().state?.tasks ?? [];
      return <TaskBreakdownChart tasks={tasks} />;
    },
    handler: () => 'Task breakdown chart rendered',
  });

  useCopilotAction({
    name: 'showComplianceTimeline',
    description: 'Show compliance obligations on a timeline sorted by urgency. Use when user asks about deadlines, compliance, due dates, or regulations.',
    parameters: [],
    render: () => {
      const items = useAppStore.getState().state?.complianceItems ?? [];
      return <ComplianceTimeline items={items} />;
    },
    handler: () => 'Compliance timeline rendered',
  });

  useCopilotAction({
    name: 'showAssetHealth',
    description: 'Show a donut chart of asset health distribution — OK, attention, critical, overdue. Use when user asks about asset condition, health, or maintenance status.',
    parameters: [],
    render: () => {
      const assets = useAppStore.getState().state?.assets ?? [];
      return <AssetHealthDonut assets={assets} />;
    },
    handler: () => 'Asset health chart rendered',
  });

  useCopilotAction({
    name: 'showVendorComparison',
    description: 'Compare all assigned vendors by rating, reliability score, number of assigned tasks, and total cost. Use when user asks about vendors, contractors, or service providers.',
    parameters: [],
    render: () => {
      const tasks = useAppStore.getState().state?.tasks ?? [];
      return <VendorComparisonTable tasks={tasks} />;
    },
    handler: () => 'Vendor comparison rendered',
  });

  useCopilotAction({
    name: 'showRiskSummary',
    description: 'Show upcoming risks sorted by urgency with severity levels and days until impact. Use when user asks about risks, threats, or what needs attention.',
    parameters: [],
    render: () => {
      const risks = useAppStore.getState().state?.analytics?.upcomingRisks ?? [];
      return <RiskSummaryChart risks={risks} />;
    },
    handler: () => 'Risk summary rendered',
  });

  // ── Management Actions ──

  useCopilotAction({
    name: 'approveTask',
    description: 'Approve a pending maintenance task and schedule the vendor. Provide the task title or ID.',
    parameters: [
      { name: 'taskIdentifier', type: 'string', description: 'Task title or ID to approve' },
    ],
    handler: async ({ taskIdentifier }: { taskIdentifier: string }) => {
      const s = useAppStore.getState().state;
      if (!s) return 'No data loaded yet';
      const task = s.tasks.find(
        (t) => t.id === taskIdentifier || t.title.toLowerCase().includes(taskIdentifier.toLowerCase())
      );
      if (!task) return `Task "${taskIdentifier}" not found`;
      if (task.status !== 'pending') return `Task "${task.title}" is already ${task.status}`;
      try {
        const res = await fetch('/api/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, action: 'approve' }),
        });
        const updated: SystemState = await res.json();
        useAppStore.getState().setState(updated);
        return `Approved task: ${task.title}. Vendor ${task.selectedVendor?.name} has been notified.`;
      } catch {
        return `Failed to approve task: ${task.title}`;
      }
    },
  });

  useCopilotAction({
    name: 'approveAllTasks',
    description: 'Approve all pending tasks at once.',
    parameters: [],
    handler: async () => {
      const s = useAppStore.getState().state;
      if (!s) return 'No data loaded yet';
      const pending = s.tasks.filter((t) => t.status === 'pending' && t.requiresApproval);
      if (pending.length === 0) return 'No pending tasks to approve';
      let approved = 0;
      for (const task of pending) {
        try {
          const res = await fetch('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: task.id, action: 'approve' }),
          });
          const updated: SystemState = await res.json();
          useAppStore.getState().setState(updated);
          approved++;
        } catch { /* continue */ }
      }
      return `Approved ${approved} of ${pending.length} tasks.`;
    },
  });

  useCopilotAction({
    name: 'addGraphNode',
    description: 'Add a new node to the property graph. Specify the label/name and type (asset, compliance, task, or vendor).',
    parameters: [
      { name: 'label', type: 'string', description: 'Name of the node' },
      { name: 'nodeType', type: 'string', description: 'Type: asset, compliance, task, or vendor' },
    ],
    handler: ({ label, nodeType }: { label: string; nodeType: string }) => {
      const validTypes = ['asset', 'compliance', 'task', 'vendor'];
      const type = validTypes.includes(nodeType) ? nodeType : 'asset';
      useAppStore.getState().addGraphNode({
        id: `user-${Date.now()}`,
        label,
        type: type as 'asset' | 'compliance' | 'task' | 'vendor',
        status: 'ok',
        userAdded: true,
      });
      return `Added ${type} node: "${label}" to the graph.`;
    },
  });

  useCopilotAction({
    name: 'removeNode',
    description: 'Remove a node from the graph by its label/name.',
    parameters: [
      { name: 'nodeLabel', type: 'string', description: 'Label of the node to remove' },
    ],
    handler: ({ nodeLabel }: { nodeLabel: string }) => {
      const s = useAppStore.getState().state;
      if (!s) return 'No data loaded';
      const node = s.graph.nodes.find((n) => n.label.toLowerCase().includes(nodeLabel.toLowerCase()));
      if (!node) return `Node "${nodeLabel}" not found`;
      useAppStore.getState().removeGraphNode(node.id);
      return `Removed node: "${node.label}"`;
    },
  });

  useCopilotAction({
    name: 'switchSite',
    description: 'Switch to a different managed property site by name.',
    parameters: [
      { name: 'siteName', type: 'string', description: 'Name of the site to switch to' },
    ],
    handler: ({ siteName }: { siteName: string }) => {
      const site = useAppStore.getState().sites.find(
        (s) => s.name.toLowerCase().includes(siteName.toLowerCase())
      );
      if (!site) return `Site "${siteName}" not found. Available: ${useAppStore.getState().sites.map((s) => s.name).join(', ')}`;
      useAppStore.getState().setActiveSite(site.id);
      return `Switched to site: "${site.name}"`;
    },
  });

  useCopilotAction({
    name: 'createSite',
    description: 'Create a new property site and switch to it.',
    parameters: [
      { name: 'name', type: 'string', description: 'Name of the new site' },
      { name: 'address', type: 'string', description: 'Address of the property (optional)' },
    ],
    handler: ({ name, address }: { name: string; address: string }) => {
      const newSite = { id: `site-${Date.now()}`, name, address: address || undefined, createdAt: new Date().toISOString() };
      useAppStore.getState().addSite(newSite);
      useAppStore.getState().setActiveSite(newSite.id);
      return `Created site "${name}" and switched to it.`;
    },
  });

  useCopilotAction({
    name: 'setOptimizationMode',
    description: 'Set the optimization preference. "cost" prioritizes lowest price, "quality" prioritizes highest reliability.',
    parameters: [
      { name: 'mode', type: 'string', description: 'Either "cost" or "quality"' },
    ],
    handler: ({ mode }: { mode: string }) => {
      const m = mode.toLowerCase().includes('cost') ? 'cost' as const : 'quality' as const;
      useAppStore.getState().setOptimizationMode(m);
      return `Optimization mode set to ${m === 'cost' ? 'cost savings' : 'best quality'}.`;
    },
  });

  useCopilotAction({
    name: 'showView',
    description: 'Switch the dashboard to a different view: chat, graph, timeline, or calendar. Use when user says "show me the graph", "open timeline", etc.',
    parameters: [
      { name: 'view', type: 'string', description: 'View to switch to: chat, graph, timeline, or calendar' },
    ],
    handler: ({ view }: { view: string }) => {
      const validViews: DashboardView[] = ['chat', 'graph', 'timeline', 'calendar'];
      const v = validViews.find((vv) => vv === view.toLowerCase()) ?? 'chat';
      useAppStore.getState().setDashboardView(v);
      return `Switched to ${v} view.`;
    },
  });

  // No visible UI — just registers hooks
  return null;
}
