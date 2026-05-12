'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDjAuth } from '@/context/DjAuthContext';
import { VenueLogo } from '@/components/VenueLogo';
import { apiFetch, type Venue } from '@/lib/api';
import { ArrowLeft, ArrowRight } from '@/components/Icons';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="page__shell">
          <span className="loading">Loading</span>
        </div>
      </main>
    );
  }

  const myVenueIds = new Set(myVenues.map((v) => v.id));
  const linkableVenues = allVenues.filter((v) => !myVenueIds.has(v.id));

  return (
    <main className="page">
      <div className="page__shell" style={{ maxWidth: 860 }}>
        <Link href="/dj" className="back-link">
          <ArrowLeft size={12} />
          Back to floor
        </Link>

        <header className="page__header">
          <p className="page__eyebrow">
            <span className="dot" />
            Venue ops
          </p>
          <h1 className="page__title">
            Your <em>venues.</em>
          </h1>
          <p className="page__subtitle">Manage the floors where patrons can find you.</p>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        {loading ? (
          <span className="loading">Loading</span>
        ) : (
          <>
            <section className="section">
              <div className="section__head">
                <span className="section__title">
                  <span className="section__title-num">01</span>
                  New venue
                </span>
              </div>
              <form onSubmit={handleCreate} className="manage__form">
                <div className="manage__field">
                  <label className="manage__label" htmlFor="venue-name">Venue name</label>
                  <input
                    id="venue-name"
                    type="text"
                    placeholder="Evolve, VyNX, your floor…"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="manage__input"
                    required
                  />
                </div>
                <div className="manage__field">
                  <label className="manage__label" htmlFor="venue-addr">Address (optional)</label>
                  <input
                    id="venue-addr"
                    type="text"
                    placeholder="Street, city"
                    value={createAddress}
                    onChange={(e) => setCreateAddress(e.target.value)}
                    className="manage__input"
                  />
                </div>
                <button type="submit" disabled={creating} className="manage__btn">
                  {creating ? 'Creating…' : (
                    <>
                      Create venue
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="section">
              <div className="section__head">
                <span className="section__title">
                  <span className="section__title-num">02</span>
                  Your venues
                </span>
                <span className="section__count">{String(myVenues.length).padStart(2, '0')} linked</span>
              </div>
              {myVenues.length === 0 ? (
                <p className="text-muted" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  No venues yet. Create one above.
                </p>
              ) : (
                myVenues.map((v) => (
                  <div key={v.id} className="venue-row">
                    <VenueLogo name={v.name} logoUrl={v.logoUrl} variant="list" />
                    <div className="venue-row__info">
                      <p className="venue-row__name">{v.name}</p>
                      <p className="venue-row__meta">{v.address || '— No address —'}</p>
                    </div>
                    <span className="venue-row__badge">
                      <span className="dot" aria-hidden="true" />
                      Linked
                    </span>
                  </div>
                ))
              )}
            </section>

            {linkableVenues.length > 0 && (
              <section className="section">
                <div className="section__head">
                  <span className="section__title">
                    <span className="section__title-num">03</span>
                    Link existing
                  </span>
                  <span className="section__count">{String(linkableVenues.length).padStart(2, '0')} available</span>
                </div>
                {linkableVenues.map((v) => (
                  <div key={v.id} className="venue-row">
                    <VenueLogo name={v.name} logoUrl={v.logoUrl} variant="list" />
                    <div className="venue-row__info">
                      <p className="venue-row__name">{v.name}</p>
                      <p className="venue-row__meta">{v.address || '— No address —'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLink(v.id)}
                      disabled={linkingId === v.id}
                      className="venue-row__action"
                    >
                      {linkingId === v.id ? 'Linking…' : 'Link'}
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
