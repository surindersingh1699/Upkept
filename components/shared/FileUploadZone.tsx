'use client';

import { useState, useRef } from 'react';

export interface UploadedFile {
  name: string;
  size: number;
  extractedText: string;
}

interface FileUploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export default function FileUploadZone({ files, onFilesChange }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = [];
    for (const file of fileList) {
      const text = await file.text();
      newFiles.push({ name: file.name, size: file.size, extractedText: text });
    }
    onFilesChange([...files, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = Array.from(e.dataTransfer.files);
    if (fileList.length > 0) handleFiles(fileList);
  };

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ padding: 20 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf,.doc,.docx,.json,.xlsx"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length > 0) handleFiles(list);
            e.target.value = '';
          }}
        />
        <div style={{ fontSize: 24, marginBottom: 6, color: isDragging ? 'var(--primary)' : 'var(--text-dim)' }}>
          {isDragging ? '↓' : '↑'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          Drop files here or click to upload
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Lease agreements, inspection reports, compliance docs, spreadsheets
        </div>
      </div>

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
    </div>
  );
}
