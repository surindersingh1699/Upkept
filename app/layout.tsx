import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UpKept — Autonomous Asset & Compliance Autopilot',
  description: 'AI-powered system that maintains assets, enforces compliance, and schedules vendors — autonomously.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
