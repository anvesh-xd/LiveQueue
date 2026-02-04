'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="page page--center">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }

  // Logged-in view — clean dashboard
  if (user) {
    return (
      <main className="dashboard">
        <div className="dashboard__inner">
          <header className="dashboard__header">
            <p className="dashboard__greeting">Welcome back</p>
            <h1 className="dashboard__title">{user.name}</h1>
          </header>

          <section className="dashboard__section">
            <div className="venue-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <Link href="/venues" className="venue-card" style={{ textDecoration: 'none' }}>
                <div className="venue-card__header">
                  <h2 className="venue-card__name">Browse venues</h2>
                  <p className="venue-card__address">Find a DJ, request a song</p>
                </div>
                <div className="venue-card__body">
                  <div className="venue-card__dj-btn" style={{ justifyContent: 'center' }}>
                    <span>Explore →</span>
                  </div>
                </div>
              </Link>

              <Link href="/my-requests" className="venue-card" style={{ textDecoration: 'none' }}>
                <div className="venue-card__header">
                  <h2 className="venue-card__name">My requests</h2>
                  <p className="venue-card__address">Track your song requests</p>
                </div>
                <div className="venue-card__body">
                  <div className="venue-card__dj-btn" style={{ justifyContent: 'center' }}>
                    <span>View →</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Iconic landing page
  return (
    <div className="landing">
      {/* === HERO === */}
      <section className="hero">
        {/* Signature: Equalizer bars */}
        <div className="hero__equalizer" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="hero__bar" />
          ))}
        </div>

        <div className="hero__content">
          <p className="hero__label">Song requests, evolved</p>
          
          <h1 className="hero__headline">
            <span className="hero__headline-word">Skip the</span>
            <span className="hero__headline-word hero__headline-accent">queue.</span>
          </h1>
          
          <p className="hero__copy">
            Request songs at live events. Get real-time updates. No shouting required.
          </p>

          <div className="hero__cta">
            <Link href="/register" className="hero__cta-btn">
              Start requesting
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>

          <div className="hero__secondary">
            <Link href="/dj/login" className="hero__secondary-link">
              I&apos;m a DJ →
            </Link>
          </div>
        </div>
      </section>

      {/* === STATEMENT === */}
      <section className="statement">
        <div className="statement__inner">
          <p className="statement__text">
            <span className="statement__text-muted">No more fighting for the DJ&apos;s attention.</span>{' '}
            Scan. Search. Request.{' '}
            <span className="statement__text-accent">Done.</span>
          </p>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="features">
        <div className="features__inner">
          <div className="features__header">
            <p className="features__label">Why LiveQueue</p>
            <h2 className="features__title">Built for the floor, not the office.</h2>
          </div>

          <div className="features__grid">
            <div className="feature-card">
              <div className="feature-card__icon">⚡</div>
              <h3 className="feature-card__title">Instant delivery</h3>
              <p className="feature-card__desc">
                Your request hits the DJ&apos;s screen the moment you submit. No delays. No lost slips.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">👁️</div>
              <h3 className="feature-card__title">Live status</h3>
              <p className="feature-card__desc">
                Know exactly when your song is accepted, declined, or playing. No more wondering.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🎛️</div>
              <h3 className="feature-card__title">DJ control</h3>
              <p className="feature-card__desc">
                DJs manage their queue from a clean dashboard. Accept, decline, or mark as played with one tap.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">📱</div>
              <h3 className="feature-card__title">Zero friction</h3>
              <p className="feature-card__desc">
                Scan a QR code, pick your song, submit. Works on any phone. No app download needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === PRODUCT PREVIEW === */}
      <section className="preview">
        <div className="preview__glow" />
        <p className="preview__label">The experience</p>
        <h2 className="preview__title">Request in seconds.</h2>
        
        <div className="preview__device">
          <div className="preview__phone">
            <div className="preview__screen">
              <div className="preview__notch" />
              <div className="preview__ui">
                <div className="preview__ui-header">
                  <p className="preview__ui-venue">The Blue Room</p>
                  <p className="preview__ui-title">Request a song</p>
                </div>
                <div className="preview__ui-search">Search for a song...</div>
                <div className="preview__ui-track">
                  <div className="preview__ui-track-art" />
                  <div className="preview__ui-track-info">
                    <p className="preview__ui-track-title">Blinding Lights</p>
                    <p className="preview__ui-track-artist">The Weeknd</p>
                  </div>
                </div>
                <div className="preview__ui-track preview__ui-track--active">
                  <div className="preview__ui-track-art" />
                  <div className="preview__ui-track-info">
                    <p className="preview__ui-track-title">Levitating</p>
                    <p className="preview__ui-track-artist">Dua Lipa</p>
                  </div>
                </div>
                <div className="preview__ui-btn">Submit request</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="final-cta">
        <div className="final-cta__inner">
          <h2 className="final-cta__title">
            Ready to skip the{' '}
            <span className="final-cta__title-accent">queue</span>?
          </h2>
          <p className="final-cta__subtitle">
            Free to use. No app required.
          </p>
          <Link href="/register" className="btn btn--white btn--lg btn--pill">
            Get started
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="footer">
        <div className="footer__inner">
          <span className="footer__brand">LiveQueue</span>
          <span className="footer__copy">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
