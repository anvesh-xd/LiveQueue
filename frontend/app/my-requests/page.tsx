'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type SongRequest } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const statusLabel: Record<SongRequest['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  played: 'Played',
  declined: 'Declined',
};

export default function MyRequestsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  function fetchRequests() {
    if (!token) return;
    apiFetch<SongRequest[]>('/requests/me', { token })
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load requests'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token || !user) return;
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  useEffect(() => {
    if (!user?.id || !token) return;
    const socket = io(API_URL, {
      path: '/',
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join', { userId: user.id });
    });
    socket.on('request:updated', () => {
      fetchRequests();
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  if (authLoading) {
    return (
      <main className="page">
        <div className="page__shell">
          <span className="loading">Loading</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page page--center">
        <div className="page__shell">
          <div className="empty">
            <p className="empty__mark">
              <span className="dot" />
              Locked door
            </p>
            <h2 className="empty__title"><em>Sign in required.</em></h2>
            <p className="empty__desc">
              <Link href="/login" className="link link--strobe">Sign in</Link> to see your requests.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__shell" style={{ maxWidth: 880 }}>
        <header className="page__header">
          <p className="page__eyebrow">
            <span className="dot" />
            Setlist · live status
          </p>
          <h1 className="page__title">
            Your <em>requests.</em>
          </h1>
          <p className="page__subtitle">Pending → Accepted → Played. Updates in real time as the DJ works the floor.</p>
        </header>

        {error && <p className="banner-error" role="alert">{error}</p>}

        {loading ? (
          <span className="loading">Loading setlist</span>
        ) : requests.length === 0 ? (
          <div className="empty">
            <p className="empty__mark">
              <span className="dot dot--idle" />
              Empty setlist
            </p>
            <h2 className="empty__title"><em>No requests yet.</em></h2>
            <p className="empty__desc">
              <Link href="/venues" className="link link--strobe">Pick a venue</Link> and send your first track.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {requests.map((req) => (
              <div key={req.id} className="timeline__item">
                <div
                  className="timeline__art"
                  style={req.albumArtUrl ? {
                    backgroundImage: `url(${req.albumArtUrl})`,
                  } : {}}
                >
                  {!req.albumArtUrl && (
                    <div className="timeline__art-placeholder">♪</div>
                  )}
                </div>
                <div className="timeline__content">
                  <h3 className="timeline__title">{req.songTitle}</h3>
                  <p className="timeline__meta">
                    <span>{req.artistName}</span>
                    <span className="timeline__meta-sep">·</span>
                    <span>{req.venue.name}</span>
                  </p>
                </div>
                <div className="timeline__status">
                  <span className={`status status--${req.status}`}>
                    {req.status === 'accepted' && <span className="dot" aria-hidden="true" />}
                    {statusLabel[req.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
