const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Storage keys shared with the auth contexts. Kept in sync with
// AuthContext.tsx / DjAuthContext.tsx — duplication is intentional so this
// module stays free of React imports.
const PATRON_TOKEN_KEY = 'livequeue_token';
const PATRON_REFRESH_KEY = 'livequeue_refresh_token';
const DJ_TOKEN_KEY = 'livequeue_dj_token';
const DJ_REFRESH_KEY = 'livequeue_dj_refresh_token';
const TOKEN_REFRESHED_EVENT = 'livequeue:token-refreshed';
const CLEAR_PATRON_EVENT = 'livequeue:clear-patron';
const CLEAR_DJ_EVENT = 'livequeue:clear-dj';

type TokenKind = 'patron' | 'dj';

export type TokenRefreshedDetail = {
  kind: TokenKind;
  token: string;
};

// In-flight refresh promise, keyed by token kind. Multiple concurrent 401s for
// the same kind share a single refresh call so we don't burn refresh tokens.
const inflight: Partial<Record<TokenKind, Promise<string | null>>> = {};

function tokenKindFor(token: string): TokenKind | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(PATRON_TOKEN_KEY) === token) return 'patron';
  if (localStorage.getItem(DJ_TOKEN_KEY) === token) return 'dj';
  return null;
}

async function refreshToken(kind: TokenKind): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (inflight[kind]) return inflight[kind]!;

  const refreshKey = kind === 'patron' ? PATRON_REFRESH_KEY : DJ_REFRESH_KEY;
  const tokenKey = kind === 'patron' ? PATRON_TOKEN_KEY : DJ_TOKEN_KEY;
  const refresh = localStorage.getItem(refreshKey);
  if (!refresh) return null;

  const promise = (async () => {
    try {
      const res = await fetch(getApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        // Refresh failed (expired or invalidated). Clear the session for this
        // kind so the UI prompts a fresh sign-in.
        const clearEvent = kind === 'patron' ? CLEAR_PATRON_EVENT : CLEAR_DJ_EVENT;
        window.dispatchEvent(new CustomEvent(clearEvent));
        return null;
      }
      const data = (await res.json()) as { token: string };
      localStorage.setItem(tokenKey, data.token);
      window.dispatchEvent(
        new CustomEvent<TokenRefreshedDetail>(TOKEN_REFRESHED_EVENT, {
          detail: { kind, token: data.token },
        })
      );
      return data.token;
    } catch {
      return null;
    } finally {
      inflight[kind] = undefined;
    }
  })();

  inflight[kind] = promise;
  return promise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string; _retried?: boolean } = {}
): Promise<T> {
  const { token, _retried, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(getApiUrl(path), { ...rest, headers });

  // If the access token expired, try a one-shot refresh and retry the request.
  if (res.status === 401 && token && !_retried) {
    const kind = tokenKindFor(token);
    if (kind) {
      const newToken = await refreshToken(kind);
      if (newToken) {
        return apiFetch<T>(path, { ...options, token: newToken, _retried: true });
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export type User = { id: string; email: string; name: string; createdAt: string };
export type Venue = {
  id: string;
  name: string;
  address: string | null;
  logoUrl: string | null;
  djs: { id: string; name: string; isActive?: boolean }[];
};
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'played';
export type DeezerTrack = {
  id: string;
  songTitle: string;
  artistName: string;
  albumArtUrl: string | null;
};

export type SongRequest = {
  id: string;
  userId: string;
  djId: string;
  venueId: string;
  deezerTrackId: string;
  songTitle: string;
  artistName: string;
  albumArtUrl: string | null;
  status: RequestStatus;
  position: number | null;
  createdAt: string;
  updatedAt: string;
  playedAt: string | null;
  user: { id: string; name: string; email: string };
  venue: { id: string; name: string };
};
