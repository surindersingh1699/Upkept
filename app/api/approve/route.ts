/**
 * POST /api/approve
 * Body: { taskId: string, action: 'approve' | 'reject', scheduledDate?: string }
 *
 * Marks a task as approved/scheduled and rebuilds graph + analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionAsync, updateSession, buildGraph, computeAnalytics, DEMO_SESSION } from '@/lib/graph';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { taskId, action, scheduledDate } = body as {
    taskId: string;
    action: 'approve' | 'approve_all' | 'reject';
    scheduledDate?: string;
  };

  const state = await getSessionAsync(DEMO_SESSION);

  const updatedTasks = state.tasks.map((task) => {
    if (action === 'approve_all' || task.id === taskId) {
      if (action === 'reject') {
        return { ...task, status: 'pending' as const };
      }
      return {
        ...task,
        status: 'approved' as const,
        scheduledDate: scheduledDate || task.scheduledDate,
        approvedAt: new Date().toISOString(),
      };
    }
    return task;
  });

  const draft = { ...state, tasks: updatedTasks };
  draft.graph = buildGraph(draft);
  draft.analytics = computeAnalytics(draft);
  draft.phase = updatedTasks.some((t) => t.status === 'approved') ? 'approved' : state.phase;

  const updated = updateSession(DEMO_SESSION, draft);
  return NextResponse.json(updated);
}
