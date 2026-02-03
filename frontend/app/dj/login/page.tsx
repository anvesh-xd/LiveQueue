'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';

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
    <main className="page page--center">
      <div className="card card--narrow card--center card--glass" style={{ padding: 'var(--space-10)' }}>
        <h1 className="title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>DJ login</h1>
        <p className="subtitle" style={{ marginBottom: 'var(--space-8)' }}>Dashboard access</p>
        <form onSubmit={handleSubmit} className="form">
          {error && <p className="text-error">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" disabled={loading} className="btn btn--primary btn--pill" style={{ marginTop: 'var(--space-2)' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
          <Link href="/" className="back-link">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
