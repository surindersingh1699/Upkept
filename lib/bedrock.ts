/**
 * Amazon Bedrock client
 * Uses Claude claude-sonnet-4-6 via Bedrock for all agent reasoning.
 * Falls back to structured demo data when credentials are unavailable.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

let client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return client;
}

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function invokeClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  const cl = getClient();

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: Buffer.from(body),
  });

  const response = await cl.send(command);
  const decoded = JSON.parse(new TextDecoder().decode(response.body));
  return decoded.content[0].text as string;
}

/** Attempt real Bedrock call; on failure return fallback */
export async function safeInvoke(
  systemPrompt: string,
  userMessage: string,
  fallback: string,
  maxTokens = 4096
): Promise<{ text: string; usedBedrock: boolean }> {
  try {
    const text = await invokeClaude(systemPrompt, userMessage, maxTokens);
    return { text, usedBedrock: true };
  } catch (err) {
    console.warn('[Bedrock] Falling back to demo data:', (err as Error).message?.slice(0, 80));
    return { text: fallback, usedBedrock: false };
  }
}
