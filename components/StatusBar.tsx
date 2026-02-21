'use client';

import { useAppStore } from '@/lib/store';

export default function StatusBar() {
  const { state, sites, activeSiteId } = useAppStore();
  const site = sites.find((s) => s.id === activeSiteId);
  const analytics = state?.analytics;

  return (
    <div className="status-bar">
      <span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: state ? 'var(--green-bright)' : 'var(--text-dim)', display: 'inline-block' }} />
        {site?.name ?? 'No site'}
      </span>
      <span>
        Assets: <strong style={{ color: 'var(--text)' }}>{state?.assets.length ?? 0}</strong>
      </span>
      <span>
        Tasks: <strong style={{ color: 'var(--text)' }}>{state?.tasks.length ?? 0}</strong>
      </span>
      {analytics && (
        <>
          <span>
            Score: <strong style={{ color: analytics.complianceScore >= 70 ? 'var(--green-bright)' : analytics.complianceScore >= 40 ? 'var(--amber)' : 'var(--red)' }}>
              {analytics.complianceScore}%
            </strong>
          </span>
          <span>
            Cost: <strong style={{ color: 'var(--text)' }}>${analytics.totalCost.toLocaleString()}</strong>
          </span>
          {analytics.estimatedSavings > 0 && (
            <span>
              Savings: <strong style={{ color: 'var(--green-bright)' }}>${analytics.estimatedSavings.toLocaleString()}</strong>
            </span>
          )}
        </>
      )}
      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>
        Powered by Amazon Bedrock
      </span>
    </div>
  );
}
