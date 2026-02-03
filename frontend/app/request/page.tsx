'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type SpotifyTrack } from '@/lib/api';

function RequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const venueId = searchParams.get('venueId');
  const venueName = searchParams.get('venueName') || 'Venue';
  const djId = searchParams.get('djId');
  const djName = searchParams.get('djName') || 'DJ';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <main className="page">
        <div className="page__content">
          <p className="text-muted">Please <Link href="/login" className="link">log in</Link> first.</p>
        </div>
      </main>
    );
  }

  if (!venueId || !djId) {
    return (
      <main className="page">
        <div className="page__content">
          <p className="text-muted">Missing venue or DJ. <Link href="/venues" className="link">Pick a venue</Link>.</p>
        </div>
      </main>
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError('');
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await apiFetch<SpotifyTrack[]>(`/spotify/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(results);
      if (results.length === 0) setSearchError('No tracks found. Try different words or add artist name.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg.includes('Spotify') ? 'Spotify search is not set up. Use manual entry below.' : msg);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (selectedTrack) {
        await apiFetch('/requests', {
          method: 'POST',
          token: token!,
          body: JSON.stringify({
            venueId,
            djId,
            spotifyTrackId: selectedTrack.id,
            songTitle: selectedTrack.songTitle,
            artistName: selectedTrack.artistName,
            albumArtUrl: selectedTrack.albumArtUrl,
          }),
        });
      } else if (manualTitle.trim() && manualArtist.trim()) {
        await apiFetch('/requests', {
          method: 'POST',
          token: token!,
          body: JSON.stringify({
            venueId,
            djId,
            spotifyTrackId: `manual-${Date.now()}`,
            songTitle: manualTitle.trim(),
            artistName: manualArtist.trim(),
          }),
        });
      } else {
        setError('Search for a song and pick one, or enter song and artist manually.');
        setLoading(false);
        return;
      }
      router.push('/my-requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page__content card card--glass" style={{ maxWidth: '480px', padding: 'var(--space-8)' }}>
        <Link href="/venues" className="back-link">← Venues</Link>
        <h1 className="title" style={{ fontSize: 'var(--text-3xl)' }}>Request a song</h1>
        <p className="subtitle" style={{ marginBottom: 'var(--space-4)' }}>{venueName} · {djName}</p>

        <form onSubmit={handleSearch} className="flex-row" style={{ marginBottom: 'var(--space-2)' }}>
          <input
            type="text"
            placeholder="Search for a song or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ flex: 1, minWidth: 0 }}
          />
          <button type="submit" disabled={searching} className="btn btn--success btn--sm" style={{ whiteSpace: 'nowrap' }}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
        {searchError && <p className="text-error" style={{ marginBottom: 'var(--space-3)' }}>{searchError}</p>}
        {searchResults.length > 0 && (
          <ul className="result-list">
            {searchResults.map((t) => (
              <li
                key={t.id}
                className={`result-item ${selectedTrack?.id === t.id ? 'result-item--selected' : ''}`}
                onClick={() => setSelectedTrack(t)}
              >
                {t.albumArtUrl && (
                  <img src={t.albumArtUrl} alt="" className="result-item__thumb" />
                )}
                <div>
                  <strong>{t.songTitle}</strong>
                  <span className="text-muted"> — {t.artistName}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {selectedTrack && (
          <p className="text-muted" style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
            Selected: <strong>{selectedTrack.songTitle}</strong> — {selectedTrack.artistName}
            <button type="button" onClick={() => setSelectedTrack(null)} className="btn btn--ghost btn--sm" style={{ marginLeft: 'var(--space-2)' }}>
              Change
            </button>
          </p>
        )}

        <p className="text-dim" style={{ textAlign: 'center', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
          — or enter manually —
        </p>
        <form onSubmit={handleSubmit} className="form">
          {error && <p className="text-error">{error}</p>}
          <input
            type="text"
            placeholder="Song title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Artist name"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            className="input"
          />
          <button type="submit" disabled={loading} className="btn btn--primary btn--pill">
            {loading ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<main className="page page--center"><p className="text-muted loading-pulse">Loading</p></main>}>
      <RequestForm />
    </Suspense>
  );
}
