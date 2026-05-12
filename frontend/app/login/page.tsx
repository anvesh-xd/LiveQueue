'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth__panel" aria-hidden="true">
        <p className="auth__panel-eyebrow">
          <span className="dot" />
          Patron · re-entry
        </p>
        <p className="auth__panel-quote">
          The floor remembers <em>regulars.</em>
        </p>
        <div className="auth__panel-meta">
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Account</span>
            <span className="auth__panel-meta-value"><em>Patron</em></span>
          </div>
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Tonight</span>
            <span className="auth__panel-meta-value"><em>Open</em></span>
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
            Sign in
          </p>
          <h1 className="auth__title"><em>Welcome back.</em></h1>
          <p className="auth__subtitle">Pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="auth__form">
            {error && <p className="auth__error" role="alert">{error}</p>}

            <div className="auth__field">
              <label className="auth__label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@somewhere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth__input"
                autoComplete="email"
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
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
            <span>New around here? <Link href="/register">Create an account</Link></span>
            <span>DJ? <Link href="/dj/login">Use the DJ door</Link></span>
          </p>
        </div>
      </div>
    </main>
  );
}
