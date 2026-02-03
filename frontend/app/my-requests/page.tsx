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

  if (authLoading) return <main style={styles.main}><p>Loading...</p></main>;
  if (!user) {
    return (
      <main style={styles.main}>
        <p>Please <Link href="/login" style={styles.link}>log in</Link> to see your requests.</p>
      </main>
    );
  }

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    accepted: '#10b981',
    declined: '#ef4444',
    played: '#6366f1',
  };

  return (
    <main style={styles.main}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>My requests</h1>
        <p style={styles.subtitle}>Status updates appear in real time</p>
        <Link href="/" style={styles.back}>← Home</Link>
        <Link href="/venues" style={styles.backLink}>Venues</Link>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p style={styles.empty}>No requests yet. <Link href="/venues" style={styles.link}>Request a song</Link>.</p>
        ) : (
          <ul style={styles.list}>
            {requests.map((req) => (
              <li key={req.id} style={styles.item}>
                <div style={styles.song}>
                  <strong>{req.songTitle}</strong> — {req.artistName}
                </div>
                <div style={styles.meta}>
                  {req.venue.name} ·{' '}
                  <span style={{ color: statusColor[req.status] || '#666', fontWeight: '600' }}>
                    {req.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  wrapper: { maxWidth: '600px', margin: '0 auto' },
  title: { marginBottom: '0.25rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { marginBottom: '1rem', color: '#666', fontSize: '0.9rem' },
  back: { display: 'inline-block', marginRight: '1rem', marginBottom: '1rem', color: '#667eea', textDecoration: 'none' },
  backLink: { display: 'inline-block', marginBottom: '1rem', color: '#667eea', textDecoration: 'none' },
  error: { color: '#c00', marginBottom: '1rem' },
  empty: { color: '#666' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '0.75rem' },
  song: { marginBottom: '0.25rem' },
  meta: { fontSize: '0.9rem', color: '#666' },
  link: { color: '#667eea', fontWeight: '600' },
};
