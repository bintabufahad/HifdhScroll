# HifdhScroll

An installable web app (PWA) for scrolling through Quran "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

1. Pick a passage on the home screen: by **Surah**, by **Mushaf page**, or by a custom **ayah range**.
2. Pick which reciters are allowed — 13 total (Murattal: Alafasy, Al-Dossari, Al-Muaiqly, Al-Ghamdi, Al-Sudais, Al-Shuraim, Al-Shatri, Al-Hudhaify, Ayyoub, Al-Ajmy. Mujawwad: Al-Minshawi, Abdul Basit, Al-Hussary) — all are selected by default; deselect any you don't want.
3. Hit **Generate Reels**. For X ayahs in the passage, exactly 2X reels are generated, each a randomized 10-20 ayah run (never crossing a surah boundary). These are random overlapping windows rather than a clean partition, so any given ayah typically turns up in several different reels with different neighbors, reciter, and scenery each time — repeated exposure in varied context for memorization — and presentation is inherently non-sequential (a reel for ayah 30 might be followed by one for ayah 112). The same logic applies to Surah, Page, and Range modes; reel count scales with passage length and never depends on how many reciters are selected.
4. Reels play in a fullscreen, vertically-scrolling feed like Instagram Reels/TikTok — scroll or swipe down to move to the next one, no buttons. Each reel auto-plays its ayah's audio, Arabic text and translation animate in, and it auto-advances on audio end. Bismillah is detected and shown as its own banner, separate from the ayah text.

## Data sources

- **Arabic text + English translation**: [AlQuran Cloud API](https://alquran.cloud/api) (`quran-uthmani` + `en.sahih` editions, no API key required). Arabic and translation are fetched as two separate single-edition calls (not the combined multi-edition endpoint), since the combined endpoint isn't reliable on Page mode.
- **Recitation audio**: [EveryAyah.com](https://everyayah.com) per-ayah mp3 files (no API key required). Folder-name slugs vary in bitrate suffix and aren't all independently confirmed, so each reciter lists a few candidate slugs in `src/lib/qaris.ts`. If every EveryAyah candidate fails, the player tries [quran.com's](https://api.quran.com) documented reciter/audio API as an independent second source (matching by reciter name), before finally falling through to text-paced timing.
- **Scenery backdrops**: 16 hand-built CSS/SVG scenes (animated nature scenes plus simpler vintage-toned ones like parchment, sepia, and charcoal) — no external images or video files, so they work offline and have no licensing concerns.

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

This is a standard Next.js App Router project, deployable to any Node 20.9+ host via `npm run build && npm run start`.

### Render

A `render.yaml` blueprint is included, so this repo deploys with almost no manual setup:

1. On the [Render dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
2. Connect this GitHub repo and select the `claude/app-deployment-plan-g48tfj` branch (or `main`, once merged).
3. Render reads `render.yaml` and provisions a **Web Service** with the build command (`npm ci --include=dev && npm run build`), start command (`npm run start`), and Node version (20.9.0) already filled in.
4. Click **Apply** / **Create Web Service**. First deploy takes a few minutes; Render gives you a live `https://<service-name>.onrender.com` URL when it's done.

No environment variables or API keys are required — the Quran text/translation and audio sources are public, keyless APIs called directly from the browser.

If you'd rather set it up manually instead of via the blueprint: create a **Web Service**, point it at this repo, set the build command to `npm ci --include=dev && npm run build`, the start command to `npm run start`, and leave the port unset (Render sets `PORT` automatically and `next start` reads it).

### Other hosts

Any platform that runs a persistent Node process works the same way (build command `npm run build`, start command `npm run start`). Vercel also works out of the box if preferred, since it's zero-config for Next.js.

Once deployed, users can "Add to Home Screen" / "Install" from their browser to get an app-like icon and standalone window — this is the PWA install flow referenced in the app plan, replacing an app-store listing.
