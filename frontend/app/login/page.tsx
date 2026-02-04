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
    <main className="page page--center">
      <div className="card card--narrow card--center">
        <h1 className="title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
          Welcome back
        </h1>
        <p className="subtitle">Sign in to your patron account</p>
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
          No account? <Link href="/register" className="link">Create one</Link>
        </p>
      </div>
    </main>
  );
}
