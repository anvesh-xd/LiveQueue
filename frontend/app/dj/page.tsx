'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useDjAuth } from '@/context/DjAuthContext';
import { apiFetch, type SongRequest } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DjDashboardPage() {
  const router = useRouter();
  const { djUser, djToken, loading: authLoading, djLogout } = useDjAuth();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Redirect non-DJ users (e.g. patrons who typed /dj) to DJ login — only DJs may access this page
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
    if (!djUser?.id) return;
    const socket = io(API_URL, { path: '/', transports: ['websocket', 'polling'] });
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
  }, [djUser?.id]);

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
      <main className="page">
        <p className="text-muted loading-pulse">Loading</p>
      </main>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const others = requests.filter((r) => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <main className="page">
      <div className="page__content">
        <div className="flex-row" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <h1 className="title">DJ dashboard</h1>
            <p className="text-muted" style={{ marginBottom: 0 }}>Hi, {djUser.name}. Requests update in real time.</p>
          </div>
          <button type="button" onClick={djLogout} className="btn btn--ghost btn--sm">
            Log out
          </button>
        </div>
        {error && <p className="text-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
        {loading ? (
          <p className="text-muted">Loading requests...</p>
        ) : (
          <>
            {pending.length > 0 && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                  New (pending)
                </h2>
                <ul className="list">
                  {pending.map((req) => (
                    <li key={req.id} className="list-item">
                      <div style={{ marginBottom: 'var(--space-1)' }}><strong>{req.songTitle}</strong> — {req.artistName}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{req.venue.name} · {req.user.name}</div>
                      <div className="flex-row" style={{ gap: 'var(--space-2)' }}>
                        <button type="button" onClick={() => updateStatus(req.id, 'accepted')} disabled={updating === req.id} className="btn btn--success btn--sm">Accept</button>
                        <button type="button" onClick={() => updateStatus(req.id, 'declined')} disabled={updating === req.id} className="btn btn--danger btn--sm">Decline</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {accepted.length > 0 && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                  Queue (accepted)
                </h2>
                <ul className="list">
                  {accepted.map((req) => (
                    <li key={req.id} className="list-item">
                      <div style={{ marginBottom: 'var(--space-1)' }}><strong>{req.songTitle}</strong> — {req.artistName}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{req.venue.name} · {req.user.name}</div>
                      <button type="button" onClick={() => updateStatus(req.id, 'played')} disabled={updating === req.id} className="btn btn--info btn--sm">Mark played</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-muted" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                  Declined / Played
                </h2>
                <ul className="list">
                  {others.map((req) => (
                    <li key={req.id} className="list-item list-item--muted">
                      <strong>{req.songTitle}</strong> — {req.artistName} · <span style={{ textTransform: 'capitalize' }}>{req.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {requests.length === 0 && <p className="text-muted">No requests yet.</p>}
          </>
        )}
      </div>
    </main>
  );
}
