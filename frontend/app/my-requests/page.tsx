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
      <main className="page">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="page">
        <div className="page__content">
          <p className="text-muted">Please <Link href="/login" className="link">log in</Link> to see your requests.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__content" style={{ maxWidth: '900px' }}>
        <h1 className="title" style={{ fontSize: 'var(--text-3xl)' }}>My requests</h1>
        <p className="subtitle">Status updates appear in real time</p>
        <Link href="/venues" className="back-link">Venues</Link>
        {error && <p className="text-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
        {loading ? (
          <p className="text-muted loading-pulse">Loading</p>
        ) : requests.length === 0 ? (
          <p className="text-muted">No requests yet. <Link href="/venues" className="link">Request a song</Link>.</p>
        ) : (
          <div className="card-grid">
            {requests.map((req) => (
              <div key={req.id} className="listing-card">
                <div className="listing-card__visual" aria-hidden>🎵</div>
                <div className="listing-card__body">
                  <div className="listing-card__title">{req.songTitle}</div>
                  <div className="listing-card__meta">
                    {req.artistName} · {req.venue.name}
                  </div>
                  <span className={`badge badge--${req.status}`}>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
