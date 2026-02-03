'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

function RequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const venueId = searchParams.get('venueId');
  const venueName = searchParams.get('venueName') || 'Venue';
  const djId = searchParams.get('djId');
  const djName = searchParams.get('djName') || 'DJ';

  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <main style={styles.main}>
        <p>Please <Link href="/login" style={styles.link}>log in</Link> first.</p>
      </main>
    );
  }

  if (!venueId || !djId) {
    return (
      <main style={styles.main}>
        <p>Missing venue or DJ. <Link href="/venues" style={styles.link}>Pick a venue</Link>.</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/requests', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          venueId,
          djId,
          spotifyTrackId: `manual-${Date.now()}`,
          songTitle,
          artistName,
        }),
      });
      router.push('/my-requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <Link href="/venues" style={styles.back}>← Venues</Link>
        <h1 style={styles.title}>Request a song</h1>
        <p style={styles.subtitle}>{venueName} · {djName}</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <p style={styles.error}>{error}</p>}
          <input
            type="text"
            placeholder="Song title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Artist name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<main style={styles.main}><p>Loading...</p></main>}>
      <RequestForm />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { maxWidth: '400px', margin: '0 auto' },
  back: { display: 'inline-block', marginBottom: '1rem', color: '#667eea', textDecoration: 'none' },
  title: { marginBottom: '0.25rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  error: { margin: 0, color: '#c00', fontSize: '0.9rem' },
  input: { padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' },
  button: { padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  link: { color: '#667eea', fontWeight: '600' },
};
