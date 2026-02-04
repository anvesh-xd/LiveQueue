'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useDjAuth } from '@/context/DjAuthContext';

export function Header() {
  const { user, loading: patronLoading, logout } = useAuth();
  const { djUser, loading: djLoading, djLogout } = useDjAuth();
  const [scrolled, setScrolled] = useState(false);

  const loading = patronLoading || djLoading;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link href="/" className="header__brand">
          LiveQueue
        </Link>
        <div className="header__nav-wrap">
          {loading ? null : (
            <>
              <nav className="header__nav">
                {djUser ? (
                  <>
                    <Link href="/" className="header__link">Home</Link>
                    <Link href="/dj/venues" className="header__link">My venues</Link>
                    <Link href="/dj" className="header__link header__link--primary">Dashboard</Link>
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
                  </>
                )}
              </nav>
              {(user || djUser) && (
                <button
                  type="button"
                  onClick={djUser ? djLogout : logout}
                  className="header__logout"
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
