'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type Venue } from '@/lib/api';

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
      <main className="browse-page">
        <div className="browse-page__inner">
          <p className="text-muted loading-pulse">Loading</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="browse-page">
        <div className="browse-page__inner">
          <div className="empty-state">
            <div className="empty-state__icon">🔒</div>
            <h2 className="empty-state__title">Sign in required</h2>
            <p className="empty-state__desc">
              Please <Link href="/login" className="link">log in</Link> to browse venues.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="browse-page">
      <div className="browse-page__inner">
        <header className="browse-page__header">
          <h1 className="browse-page__title">Venues</h1>
          <p className="browse-page__subtitle">Pick a venue to request a song</p>
        </header>

        {error && <p className="auth-page__error" style={{ marginBottom: 'var(--space-6)' }}>{error}</p>}

        {loading ? (
          <p className="text-muted loading-pulse">Loading venues...</p>
        ) : venues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📍</div>
            <h2 className="empty-state__title">No venues yet</h2>
            <p className="empty-state__desc">Check back later for available venues.</p>
          </div>
        ) : (
          <div className="venue-grid">
            {venues.map((venue) => (
              <div key={venue.id} className="venue-card">
                <div className="venue-card__header">
                  <h2 className="venue-card__name">{venue.name}</h2>
                  <p className="venue-card__address">{venue.address || 'No address listed'}</p>
                </div>
                <div className="venue-card__body">
                  {venue.djs.length > 0 ? (
                    <div className="venue-card__dj-list">
                      {venue.djs.map((dj) => (
                        <Link
                          key={dj.id}
                          href={`/request?venueId=${encodeURIComponent(venue.id)}&venueName=${encodeURIComponent(venue.name)}&djId=${encodeURIComponent(dj.id)}&djName=${encodeURIComponent(dj.name)}`}
                          className="venue-card__dj-btn"
                        >
                          <span>Request · {dj.name}</span>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 4l4 4-4 4" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="venue-card__empty">No DJs available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
