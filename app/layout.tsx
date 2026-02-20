import type { Metadata } from 'next';
import './globals.css';
import '@copilotkit/react-ui/styles.css';
import { CopilotKitWrapper } from '@/components/CopilotKitWrapper';

export const metadata: Metadata = {
  title: 'UpKept — Autonomous Asset & Compliance Autopilot',
  description: 'AI-powered system that maintains assets, enforces compliance, and schedules vendors — autonomously.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKitWrapper>
          {children}
        </CopilotKitWrapper>
      </body>
    </html>
  );
}
