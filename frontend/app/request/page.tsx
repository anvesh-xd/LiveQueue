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
      <main className="request-page">
        <div className="request-page__content">
          <div className="empty-state">
            <div className="empty-state__icon">🔒</div>
            <h2 className="empty-state__title">Sign in required</h2>
            <p className="empty-state__desc">
              Please <Link href="/login" className="link">log in</Link> to request songs.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!venueId || !djId) {
    return (
      <main className="request-page">
        <div className="request-page__content">
          <div className="empty-state">
            <div className="empty-state__icon">📍</div>
            <h2 className="empty-state__title">No venue selected</h2>
            <p className="empty-state__desc">
              <Link href="/venues" className="link">Pick a venue</Link> to get started.
            </p>
          </div>
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
      if (results.length === 0) setSearchError('No tracks found. Try different keywords.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg.includes('Spotify') ? 'Search unavailable. Enter manually below.' : msg);
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
        setError('Select a song from search or enter details manually.');
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
    <main className="request-page">
      <div className="request-page__content">
        <Link href="/venues" className="request-page__back">
          ← Back to venues
        </Link>

        <header className="request-page__header">
          <h1 className="request-page__title">Request a song</h1>
          <p className="request-page__venue">{venueName} · {djName}</p>
        </header>

        {error && <p className="auth-page__error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

        <form onSubmit={handleSearch} className="request-page__search">
          <input
            type="text"
            placeholder="Search for a song..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="request-page__search-input"
          />
          <button type="submit" disabled={searching} className="request-page__search-btn">
            {searching ? '...' : 'Search'}
          </button>
        </form>

        {searchError && <p className="text-error" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{searchError}</p>}

        {searchResults.length > 0 && (
          <div className="request-page__results">
            {searchResults.map((t) => (
              <div
                key={t.id}
                className={`request-page__result ${selectedTrack?.id === t.id ? 'request-page__result--selected' : ''}`}
                onClick={() => setSelectedTrack(t)}
              >
                {t.albumArtUrl ? (
                  <img src={t.albumArtUrl} alt="" className="request-page__result-art" />
                ) : (
                  <div className="request-page__result-art" />
                )}
                <div className="request-page__result-info">
                  <p className="request-page__result-title">{t.songTitle}</p>
                  <p className="request-page__result-artist">{t.artistName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTrack && (
          <p className="text-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Selected: <strong>{selectedTrack.songTitle}</strong> by {selectedTrack.artistName}
            <button
              type="button"
              onClick={() => setSelectedTrack(null)}
              style={{ marginLeft: 'var(--space-2)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
            >
              Change
            </button>
          </p>
        )}

        <div className="request-page__divider">or enter manually</div>

        <form onSubmit={handleSubmit} className="request-page__manual">
          <input
            type="text"
            placeholder="Song title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="request-page__manual-input"
          />
          <input
            type="text"
            placeholder="Artist name"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            className="request-page__manual-input"
          />
          <button type="submit" disabled={loading} className="request-page__submit">
            {loading ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<main className="request-page"><div className="request-page__content"><p className="text-muted loading-pulse">Loading</p></div></main>}>
      <RequestForm />
    </Suspense>
  );
}
