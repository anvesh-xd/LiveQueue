import { Router, Request, Response } from 'express';

const router = Router();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
    return cachedToken.access_token;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export type SpotifyTrackResult = {
  id: string;
  songTitle: string;
  artistName: string;
  albumArtUrl: string | null;
};

// GET /spotify/search?q=...
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string)?.trim();
    if (!q || q.length < 2) {
      res.status(400).json({ error: 'Query "q" required (min 2 characters)' });
      return;
    }

    const token = await getSpotifyToken();
    if (!token) {
      res.status(503).json({
        error: 'Spotify search unavailable',
        hint: 'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend .env',
      });
      return;
    }

    const searchRes = await fetch(
      `${SPOTIFY_API_BASE}/search?type=track&q=${encodeURIComponent(q)}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!searchRes.ok) {
      res.status(502).json({ error: 'Spotify API error' });
      return;
    }

    const data = (await searchRes.json()) as {
      tracks?: { items?: Array<{
        id: string;
        name: string;
        artists?: Array<{ name: string }>;
        album?: { images?: Array<{ url: string }> };
      }> };
    };

    const items = data.tracks?.items ?? [];
    const results: SpotifyTrackResult[] = items.map((t) => ({
      id: t.id,
      songTitle: t.name,
      artistName: t.artists?.map((a) => a.name).join(', ') ?? '',
      albumArtUrl: t.album?.images?.[0]?.url ?? null,
    }));

    res.json(results);
  } catch (e) {
    console.error('Spotify search error:', e);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
