# HifdhScroll

An installable web app (PWA) for scrolling through Quran "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

1. Pick a passage on the home screen: by **Surah**, by **Mushaf page**, or by a custom **ayah range**.
2. Pick which reciters are allowed (Murattal: Alafasy, Al-Dossari, Al-Muaiqly, Al-Luhaidan, Al-Ghamdi. Mujawwad: Al-Minshawi, Abdul Basit, Al-Hussary) — all are selected by default; deselect any you don't want.
3. Hit **Generate Reels**. Instead of one long reel, the passage is split into many short ones (~10 ayahs each for Surah/Range mode, ~10 reels per page for Page mode), each cycling through a shuffled mix of your selected reciters and one of 16 scenery backdrops, so consecutive reels vary.
4. Each reel plays in a fixed 9:16 (Instagram Reel) card: audio per ayah, Arabic text and translation animating in, auto-advancing on audio end. Bismillah is detected and shown as its own banner, separate from the ayah text. Navigate between generated reels with the arrows beside/below the card.

## Data sources

- **Arabic text + English translation**: [AlQuran Cloud API](https://alquran.cloud/api) (`quran-uthmani` + `en.sahih` editions, no API key required).
- **Recitation audio**: [EveryAyah.com](https://everyayah.com) per-ayah mp3 files (no API key required).
- **Scenery backdrops**: 16 hand-built CSS/SVG scenes (animated nature scenes plus simpler vintage-toned ones like parchment, sepia, and charcoal) — no external images or video files, so they work offline and have no licensing concerns.

Note: Muhammad Al-Luhaidan does not have a confirmed per-ayah audio source on EveryAyah.com yet, so reels assigned to him fall back to text-paced timing (no audio) until a source is wired up.

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
