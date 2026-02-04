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

  // Logged-in view — clean, functional
  if (user) {
    return (
      <main className="home-logged">
        <div className="home-logged__inner">
          <p className="home-logged__greeting">Welcome back</p>
          <h1 className="home-logged__title">Hi, {user.name}</h1>
          <p className="home-logged__subtitle">
            What would you like to do today?
          </p>
          <div className="action-cards">
            <Link href="/venues" className="action-card">
              <div className="action-card__icon" aria-hidden>📍</div>
              <div className="action-card__title">Browse venues</div>
              <div className="action-card__desc">
                Find a venue and DJ, then submit your song request.
              </div>
            </Link>
            <Link href="/my-requests" className="action-card">
              <div className="action-card__icon" aria-hidden>🎵</div>
              <div className="action-card__title">My requests</div>
              <div className="action-card__desc">
                See all your requests and their status in real time.
              </div>
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="btn btn--ghost btn--sm"
          >
            Log out
          </button>
        </div>
      </main>
    );
  }

  // Landing page — premium, cinematic
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-section__bg">
          <div className="hero-section__gradient" />
          <div className="hero-section__gradient-secondary" />
        </div>
        <div className="hero-section__content">
          <div className="hero-section__badge">
            <span className="hero-section__badge-dot" />
            Real-time song requests
          </div>
          <h1 className="hero-section__title">
            The queue,{' '}
            <span className="hero-section__title-accent">reimagined</span>
          </h1>
          <p className="hero-section__subtitle">
            A modern way for patrons to request songs and DJs to manage their queue. Real-time. Effortless.
          </p>
          <div className="hero-section__actions">
            <Link href="/register" className="btn btn--primary btn--lg btn--pill">
              Get started free
            </Link>
            <Link href="/login" className="btn btn--secondary btn--lg btn--pill">
              Log in
            </Link>
          </div>
          <p className="hero-section__footer">
            <Link href="/dj/login">DJ? Sign in to your dashboard →</Link>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="how-section__inner">
          <div className="how-section__header">
            <p className="how-section__label">How it works</p>
            <h2 className="how-section__title">Three steps. Zero friction.</h2>
          </div>
          <div className="how-section__steps">
            <div className="step">
              <div className="step__number">01</div>
              <h3 className="step__title">Find your venue</h3>
              <p className="step__desc">
                Scan a QR code or browse venues to find where you are tonight.
              </p>
            </div>
            <div className="step">
              <div className="step__number">02</div>
              <h3 className="step__title">Request a song</h3>
              <p className="step__desc">
                Search for any track and submit your request to the DJ instantly.
              </p>
            </div>
            <div className="step">
              <div className="step__number">03</div>
              <h3 className="step__title">Track your status</h3>
              <p className="step__desc">
                Get real-time updates when your request is accepted, declined, or played.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Patrons */}
      <section className="split-section">
        <div className="split-section__inner">
          <div className="split-section__content">
            <p className="split-section__label">For Patrons</p>
            <h2 className="split-section__title">
              No more shouting at the DJ
            </h2>
            <p className="split-section__desc">
              Submit requests from your phone. See exactly where you are in the queue. 
              Know instantly if your song will be played.
            </p>
            <Link href="/register" className="btn btn--primary btn--pill">
              Create an account
            </Link>
          </div>
          <div className="split-section__visual">
            <span className="split-section__visual-icon">🎧</span>
          </div>
        </div>
      </section>

      {/* For DJs */}
      <section className="split-section">
        <div className="split-section__inner" style={{ direction: 'rtl' }}>
          <div className="split-section__content" style={{ direction: 'ltr' }}>
            <p className="split-section__label">For DJs</p>
            <h2 className="split-section__title">
              Full control, zero chaos
            </h2>
            <p className="split-section__desc">
              Manage requests from a clean dashboard. Accept, decline, or mark songs as played.
              Focus on the music, not the crowd.
            </p>
            <Link href="/dj/login" className="btn btn--secondary btn--pill">
              DJ Dashboard
            </Link>
          </div>
          <div className="split-section__visual" style={{ direction: 'ltr' }}>
            <span className="split-section__visual-icon">🎛️</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-section__gradient" />
        <div className="cta-section__inner">
          <h2 className="cta-section__title">Ready to elevate the experience?</h2>
          <p className="cta-section__subtitle">
            Start your first session in under a minute.
          </p>
          <Link href="/register" className="btn btn--primary btn--lg btn--pill">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <span className="footer__brand">LiveQueue</span>
          <span className="footer__copy">© {new Date().getFullYear()} LiveQueue. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
