const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(getApiUrl(path), { ...rest, headers });
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
  djs: { id: string; name: string }[];
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
  createdAt: string;
  updatedAt: string;
  playedAt: string | null;
  user: { id: string; name: string; email: string };
  venue: { id: string; name: string };
};
