# HifdhScroll

An installable web app (PWA) for scrolling through Quran "reels" — Arabic text and English translation synced to a reciter's audio, over an animated scenic backdrop. Works on any device from a browser (Android, iOS, Windows, HarmonyOS, etc.) — no app store required.

## How it works

1. Pick a passage on the home screen: by **Surah** (defaults to Al-Baqarah), by **Mushaf page**, or by a custom **ayah range**.
2. Pick which reciters are allowed — 12 total (Murattal: Alafasy, Al-Dossari, Al-Muaiqly, Al-Ghamdi, Al-Sudais, Al-Shuraim, Al-Shatri, Al-Hudhaify, Ayyoub. Mujawwad: Al-Minshawi, Abdul Basit, Al-Hussary) — all are selected by default; deselect any you don't want.
3. Hit **Generate Reels**. For X ayahs in the passage, exactly 2X reels are generated, each a randomized 10-20 ayah run (never crossing a surah boundary; shorter surahs and Mushaf pages instead get a proportional window, so a short surah like Al-Fatihah still varies in start/end instead of every reel just being the whole thing — see `src/lib/reelSegments.ts`). These are random overlapping windows rather than a clean partition, so any given ayah typically turns up in several different reels with different neighbors, reciter, and scenery each time — repeated exposure in varied context for memorization — and presentation is inherently non-sequential (a reel for ayah 30 might be followed by one for ayah 112). The same logic applies to Surah, Page, and Range modes; reel count scales with passage length and never depends on how many reciters are selected.
4. Reels play in a fullscreen, vertically-scrolling feed like Instagram Reels/TikTok — scroll or swipe down to move to the next one, no buttons. Each reel auto-plays its ayah's audio, Arabic text and translation animate in, and it auto-advances on audio end. Bismillah is detected and shown as its own banner, separate from the ayah text.

## Student of Knowledge study dashboard

`/study` is a separate focus-session tool for students of knowledge (not just memorization) — any signed-in user can use it regardless of trial status, since it isn't part of the reel-generation gating at all. It's linked from the home page.

- **Simulated video call** (`src/components/study/FakeVideoCall.tsx`): a two-panel layout styled like a video call — a static "teacher" placeholder next to the user's own camera self-view — clearly labeled throughout as a simulation ("not a real class, no one else is on this call") so it's never mistaken for an actual call. The idea is that seeing yourself on camera, like in a real class, helps you stay on-task. Camera access is opt-in (a button, not requested automatically) and the stream is only ever rendered locally — nothing is uploaded or recorded.
- **Lecture embed** (`src/components/study/LectureEmbed.tsx`): paste a YouTube link (e.g. a scholar's lecture) and it plays inline via `youtube-nocookie.com`, next to the video-call panel instead of a separate tab.
- **Focus timer** (`src/components/study/StudyTimer.tsx`): 15/25/45/60-minute presets, start/pause/reset, and an "end & log now" option to record a partial session early.
- **To-do list** (`src/components/study/TaskList.tsx`): a per-user `study_tasks` table (see `supabase/migrations/004_study_dashboard.sql`), plain Row-Level-Security scoped to `auth.uid()`.
- **Gamification** (`src/components/study/GamificationBar.tsx`, `src/lib/gamification.ts`): points, a daily streak, and badges for point/streak milestones. Finishing (or manually ending) a timer session calls the `record_study_session` Postgres function, which awards points and updates the streak server-side — duration is capped per call and the whole calculation happens in the function, not the client, so points/streak can't just be set from devtools the way `trial_ends_at` couldn't be either (see the feedback flow above).

## Waitlist and free trial

Generating reels (`/reel`) requires an active trial. New visitors are pointed to `/waitlist` (a link on the home page, or an automatic redirect if they try `/reel` directly) to sign in with just an email (name and a suggestion/feedback note are both optional) — no password. They get a magic link by email; clicking it signs them in and starts a 14-day free trial immediately.

This runs on [Supabase](https://supabase.com) (Auth + Postgres) rather than a custom-built login system:

- **Auth**: Supabase's email magic-link (OTP) sign-in. `src/lib/supabase/client.ts` / `server.ts` / `middleware.ts` are the standard `@supabase/ssr` client setup for the Next.js App Router.
- **Trial data**: a `profiles` table (see `supabase/migrations/001_profiles_and_trial.sql`) with `trial_starts_at`/`trial_ends_at`, auto-created by a database trigger the moment someone signs up, copying the name/suggestion they entered from their auth metadata. Protected by Row Level Security so a user can only ever read their own row.
- **Gating**: `src/proxy.ts` refreshes the Supabase session and checks `trial_ends_at` on every `/reel` and `/feedback` request. No signed-in user → `/waitlist` (`from=signin`, a neutral "sign in" prompt — not shown as an expired trial). Trial still active → `/reel` works and `/feedback` bounces to `/`. Trial expired and feedback not yet given → `/reel` redirects to `/feedback`. Trial expired and feedback already given (the one-time 30-day bonus already used) → back to `/waitlist` (`from=trial-ended`, the "your trial has ended" message). These two waitlist reasons are deliberately distinct so a brand-new visitor is never told their (nonexistent) trial "has ended."
- **Magic-link callback**: `src/app/auth/callback/route.ts` exchanges the emailed code for a session, per Supabase's documented PKCE flow.
- There's no paid tier or renewal flow — once the 14-day trial and the one-time 30-day feedback bonus are both used up, `/reel` redirects back to the waitlist page.

### Post-trial feedback → 30 more days

When the 14-day trial expires, `/reel` redirects to `/feedback` (see `src/components/FeedbackForm.tsx`) instead of straight back to the waitlist. The page:

- Explains, in a respectful Islamic tone, that the trial has ended and thanks the user for their time.
- Shows two verses fetched live through the same AlQuran Cloud integration used for reels — An-Nahl 16:125 and Fussilat 41:33 (`src/components/DawahVerses.tsx`) — both about the virtue of calling others to the Qur'an, framing a review as an invitation that might turn someone's Instagram scrolling into Qur'an reading instead.
- Asks for a star rating, a short review, and — separately — what features or value would make the app worth paying for, since that's genuinely useful product feedback.
- On submit, calls the `submit_feedback_and_extend_trial` Postgres function (see `supabase/migrations/002_feedback_and_trial_extension.sql`), which records the feedback and pushes `trial_ends_at` out by 30 days, then redirects home.

This only ever fires once per account: the function refuses to run again if `feedback_submitted_at` is already set, and direct client updates to `trial_ends_at` are no longer possible at all — migration 002 drops the old "users can update their own profile" policy (which would have let anyone extend their own trial from devtools) so the trial can now only change through this server-side function.

### Supabase setup (one-time)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in `supabase/migrations/` in order (001 through 004): profiles/trial, the post-trial feedback flow, the donation-field removal, then the Study Session dashboard's task table and gamification columns/function.
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

Open http://localhost:3000. The waitlist/trial gating needs Supabase credentials (see [Supabase setup](#supabase-setup-one-time) above); set these locally in `.env.local` (gitignored):

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
