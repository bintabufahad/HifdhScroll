# HifdhScroll

An installable web app (PWA) for scrolling through Quran "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

1. Pick a passage on the home screen: by **Surah**, by **Mushaf page**, or by a custom **ayah range**.
2. Pick a reciter (Murattal: Alafasy, Al-Dossari, Al-Muaiqly, Al-Luhaidan, Al-Ghamdi. Mujawwad: Al-Minshawi, Abdul Basit, Al-Hussary) and a scenery backdrop.
3. The reel page plays each ayah's audio while the Arabic text and translation animate in; it auto-advances to the next ayah when the audio ends.

## Data sources

- **Arabic text + English translation**: [AlQuran Cloud API](https://alquran.cloud/api) (`quran-uthmani` + `en.sahih` editions, no API key required).
- **Recitation audio**: [EveryAyah.com](https://everyayah.com) per-ayah mp3 files (no API key required).
- **Scenery backdrops**: hand-built CSS/SVG animated scenes — no external images or video files, so they work offline and have no licensing concerns.

Note: Muhammad Al-Luhaidan does not have a confirmed per-ayah audio source on EveryAyah.com yet, so his reel falls back to text-paced timing (no audio) until a source is wired up.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Deployment

This is a standard Next.js App Router project — deploy it to [Vercel](https://vercel.com/new) (recommended, zero-config) by importing this GitHub repo, or run `npm run build && npm run start` on any Node 20.9+ host.

Once deployed, users can "Add to Home Screen" / "Install" from their browser to get an app-like icon and standalone window — this is the PWA install flow referenced in the app plan, replacing an app-store listing.
