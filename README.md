# HifdhScroll

An installable web app (PWA) for scrolling through Quran "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

1. Pick a passage on the home screen: by **Surah**, by **Mushaf page**, or by a custom **ayah range**.
2. Pick which reciters are allowed — 13 total (Murattal: Alafasy, Al-Dossari, Al-Muaiqly, Al-Ghamdi, Al-Sudais, Al-Shuraim, Al-Shatri, Al-Hudhaify, Ayyoub, Al-Ajmy. Mujawwad: Al-Minshawi, Abdul Basit, Al-Hussary) — all are selected by default; deselect any you don't want.
3. Hit **Generate Reels**. For X ayahs in the passage, exactly 2X reels are generated, each a randomized 10-20 ayah run (never crossing a surah boundary). These are random overlapping windows rather than a clean partition, so any given ayah typically turns up in several different reels with different neighbors, reciter, and scenery each time — repeated exposure in varied context for memorization — and presentation is inherently non-sequential (a reel for ayah 30 might be followed by one for ayah 112). The same logic applies to Surah, Page, and Range modes; reel count scales with passage length and never depends on how many reciters are selected.
4. Reels play in a fullscreen, vertically-scrolling feed like Instagram Reels/TikTok — scroll or swipe down to move to the next one, no buttons. Each reel auto-plays its ayah's audio, Arabic text and translation animate in, and it auto-advances on audio end. Bismillah is detected and shown as its own banner, separate from the ayah text.

## Waitlist and free trial

Generating reels (`/reel`) requires an active trial. New visitors are pointed to `/waitlist` (a link on the home page, or an automatic redirect if they try `/reel` directly) to sign up with just an email (name, a suggestion/feedback note, and "I'd like to donate" are all optional). Signing up immediately starts a 14-day free trial — no separate login step.

- Signups are stored in Postgres (`waitlist_signups` table, auto-created on first use) via `src/lib/db.ts`.
- Trial state lives in an HMAC-signed, httpOnly cookie (`src/lib/trialCookie.ts`) so it can't be edited client-side to extend the trial; access gating happens in `src/proxy.ts`, which redirects to `/waitlist` whenever the cookie is missing or expired.
- There's no paid tier or renewal flow yet — after 14 days, `/reel` simply redirects back to the waitlist page.

## Data sources

- **Arabic text + English translation**: [AlQuran Cloud API](https://alquran.cloud/api) (`quran-uthmani` + `en.sahih` editions, no API key required). Arabic and translation are fetched as two separate single-edition calls (not the combined multi-edition endpoint), since the combined endpoint isn't reliable on Page mode.
- **Recitation audio**: [EveryAyah.com](https://everyayah.com) per-ayah mp3 files (no API key required). Folder-name slugs vary in bitrate suffix and aren't all independently confirmed, so each reciter lists a few candidate slugs in `src/lib/qaris.ts`. If every EveryAyah candidate fails, the player tries [quran.com's](https://api.quran.com) documented reciter/audio API as an independent second source (matching by reciter name), before finally falling through to text-paced timing.
- **Scenery backdrops**: 16 hand-built CSS/SVG scenes (animated nature scenes plus simpler vintage-toned ones like parchment, sepia, and charcoal) — no external images or video files, so they work offline and have no licensing concerns.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The waitlist form needs a Postgres database; set these locally (e.g. in `.env.local`, which is gitignored) to test it:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/hifdhscroll
WAITLIST_COOKIE_SECRET=any-random-string-for-local-dev
NEXT_PUBLIC_DONATE_URL=https://your-donation-link  # optional; the donate link only shows if this is set
```

Without `DATABASE_URL`, everything except the waitlist form and `/reel` access gating still works.

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
3. Render reads `render.yaml` and provisions a **Web Service** (build command `npm ci --include=dev && npm run build`, start command `npm run start`, Node 20.9.0) plus a **free Postgres database**, and wires `DATABASE_URL` from that database and a random `WAITLIST_COOKIE_SECRET` into the service automatically.
4. Click **Apply**. First deploy takes a few minutes; Render gives you a live `https://<service-name>.onrender.com` URL when it's done.
5. **After deploying**, set the real `NEXT_PUBLIC_DONATE_URL` in the service's environment variables — `render.yaml` ships a placeholder (`https://example.com/replace-with-your-real-donation-link`) since there's no way to know your actual donation link (Ko-fi, PayPal.me, Buy Me a Coffee, etc.) ahead of time. Without changing it, the donate link just won't make sense if clicked.

If you already had this service running from an earlier deploy of this blueprint (before the database existed), you'll need to **sync the blueprint again** on Render's dashboard (Blueprint → Manual Sync, or push to the branch if auto-sync is on) for it to provision the new database and add the new environment variables to the existing service.

Note: Render's **free Postgres tier expires after 30 days** and is deleted rather than paused — if you want to keep waitlist signups past that, either upgrade the database's plan before it expires or export the data (`waitlist_signups` table) beforehand.

If you'd rather set it up manually instead of via the blueprint: create a **Web Service** and a **PostgreSQL** database, point the service at this repo, set the build command to `npm ci --include=dev && npm run build`, the start command to `npm run start`, leave the port unset (Render sets `PORT` automatically and `next start` reads it), and set `DATABASE_URL` (from the database's connection string), `WAITLIST_COOKIE_SECRET` (any random string), and `NEXT_PUBLIC_DONATE_URL` as environment variables.

### Other hosts

Any platform that runs a persistent Node process works the same way (build command `npm run build`, start command `npm run start`). Vercel also works out of the box if preferred, since it's zero-config for Next.js.

Once deployed, users can "Add to Home Screen" / "Install" from their browser to get an app-like icon and standalone window — this is the PWA install flow referenced in the app plan, replacing an app-store listing.
