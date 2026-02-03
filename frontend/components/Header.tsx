'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useDjAuth } from '@/context/DjAuthContext';

export function Header() {
  const { user, loading: patronLoading, logout } = useAuth();
  const { djUser, loading: djLoading, djLogout } = useDjAuth();

  const loading = patronLoading || djLoading;

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__brand">
          LiveQueue
        </Link>
        <div className="header__nav-wrap">
          {loading ? (
            <span className="text-dim" style={{ fontSize: 'var(--text-sm)' }}>Loading...</span>
          ) : (
            <>
              <nav className="header__nav">
                {djUser ? (
                  <>
                    <Link href="/" className="header__link">Home</Link>
                    <Link href="/dj/venues" className="header__link">My venues</Link>
                    <Link href="/dj" className="header__link header__link--primary">DJ dashboard</Link>
                  </>
                ) : user ? (
                  <>
                    <Link href="/venues" className="header__link">Venues</Link>
                    <Link href="/my-requests" className="header__link">My requests</Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="header__link">Log in</Link>
                    <Link href="/register" className="header__link header__link--primary">Sign up</Link>
                    <Link href="/dj/login" className="header__link">DJ login</Link>
                  </>
                )}
              </nav>
              {(user || djUser) && (
                <button
                  type="button"
                  onClick={djUser ? djLogout : logout}
                  className="header__logout btn btn--ghost btn--sm"
                >
                  Log out
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
