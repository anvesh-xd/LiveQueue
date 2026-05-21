'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VenueLogo } from '@/components/VenueLogo';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type Venue } from '@/lib/api';
import { ArrowUpRight } from '@/components/Icons';

export default function VenuesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<Venue[]>('/venues')
      .then(setVenues)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load venues'))
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading) {
    return (
      <main className="page">
        <div className="page__shell">
          <span className="loading">Loading floors</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page page--center">
        <div className="page__shell">
          <div className="empty">
            <p className="empty__mark">
              <span className="dot" />
              Locked door
            </p>
            <h2 className="empty__title"><em>Sign in required.</em></h2>
            <p className="empty__desc">
              <Link href="/login" className="link link--strobe">Sign in</Link> to browse venues and request songs.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__shell">
        <header className="page__header">
          <p className="page__eyebrow">
            <span className="dot" />
            Tonight · live floors
          </p>
          <h1 className="page__title">
            Pick <em>a venue.</em>
          </h1>
          <p className="page__subtitle">Find a DJ on the deck and send your track.</p>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        {loading ? (
          <span className="loading">Loading venues</span>
        ) : venues.length === 0 ? (
          <div className="empty">
            <p className="empty__mark">
              <span className="dot dot--idle" />
              No floors live
            </p>
            <h2 className="empty__title"><em>No venues yet.</em></h2>
            <p className="empty__desc">
              No DJs have set up a venue yet. Check back soon, or ask a DJ to add their floor.
            </p>
          </div>
        ) : (
          <div className="venue-grid">
            {venues.map((venue, i) => (
              <article key={venue.id} className="venue-card">
                <div className="venue-card__top">
                  <span className="venue-card__index">
                    {String(i + 1).padStart(2, '0')} / {String(venues.length).padStart(2, '0')}
                  </span>
                  <span className="venue-card__live">
                    <span className="dot" />
                    Live
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <VenueLogo name={venue.name} logoUrl={venue.logoUrl} />
                  <div className="venue-card__heading">
                    <h2 className="venue-card__name">{venue.name}</h2>
                    <p className="venue-card__address">{venue.address || '— No address listed —'}</p>
                  </div>
                </div>

                <div className="venue-card__djs">
                  {venue.djs.length > 0 ? (
                    venue.djs.map((dj) => (
                      <Link
                        key={dj.id}
                        href={`/request?venueId=${encodeURIComponent(venue.id)}&venueName=${encodeURIComponent(venue.name)}&djId=${encodeURIComponent(dj.id)}&djName=${encodeURIComponent(dj.name)}`}
                        className="venue-card__dj"
                      >
                        <span className="venue-card__dj-name">{dj.name}</span>
                        <ArrowUpRight className="venue-card__dj-arrow" size={14} />
                      </Link>
                    ))
                  ) : (
                    <p className="venue-card__empty">— No DJ on the deck —</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
