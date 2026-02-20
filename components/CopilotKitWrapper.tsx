'use client';

import { CopilotKit } from '@copilotkit/react-core';

export function CopilotKitWrapper({ children }: { children: React.ReactNode }) {
  const cloudKey = process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY;

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      {...(cloudKey ? { publicApiKey: cloudKey } : {})}
    >
      {children}
    </CopilotKit>
  );
}
