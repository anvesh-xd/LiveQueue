import { Router, Request, Response } from 'express';

const router = Router();

const DEEZER_API_BASE = 'https://api.deezer.com';

export type DeezerTrackResult = {
  id: string;
  songTitle: string;
  artistName: string;
  albumArtUrl: string | null;
};

// GET /deezer/search?q=...
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string)?.trim();
    if (!q || q.length < 2) {
      res.status(400).json({ error: 'Query "q" required (min 2 characters)' });
      return;
    }

    const searchRes = await fetch(
      `${DEEZER_API_BASE}/search/track?q=${encodeURIComponent(q)}&limit=10`
    );
    if (!searchRes.ok) {
      res.status(502).json({ error: 'Deezer API error' });
      return;
    }

    const data = (await searchRes.json()) as {
      data?: Array<{
        id: number;
        title: string;
        artist?: { name: string };
        album?: { cover_medium: string };
      }>;
    };

    const items = data.data ?? [];
    const results: DeezerTrackResult[] = items.map((t) => ({
      id: String(t.id),
      songTitle: t.title,
      artistName: t.artist?.name ?? '',
      albumArtUrl: t.album?.cover_medium ?? null,
    }));

    res.json(results);
  } catch (e) {
    console.error('Deezer search error:', e);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
