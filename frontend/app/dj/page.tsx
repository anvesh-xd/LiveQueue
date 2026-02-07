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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!djUser) {
      router.replace('/dj/login');
    }
  }, [authLoading, djUser, router]);

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
  }, [djToken, djUser?.id]);

  useEffect(() => {
    if (!djUser?.id || !djToken) return;
    const socket = io(API_URL, { 
      path: '/', 
      transports: ['websocket', 'polling'],
      auth: { token: djToken }
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join', { djId: djUser.id });
    });
    socket.on('request:new', () => fetchRequests());
    socket.on('request:updated', () => fetchRequests());
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
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

  if (authLoading || !djUser) {
    return (
      <main className="dashboard">
        <div className="dashboard__inner">
          <p className="text-muted loading-pulse">Loading</p>
        </div>
      </main>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const others = requests.filter((r) => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <main className="dashboard">
      <div className="dashboard__inner">
        <header className="dashboard__header">
          <p className="dashboard__greeting">Welcome back</p>
          <h1 className="dashboard__title">{djUser.name}</h1>
        </header>

        {error && <p className="auth-page__error" style={{ marginBottom: 'var(--space-6)' }}>{error}</p>}

        {loading ? (
          <p className="text-muted loading-pulse">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎵</div>
            <h2 className="empty-state__title">No requests yet</h2>
            <p className="empty-state__desc">
              When patrons submit song requests, they&apos;ll appear here in real time.
            </p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Incoming</h2>
                  <span className="dashboard__section-count">{pending.length}</span>
                </div>
                {pending.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card__art">🎵</div>
                    <div className="request-card__content">
                      <h3 className="request-card__title">{req.songTitle}</h3>
                      <p className="request-card__meta">{req.artistName} · {req.user.name}</p>
                      <div className="request-card__actions">
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
                    </div>
                  </div>
                ))}
              </section>
            )}

            {accepted.length > 0 && (
              <section className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Queue</h2>
                  <span className="dashboard__section-count">{accepted.length}</span>
                </div>
                {accepted.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card__art">🎵</div>
                    <div className="request-card__content">
                      <h3 className="request-card__title">{req.songTitle}</h3>
                      <p className="request-card__meta">{req.artistName} · {req.user.name}</p>
                      <div className="request-card__actions">
                        <button
                          type="button"
                          onClick={() => updateStatus(req.id, 'played')}
                          disabled={updating === req.id}
                          className="action-btn action-btn--played"
                        >
                          Mark played
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {others.length > 0 && (
              <section className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">History</h2>
                  <span className="dashboard__section-count">{others.length}</span>
                </div>
                {others.map((req) => (
                  <div key={req.id} className="request-card request-card--muted">
                    <div className="request-card__art" style={{ opacity: 0.5 }}>🎵</div>
                    <div className="request-card__content">
                      <h3 className="request-card__title">{req.songTitle}</h3>
                      <p className="request-card__meta">
                        {req.artistName} · 
                        <span className={`badge badge--${req.status}`} style={{ marginLeft: 'var(--space-2)' }}>
                          {req.status}
                        </span>
                      </p>
                    </div>
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
