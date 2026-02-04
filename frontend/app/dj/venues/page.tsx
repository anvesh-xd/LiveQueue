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
      <main className="manage-page">
        <div className="manage-page__inner">
          <p className="text-muted loading-pulse">Loading</p>
        </div>
      </main>
    );
  }

  const myVenueIds = new Set(myVenues.map((v) => v.id));
  const linkableVenues = allVenues.filter((v) => !myVenueIds.has(v.id));

  return (
    <main className="manage-page">
      <div className="manage-page__inner">
        <header className="manage-page__header">
          <Link href="/dj" className="manage-page__back">← Dashboard</Link>
          <h1 className="manage-page__title">My venues</h1>
          <p className="manage-page__subtitle">Manage where patrons can find you</p>
        </header>

        {error && <p className="auth-page__error" style={{ marginBottom: 'var(--space-6)' }}>{error}</p>}

        {loading ? (
          <p className="text-muted loading-pulse">Loading...</p>
        ) : (
          <>
            <section className="manage-page__section">
              <h2 className="manage-page__section-title">Create new venue</h2>
              <form onSubmit={handleCreate} className="manage-page__form">
                <input
                  type="text"
                  placeholder="Venue name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="manage-page__input"
                  required
                />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  className="manage-page__input"
                />
                <button type="submit" disabled={creating} className="manage-page__btn">
                  {creating ? 'Creating...' : 'Create venue'}
                </button>
              </form>
            </section>

            <section className="manage-page__section">
              <h2 className="manage-page__section-title">Your venues</h2>
              {myVenues.length === 0 ? (
                <p className="text-muted">No venues yet. Create one above.</p>
              ) : (
                myVenues.map((v) => (
                  <div key={v.id} className="venue-item">
                    <div className="venue-item__info">
                      <p className="venue-item__name">{v.name}</p>
                      <p className="venue-item__meta">{v.address || 'No address'}</p>
                    </div>
                  </div>
                ))
              )}
            </section>

            {linkableVenues.length > 0 && (
              <section className="manage-page__section">
                <h2 className="manage-page__section-title">Link to existing venue</h2>
                {linkableVenues.map((v) => (
                  <div key={v.id} className="venue-item">
                    <div className="venue-item__info">
                      <p className="venue-item__name">{v.name}</p>
                      <p className="venue-item__meta">{v.address || 'No address'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLink(v.id)}
                      disabled={linkingId === v.id}
                      className="venue-item__action"
                    >
                      {linkingId === v.id ? 'Linking...' : 'Link'}
                    </button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
