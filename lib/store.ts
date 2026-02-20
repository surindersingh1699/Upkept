'use client';

import { create } from 'zustand';
import type {
  SystemState,
  AgentStep,
  Task,
  PhaseType,
  Site,
  OptimizationMode,
  OrderHistoryEntry,
  GraphNode,
  GraphEdge,
} from '@/types';

type RightPanelView = 'none' | 'node' | 'task' | 'tasks' | 'analytics';

interface AppStore {
  // Core state
  state: SystemState | null;
  agentSteps: AgentStep[];
  isPlanning: boolean;

  // Multi-site
  sites: Site[];
  activeSiteId: string;

  // UI panels
  selectedTaskId: string | null;
  selectedNodeId: string | null;
  leftCollapsed: boolean;
  rightPanelView: RightPanelView;
  optimizationMode: OptimizationMode;

  // History
  orderHistory: OrderHistoryEntry[];

  // Actions — core
  setPhase: (phase: PhaseType) => void;
  addAgentStep: (step: AgentStep) => void;
  setIsPlanning: (v: boolean) => void;
  setState: (s: SystemState) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  reset: () => void;

  // Actions — multi-site
  addSite: (site: Site) => void;
  removeSite: (siteId: string) => void;
  renameSite: (siteId: string, name: string) => void;
  setActiveSite: (siteId: string) => void;

  // Actions — UI
  setSelectedTaskId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  toggleLeftSidebar: () => void;
  setRightPanelView: (view: RightPanelView) => void;
  setOptimizationMode: (mode: OptimizationMode) => void;

  // Actions — graph mutations
  addGraphNode: (node: GraphNode) => void;
  removeGraphNode: (nodeId: string) => void;
  updateGraphNode: (nodeId: string, patch: Partial<GraphNode>) => void;
  addGraphEdge: (edge: GraphEdge) => void;
  removeGraphEdge: (edgeId: string) => void;

  // Actions — history
  addToHistory: (entry: OrderHistoryEntry) => void;
  loadHistoryEntry: (id: string) => void;
}

// localStorage helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded — ignore */ }
}

const DEFAULT_SITE: Site = {
  id: 'site-default',
  name: 'My Property',
  createdAt: new Date().toISOString(),
};

export const useAppStore = create<AppStore>((set, get) => ({
  state: null,
  agentSteps: [],
  isPlanning: false,

  sites: loadFromStorage('upkept-sites', [DEFAULT_SITE]),
  activeSiteId: loadFromStorage('upkept-active-site', 'site-default'),

  selectedTaskId: null,
  selectedNodeId: null,
  leftCollapsed: false,
  rightPanelView: 'none',
  optimizationMode: 'quality',

  orderHistory: loadFromStorage('upkept-history', []),

  // ── Core ──

  setPhase: (phase) =>
    set((s) => ({
      state: s.state ? { ...s.state, phase } : null,
    })),

  addAgentStep: (step) =>
    set((s) => ({ agentSteps: [...s.agentSteps, step] })),

  setIsPlanning: (v) => set({ isPlanning: v }),

  setState: (newState) => set({ state: newState }),

  updateTask: (taskId, patch) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          tasks: s.state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t
          ),
        },
      };
    }),

  reset: () => {
    set({
      state: null,
      agentSteps: [],
      isPlanning: false,
      selectedTaskId: null,
      selectedNodeId: null,
      rightPanelView: 'none',
    });
  },

  // ── Multi-site ──

  addSite: (site) =>
    set((s) => {
      const sites = [...s.sites, site];
      saveToStorage('upkept-sites', sites);
      return { sites };
    }),

  removeSite: (siteId) =>
    set((s) => {
      const sites = s.sites.filter((si) => si.id !== siteId);
      if (sites.length === 0) sites.push(DEFAULT_SITE);
      saveToStorage('upkept-sites', sites);
      localStorage.removeItem(`upkept-site-${siteId}`);
      const newActive = s.activeSiteId === siteId ? sites[0].id : s.activeSiteId;
      saveToStorage('upkept-active-site', newActive);
      return { sites, activeSiteId: newActive };
    }),

  renameSite: (siteId, name) =>
    set((s) => {
      const sites = s.sites.map((si) =>
        si.id === siteId ? { ...si, name } : si
      );
      saveToStorage('upkept-sites', sites);
      return { sites };
    }),

  setActiveSite: (siteId) => {
    const { state, agentSteps, activeSiteId } = get();
    // Save current site state
    if (state) {
      saveToStorage(`upkept-site-${activeSiteId}`, { state, agentSteps });
    }
    // Load new site state
    const saved = loadFromStorage<{ state: SystemState; agentSteps: AgentStep[] } | null>(
      `upkept-site-${siteId}`,
      null
    );
    saveToStorage('upkept-active-site', siteId);
    set({
      activeSiteId: siteId,
      state: saved?.state ?? null,
      agentSteps: saved?.agentSteps ?? [],
      selectedTaskId: null,
      selectedNodeId: null,
      rightPanelView: 'none',
    });
  },

  // ── UI ──

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  setSelectedNodeId: (id) =>
    set({ selectedNodeId: id, rightPanelView: id ? 'node' : 'none' }),

  toggleLeftSidebar: () =>
    set((s) => ({ leftCollapsed: !s.leftCollapsed })),

  setRightPanelView: (view) => set({ rightPanelView: view }),

  setOptimizationMode: (mode) => set({ optimizationMode: mode }),

  // ── Graph mutations ──

  addGraphNode: (node) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          graph: {
            ...s.state.graph,
            nodes: [...s.state.graph.nodes, node],
          },
        },
      };
    }),

  removeGraphNode: (nodeId) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          graph: {
            nodes: s.state.graph.nodes.filter((n) => n.id !== nodeId),
            edges: s.state.graph.edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId
            ),
          },
        },
      };
    }),

  updateGraphNode: (nodeId, patch) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          graph: {
            ...s.state.graph,
            nodes: s.state.graph.nodes.map((n) =>
              n.id === nodeId ? { ...n, ...patch } : n
            ),
          },
        },
      };
    }),

  addGraphEdge: (edge) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          graph: {
            ...s.state.graph,
            edges: [...s.state.graph.edges, edge],
          },
        },
      };
    }),

  removeGraphEdge: (edgeId) =>
    set((s) => {
      if (!s.state) return {};
      return {
        state: {
          ...s.state,
          graph: {
            ...s.state.graph,
            edges: s.state.graph.edges.filter((e) => e.id !== edgeId),
          },
        },
      };
    }),

  // ── History ──

  addToHistory: (entry) =>
    set((s) => {
      const history = [...s.orderHistory, entry].slice(-50);
      saveToStorage('upkept-history', history);
      return { orderHistory: history };
    }),

  loadHistoryEntry: (id) => {
    const { orderHistory } = get();
    const entry = orderHistory.find((e) => e.id === id);
    if (entry) {
      set({
        state: entry.state,
        agentSteps: entry.agentSteps,
        selectedTaskId: null,
        selectedNodeId: null,
        rightPanelView: 'none',
      });
    }
  },
}));
