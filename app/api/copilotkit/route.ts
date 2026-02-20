/**
 * CopilotKit runtime endpoint
 * Enables the AI assistant panel for explaining decisions and approvals.
 * Uses BedrockAdapter since Amazon Bedrock is the primary intelligence layer.
 */

import {
  CopilotRuntime,
  BedrockAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

const serviceAdapter = new BedrockAdapter({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.AWS_REGION || 'us-east-1',
});

const runtime = new CopilotRuntime({
  remoteEndpoints: [],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });
  return handleRequest(req);
};
