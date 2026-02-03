'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
    <main className="page page--center">
      <div className="card card--narrow card--center card--glass" style={{ padding: 'var(--space-10)' }}>
        <h1 className="title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Sign up</h1>
        <p className="subtitle" style={{ marginBottom: 'var(--space-8)' }}>Create a patron account</p>
        <form onSubmit={handleSubmit} className="form">
          {error && <p className="text-error">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
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
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
          Already have an account? <Link href="/login" className="link">Log in</Link>
        </p>
      </div>
    </main>
  );
}
