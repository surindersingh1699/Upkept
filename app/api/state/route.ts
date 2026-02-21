/**
 * GET /api/state  — returns full system state for the demo session
 * PATCH /api/state — update phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionAsync, updateSession, DEMO_SESSION } from '@/lib/graph';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await getSessionAsync(DEMO_SESSION);
  return NextResponse.json(state);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const updated = updateSession(DEMO_SESSION, body);
  return NextResponse.json(updated);
}
