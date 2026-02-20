'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { SystemState } from '@/types';

export default function TaskDetail() {
  const { state, selectedTaskId, setSelectedTaskId, setState } = useAppStore();
  const [approving, setApproving] = useState(false);

  if (!state || !selectedTaskId) return null;
  const task = state.tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const approve = async () => {
    setApproving(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          action: 'approve',
          scheduledDate: task.scheduledDate,
        }),
      });
      const updated: SystemState = await res.json();
      setState(updated);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(7,9,12,0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={() => setSelectedTaskId(null)}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 640,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}
            >
              {task.title}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{task.description}</p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setSelectedTaskId(null)}
            style={{ padding: '4px 10px', fontSize: 16 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pricing */}
          <Section title="Pricing Analysis">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <PricePill label="Agent Estimate" value={`$${task.estimatedCost.toLocaleString()}`} color="var(--green)" />
              <PricePill label="Market Average" value={`$${task.marketPrice.toLocaleString()}`} color="var(--text-muted)" />
              <PricePill
                label="Savings"
                value={`$${(task.marketPrice - task.estimatedCost).toLocaleString()}`}
                color="var(--amber)"
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {task.reasoning.priceJustification}
            </p>
          </Section>

          {/* Selected vendor */}
          {task.selectedVendor && (
            <Section title="Selected Vendor">
              <div
                style={{
                  background: 'var(--green-glow)',
                  border: '1px solid var(--green-dim)',
                  borderRadius: 'var(--radius)',
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--green)',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}
                    >
                      ✓ {task.selectedVendor.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {task.selectedVendor.location} · {task.selectedVendor.yearsInBusiness}yr experience
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {task.selectedVendor.sources.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            background: 'var(--bg-base)',
                            border: '1px solid var(--border)',
                            borderRadius: 2,
                            color: 'var(--text-muted)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                      {task.selectedVendor.rating}★
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.selectedVendor.reviewCount} reviews</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      Reliability: {task.selectedVendor.reliabilityScore}%
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                      {task.selectedVendor.licensed && (
                        <span style={{ fontSize: 9, background: 'var(--blue-glow)', color: 'var(--blue)', padding: '1px 5px', borderRadius: 2 }}>
                          LICENSED
                        </span>
                      )}
                      {task.selectedVendor.insured && (
                        <span style={{ fontSize: 9, background: 'var(--green-glow)', color: 'var(--green)', padding: '1px 5px', borderRadius: 2 }}>
                          INSURED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.reasoning.vendorSelectionReason}</p>
            </Section>
          )}

          {/* Alternatives rejected */}
          {task.reasoning.alternativesRejected.length > 0 && (
            <Section title="Alternatives Considered">
              {task.reasoning.alternativesRejected.map((alt, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: 'var(--red)', flexShrink: 0 }}>✗</span>
                  <span style={{ color: 'var(--text)', flexShrink: 0 }}>{alt.vendorName}</span>
                  <span style={{ color: 'var(--text-muted)', flex: 1 }}>— {alt.reason}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Risk avoided */}
          <Section title="Risk Avoided">
            <div
              style={{
                background: 'var(--amber-glow)',
                border: '1px solid var(--amber-dim)',
                borderRadius: 'var(--radius)',
                padding: 12,
                fontSize: 12,
                color: 'var(--text)',
              }}
            >
              ⚠ {task.reasoning.riskAvoided}
            </div>
          </Section>

          {/* Data used */}
          <Section title="Data Sources">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {task.reasoning.dataUsed.map((d) => (
                <span
                  key={d}
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </Section>

          {/* Confidence */}
          <Section title="Confidence Score">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  fontSize: 40,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color:
                    task.reasoning.confidenceScore >= 80
                      ? 'var(--green)'
                      : task.reasoning.confidenceScore >= 60
                      ? 'var(--amber)'
                      : 'var(--red)',
                  lineHeight: 1,
                }}
              >
                {task.reasoning.confidenceScore}
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-bar" style={{ marginBottom: 4 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${task.reasoning.confidenceScore}%`,
                      background:
                        task.reasoning.confidenceScore >= 80
                          ? 'var(--green)'
                          : task.reasoning.confidenceScore >= 60
                          ? 'var(--amber)'
                          : 'var(--red)',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Based on vendor reliability, review volume, pricing data, and compliance urgency
                </div>
              </div>
            </div>
          </Section>

          {/* Schedule */}
          {task.scheduledDate && (
            <Section title="Proposed Schedule">
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                    PROPOSED DATE
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
                    {task.scheduledDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                    DUE BY
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                    {task.dueDate}
                  </div>
                </div>
                {task.selectedVendor && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                      VENDOR AVAIL.
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                      {task.selectedVendor.availability}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Approval button */}
          {task.status === 'pending' && task.requiresApproval && (
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button
                className="btn btn-green"
                onClick={approve}
                disabled={approving}
                style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: 12 }}
              >
                {approving ? '⟳ Approving...' : '✓ Approve & Schedule Vendor'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedTaskId(null)}
                style={{ padding: '12px 20px' }}
              >
                Defer
              </button>
            </div>
          )}

          {task.status === 'approved' && (
            <div
              style={{
                background: 'var(--green-glow)',
                border: '1px solid var(--green-dim)',
                borderRadius: 'var(--radius)',
                padding: 12,
                textAlign: 'center',
                color: 'var(--green)',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                letterSpacing: '0.1em',
              }}
            >
              ✓ APPROVED — Vendor notified, scheduled for {task.scheduledDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function PricePill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
