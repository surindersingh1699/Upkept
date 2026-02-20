'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function NodeEditPanel() {
  const { state, selectedNodeId, updateGraphNode, removeGraphNode, setSelectedNodeId, setRightPanelView } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');

  if (!state || !selectedNodeId) {
    return <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20, fontSize: 12 }}>Select a node on the graph</div>;
  }

  const graphNode = state.graph.nodes.find((n) => n.id === selectedNodeId);
  if (!graphNode) {
    return <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20, fontSize: 12 }}>Node not found</div>;
  }

  // Find related data
  const asset = state.assets.find((a) => a.id === selectedNodeId || graphNode.label === a.name);
  const compliance = state.complianceItems.find((c) => c.id === selectedNodeId || graphNode.label === c.name);
  const task = state.tasks.find((t) => {
    const taskNode = state.graph.nodes.find((n) => n.type === 'task' && n.label === t.title);
    return taskNode?.id === selectedNodeId;
  });
  const vendor = task?.selectedVendor ?? state.tasks.find((t) => t.selectedVendor?.name === graphNode.label)?.selectedVendor;

  const handleDelete = () => {
    removeGraphNode(selectedNodeId);
    setSelectedNodeId(null);
  };

  const startEdit = () => {
    setEditLabel(graphNode.label);
    setEditing(true);
  };

  const commitEdit = () => {
    updateGraphNode(selectedNodeId, { label: editLabel });
    setEditing(false);
  };

  const typeColors: Record<string, string> = { asset: 'var(--blue)', compliance: 'var(--amber)', task: 'var(--purple)', vendor: 'var(--green)' };
  const nodeColor = typeColors[graphNode.type] ?? 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Node header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: nodeColor }} />
          <span className={`badge badge-${graphNode.type === 'asset' ? 'physical' : graphNode.type === 'compliance' ? 'high' : graphNode.type === 'vendor' ? 'ok' : 'scheduled'}`}>
            {graphNode.type}
          </span>
          {graphNode.status && (
            <span className={`badge badge-${graphNode.status}`}>{graphNode.status}</span>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text" value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
              autoFocus
              style={{ flex: 1, fontSize: 14, padding: '4px 8px' }}
            />
            <button className="btn btn-green" style={{ padding: '4px 10px', fontSize: 10 }} onClick={commitEdit}>Save</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>{graphNode.label}</h3>
            <button
              onClick={startEdit}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12 }}
              title="Edit name"
            >
              ✎
            </button>
          </div>
        )}
      </div>

      {/* Asset details */}
      {graphNode.type === 'asset' && asset && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">Asset Details</div>
          <InfoRow label="Type" value={asset.type} />
          <InfoRow label="Status" value={asset.status} color={asset.status === 'critical' ? 'var(--red)' : asset.status === 'attention' ? 'var(--amber)' : 'var(--green)'} />
          <InfoRow label="Risk Score" value={`${asset.riskScore}/100`} />
          {asset.location && <InfoRow label="Location" value={asset.location} />}
          {asset.installedYear && <InfoRow label="Installed" value={String(asset.installedYear)} />}
          {asset.lastServiced && <InfoRow label="Last Serviced" value={asset.lastServiced} />}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{asset.description}</div>

          {/* Related tasks */}
          {state.tasks.filter((t) => t.assetId === asset.id).length > 0 && (
            <>
              <div className="section-label">Related Tasks</div>
              {state.tasks.filter((t) => t.assetId === asset.id).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { useAppStore.getState().setSelectedTaskId(t.id); setRightPanelView('task'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    background: 'var(--bg-base)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <div className={`status-dot dot-${t.status === 'pending' ? 'pending' : 'approved'}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text)' }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t.selectedVendor?.name} · ${t.estimatedCost}</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Compliance details */}
      {graphNode.type === 'compliance' && compliance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">Compliance Details</div>
          <InfoRow label="Authority" value={compliance.authority ?? 'N/A'} />
          <InfoRow label="Due Date" value={compliance.dueDate} />
          <InfoRow label="Days Until Due" value={String(compliance.daysUntilDue)} color={compliance.daysUntilDue <= 30 ? 'var(--red)' : 'var(--amber)'} />
          <InfoRow label="Risk Level" value={compliance.riskLevel} color={compliance.riskLevel === 'critical' ? 'var(--red)' : 'var(--amber)'} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{compliance.description}</div>
        </div>
      )}

      {/* Task details with full AI reasoning */}
      {graphNode.type === 'task' && task && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">AI Decision</div>

          {/* Pricing analysis */}
          <div style={{ display: 'flex', gap: 8 }}>
            <PricePill label="Agent Est." value={`$${task.estimatedCost}`} color="var(--green)" />
            <PricePill label="Market" value={`$${task.marketPrice}`} color="var(--text-muted)" />
            <PricePill label="Savings" value={`$${task.marketPrice - task.estimatedCost}`} color="var(--green)" />
          </div>

          {/* Selected vendor */}
          {task.selectedVendor && (
            <div style={{ padding: 12, background: 'var(--bg-base)', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 4 }}>SELECTED VENDOR</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{task.selectedVendor.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                ★ {task.selectedVendor.rating} · {task.selectedVendor.reviewCount} reviews · {task.selectedVendor.reliabilityScore}% reliable
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {task.selectedVendor.licensed && <span className="badge badge-ok" style={{ fontSize: 9 }}>Licensed</span>}
                {task.selectedVendor.insured && <span className="badge badge-ok" style={{ fontSize: 9 }}>Insured</span>}
              </div>
            </div>
          )}

          {/* Vendor selection reasoning */}
          <div className="section-label">Reasoning</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{task.reasoning.summary}</div>

          {/* Confidence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>CONFIDENCE</span>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{
                width: `${task.reasoning.confidenceScore}%`,
                background: task.reasoning.confidenceScore >= 80 ? 'var(--green)' : task.reasoning.confidenceScore >= 60 ? 'var(--amber)' : 'var(--red)',
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: task.reasoning.confidenceScore >= 80 ? 'var(--green)' : 'var(--amber)' }}>
              {task.reasoning.confidenceScore}
            </span>
          </div>

          {/* Alternatives rejected */}
          {task.reasoning.alternativesRejected.length > 0 && (
            <>
              <div className="section-label">Alternatives Rejected</div>
              {task.reasoning.alternativesRejected.map((alt, i) => (
                <div key={i} style={{ padding: '6px 10px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alt.vendorName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{alt.reason}</div>
                </div>
              ))}
            </>
          )}

          {/* Risk avoided */}
          <div className="section-label">Risk Avoided</div>
          <div style={{ fontSize: 11, color: 'var(--red)', padding: '8px 10px', background: 'var(--red-glow)', border: '1px solid var(--red-dim)', borderRadius: 'var(--radius)' }}>
            {task.reasoning.riskAvoided}
          </div>

          {/* Data sources */}
          <div className="section-label">Data Sources</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {task.reasoning.dataUsed.map((src, i) => (
              <span key={i} className="badge badge-medium" style={{ fontSize: 9 }}>{src}</span>
            ))}
          </div>

          {/* Approve button */}
          {task.status === 'pending' && task.requiresApproval && (
            <button
              className="btn btn-green"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={async () => {
                const res = await fetch('/api/approve', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taskId: task.id, action: 'approve' }),
                });
                const updated = await res.json();
                useAppStore.getState().setState(updated);
              }}
            >
              ✓ Approve & Schedule
            </button>
          )}

          {task.status === 'approved' && (
            <div style={{ padding: '8px 12px', background: 'var(--green-glow)', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--green)', fontSize: 11, fontFamily: 'var(--font-display)' }}>
              ✓ APPROVED
            </div>
          )}
        </div>
      )}

      {/* Vendor details */}
      {graphNode.type === 'vendor' && vendor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-label">Vendor Details</div>
          <InfoRow label="Rating" value={`★ ${vendor.rating} (${vendor.reviewCount} reviews)`} />
          <InfoRow label="Reliability" value={`${vendor.reliabilityScore}%`} color="var(--green)" />
          <InfoRow label="Price Range" value={vendor.priceRange} />
          <InfoRow label="Availability" value={vendor.availability} />
          <InfoRow label="Location" value={vendor.location} />
          <InfoRow label="Years" value={`${vendor.yearsInBusiness} years`} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {vendor.licensed && <span className="badge badge-ok">Licensed</span>}
            {vendor.insured && <span className="badge badge-ok">Insured</span>}
            {vendor.sources.map((s) => <span key={s} className="badge badge-medium" style={{ fontSize: 9 }}>{s}</span>)}
          </div>

          {/* Assigned tasks */}
          <div className="section-label">Assigned Tasks</div>
          {state.tasks.filter((t) => t.selectedVendor?.name === vendor.name).map((t) => (
            <button
              key={t.id}
              onClick={() => { useAppStore.getState().setSelectedTaskId(t.id); setRightPanelView('task'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <span className={`badge badge-${t.priority}`} style={{ fontSize: 9 }}>{t.priority}</span>
              <span style={{ fontSize: 11, color: 'var(--text)' }}>{t.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Delete button */}
      <button
        className="btn btn-red"
        style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
        onClick={handleDelete}
      >
        Delete Node
      </button>
    </div>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 12, color: color ?? 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function PricePill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1, padding: '6px 8px', background: 'var(--bg-base)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}
