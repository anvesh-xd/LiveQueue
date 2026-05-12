'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

export default function DjLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { djLogin } = useDjAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await djLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth__panel auth__panel--dj" aria-hidden="true">
        <p className="auth__panel-eyebrow">
          <span className="dot" />
          DJ · stage entrance
        </p>
        <p className="auth__panel-quote">
          The floor is <em>yours.</em>
        </p>
        <div className="auth__panel-meta">
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Role</span>
            <span className="auth__panel-meta-value"><em>DJ</em></span>
          </div>
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Channel</span>
            <span className="auth__panel-meta-value"><em>Live</em></span>
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
            DJ sign-in
          </p>
          <h1 className="auth__title"><em>Take the deck.</em></h1>
          <p className="auth__subtitle">Sign in to manage requests in real time.</p>

          <form onSubmit={handleSubmit} className="auth__form">
            {error && <p className="auth__error" role="alert">{error}</p>}

            <div className="auth__field">
              <label className="auth__label" htmlFor="dj-login-email">Email</label>
              <input
                id="dj-login-email"
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
              <label className="auth__label" htmlFor="dj-login-password">Password</label>
              <input
                id="dj-login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth__input"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth__submit">
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="auth__submit-arrow" size={14} />}
            </button>
          </form>

          <p className="auth__footer">
            <span>Need an account? <Link href="/dj/register">Apply as DJ</Link></span>
            <span>Patron? <Link href="/login">Use the patron door</Link></span>
          </p>
        </div>
      </div>
    </main>
  );
}
