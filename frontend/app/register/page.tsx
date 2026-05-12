'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth__panel" aria-hidden="true">
        <p className="auth__panel-eyebrow">
          <span className="dot" />
          Patron · new entry
        </p>
        <p className="auth__panel-quote">
          One name on the list. <em>Yours.</em>
        </p>
        <div className="auth__panel-meta">
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Account</span>
            <span className="auth__panel-meta-value"><em>Patron</em></span>
          </div>
          <div className="auth__panel-meta-item">
            <span className="auth__panel-meta-label">Entry</span>
            <span className="auth__panel-meta-value"><em>Free</em></span>
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
            Register
          </p>
          <h1 className="auth__title"><em>Get in.</em></h1>
          <p className="auth__subtitle">Three fields. Then the floor.</p>

          <form onSubmit={handleSubmit} className="auth__form">
            {error && <p className="auth__error" role="alert">{error}</p>}

            <div className="auth__field">
              <label className="auth__label" htmlFor="reg-name">Your name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="What we should call you"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth__input"
                autoComplete="name"
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
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
              <label className="auth__label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth__input"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth__submit">
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight className="auth__submit-arrow" size={14} />}
            </button>
          </form>

          <p className="auth__footer">
            <span>Already on the list? <Link href="/login">Sign in</Link></span>
            <span>DJ? <Link href="/dj/register">Use the DJ door</Link></span>
          </p>
        </div>
      </div>
    </main>
  );
}
