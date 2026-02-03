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

  if (authLoading) return <main style={styles.main}><p>Loading...</p></main>;
  if (!user) {
    return (
      <main style={styles.main}>
        <p>Please <Link href="/login" style={styles.link}>log in</Link> to view venues.</p>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Venues</h1>
        <p style={styles.subtitle}>Pick a venue to request a song</p>
        <Link href="/" style={styles.back}>← Home</Link>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? (
          <p>Loading venues...</p>
        ) : venues.length === 0 ? (
          <p style={styles.empty}>No venues yet.</p>
        ) : (
          <ul style={styles.list}>
            {venues.map((venue) => (
              <li key={venue.id} style={styles.item}>
                <div>
                  <strong>{venue.name}</strong>
                  {venue.address && <span style={styles.address}> — {venue.address}</span>}
                </div>
                {venue.djs.length > 0 ? (
                  venue.djs.map((dj) => (
                    <Link
                      key={dj.id}
                      href={`/request?venueId=${encodeURIComponent(venue.id)}&venueName=${encodeURIComponent(venue.name)}&djId=${encodeURIComponent(dj.id)}&djName=${encodeURIComponent(dj.name)}`}
                      style={styles.requestLink}
                    >
                      Request a song (DJ: {dj.name})
                    </Link>
                  ))
                ) : (
                  <span style={styles.noDj}>No DJ assigned</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  wrapper: { maxWidth: '600px', margin: '0 auto' },
  title: { marginBottom: '0.25rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { marginBottom: '1.5rem', color: '#666' },
  back: { display: 'inline-block', marginBottom: '1rem', color: '#667eea', textDecoration: 'none' },
  error: { color: '#c00', marginBottom: '1rem' },
  empty: { color: '#666' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '0.75rem' },
  address: { color: '#666', fontSize: '0.9rem' },
  requestLink: { display: 'inline-block', marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#667eea', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem' },
  noDj: { color: '#999', fontSize: '0.9rem' },
  link: { color: '#667eea', fontWeight: '600' },
};
