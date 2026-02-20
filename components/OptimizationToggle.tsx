'use client';

import { useAppStore } from '@/lib/store';

export default function OptimizationToggle() {
  const { optimizationMode, setOptimizationMode } = useAppStore();

  return (
    <div className="opt-toggle">
      <button
        className={`opt-btn ${optimizationMode === 'cost' ? 'active' : ''}`}
        onClick={() => setOptimizationMode('cost')}
      >
        $ Cost Savings
      </button>
      <button
        className={`opt-btn ${optimizationMode === 'quality' ? 'active' : ''}`}
        onClick={() => setOptimizationMode('quality')}
      >
        ★ Best Quality
      </button>
    </div>
  );
}
