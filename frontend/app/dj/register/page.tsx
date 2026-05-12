'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

export default function DjRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { djRegister } = useDjAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await djRegister(email, password, name, inviteCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth__panel auth__panel--dj" aria-hidden="true">
        <p className="auth__panel-eyebrow">
          <span className="dot" />
          DJ · application
        </p>
        <p className="auth__panel-quote">
          Booth pass. <em>Invite only.</em>
        </p>
        <div className="auth__panel-meta">
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Role</span>
            <span className="auth__panel-meta-value"><em>DJ</em></span>
          </div>
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Access</span>
            <span className="auth__panel-meta-value"><em>Coded</em></span>
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
            DJ registration
          </p>
          <h1 className="auth__title"><em>Apply for the booth.</em></h1>
          <p className="auth__subtitle">Need an invite code? Get it from the venue.</p>

          <form onSubmit={handleSubmit} className="auth__form">
            {error && <p className="auth__error" role="alert">{error}</p>}

            <div className="auth__field">
              <label className="auth__label" htmlFor="dj-reg-name">Stage / full name</label>
              <input
                id="dj-reg-name"
                type="text"
                placeholder="How the floor sees you"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth__input"
                autoComplete="name"
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="dj-reg-email">Email</label>
              <input
                id="dj-reg-email"
                type="email"
                placeholder="you@booth.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth__input"
                autoComplete="email"
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="dj-reg-password">Password</label>
              <input
                id="dj-reg-password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="auth__input"
                autoComplete="new-password"
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="dj-reg-code">Invite code</label>
              <input
                id="dj-reg-code"
                type="text"
                placeholder="XXXXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                className="auth__input"
                autoComplete="off"
                maxLength={8}
                style={{ fontFamily: 'var(--mono)', letterSpacing: '0.2em' }}
              />
            </div>

            <button type="submit" disabled={loading} className="auth__submit">
              {loading ? 'Submitting…' : 'Apply'}
              {!loading && <ArrowRight className="auth__submit-arrow" size={14} />}
            </button>
          </form>

          <p className="auth__footer">
            <span>Already a DJ here? <Link href="/dj/login">Sign in</Link></span>
            <span>Patron? <Link href="/register">Use the patron door</Link></span>
          </p>
        </div>
      </div>
    </main>
  );
}
