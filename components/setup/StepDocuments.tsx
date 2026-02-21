'use client';

import type { SetupData } from '@/types';
import FileUploadZone from '@/components/shared/FileUploadZone';
import type { UploadedFile } from '@/components/shared/FileUploadZone';

interface Props {
  data: SetupData;
  onChange: (patch: Partial<SetupData>) => void;
}

export default function StepDocuments({ data, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, width: '100%' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Supporting documents
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          Upload any relevant documents to improve accuracy. This step is optional — you can add documents later.
        </p>
      </div>

      <FileUploadZone
        files={data.uploadedFiles}
        onFilesChange={(files: UploadedFile[]) => onChange({ uploadedFiles: files })}
      />

      <div style={{
        padding: 16, borderRadius: 'var(--radius)', background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Helpful documents include:
        </div>
        <ul style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Lease or property management agreements</li>
          <li>Previous inspection reports</li>
          <li>Insurance policies</li>
          <li>Maintenance history or service records</li>
          <li>Compliance certificates</li>
        </ul>
      </div>
    </div>
  );
}
