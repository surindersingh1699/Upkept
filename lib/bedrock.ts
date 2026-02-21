/**
 * Amazon Bedrock client
 * Uses Claude Sonnet via Bedrock for all agent reasoning.
 * Supports bearer token auth (AWS_BEARER_TOKEN_BEDROCK) or standard IAM credentials.
 * Falls back to structured demo data when neither is available.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import tracer from 'dd-trace';

const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

function getRegion(): string {
  return process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-west-2';
}

let client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({
      region: getRegion(),
    });
  }
  return client;
}

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Invoke via bearer token using direct HTTP call */
async function invokeClaudeWithBearerToken(
  systemPrompt: string,
  userMessage: string,
  bearerToken: string,
  maxTokens: number
): Promise<string> {
  const region = getRegion();
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${MODEL_ID}/invoke`;

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Bedrock bearer token API error: ${response.status} ${response.statusText} ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}

/** Invoke via standard IAM credentials (AWS SDK) */
async function invokeClaudeWithSDK(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
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

export async function invokeClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  return tracer.llmobs.trace(
    { kind: 'llm', name: 'bedrock.invoke', modelName: MODEL_ID, modelProvider: 'aws_bedrock' },
    async () => {
      tracer.llmobs.annotate({
        inputData: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        metadata: { maxTokens },
      });

      const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;
      const text = bearerToken
        ? await invokeClaudeWithBearerToken(systemPrompt, userMessage, bearerToken, maxTokens)
        : await invokeClaudeWithSDK(systemPrompt, userMessage, maxTokens);

      tracer.llmobs.annotate({
        outputData: [{ role: 'assistant', content: text }],
      });

      return text;
    },
  );
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
    console.warn('[Bedrock] Falling back to demo data:', (err as Error).message?.slice(0, 200));
    return { text: fallback, usedBedrock: false };
  }
}
