'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, type User } from '@/lib/api';

const TOKEN_KEY = 'livequeue_token';
const REFRESH_TOKEN_KEY = 'livequeue_refresh_token';
const USER_KEY = 'livequeue_user';
const DJ_TOKEN_KEY = 'livequeue_dj_token';
const DJ_REFRESH_TOKEN_KEY = 'livequeue_dj_refresh_token';
const DJ_USER_KEY = 'livequeue_dj_user';
const CLEAR_DJ_EVENT = 'livequeue:clear-dj';
const CLEAR_PATRON_EVENT = 'livequeue:clear-patron';
const TOKEN_REFRESHED_EVENT = 'livequeue:token-refreshed';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrate = () => {
      const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      const u = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      if (t && u) {
        setToken(t);
        try {
          setUser(JSON.parse(u));
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    };
    hydrate();
    setLoading(false);
    const onClearPatron = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    };
    const onTokenRefreshed = (e: Event) => {
      const detail = (e as CustomEvent<{ kind: 'patron' | 'dj'; token: string }>).detail;
      if (detail?.kind === 'patron') {
        setToken(detail.token);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(CLEAR_PATRON_EVENT, onClearPatron);
      window.addEventListener(TOKEN_REFRESHED_EVENT, onTokenRefreshed);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(CLEAR_PATRON_EVENT, onClearPatron);
        window.removeEventListener(TOKEN_REFRESHED_EVENT, onTokenRefreshed);
      }
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.removeItem(DJ_TOKEN_KEY);
    localStorage.removeItem(DJ_REFRESH_TOKEN_KEY);
    localStorage.removeItem(DJ_USER_KEY);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CLEAR_DJ_EVENT));
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    router.push('/venues');
  }, [router]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await apiFetch<{ user: User; token: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.removeItem(DJ_TOKEN_KEY);
    localStorage.removeItem(DJ_REFRESH_TOKEN_KEY);
    localStorage.removeItem(DJ_USER_KEY);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CLEAR_DJ_EVENT));
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    router.push('/venues');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
