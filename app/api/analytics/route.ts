/**
 * GET /api/analytics — returns computed analytics for the current session
 */

import { NextResponse } from 'next/server';
import { getSessionAsync, computeAnalytics, DEMO_SESSION } from '@/lib/graph';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await getSessionAsync(DEMO_SESSION);
  const analytics = computeAnalytics(state);
  return NextResponse.json(analytics);
}
