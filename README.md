# Rusookh

Rusookh (رسوخ, "firm-rootedness in knowledge") is an installable web app (PWA) for memorizing the Qur'an through short "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop — plus a focused study space for students of knowledge. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

The home page (`/`) is a hub with two paths: **Quran Reels** (memorization) and the **Student of Knowledge** study dashboard. The reel setup lives at `/reels`.

1. From the hub, open **Quran Reels** and pick a passage: by **Surah** (defaults to Al-Baqarah), by **Mushaf page**, or by a custom **ayah range**.
2. Pick which reciters are allowed — 12 total (Alafasy, Al-Dossari, Al-Muaiqly, Al-Ghamdi, Al-Sudais, Al-Shuraim, Al-Shatri, Al-Hudhaify, Ayyoub, Al-Minshawi, Abdul Basit, Al-Hussary) — all are selected by default; deselect any you don't want.
3. Hit **Generate Reels**. For X ayahs in the passage, exactly 2X reels are generated, each a randomized 10-20 ayah run (never crossing a surah boundary; shorter surahs and Mushaf pages instead get a proportional window, so a short surah like Al-Fatihah still varies in start/end instead of every reel just being the whole thing — see `src/lib/reelSegments.ts`). These are random overlapping windows rather than a clean partition, so any given ayah typically turns up in several different reels with different neighbors, reciter, and scenery each time — repeated exposure in varied context for memorization — and presentation is inherently non-sequential (a reel for ayah 30 might be followed by one for ayah 112). The same logic applies to Surah, Page, and Range modes; reel count scales with passage length and never depends on how many reciters are selected.
4. Reels play in a fullscreen, vertically-scrolling feed like Instagram Reels/TikTok — scroll or swipe down to move to the next one, no buttons. Each reel auto-plays its ayah's audio, Arabic text and translation animate in, and it auto-advances on audio end. Bismillah is detected and shown as its own banner, separate from the ayah text.

## Student of Knowledge study dashboard

`/study` is a separate focus-session tool for students of knowledge (not just memorization), open to any signed-in user. It's reached from the home hub (`src/components/study/StudyDashboard.tsx` orchestrates the layout).

- **Simulated class + lecture** (`src/components/study/MainStage.tsx`): the big left panel shows a placeholder teacher until a YouTube link is added (typed in, or picked from the course), then plays that lecture in its place via `youtube-nocookie.com`. Clearly labeled as a simulation ("not a real class, no one else is on this call"). When there's **no** lecture and the camera is on, the camera takes the big slot and the teacher shrinks to the small sidebar tile (`CameraView` + `TeacherBox`, camera stream owned by `useCamera`); a loaded lecture always reclaims the big slot. In the big slot the camera's controls are overlaid on the video so it stays exactly lecture-sized (no scrolling).
- **Camera self-view + local recording** (`src/components/study/CameraView.tsx`, `useCamera.ts`): opt-in (a button, never auto-requested). Optional recording uses the MediaRecorder API and stays entirely on the device — the clip is held in memory as a blob the user can replay or download; it is never uploaded or sent anywhere.
- **"Ustad" watcher** (`src/components/study/UstadWatcher.tsx`): a decorative turbaned scholar who arrives ~5-6s into the session with a short synthesized sound cue (Web Audio), then returns every 5 minutes as a focus nudge. He stays away entirely while a lecture is playing. Doesn't track anything.
- **Structured course** (`src/components/study/CoursePlaylist.tsx`): a floating panel (top-right) to build an ordered course of YouTube lectures and PDF readings, reorder/check them off, and see progress. YouTube items show their cover thumbnail. Clicking a lecture plays it in the teacher panel; a PDF opens in a new tab. Stored **per-user in Supabase** (`course_items`, migration 005) so it's durable and cross-device.
- **Focus timer** (`src/components/study/StudyTimer.tsx`): a compact timer (15/25/45/60-minute presets) tucked in the sidebar corner; finishing a session shows a small "session complete" note.
- **To-do list** (`src/components/study/TaskList.tsx`): a per-user `study_tasks` table (see `supabase/migrations/004_study_dashboard.sql`), plain Row-Level-Security scoped to `auth.uid()`.
- **Layout**: on wide screens it's a full-height two-column workspace — the big stage (lecture/camera/teacher) fills the left, and the camera-or-teacher tile plus the (prominent) to-do list fill a right column, with the compact focus timer at the bottom corner, so nothing needs scrolling or fullscreen. On mobile everything stacks and scrolls.

Both the course and the to-do list live in Supabase (not browser storage), so they persist indefinitely and follow the user across devices.

The whole app uses one modern dark theme (near-black with emerald/gold accents and glass panels — see `.bg-app-dark`/`.glass` in `src/app/globals.css`): hub, study dashboard, reel setup, waitlist, and feedback. The reel player itself keeps its per-reel scenery.

> An earlier version had a points/streak gamification bar (backed by a `record_study_session` Postgres function and extra columns in migration 004). That UI was removed; those columns/function remain in migration 004 but are unused and harmless. Migration 004 is still required — it also creates the `study_tasks` table the to-do list uses.

## Accounts (free) and reviews

Everything is free — there's no trial or paid tier. `/reel` and `/study` just require a signed-in user; visitors are pointed to `/waitlist` to sign in with just an email (name and an optional note) — no password. They get a magic link by email; clicking it signs them in.

This runs on [Supabase](https://supabase.com) (Auth + Postgres):

- **Auth**: Supabase's email magic-link (OTP) sign-in. `src/lib/supabase/client.ts` / `server.ts` / `middleware.ts` are the standard `@supabase/ssr` client setup for the Next.js App Router.
- **Gating**: `src/proxy.ts` refreshes the Supabase session and, for `/reel` and `/study`, redirects to `/waitlist` only if there's no signed-in user. No trial checks. `/feedback` is fully public.
- **Magic-link callback**: `src/app/auth/callback/route.ts` verifies the emailed link (token_hash or PKCE code) and writes the session cookies onto its redirect response; it derives the public origin from the forwarded host so redirects work behind Render's proxy.
- The `profiles` table and trial columns (migrations 001–006) still exist but are no longer used for gating — they're harmless.

### Reviews (`/feedback`)

`/feedback` is a public reviews wall (`src/components/ReviewsPage.tsx`). Anyone can read the reviews; a signed-in user can post one (star rating + text) and delete their own. Reviews are stored per-user in a `reviews` table (`supabase/migrations/007_reviews.sql`) with public-read RLS, so they're durable and never disappear. It's linked from the home page.

### Supabase setup (one-time)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in `supabase/migrations/` in order (001 through 007). The later ones add the study to-do table, the structured-course table, a resilient signup trigger, and the reviews table. (The trial/feedback-extension pieces in 001–002 are unused now but harmless.)
3. In **Project Settings → API**, copy the **Project URL** and **anon/public key**.
4. Confirm **Authentication → Providers → Email** has OTP/magic-link enabled (on by default).
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to those values, locally and/or on Render (see below).

## Data sources

- **Arabic text + English translation**: [AlQuran Cloud API](https://alquran.cloud/api) (`quran-uthmani` + `en.sahih` editions, no API key required). Arabic and translation are fetched as two separate single-edition calls (not the combined multi-edition endpoint), since the combined endpoint isn't reliable on Page mode.
- **Recitation audio**: [EveryAyah.com](https://everyayah.com) per-ayah mp3 files (no API key required). Folder-name slugs vary in bitrate suffix and aren't all independently confirmed, so each reciter lists a few candidate slugs in `src/lib/qaris.ts`. If every EveryAyah candidate fails, the player tries [quran.com's](https://api.quran.com) documented reciter/audio API as an independent second source (matching by reciter name), before finally falling through to text-paced timing.
- **Scenery backdrops**: 16 hand-built CSS/SVG scenes (animated nature scenes plus simpler vintage-toned ones like parchment, sepia, and charcoal) — no external images or video files, so they work offline and have no licensing concerns.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sign-in, the study dashboard, and reviews need Supabase credentials (see [Supabase setup](#supabase-setup-one-time) above); set these locally in `.env.local` (gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without these, everything except the waitlist sign-in and `/reel` access gating still works.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Deployment

This is a standard Next.js App Router project, deployable to any Node 20.9+ host via `npm run build && npm run start`.

### Render

A `render.yaml` blueprint is included:

1. On the [Render dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
2. Connect this GitHub repo and select the `claude/app-deployment-plan-g48tfj` branch (or `main`, once merged).
3. Render reads `render.yaml` and provisions a **Web Service** (build command `npm ci --include=dev && npm run build`, start command `npm run start`, Node 20.9.0).
4. Click **Apply**. First deploy takes a few minutes; Render gives you a live `https://<service-name>.onrender.com` URL when it's done.
5. **Before (or right after) deploying**, replace the placeholder environment variables in the Render service settings with real values: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your [Supabase project](#supabase-setup-one-time). These can't be known ahead of time, so `render.yaml` ships obvious placeholders rather than working values.

Also add your deployed URL (`https://<service-name>.onrender.com`) to Supabase's **Authentication → URL Configuration → Redirect URLs**, so magic links are allowed to redirect back to it.

If you already had this service running from before Supabase was added, you'll need to **sync the blueprint again** on Render's dashboard (Blueprint → Manual Sync, or push to the branch if auto-sync is on) so it picks up the new environment variable slots — then fill in the real values as in step 5.

If you'd rather set it up manually instead of via the blueprint: create a **Web Service**, point it at this repo, set the build command to `npm ci --include=dev && npm run build`, the start command to `npm run start`, leave the port unset (Render sets `PORT` automatically and `next start` reads it), and set the two environment variables above.

### Other hosts

Any platform that runs a persistent Node process works the same way (build command `npm run build`, start command `npm run start`). Vercel also works out of the box if preferred, since it's zero-config for Next.js.

Once deployed, users can "Add to Home Screen" / "Install" from their browser to get an app-like icon and standalone window — this is the PWA install flow referenced in the app plan, replacing an app-store listing.
