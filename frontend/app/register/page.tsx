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
    <main className="auth-page">
      <div className="auth-page__content">
        <div className="auth-page__header">
          <h1 className="auth-page__title">Get started</h1>
          <p className="auth-page__subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && <p className="auth-page__error">{error}</p>}
          
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="auth-page__input"
            autoComplete="name"
          />
          
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
            autoComplete="new-password"
          />
          
          <button type="submit" disabled={loading} className="auth-page__submit">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-page__footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
