'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type InviteCode = {
  id: string;
  code: string;
  used: boolean;
  label?: string | null;
  createdAt: string;
  usedByDj?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('admin_secret');
      if (stored) {
        setAdminSecret(stored);
        setAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (authenticated && adminSecret) {
      fetchCodes();
    }
  }, [authenticated, adminSecret]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/invite-codes`, {
        headers: { Authorization: `Bearer ${inputSecret}` },
      });

      if (response.ok) {
        sessionStorage.setItem('admin_secret', inputSecret);
        setAdminSecret(inputSecret);
        setAuthenticated(true);
        setInputSecret('');
      } else {
        setError('Invalid admin secret');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCodes() {
    try {
      const response = await fetch(`${API_BASE}/admin/invite-codes`, {
        headers: { Authorization: `Bearer ${adminSecret}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      }
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/invite-codes`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: label.trim() || null }),
      });
      if (response.ok) {
        setLabel('');
        await fetchCodes();
      } else {
        setError('Failed to generate code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setGenerating(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_secret');
    setAuthenticated(false);
    setAdminSecret('');
    setCodes([]);
  }

  if (!authenticated) {
    return (
      <main className="auth-page">
        <div className="auth-page__content">
          <div className="auth-page__header">
            <h1 className="auth-page__title">Admin</h1>
            <p className="auth-page__subtitle">Enter admin secret</p>
          </div>

          <form onSubmit={handleAuth} className="auth-page__form">
            {error && <p className="auth-page__error">{error}</p>}
            
            <input
              type="password"
              placeholder="Admin Secret"
              value={inputSecret}
              onChange={(e) => setInputSecret(e.target.value)}
              required
              className="auth-page__input"
              autoComplete="off"
            />
            
            <button type="submit" disabled={loading} className="auth-page__submit">
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <p className="auth-page__footer">
            <Link href="/">← Back to home</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 className="title">Invite Codes</h1>
            <p className="subtitle">Generate codes for DJ registration</p>
          </div>
          <button onClick={handleLogout} className="btn btn--ghost btn--sm">
            Log out
          </button>
        </div>

        {error && <p className="text-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <input
            type="text"
            placeholder="Label (optional - e.g. 'John Smith')"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="input"
            style={{ marginBottom: 'var(--space-3)' }}
            maxLength={100}
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn--primary"
          >
            {generating ? 'Generating...' : 'Generate New Code'}
          </button>
        </div>

        <div className="card">
          <h2 className="title" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
            All Codes
          </h2>
          
          {codes.length === 0 ? (
            <p className="text-muted">No invite codes yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {codes.map((code) => (
                <div
                  key={code.id}
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', fontFamily: 'monospace' }}>
                      {code.code}
                    </p>
                    {code.label && (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginTop: 'var(--space-1)' }}>
                        For: {code.label}
                      </p>
                    )}
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
                      {new Date(code.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    {code.used ? (
                      <div>
                        <span className="badge badge--played">Used</span>
                        {code.usedByDj && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
                            by {code.usedByDj.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge--pending">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
