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
      <div className="card card--narrow card--center">
        <h1 className="title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
          DJ Dashboard
        </h1>
        <p className="subtitle">Sign in to manage your requests</p>
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
          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn--primary"
            style={{ marginTop: 'var(--space-2)', width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
          <Link href="/" className="link--muted">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
