'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';

export default function DjRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { djRegister } = useDjAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await djRegister(email, password, name, inviteCode);
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
          <h1 className="auth-page__title">DJ Registration</h1>
          <p className="auth-page__subtitle">Create your DJ account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && <p className="auth-page__error">{error}</p>}
          
          <input
            type="text"
            placeholder="Full Name"
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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="auth-page__input"
            autoComplete="new-password"
          />
          
          <input
            type="text"
            placeholder="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
            className="auth-page__input"
            autoComplete="off"
            maxLength={8}
          />
          
          <button type="submit" disabled={loading} className="auth-page__submit">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-page__footer">
          Already have an account? <Link href="/dj/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
