'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useDjAuth } from '@/context/DjAuthContext';
import { apiFetch, type SongRequest } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DjDashboardPage() {
  const { djUser, djToken, loading: authLoading, djLogout } = useDjAuth();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

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

  if (authLoading) return <main style={styles.main}><p>Loading...</p></main>;
  if (!djUser) {
    return (
      <main style={styles.main}>
        <p>Please <Link href="/dj/login" style={styles.link}>log in as DJ</Link>.</p>
      </main>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const others = requests.filter((r) => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <main style={styles.main}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>DJ dashboard</h1>
          <p style={styles.subtitle}>Hi, {djUser.name}. Requests update in real time.</p>
          <div style={styles.nav}>
            <Link href="/" style={styles.backLink}>← Home</Link>
            <button type="button" onClick={djLogout} style={styles.logout}>Log out</button>
          </div>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? (
          <p>Loading requests...</p>
        ) : (
          <>
            {pending.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>New (pending)</h2>
                <ul style={styles.list}>
                  {pending.map((req) => (
                    <li key={req.id} style={styles.item}>
                      <div style={styles.song}><strong>{req.songTitle}</strong> — {req.artistName}</div>
                      <div style={styles.meta}>{req.venue.name} · {req.user.name}</div>
                      <div style={styles.actions}>
                        <button type="button" onClick={() => updateStatus(req.id, 'accepted')} disabled={updating === req.id} style={styles.btnAccept}>Accept</button>
                        <button type="button" onClick={() => updateStatus(req.id, 'declined')} disabled={updating === req.id} style={styles.btnDecline}>Decline</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {accepted.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Queue (accepted)</h2>
                <ul style={styles.list}>
                  {accepted.map((req) => (
                    <li key={req.id} style={styles.item}>
                      <div style={styles.song}><strong>{req.songTitle}</strong> — {req.artistName}</div>
                      <div style={styles.meta}>{req.venue.name} · {req.user.name}</div>
                      <button type="button" onClick={() => updateStatus(req.id, 'played')} disabled={updating === req.id} style={styles.btnPlayed}>Mark played</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {others.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Declined / Played</h2>
                <ul style={styles.list}>
                  {others.map((req) => (
                    <li key={req.id} style={styles.itemMuted}>
                      <strong>{req.songTitle}</strong> — {req.artistName} · <span style={styles.status}>{req.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {requests.length === 0 && <p style={styles.empty}>No requests yet.</p>}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  wrapper: { maxWidth: '640px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  title: { marginBottom: '0.25rem', color: '#764ba2', fontSize: '1.75rem' },
  subtitle: { marginBottom: '0.75rem', color: '#666', fontSize: '0.95rem' },
  nav: { display: 'flex', gap: '1rem', alignItems: 'center' },
  backLink: { color: '#667eea', textDecoration: 'none' },
  logout: { padding: '0.4rem 0.8rem', background: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  error: { color: '#c00', marginBottom: '1rem' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1rem', color: '#666', marginBottom: '0.75rem', fontWeight: '600' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' },
  itemMuted: { padding: '0.6rem 0', color: '#888', fontSize: '0.9rem' },
  song: { marginBottom: '0.25rem' },
  meta: { fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  btnAccept: { padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDecline: { padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnPlayed: { padding: '0.4rem 0.8rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  status: { textTransform: 'capitalize' },
  empty: { color: '#666' },
  link: { color: '#667eea', fontWeight: '600' },
};
