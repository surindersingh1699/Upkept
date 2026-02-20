'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';

const DEMO_TEXT = `2-story commercial property at 1400 Congress Ave, Austin TX.
HVAC system installed 2008, last serviced March 2021. Water heater in garage, 9 years old.
3 smoke detectors (floors 1 & 2), last tested June 2022.
Roof: asphalt shingles, no inspection since 2019.
Electrical panel: original 2008, never inspected.
Website SSL certificate expiring in 45 days.
AWS S3 backup not verified in 6 months.
Annual fire safety inspection due next month.
Business license renewal due in 60 days.
GDPR data retention audit due in 90 days.`;

export default function IntakePanel() {
  const { setState, addAgentStep, setIsPlanning, optimizationMode, setOptimizationMode, addToHistory, activeSiteId } = useAppStore();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: File[]) => {
    const newFiles: { name: string; size: number }[] = [];
    let combinedText = '';
    for (const file of fileList) {
      const text = await file.text();
      combinedText += `\n--- ${file.name} ---\n${text}`;
      newFiles.push({ name: file.name, size: file.size });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setDescription((prev) => prev + combinedText);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = Array.from(e.dataTransfer.files);
    if (fileList.length > 0) handleFiles(fileList);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleRun = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setIsPlanning(true);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, optimizationMode }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'step') addAgentStep(data.step);
          } catch { /* ignore parse errors */ }
        }
      }

      const stateRes = await fetch('/api/state');
      const newState = await stateRes.json();
      setState(newState);

      addToHistory({
        id: `hist-${Date.now()}`,
        siteId: activeSiteId,
        timestamp: new Date().toISOString(),
        inputDescription: description,
        summary: `${newState.assets?.length ?? 0} assets, ${newState.tasks?.length ?? 0} tasks`,
        state: newState,
        agentSteps: useAppStore.getState().agentSteps,
      });
    } catch (err) {
      console.error('Intake error:', err);
    } finally {
      setLoading(false);
      setIsPlanning(false);
    }
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* File Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ padding: 12 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf,.doc,.docx,.json"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length > 0) handleFiles(list);
            e.target.value = '';
          }}
        />
        <div style={{ fontSize: 18, marginBottom: 4, color: isDragging ? 'var(--amber)' : 'var(--text-dim)' }}>
          {isDragging ? '↓' : '↑'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
          Drop files or click to upload
        </div>
      </div>

      {/* File chips */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {files.map((f) => (
            <div key={f.name} className="file-chip">
              <span>{f.name}</span>
              <span style={{ color: 'var(--text-dim)' }}>{(f.size / 1024).toFixed(1)}KB</span>
              <button onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Text input */}
      <textarea
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe assets, compliance needs..."
        style={{ fontSize: 11 }}
      />

      {/* Optimization toggle */}
      <div className="opt-toggle" style={{ alignSelf: 'stretch' }}>
        <button
          className={`opt-btn ${optimizationMode === 'cost' ? 'active' : ''}`}
          onClick={() => setOptimizationMode('cost')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          $ Cost
        </button>
        <button
          className={`opt-btn ${optimizationMode === 'quality' ? 'active' : ''}`}
          onClick={() => setOptimizationMode('quality')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          ★ Quality
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-amber"
          onClick={handleRun}
          disabled={!description.trim() || loading}
          style={{ flex: 1, justifyContent: 'center', opacity: !description.trim() || loading ? 0.5 : 1 }}
        >
          {loading ? (
            <><span className="animate-spin-slow" style={{ display: 'inline-block' }}>⟳</span> Running...</>
          ) : (
            '▶ Run Agent'
          )}
        </button>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 10, padding: '4px 10px' }}
          onClick={() => setDescription(DEMO_TEXT)}
        >
          Demo
        </button>
      </div>
    </div>
  );
}
