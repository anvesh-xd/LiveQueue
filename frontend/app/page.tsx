'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main style={styles.main}>
        <p style={styles.loading}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>LiveQueue</h1>
        <p style={styles.subtitle}>Real-time song requests for live events</p>
        {user ? (
          <>
            <p style={styles.welcome}>Hi, {user.name}!</p>
            <div style={styles.links}>
              <Link href="/venues" style={styles.link}>Browse venues</Link>
              <Link href="/my-requests" style={styles.link}>My requests</Link>
            </div>
            <button type="button" onClick={logout} style={styles.logout}>Log out</button>
          </>
        ) : (
          <>
            <div style={styles.links}>
              <Link href="/login" style={styles.link}>Log in</Link>
              <Link href="/register" style={styles.link}>Sign up</Link>
            </div>
            <p style={styles.djLink}>
              <Link href="/dj/login" style={styles.linkSmall}>DJ dashboard login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  loading: { color: '#666' },
  card: { textAlign: 'center', maxWidth: '480px' },
  title: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#666', marginBottom: '2rem' },
  welcome: { marginBottom: '1.5rem', fontSize: '1.1rem' },
  links: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  link: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' },
  linkSmall: { color: '#764ba2', textDecoration: 'none', fontSize: '0.9rem' },
  djLink: { marginTop: '1rem', color: '#666' },
  logout: { marginTop: '1.5rem', padding: '0.5rem 1rem', background: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
};
