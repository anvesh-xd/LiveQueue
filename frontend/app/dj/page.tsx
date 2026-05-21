'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useDjAuth } from '@/context/DjAuthContext';
import { apiFetch, type SongRequest } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DjDashboardPage() {
  const router = useRouter();
  const { djUser, djToken, loading: authLoading } = useDjAuth();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [clock, setClock] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!djUser) {
      router.replace('/dj/login');
    }
  }, [authLoading, djUser, router]);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setClock(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  function fetchRequests() {
    if (!djToken) return;
    apiFetch<SongRequest[]>('/requests/dj', { token: djToken })
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load requests'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!djToken || !djUser) return;
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djToken, djUser?.id]);

  useEffect(() => {
    if (!djUser?.id || !djToken) return;
    const socket = io(API_URL, {
      path: '/',
      transports: ['websocket', 'polling'],
      auth: { token: djToken },
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join', { djId: djUser.id });
    });
    socket.on('request:new', () => fetchRequests());
    socket.on('request:updated', () => fetchRequests());
    socket.on('queue:reordered', () => fetchRequests());
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djUser?.id, djToken]);

  async function updateStatus(id: string, status: 'accepted' | 'declined' | 'played') {
    if (!djToken) return;
    setUpdating(id);
    try {
      await apiFetch(`/requests/${id}`, {
        method: 'PATCH',
        token: djToken,
        body: JSON.stringify({ status }),
      });
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  }

  async function move(id: string, direction: 'up' | 'down') {
    if (!djToken) return;
    const ordered = requests
      .filter((r) => r.status === 'accepted')
      .slice()
      .sort((a, b) => {
        const pa = a.position ?? Number.MAX_SAFE_INTEGER;
        const pb = b.position ?? Number.MAX_SAFE_INTEGER;
        if (pa !== pb) return pa - pb;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    const idx = ordered.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= ordered.length) return;

    const next = ordered.slice();
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    const optimistic = next.map((r, i) => ({ ...r, position: i + 1 }));
    setRequests((prev) => {
      const otherStatuses = prev.filter((r) => r.status !== 'accepted');
      return [...optimistic, ...otherStatuses];
    });
    setUpdating(id);
    try {
      await apiFetch('/requests/reorder', {
        method: 'POST',
        token: djToken,
        body: JSON.stringify({ orderedIds: next.map((r) => r.id) }),
      });
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
      fetchRequests();
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || !djUser) {
    return (
      <main className="page">
        <div className="page__shell">
          <span className="loading">Loading floor</span>
        </div>
      </main>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests
    .filter((r) => r.status === 'accepted')
    .slice()
    .sort((a, b) => {
      const pa = a.position ?? Number.MAX_SAFE_INTEGER;
      const pb = b.position ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  const others = requests.filter((r) => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <main className="page">
      <div className="page__shell" style={{ maxWidth: 960 }}>
        <header className="home__head" style={{ animation: 'fade-up 0.6s var(--ease-out-expo) both' }}>
          <div>
            <p className="home__greeting">
              <span className="dot" />
              DJ booth · on air
            </p>
            <h1 className="home__title">
              <em>{djUser.name}.</em>
            </h1>
          </div>
          <div className="home__time">
            Floor time
            <strong>{clock || '—'}</strong>
          </div>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        {loading ? (
          <span className="loading">Loading queue</span>
        ) : requests.length === 0 ? (
          <div className="empty">
            <p className="empty__mark">
              <span className="dot dot--idle" />
              Empty queue
            </p>
            <h2 className="empty__title"><em>Nothing on deck yet.</em></h2>
            <p className="empty__desc">
              When patrons send requests, they hit this screen in real time. Keep the deck open.
            </p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="section">
                <div className="section__head">
                  <span className="section__title">
                    <span className="section__title-num">01</span>
                    Incoming
                  </span>
                  <span className="section__count">{String(pending.length).padStart(2, '0')} live</span>
                </div>
                {pending.map((req) => (
                  <article key={req.id} className="req-card req-card--hot">
                    <div
                      className="req-card__art"
                      style={req.albumArtUrl ? { backgroundImage: `url(${req.albumArtUrl})` } : {}}
                    />
                    <div className="req-card__content">
                      <h3 className="req-card__title">{req.songTitle}</h3>
                      <p className="req-card__meta">
                        <strong>{req.artistName}</strong> · {req.user.name}
                      </p>
                    </div>
                    <div className="req-card__actions">
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'accepted')}
                        disabled={updating === req.id}
                        className="action-btn action-btn--accept"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'declined')}
                        disabled={updating === req.id}
                        className="action-btn action-btn--decline"
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {accepted.length > 0 && (
              <section className="section">
                <div className="section__head">
                  <span className="section__title">
                    <span className="section__title-num">02</span>
                    Queue
                  </span>
                  <span className="section__count">{String(accepted.length).padStart(2, '0')} on deck</span>
                </div>
                {accepted.map((req, i) => (
                  <article key={req.id} className="req-card">
                    <span className="req-card__pos">{String(i + 1).padStart(2, '0')}</span>
                    <div
                      className="req-card__art"
                      style={req.albumArtUrl ? { backgroundImage: `url(${req.albumArtUrl})` } : {}}
                    />
                    <div className="req-card__content">
                      <h3 className="req-card__title">{req.songTitle}</h3>
                      <p className="req-card__meta">
                        <strong>{req.artistName}</strong> · {req.user.name}
                      </p>
                    </div>
                    <div className="req-card__actions">
                      <div className="req-card__move">
                        <button
                          type="button"
                          onClick={() => move(req.id, 'up')}
                          disabled={updating === req.id || i === 0}
                          className="action-btn action-btn--ghost"
                          aria-label="Move up"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(req.id, 'down')}
                          disabled={updating === req.id || i === accepted.length - 1}
                          className="action-btn action-btn--ghost"
                          aria-label="Move down"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'played')}
                        disabled={updating === req.id}
                        className="action-btn action-btn--played"
                      >
                        Mark played
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {others.length > 0 && (
              <section className="section">
                <div className="section__head">
                  <span className="section__title">
                    <span className="section__title-num">03</span>
                    History
                  </span>
                  <span className="section__count">{String(others.length).padStart(2, '0')} archived</span>
                </div>
                {others.map((req) => (
                  <article key={req.id} className="req-card req-card--muted">
                    <div
                      className="req-card__art"
                      style={req.albumArtUrl ? { backgroundImage: `url(${req.albumArtUrl})` } : {}}
                    />
                    <div className="req-card__content">
                      <h3 className="req-card__title">{req.songTitle}</h3>
                      <p className="req-card__meta">
                        <strong>{req.artistName}</strong>
                      </p>
                    </div>
                    <div className="req-card__actions">
                      <span className={`status status--${req.status}`}>
                        {req.status === 'played' ? 'Played' : 'Declined'}
                      </span>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
