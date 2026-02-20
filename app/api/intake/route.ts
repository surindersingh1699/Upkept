/**
 * POST /api/intake
 * Accepts a property description and streams agent reasoning back as SSE.
 * Each event is a JSON-encoded AgentStep or a state snapshot.
 */

import { NextRequest } from 'next/server';
import { runOrchestrator } from '@/lib/agents/orchestrator';
import { resetSession, DEMO_SESSION } from '@/lib/graph';
import type { AgentStep } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const description: string = body.description || '';
  const optimizationMode = body.optimizationMode === 'cost' ? 'cost' as const : 'quality' as const;

  if (!description.trim()) {
    return new Response('Description required', { status: 400 });
  }

  // Reset session for fresh demo
  resetSession(DEMO_SESSION);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: 'status', message: 'Agent pipeline starting…' });

        await runOrchestrator(DEMO_SESSION, description, (step: AgentStep) => {
          send({ type: 'step', step });
        }, optimizationMode);

        send({ type: 'complete', message: 'Planning complete' });
      } catch (err) {
        send({ type: 'error', message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
