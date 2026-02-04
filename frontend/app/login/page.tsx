'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
    <main className="auth-page">
      <div className="auth-page__content">
        <div className="auth-page__header">
          <h1 className="auth-page__title">Welcome back</h1>
          <p className="auth-page__subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && <p className="auth-page__error">{error}</p>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-page__input"
            autoComplete="email"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-page__input"
            autoComplete="current-password"
          />
          
          <button type="submit" disabled={loading} className="auth-page__submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-page__footer">
          No account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
}
