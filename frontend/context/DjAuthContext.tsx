'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, type User } from '@/lib/api';

const DJ_TOKEN_KEY = 'livequeue_dj_token';
const DJ_REFRESH_TOKEN_KEY = 'livequeue_dj_refresh_token';
const DJ_USER_KEY = 'livequeue_dj_user';
const TOKEN_KEY = 'livequeue_token';
const REFRESH_TOKEN_KEY = 'livequeue_refresh_token';
const USER_KEY = 'livequeue_user';
const CLEAR_DJ_EVENT = 'livequeue:clear-dj';
const CLEAR_PATRON_EVENT = 'livequeue:clear-patron';

type DjAuthContextType = {
  djUser: User | null;
  djToken: string | null;
  loading: boolean;
  djLogin: (email: string, password: string) => Promise<void>;
  djLogout: () => void;
};

const DjAuthContext = createContext<DjAuthContextType | null>(null);

export function DjAuthProvider({ children }: { children: React.ReactNode }) {
  const [djUser, setDjUser] = useState<User | null>(null);
  const [djToken, setDjToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrate = () => {
      const t = typeof window !== 'undefined' ? localStorage.getItem(DJ_TOKEN_KEY) : null;
      const u = typeof window !== 'undefined' ? localStorage.getItem(DJ_USER_KEY) : null;
      if (t && u) {
        setDjToken(t);
        try {
          setDjUser(JSON.parse(u));
        } catch {
          localStorage.removeItem(DJ_TOKEN_KEY);
          localStorage.removeItem(DJ_USER_KEY);
          setDjToken(null);
          setDjUser(null);
        }
      } else {
        setDjToken(null);
        setDjUser(null);
      }
    };
    hydrate();
    setLoading(false);
    const onClearDj = () => {
      localStorage.removeItem(DJ_TOKEN_KEY);
      localStorage.removeItem(DJ_REFRESH_TOKEN_KEY);
      localStorage.removeItem(DJ_USER_KEY);
      setDjToken(null);
      setDjUser(null);
    };
    if (typeof window !== 'undefined') window.addEventListener(CLEAR_DJ_EVENT, onClearDj);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener(CLEAR_DJ_EVENT, onClearDj);
    };
  }, []);

  const djLogin = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string; refreshToken: string }>('/auth/login-dj', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CLEAR_PATRON_EVENT));
    localStorage.setItem(DJ_TOKEN_KEY, data.token);
    localStorage.setItem(DJ_REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(DJ_USER_KEY, JSON.stringify(data.user));
    setDjToken(data.token);
    setDjUser(data.user);
    router.push('/dj');
  }, [router]);

  const djLogout = useCallback(() => {
    localStorage.removeItem(DJ_TOKEN_KEY);
    localStorage.removeItem(DJ_REFRESH_TOKEN_KEY);
    localStorage.removeItem(DJ_USER_KEY);
    setDjToken(null);
    setDjUser(null);
    router.push('/dj/login');
  }, [router]);

  return (
    <DjAuthContext.Provider value={{ djUser, djToken, loading, djLogin, djLogout }}>
      {children}
    </DjAuthContext.Provider>
  );
}

export function useDjAuth() {
  const ctx = useContext(DjAuthContext);
  if (!ctx) throw new Error('useDjAuth must be used within DjAuthProvider');
  return ctx;
}
