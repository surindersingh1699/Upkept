'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { SystemState } from '@/types';

export default function TaskDetail() {
  const { state, selectedTaskId, setSelectedTaskId, setState, setRightPanelView } = useAppStore();
  const [approving, setApproving] = useState(false);

  if (!state || !selectedTaskId) {
    return (
      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 12 }}>
        Select a task to view details
      </div>
    );
  }

  const task = state.tasks.find((t) => t.id === selectedTaskId);
  if (!task) {
    return (
      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 12 }}>
        Task not found
      </div>
    );
  }

  const approve = async () => {
    setApproving(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, action: 'approve', scheduledDate: task.scheduledDate }),
      });
      const updated: SystemState = await res.json();
      setState(updated);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back to task list */}
      <button
        onClick={() => { setSelectedTaskId(null); setRightPanelView('tasks'); }}
        style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          cursor: 'pointer', fontSize: 11, textAlign: 'left', padding: 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← Back to tasks
      </button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
          letterSpacing: '0.04em', color: 'var(--text)', marginBottom: 4,
        }}>
          {task.title}
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{task.description}</p>
      </div>

      {/* Pricing */}
      <div>
        <div className="section-label">Pricing Analysis</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <PricePill label="Agent Est." value={`$${task.estimatedCost.toLocaleString()}`} color="var(--green)" />
          <PricePill label="Market" value={`$${task.marketPrice.toLocaleString()}`} color="var(--text-muted)" />
          <PricePill label="Savings" value={`$${(task.marketPrice - task.estimatedCost).toLocaleString()}`} color="var(--amber)" />
        </div>
        {task.reasoning.priceJustification && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
            {task.reasoning.priceJustification}
          </p>
        )}
      </div>

      {/* Selected vendor */}
      {task.selectedVendor && (
        <div>
          <div className="section-label">Selected Vendor</div>
          <div style={{
            padding: 10, background: 'var(--green-glow)',
            border: '1px solid var(--green-dim)', borderRadius: 'var(--radius)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>
                  {task.selectedVendor.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {task.selectedVendor.location} · {task.selectedVendor.yearsInBusiness}yr
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                  {task.selectedVendor.rating}★
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{task.selectedVendor.reviewCount} reviews</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                Reliability: {task.selectedVendor.reliabilityScore}%
              </span>
              {task.selectedVendor.licensed && <span className="badge badge-ok" style={{ fontSize: 8 }}>Licensed</span>}
              {task.selectedVendor.insured && <span className="badge badge-ok" style={{ fontSize: 8 }}>Insured</span>}
            </div>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
            {task.reasoning.vendorSelectionReason}
          </p>
        </div>
      )}

      {/* Alternatives rejected */}
      {task.reasoning.alternativesRejected.length > 0 && (
        <div>
          <div className="section-label">Alternatives Considered</div>
          {task.reasoning.alternativesRejected.map((alt, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '6px 0',
              borderBottom: '1px solid var(--border)', fontSize: 11,
            }}>
              <span style={{ color: 'var(--red)', flexShrink: 0 }}>✗</span>
              <span style={{ color: 'var(--text)', flexShrink: 0 }}>{alt.vendorName}</span>
              <span style={{ color: 'var(--text-muted)', flex: 1 }}>— {alt.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Risk avoided */}
      <div>
        <div className="section-label">Risk Avoided</div>
        <div style={{
          background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)',
          borderRadius: 'var(--radius)', padding: 10, fontSize: 11, color: 'var(--text)', lineHeight: 1.5,
        }}>
          {task.reasoning.riskAvoided}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="section-label">Confidence</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1,
            color: task.reasoning.confidenceScore >= 80 ? 'var(--green)' : task.reasoning.confidenceScore >= 60 ? 'var(--amber)' : 'var(--red)',
          }}>
            {task.reasoning.confidenceScore}
          </span>
          <div style={{ flex: 1 }}>
            <div className="progress-bar" style={{ marginBottom: 3 }}>
              <div className="progress-fill" style={{
                width: `${task.reasoning.confidenceScore}%`,
                background: task.reasoning.confidenceScore >= 80 ? 'var(--green)' : task.reasoning.confidenceScore >= 60 ? 'var(--amber)' : 'var(--red)',
              }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
              Based on vendor data, pricing, and compliance urgency
            </div>
          </div>
        </div>
      </div>

      {/* Data sources */}
      <div>
        <div className="section-label">Data Sources</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {task.reasoning.dataUsed.map((d) => (
            <span key={d} className="badge badge-medium" style={{ fontSize: 9 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Schedule */}
      {task.scheduledDate && (
        <div>
          <div className="section-label">Schedule</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>PROPOSED</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{task.scheduledDate}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>DUE BY</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{task.dueDate}</div>
            </div>
          </div>
        </div>
      )}

      {/* Approval */}
      {task.status === 'pending' && task.requiresApproval && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            className="btn btn-green"
            onClick={approve}
            disabled={approving}
            style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 11 }}
          >
            {approving ? 'Approving...' : 'Approve & Schedule'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setSelectedTaskId(null); setRightPanelView('tasks'); }}
            style={{ padding: '10px 16px', fontSize: 11 }}
          >
            Defer
          </button>
        </div>
      )}

      {task.status === 'approved' && (
        <div style={{
          background: 'var(--green-glow)', border: '1px solid var(--green-dim)',
          borderRadius: 'var(--radius)', padding: 10, textAlign: 'center',
          color: 'var(--green)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em',
        }}>
          APPROVED — Scheduled for {task.scheduledDate}
        </div>
      )}
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
