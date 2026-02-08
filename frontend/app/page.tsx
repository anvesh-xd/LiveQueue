'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!landingRef.current) return;

    const elements = landingRef.current.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <main className="page page--center">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }

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
                    <span>Explore</span>
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
                    <span>View</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="landing" ref={landingRef}>
      {/* HERO */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__headline">
            Skip the queue.
          </h1>

          <p className="hero__copy">
            Real-time song requests for live venues.
          </p>

          <div className="hero__actions">
            <Link href="/register" className="hero__cta-btn">
              Get started
            </Link>
            <Link href="/dj/login" className="hero__secondary-link">
              I&apos;m a DJ
            </Link>
          </div>
        </div>

        <div className="hero__device">
          <div className="hero__phone">
            <div className="hero__screen">
              <div className="hero__notch" />
              <div className="hero__ui">
                <p className="hero__ui-venue">The Blue Room</p>
                <p className="hero__ui-title">Request a song</p>
                <div className="hero__ui-search">Search for a song...</div>
                <div className="hero__ui-track">
                  <div className="hero__ui-track-art" style={{ backgroundImage: 'url(/album-art/Starboy.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="hero__ui-track-info">
                    <p className="hero__ui-track-name">Starboy</p>
                    <p className="hero__ui-track-artist">The Weeknd</p>
                  </div>
                </div>
                <div className="hero__ui-track">
                  <div className="hero__ui-track-art" style={{ backgroundImage: 'url(/album-art/Levitating.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="hero__ui-track-info">
                    <p className="hero__ui-track-name">Levitating</p>
                    <p className="hero__ui-track-artist">Dua Lipa</p>
                  </div>
                </div>
                <div className="hero__ui-track">
                  <div className="hero__ui-track-art" style={{ backgroundImage: 'url(/album-art/Save%20your%20tears.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="hero__ui-track-info">
                    <p className="hero__ui-track-name">Save Your Tears</p>
                    <p className="hero__ui-track-artist">The Weeknd</p>
                  </div>
                </div>
                <div className="hero__ui-track">
                  <div className="hero__ui-track-art" style={{ backgroundImage: 'url(/album-art/Sour.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="hero__ui-track-info">
                    <p className="hero__ui-track-name">Good 4 U</p>
                    <p className="hero__ui-track-artist">Olivia Rodrigo</p>
                  </div>
                </div>
                <div className="hero__ui-btn">Submit request</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="statement" data-reveal>
        <p className="statement__text">
          <span className="statement__text-muted">No more fighting for the DJ&apos;s attention.</span>{' '}
          Scan. Search. Request.{' '}
          <span className="statement__text-accent">Done.</span>
        </p>
      </section>

      {/* PROOF */}
      <section className="proof" data-reveal>
        <div className="proof__inner">
          <div className="proof__item">
            <h3 className="proof__title">Instant</h3>
            <p className="proof__desc">
              Your request hits the DJ&apos;s screen the moment you submit.
            </p>
          </div>
          <div className="proof__item">
            <h3 className="proof__title">Transparent</h3>
            <p className="proof__desc">
              See when your song is accepted, declined, or playing.
            </p>
          </div>
          <div className="proof__item">
            <h3 className="proof__title">Effortless</h3>
            <p className="proof__desc">
              Works on any phone. No app download needed.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" data-reveal>
        <div className="final-cta__inner">
          <h2 className="final-cta__title">Ready?</h2>
          <Link href="/register" className="btn btn--white btn--lg btn--pill">
            Get started
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            <span className="footer__brand">LiveQueue</span>
            <nav className="footer__nav">
              <Link href="/register">Sign up</Link>
              <Link href="/login">Log in</Link>
              <Link href="/dj/login">For DJs</Link>
            </nav>
          </div>
          <div className="footer__bottom">
            <span className="footer__copy">&copy; {new Date().getFullYear()} LiveQueue. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
