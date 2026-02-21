import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: 'gpt-4o',
});

const copilotRuntime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  try {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime: copilotRuntime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });
    const response = await handleRequest(req);
    return response;
  } catch (err) {
    console.error('[copilotkit] Error:', err);
    return NextResponse.json(
      { error: 'CopilotKit failed — check OPENAI_API_KEY', detail: String(err) },
      { status: 500 },
    );
  }
}
