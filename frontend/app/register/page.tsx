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
      <div className="card card--narrow card--center">
        <h1 className="title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
          Create an account
        </h1>
        <p className="subtitle">Start requesting songs at live events</p>
        <form onSubmit={handleSubmit} className="form">
          {error && <p className="text-error">{error}</p>}
          <input
            type="text"
            placeholder="Your name"
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
          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn--primary"
            style={{ marginTop: 'var(--space-2)', width: '100%' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
          Already have an account? <Link href="/login" className="link">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
