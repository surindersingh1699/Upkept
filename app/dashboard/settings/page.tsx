'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: 'error', text: data.error });
          setLoading(false);
          return;
        }
        setProfile(data);
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setCompany(data.company ?? '');
        setRoleTitle(data.role_title ?? '');
        setAvatarUrl(data.avatar_url ?? '');
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load profile.' });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        phone: phone || null,
        company: company || null,
        role_title: roleTitle || null,
        avatar_url: avatarUrl || null,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setProfile(data);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to save.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)', fontSize: 14,
      }}>
        Loading profile...
      </div>
    );
  }

  const initials = (fullName || profile?.email || 'U')[0].toUpperCase();

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center',
        padding: '0 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <a
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-secondary)', textDecoration: 'none',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
            color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.02em',
          }}>
            Profile Settings
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'var(--text-muted)', marginBottom: 32,
          }}>
            Manage your account information.
          </p>

          {/* Avatar section */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
            padding: 20, borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', background: 'var(--bg-base)',
          }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                fontFamily: 'var(--font-display)', marginBottom: 4,
              }}>
                {fullName || profile?.email || 'User'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                {profile?.email}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label style={labelStyle}>
                Email
                <span style={{ fontWeight: 400, color: 'var(--text-dim)', marginLeft: 6 }}>
                  (managed by login provider)
                </span>
              </label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                style={{
                  width: '100%', fontSize: 14, padding: '10px 12px',
                  opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-surface)',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}
              />
            </div>

            {/* Company */}
            <div>
              <label style={labelStyle}>Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Properties"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}
              />
            </div>

            {/* Role / Title */}
            <div>
              <label style={labelStyle}>Role / Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Property Manager"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label style={labelStyle}>Avatar URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}
              />
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: message.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
                color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
                fontSize: 13, fontFamily: 'var(--font-body)',
              }}>
                {message.text}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px', borderRadius: 'var(--radius)',
                background: 'var(--primary)', color: '#fff', border: 'none',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
                alignSelf: 'flex-start',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 6,
};
