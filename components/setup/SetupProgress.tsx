'use client';

interface SetupProgressProps {
  currentStep: number;
  steps: { title: string }[];
}

export default function SetupProgress({ currentStep, steps }: SetupProgressProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={step.title} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
                background: isCompleted ? 'var(--green)' : isActive ? 'var(--primary)' : 'var(--bg-hover)',
                color: isCompleted || isActive ? '#fff' : 'var(--text-muted)',
                border: isActive ? '2px solid var(--primary)' : isCompleted ? '2px solid var(--green)' : '2px solid var(--border)',
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8l3.5 3.5L13 5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600,
                color: isActive ? 'var(--primary)' : isCompleted ? 'var(--green)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', transition: 'color 0.3s ease',
              }}>
                {step.title}
              </span>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 22,
                background: isCompleted ? 'var(--green)' : 'var(--border)',
                marginLeft: 8, marginRight: 8, borderRadius: 1,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
