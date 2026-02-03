'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';
import { apiFetch, type Venue } from '@/lib/api';

export default function DjVenuesPage() {
  const router = useRouter();
  const { djUser, djToken, loading: authLoading } = useDjAuth();
  const [myVenues, setMyVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createName, setCreateName] = useState('');
  const [createAddress, setCreateAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!djUser) {
      router.replace('/dj/login');
    }
  }, [authLoading, djUser, router]);

  function fetchMyVenues() {
    if (!djToken) return;
    apiFetch<Venue[]>('/venues/dj', { token: djToken })
      .then(setMyVenues)
      .catch(() => setMyVenues([]));
  }

  function fetchAllVenues() {
    apiFetch<Venue[]>('/venues')
      .then(setAllVenues)
      .catch(() => setAllVenues([]));
  }

  useEffect(() => {
    if (!djUser) return;
    setLoading(true);
    Promise.all([
      djToken ? apiFetch<Venue[]>('/venues/dj', { token: djToken }) : Promise.resolve([]),
      apiFetch<Venue[]>('/venues'),
    ])
      .then(([mine, all]) => {
        setMyVenues(mine);
        setAllVenues(all);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load venues'))
      .finally(() => setLoading(false));
  }, [djUser?.id, djToken]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !djToken) return;
    setError('');
    setCreating(true);
    try {
      const venue = await apiFetch<Venue>('/venues', {
        method: 'POST',
        token: djToken,
        body: JSON.stringify({ name: createName.trim(), address: createAddress.trim() || undefined }),
      });
      setMyVenues((prev) => [...prev, venue]);
      setAllVenues((prev) => (prev.some((v) => v.id === venue.id) ? prev : [...prev, venue]));
      setCreateName('');
      setCreateAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create venue');
    } finally {
      setCreating(false);
    }
  }

  async function handleLink(venueId: string) {
    if (!djToken) return;
    setError('');
    setLinkingId(venueId);
    try {
      const venue = await apiFetch<Venue>(`/venues/${venueId}/link`, {
        method: 'POST',
        token: djToken,
      });
      setMyVenues((prev) => (prev.some((v) => v.id === venue.id) ? prev : [...prev, venue]));
      setAllVenues((prev) => prev.map((v) => (v.id === venue.id ? venue : v)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link to venue');
    } finally {
      setLinkingId(null);
    }
  }

  if (authLoading || !djUser) {
    return (
      <main className="page">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }

  const myVenueIds = new Set(myVenues.map((v) => v.id));
  const linkableVenues = allVenues.filter((v) => !myVenueIds.has(v.id));

  return (
    <main className="page">
      <div className="page__content">
        <h1 className="title">My venues</h1>
        <p className="subtitle">Create a venue or link yourself to an existing one. Patrons will see these when requesting songs.</p>
        <div className="flex-row" style={{ marginBottom: 'var(--space-6)' }}>
          <Link href="/dj" className="back-link">← Dashboard</Link>
        </div>
        {error && <p className="text-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

        {loading ? (
          <p className="text-muted">Loading venues...</p>
        ) : (
          <>
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                Create a new venue
              </h2>
              <form onSubmit={handleCreate} className="form" style={{ maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Venue name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  className="input"
                />
                <button type="submit" disabled={creating} className="btn btn--primary">
                  {creating ? 'Creating...' : 'Create venue'}
                </button>
              </form>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                Your venues
              </h2>
              {myVenues.length === 0 ? (
                <p className="text-muted">You haven’t created or linked to any venues yet.</p>
              ) : (
                <ul className="list">
                  {myVenues.map((v) => (
                    <li key={v.id} className="list-item">
                      <strong>{v.name}</strong>
                      {v.address && <span className="text-muted"> — {v.address}</span>}
                      <div className="text-dim" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {v.djs.length > 0 ? `DJs: ${v.djs.map((d) => d.name).join(', ')}` : 'No other DJs linked'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                Link to an existing venue
              </h2>
              {linkableVenues.length === 0 ? (
                <p className="text-muted">All venues are already linked to you, or there are no other venues yet.</p>
              ) : (
                <ul className="list">
                  {linkableVenues.map((v) => (
                    <li key={v.id} className="list-item flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <div>
                        <strong>{v.name}</strong>
                        {v.address && <span className="text-muted"> — {v.address}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLink(v.id)}
                        disabled={linkingId === v.id}
                        className="btn btn--ghost btn--sm"
                      >
                        {linkingId === v.id ? 'Linking...' : 'Link me'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
