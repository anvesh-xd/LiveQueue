'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Marquee } from '@/components/Marquee';
import { ArrowRight, ArrowUpRight } from '@/components/Icons';

export default function Home() {
  const { user, loading } = useAuth();
  const landingRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setNow(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

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
  }, [loading, user]);

  if (loading) {
    return (
      <main className="page page--center">
        <span className="loading">Loading floor</span>
      </main>
    );
  }

  if (user) {
    return (
      <main className="home">
        <div className="home__inner">
          <header className="home__head">
            <div>
              <p className="home__greeting">
                <span className="dot" aria-hidden="true" />
                Tonight · welcome back
              </p>
              <h1 className="home__title">
                <em>{user.name.split(' ')[0]}.</em>
              </h1>
            </div>
            <div className="home__time">
              Floor time
              <strong>{now || '—'}</strong>
            </div>
          </header>

          <section className="home__actions" aria-label="Quick actions">
            <Link href="/venues" className="home__action">
              <div className="home__action-top">
                <span className="home__action-num">01 / Floors</span>
                <ArrowUpRight className="home__action-arrow" size={22} />
              </div>
              <div>
                <h2 className="home__action-title">Pick a venue.</h2>
                <p className="home__action-desc">Find a DJ — request a track</p>
              </div>
            </Link>

            <Link href="/my-requests" className="home__action">
              <div className="home__action-top">
                <span className="home__action-num">02 / Setlist</span>
                <ArrowUpRight className="home__action-arrow" size={22} />
              </div>
              <div>
                <h2 className="home__action-title">Your requests.</h2>
                <p className="home__action-desc">Live status — pending, played, more</p>
              </div>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="landing" ref={landingRef}>
      {/* HERO */}
      <section className="hero">
        <div className="hero__left">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-bar" aria-hidden="true" />
            LiveQueue · Est. tonight
          </p>

          <h1 className="hero__headline">
            <span className="hero__headline-line">Skip</span>
            <span className="hero__headline-line">
              <em className="hero__headline-italic">the</em>
            </span>
            <span className="hero__headline-line">
              queue<span className="hero__headline-stamp">Live</span>
            </span>
          </h1>

          <p className="hero__copy">
            Patrons request from their phone. DJs run the floor in real time.
            No shouting over the speakers. <strong>Just tap, search, send.</strong>
          </p>

          <div className="hero__actions">
            <Link href="/register" className="btn btn--primary btn--lg">
              Get in
              <ArrowRight className="btn__arrow" size={14} />
            </Link>
            <Link href="/demo" className="btn btn--ghost btn--lg">
              Try the demo
            </Link>
            <Link href="/dj/login" className="btn btn--outline btn--lg">
              DJs — enter here
            </Link>
          </div>

          <dl className="hero__meta">
            <div className="hero__meta-item">
              <dt className="hero__meta-label">Latency</dt>
              <dd className="hero__meta-value">&lt;200ms</dd>
            </div>
            <div className="hero__meta-item">
              <dt className="hero__meta-label">Channel</dt>
              <dd className="hero__meta-value">Web only</dd>
            </div>
            <div className="hero__meta-item">
              <dt className="hero__meta-label">Stack</dt>
              <dd className="hero__meta-value">Live socket</dd>
            </div>
          </dl>
        </div>

        <div className="hero__right">
          <div className="hero__phone-wrap">
            <span className="hero__phone-tag">
              <span className="dot" aria-hidden="true" />
              Live now
            </span>
            <div className="hero__phone">
              <div className="hero__screen">
                <div className="hero__notch" aria-hidden="true" />
                <div className="hero__ui">
                  <div className="hero__ui-bar">
                    <span className="hero__ui-venue">Evolve · Floor 02</span>
                    <span className="hero__ui-live">
                      <span className="dot" aria-hidden="true" />
                      On air
                    </span>
                  </div>
                  <p className="hero__ui-title"><em>Request a song.</em></p>
                  <div className="hero__ui-search">Search · &quot;Starboy&quot;</div>
                  <div className="hero__ui-list">
                    <div className="hero__ui-track">
                      <div
                        className="hero__ui-track-art"
                        style={{ backgroundImage: 'url(/album-art/Starboy.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                      <div className="hero__ui-track-info">
                        <p className="hero__ui-track-name">Starboy</p>
                        <p className="hero__ui-track-artist">The Weeknd</p>
                      </div>
                    </div>
                    <div className="hero__ui-track">
                      <div
                        className="hero__ui-track-art"
                        style={{ backgroundImage: 'url(/album-art/Levitating.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                      <div className="hero__ui-track-info">
                        <p className="hero__ui-track-name">Levitating</p>
                        <p className="hero__ui-track-artist">Dua Lipa</p>
                      </div>
                    </div>
                    <div className="hero__ui-track">
                      <div
                        className="hero__ui-track-art"
                        style={{ backgroundImage: 'url(/album-art/Save%20your%20tears.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                      <div className="hero__ui-track-info">
                        <p className="hero__ui-track-name">Save Your Tears</p>
                        <p className="hero__ui-track-artist">The Weeknd</p>
                      </div>
                    </div>
                  </div>
                  <div className="hero__ui-btn">Submit · 24s ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="hero-ticker" data-reveal>
        <Marquee
          items={[
            'LIVE NOW',
            'EVOLVE · FLOOR 02',
            'VYNX · MAIN ROOM',
            'HYZE · TERRACE',
            'REQUEST · ACCEPT · PLAYED',
            'NO APP · NO QUEUE',
            'WEB FIRST',
          ]}
          variant="strobe"
        />
      </div>

      {/* STATEMENT — Numbered editorial section */}
      <section className="statement" data-reveal>
        <div className="statement__index">
          <span className="statement__index-num">01</span>
          <span>The Problem</span>
        </div>
        <p className="statement__text">
          <span className="statement__text-muted">No more fighting for the DJ&apos;s attention.</span>{' '}
          Scan. Search. <em>Request.</em>{' '}
          <span className="statement__text-stamp">Done.</span>
        </p>
      </section>

      {/* PROOF */}
      <section className="proof" data-reveal>
        <div className="proof__head">
          <h2 className="proof__title">Three rules of the floor.</h2>
          <span className="proof__count">01 / 02 / 03</span>
        </div>
        <div className="proof__grid">
          <article className="proof__item">
            <span className="proof__item-num">01 · Signal</span>
            <h3 className="proof__item-title"><em>Instant.</em></h3>
            <p className="proof__item-desc">
              Your request lands on the DJ&apos;s deck the moment you press send. WebSocket-tight, sub-200ms.
            </p>
          </article>
          <article className="proof__item">
            <span className="proof__item-num">02 · Status</span>
            <h3 className="proof__item-title"><em>Transparent.</em></h3>
            <p className="proof__item-desc">
              Pending → Accepted → Played. Watch your track move through the queue, never wonder again.
            </p>
          </article>
          <article className="proof__item">
            <span className="proof__item-num">03 · Friction</span>
            <h3 className="proof__item-title"><em>Effortless.</em></h3>
            <p className="proof__item-desc">
              Works on any phone. No download. No new account at every venue. Just the web.
            </p>
          </article>
        </div>
      </section>

      <Marquee
        items={[
          'TONIGHT — TONIGHT — TONIGHT',
          'EST. 2026',
          'BUILT FOR THE FLOOR',
          'PATRON / DJ / VENUE',
          'TAP — SEARCH — SEND',
        ]}
      />

      {/* FINAL CTA */}
      <section className="final-cta" data-reveal>
        <p className="final-cta__eyebrow">
          <span className="dot" aria-hidden="true" />
          Doors are open
        </p>
        <h2 className="final-cta__title">
          Ready? <span className="final-cta__title-stamp">/</span> <em>Let&apos;s.</em>
        </h2>
        <div className="final-cta__actions">
          <Link href="/register" className="btn btn--primary btn--lg">
            Get in
            <ArrowRight className="btn__arrow" size={14} />
          </Link>
          <Link href="/demo" className="btn btn--ghost btn--lg">
            Take the tour
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">
            <div>
              <p className="footer__brand">
                <span className="footer__brand-mark" aria-hidden="true" />
                LiveQueue
              </p>
              <p className="footer__tag">
                Real-time song requests for venues that take the floor seriously.
              </p>
            </div>
            <div>
              <p className="footer__col-title">Patrons</p>
              <nav className="footer__nav">
                <Link href="/register">Sign up</Link>
                <Link href="/login">Sign in</Link>
                <Link href="/venues">Venues</Link>
              </nav>
            </div>
            <div>
              <p className="footer__col-title">DJs</p>
              <nav className="footer__nav">
                <Link href="/dj/login">Sign in</Link>
                <Link href="/dj/register">Apply</Link>
                <Link href="/dj">Dashboard</Link>
              </nav>
            </div>
            <div>
              <p className="footer__col-title">Project</p>
              <nav className="footer__nav">
                <Link href="/demo">Demo</Link>
                <a href="https://github.com/anvesh-xd/LiveQueue" target="_blank" rel="noopener noreferrer">GitHub</a>
              </nav>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="footer__copy">
              © {new Date().getFullYear()} <strong>LiveQueue</strong> — All requests reserved
            </span>
            <span className="footer__copy">Built on the dancefloor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
