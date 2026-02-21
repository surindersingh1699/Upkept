import { Suspense } from 'react';
import SetupWizard from '@/components/setup/SetupWizard';

export default function SetupPage() {
  return (
    <Suspense>
      <SetupWizard />
    </Suspense>
  );
}
