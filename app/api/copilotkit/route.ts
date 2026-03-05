import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function POST(req: NextRequest) {
  try {
    const serviceAdapter = new OpenAIAdapter({
      openai: getOpenAI(),
      model: 'gpt-4o',
    });
    const copilotRuntime = new CopilotRuntime();
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
