import {
  CopilotRuntime,
  BedrockAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const serviceAdapter = new BedrockAdapter({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-west-2',
});

const copilotRuntime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });
  return handleRequest(req);
}
