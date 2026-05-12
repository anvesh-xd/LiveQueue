'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type DeezerTrack } from '@/lib/api';
import { ArrowRight, ArrowLeft } from '@/components/Icons';

function RequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const venueId = searchParams.get('venueId');
  const venueName = searchParams.get('venueName') || 'Venue';
  const djId = searchParams.get('djId');
  const djName = searchParams.get('djName') || 'DJ';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<DeezerTrack | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <main className="request">
        <div className="request__shell">
          <div className="empty">
            <p className="empty__mark">
              <span className="dot" />
              Locked door
            </p>
            <h2 className="empty__title"><em>Sign in required.</em></h2>
            <p className="empty__desc">
              <Link href="/login" className="link link--strobe">Sign in</Link> to request songs.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!venueId || !djId) {
    return (
      <main className="request">
        <div className="request__shell">
          <div className="empty">
            <p className="empty__mark">
              <span className="dot dot--idle" />
              No venue selected
            </p>
            <h2 className="empty__title"><em>Pick a floor first.</em></h2>
            <p className="empty__desc">
              <Link href="/venues" className="link link--strobe">Browse venues</Link> to get started.
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
      const results = await apiFetch<DeezerTrack[]>(`/deezer/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(results);
      if (results.length === 0) setSearchError('No tracks found. Try different keywords.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg.includes('Deezer') ? 'Search unavailable. Enter manually below.' : msg);
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
            deezerTrackId: selectedTrack.id,
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
            deezerTrackId: `manual-${Date.now()}`,
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
    <main className="request">
      <div className="request__shell">
        <Link href="/venues" className="back-link">
          <ArrowLeft size={12} />
          Back to venues
        </Link>

        <header className="request__head">
          <p className="request__eyebrow">
            <span className="dot" />
            New request
          </p>
          <h1 className="request__title"><em>Send a song.</em></h1>
          <p className="request__venue">
            <strong>{venueName}</strong> · DJ {djName}
          </p>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        <form onSubmit={handleSearch} className="request__search">
          <input
            type="text"
            placeholder="Search a song or artist…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="request__search-input"
          />
          <button type="submit" disabled={searching} className="request__search-btn">
            {searching ? '…' : 'Search'}
          </button>
        </form>

        {searchError && <p className="text-error" style={{ marginBottom: 16 }}>{searchError}</p>}

        {searchResults.length > 0 && (
          <div className="request__results">
            {searchResults.map((t) => (
              <div
                key={t.id}
                className={`request__result ${selectedTrack?.id === t.id ? 'request__result--selected' : ''}`}
                onClick={() => setSelectedTrack(t)}
              >
                {t.albumArtUrl ? (
                  <img src={t.albumArtUrl} alt="" className="request__result-art" />
                ) : (
                  <div className="request__result-art" />
                )}
                <div className="request__result-info">
                  <p className="request__result-title">{t.songTitle}</p>
                  <p className="request__result-artist">{t.artistName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTrack && (
          <div className="request__selected">
            <span className="request__selected-info">
              Selected · <strong>{selectedTrack.songTitle}</strong> — {selectedTrack.artistName}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTrack(null)}
              className="request__selected-change"
            >
              Change
            </button>
          </div>
        )}

        <div className="request__divider">or enter manually</div>

        <form onSubmit={handleSubmit} className="request__manual">
          <div className="request__manual-field">
            <label className="request__manual-label" htmlFor="manual-title">Song title</label>
            <input
              id="manual-title"
              type="text"
              placeholder="What's the track?"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="request__manual-input"
            />
          </div>
          <div className="request__manual-field">
            <label className="request__manual-label" htmlFor="manual-artist">Artist</label>
            <input
              id="manual-artist"
              type="text"
              placeholder="Who plays it?"
              value={manualArtist}
              onChange={(e) => setManualArtist(e.target.value)}
              className="request__manual-input"
            />
          </div>
          <button type="submit" disabled={loading} className="request__submit">
            {loading ? 'Sending…' : 'Send request'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <main className="request">
          <div className="request__shell">
            <span className="loading">Loading</span>
          </div>
        </main>
      }
    >
      <RequestForm />
    </Suspense>
  );
}
