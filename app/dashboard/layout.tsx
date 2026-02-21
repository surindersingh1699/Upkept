import '@copilotkit/react-ui/styles.css';
import { CopilotKitWrapper } from '@/components/CopilotKitWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitWrapper>
      {children}
    </CopilotKitWrapper>
  );
}
