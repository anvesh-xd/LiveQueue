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
      <main className="page">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="page">
        <div className="page__content">
          <p className="text-muted">Please <Link href="/login" className="link">log in</Link> to view venues.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__content" style={{ maxWidth: '900px' }}>
        <h1 className="title" style={{ fontSize: 'var(--text-3xl)' }}>Venues</h1>
        <p className="subtitle">Pick a venue and DJ to request a song</p>
        {error && <p className="text-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
        {loading ? (
          <p className="text-muted loading-pulse">Loading venues</p>
        ) : venues.length === 0 ? (
          <p className="text-muted">No venues yet.</p>
        ) : (
          <div className="card-grid">
            {venues.map((venue) => (
              <div key={venue.id} className="listing-card">
                <div className="listing-card__visual" aria-hidden>📍</div>
                <div className="listing-card__body">
                  <div className="listing-card__title">{venue.name}</div>
                  <div className="listing-card__meta">
                    {venue.address || 'No address'}
                    {venue.djs.length > 0 && ` · ${venue.djs.length} DJ${venue.djs.length > 1 ? 's' : ''}`}
                  </div>
                  {venue.djs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {venue.djs.map((dj) => (
                        <Link
                          key={dj.id}
                          href={`/request?venueId=${encodeURIComponent(venue.id)}&venueName=${encodeURIComponent(venue.name)}&djId=${encodeURIComponent(dj.id)}&djName=${encodeURIComponent(dj.name)}`}
                          className="listing-card__action"
                        >
                          Request a song · {dj.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-dim" style={{ fontSize: 'var(--text-sm)' }}>No DJ assigned</span>
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
