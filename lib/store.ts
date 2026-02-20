'use client';
/**
 * Zustand client-side store
 * Mirrors the server SystemState and drives all UI state.
 */

import { create } from 'zustand';
import type { SystemState, AgentStep, Task, PhaseType } from '@/types';

interface AppStore {
  state: SystemState | null;
  agentSteps: AgentStep[];
  isPlanning: boolean;
  selectedTaskId: string | null;
  activeTab: 'tasks' | 'graph' | 'analytics';

  // Actions
  setPhase: (phase: PhaseType) => void;
  addAgentStep: (step: AgentStep) => void;
  setIsPlanning: (v: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setActiveTab: (tab: 'tasks' | 'graph' | 'analytics') => void;
  setState: (s: SystemState) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  state: null,
  agentSteps: [],
  isPlanning: false,
  selectedTaskId: null,
  activeTab: 'tasks',

  setPhase: (phase) =>
    set((s) => ({
      state: s.state ? { ...s.state, phase } : null,
    })),

  addAgentStep: (step) =>
    set((s) => ({ agentSteps: [...s.agentSteps, step] })),

  setIsPlanning: (v) => set({ isPlanning: v }),

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  setActiveTab: (tab) => set({ activeTab: tab }),

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

  reset: () =>
    set({
      state: null,
      agentSteps: [],
      isPlanning: false,
      selectedTaskId: null,
      activeTab: 'tasks',
    }),
}));
