'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="page page--center">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }

  return (
    <main className="hero">
      {user ? (
        <>
          <span className="hero__badge">Welcome back</span>
          <h1 className="hero__title">
            Hi, <span>{user.name}</span>
          </h1>
          <p className="hero__tagline" style={{ marginBottom: 'var(--space-8)' }}>
            Choose where you want to request songs or check your request status.
          </p>
          <div className="action-cards">
            <Link href="/venues" className="action-card">
              <div className="action-card__icon" aria-hidden>📍</div>
              <div className="action-card__title">Browse venues</div>
              <div className="action-card__desc">Find a venue and DJ, then submit your song request.</div>
            </Link>
            <Link href="/my-requests" className="action-card">
              <div className="action-card__icon" aria-hidden>🎵</div>
              <div className="action-card__title">My requests</div>
              <div className="action-card__desc">See all your requests and their status in real time.</div>
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="btn btn--ghost btn--sm"
            style={{ marginTop: 'var(--space-10)' }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <span className="hero__badge">Real-time song requests</span>
          <h1 className="hero__title">
            Live<span>Queue</span>
          </h1>
          <p className="hero__tagline">
            A modern way to request songs.
          </p>
          <div className="hero__actions">
            <Link href="/register" className="btn btn--primary btn--pill">
              Get started
            </Link>
            <Link href="/login" className="btn btn--outline btn--pill">
              Log in
            </Link>
          </div>
          <p className="hero__foot">
            <Link href="/dj/login" className="link--muted">DJ? Sign in to your dashboard</Link>
          </p>
        </>
      )}
    </main>
  );
}
