'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type SongRequest } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  }, [token, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io(API_URL, { path: '/', transports: ['websocket', 'polling'] });
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
  }, [user?.id]);

  if (authLoading) {
    return (
      <main className="requests-page">
        <div className="requests-page__inner">
          <p className="text-muted loading-pulse">Loading</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="requests-page">
        <div className="requests-page__inner">
          <div className="empty-state">
            <div className="empty-state__icon">🔒</div>
            <h2 className="empty-state__title">Sign in required</h2>
            <p className="empty-state__desc">
              Please <Link href="/login" className="link">log in</Link> to see your requests.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="requests-page">
      <div className="requests-page__inner">
        <header className="requests-page__header">
          <h1 className="requests-page__title">My requests</h1>
          <p className="requests-page__subtitle">Live status updates</p>
        </header>

        {error && <p className="auth-page__error" style={{ marginBottom: 'var(--space-6)' }}>{error}</p>}

        {loading ? (
          <p className="text-muted loading-pulse">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎵</div>
            <h2 className="empty-state__title">No requests yet</h2>
            <p className="empty-state__desc">
              <Link href="/venues" className="link">Browse venues</Link> to request your first song.
            </p>
          </div>
        ) : (
          <div className="requests-page__list">
            {requests.map((req) => (
              <div key={req.id} className="request-item">
                <div className="request-item__art">🎵</div>
                <div className="request-item__content">
                  <h3 className="request-item__title">{req.songTitle}</h3>
                  <p className="request-item__meta">{req.artistName} · {req.venue.name}</p>
                  <span className={`request-item__status request-item__status--${req.status}`}>
                    {req.status === 'pending' && '⏳ '}
                    {req.status === 'accepted' && '✓ '}
                    {req.status === 'played' && '🎵 '}
                    {req.status === 'declined' && '✕ '}
                    {req.status}
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
