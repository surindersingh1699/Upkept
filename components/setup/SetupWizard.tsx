'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { SetupData } from '@/types';
import SetupProgress from './SetupProgress';
import StepPropertyInfo from './StepPropertyInfo';
import StepPropertyDetails from './StepPropertyDetails';
import StepCompliance from './StepCompliance';
import StepDocuments from './StepDocuments';
import StepGenerate from './StepGenerate';

const STEPS = [
  { title: 'Property' },
  { title: 'Details' },
  { title: 'Compliance' },
  { title: 'Documents' },
  { title: 'Generate' },
];

const EMPTY_SETUP: SetupData = {
  siteName: '',
  address: '',
  propertyType: 'commercial',
  description: '',
  complianceNeeds: [],
  uploadedFiles: [],
  completed: false,
};

export default function SetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSiteId = searchParams.get('edit');

  const { setupStep, setSetupStep, setupData, updateSetupData, resetSetup, sites, activeSiteId, addSite, setActiveSite } = useAppStore();

  // Initialize setup data
  useEffect(() => {
    if (setupData) return; // already initialized

    if (editSiteId) {
      // Editing an existing site — pre-populate from its setupData
      const site = sites.find((s) => s.id === editSiteId);
      if (site?.setupData) {
        updateSetupData({ ...site.setupData, completed: false });
        return;
      }
    }

    // New site setup
    updateSetupData(EMPTY_SETUP);
  }, [editSiteId, sites, setupData, updateSetupData]);

  // Create a new site entry if we're not editing
  useEffect(() => {
    if (editSiteId) return;
    // Check if the current active site already has setup completed — if so, create a new one
    const activeSite = sites.find((s) => s.id === activeSiteId);
    if (activeSite?.setupCompleted) {
      const newSite = { id: `site-${Date.now()}`, name: 'New Site', createdAt: new Date().toISOString() };
      addSite(newSite);
      setActiveSite(newSite.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = setupData ?? EMPTY_SETUP;

  const canAdvance = () => {
    switch (setupStep) {
      case 0: return data.siteName.trim() !== '' && data.address.trim() !== '';
      case 1: return data.description.trim() !== '';
      case 2: return true; // compliance is optional
      case 3: return true; // documents are optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (setupStep < STEPS.length - 1 && canAdvance()) {
      setSetupStep(setupStep + 1);
    }
  };

  const handleBack = () => {
    if (setupStep > 0) {
      setSetupStep(setupStep - 1);
    }
  };

  const handleComplete = () => {
    resetSetup();
    router.push('/dashboard');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg-base)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--bg-base)', fontFamily: 'var(--font-display)',
          }}>
            U
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            UpKept
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
            {editSiteId ? 'Edit Site' : 'New Site Setup'}
          </span>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => router.push('/dashboard')}
          style={{ fontSize: 12, padding: '5px 12px' }}
        >
          Skip for now
        </button>
      </div>

      {/* Progress */}
      <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
        <SetupProgress currentStep={setupStep} steps={STEPS} />
      </div>

      {/* Step content */}
      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex', justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div className="animate-fade-in" key={setupStep}>
          {setupStep === 0 && <StepPropertyInfo data={data} onChange={updateSetupData} />}
          {setupStep === 1 && <StepPropertyDetails data={data} onChange={updateSetupData} />}
          {setupStep === 2 && <StepCompliance data={data} onChange={updateSetupData} />}
          {setupStep === 3 && <StepDocuments data={data} onChange={updateSetupData} />}
          {setupStep === 4 && <StepGenerate data={data} onComplete={handleComplete} />}
        </div>
      </div>

      {/* Navigation */}
      {setupStep < 4 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0,
          background: 'var(--bg-surface)',
        }}>
          <button
            className="btn btn-ghost"
            onClick={handleBack}
            disabled={setupStep === 0}
            style={{ opacity: setupStep === 0 ? 0.3 : 1, padding: '8px 20px' }}
          >
            ← Back
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Step {setupStep + 1} of {STEPS.length}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canAdvance()}
            style={{ opacity: canAdvance() ? 1 : 0.4, padding: '8px 20px' }}
          >
            {setupStep === 3 ? 'Review →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
