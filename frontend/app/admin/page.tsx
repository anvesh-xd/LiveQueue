'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
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
    } catch {
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
      <main className="auth">
        <aside className="auth__panel" aria-hidden="true">
          <p className="auth__panel-eyebrow">
            <span className="dot" />
            Admin · backroom
          </p>
          <p className="auth__panel-quote">
            For the <em>house only.</em>
          </p>
          <div className="auth__panel-meta">
            <div className="auth__panel-meta-item">
              <span className="auth__panel-meta-label">Role</span>
              <span className="auth__panel-meta-value"><em>Admin</em></span>
            </div>
            <div className="auth__panel-meta-item">
              <span className="auth__panel-meta-label">Scope</span>
              <span className="auth__panel-meta-value"><em>Invites</em></span>
            </div>
          </div>
        </aside>

        <div className="auth__form-wrap">
          <div className="auth__form-inner">
            <Link href="/" className="auth__back">
              <ArrowLeft size={12} />
              Back to floor
            </Link>

            <p className="auth__eyebrow">
              <span className="dot" />
              Admin
            </p>
            <h1 className="auth__title"><em>House key.</em></h1>
            <p className="auth__subtitle">Enter the admin secret.</p>

            <form onSubmit={handleAuth} className="auth__form">
              {error && <p className="auth__error" role="alert">{error}</p>}
              <div className="auth__field">
                <label className="auth__label" htmlFor="admin-secret">Secret</label>
                <input
                  id="admin-secret"
                  type="password"
                  placeholder="••••••••"
                  value={inputSecret}
                  onChange={(e) => setInputSecret(e.target.value)}
                  required
                  className="auth__input"
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={loading} className="auth__submit">
                {loading ? 'Verifying…' : 'Continue'}
                {!loading && <ArrowRight className="auth__submit-arrow" size={14} />}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__shell" style={{ maxWidth: 860 }}>
        <header className="page__header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p className="page__eyebrow">
              <span className="dot" />
              Admin · backroom
            </p>
            <h1 className="page__title">
              Invite <em>codes.</em>
            </h1>
            <p className="page__subtitle">Generate codes for DJ registration.</p>
          </div>
          <button onClick={handleLogout} className="btn btn--ghost btn--sm">
            Log out
          </button>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        <section className="section">
          <div className="section__head">
            <span className="section__title">
              <span className="section__title-num">01</span>
              Generate
            </span>
          </div>
          <div className="manage__form">
            <div className="manage__field">
              <label className="manage__label" htmlFor="code-label">Label (optional)</label>
              <input
                id="code-label"
                type="text"
                placeholder="For — e.g. 'John Smith'"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="manage__input"
                maxLength={100}
              />
            </div>
            <button onClick={handleGenerate} disabled={generating} className="manage__btn">
              {generating ? 'Generating…' : (
                <>
                  Generate new code
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__title">
              <span className="section__title-num">02</span>
              All codes
            </span>
            <span className="section__count">{String(codes.length).padStart(2, '0')} total</span>
          </div>

          {codes.length === 0 ? (
            <p className="text-muted" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              No invite codes yet
            </p>
          ) : (
            codes.map((code) => (
              <div key={code.id} className="venue-row" style={{ gridTemplateColumns: '1fr auto' }}>
                <div className="venue-row__info">
                  <p className="venue-row__name" style={{ fontFamily: 'var(--mono)', fontStyle: 'normal', letterSpacing: '0.18em', fontSize: '1.05rem' }}>
                    {code.code}
                  </p>
                  <p className="venue-row__meta">
                    {code.label ? `For ${code.label} · ` : ''}
                    {new Date(code.createdAt).toLocaleDateString()}
                    {code.used && code.usedByDj && ` · used by ${code.usedByDj.name}`}
                  </p>
                </div>
                <span className={`status ${code.used ? 'status--played' : 'status--accepted'}`}>
                  {!code.used && <span className="dot" aria-hidden="true" />}
                  {code.used ? 'Used' : 'Open'}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
