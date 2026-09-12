# Spots 📍

A mobile-first places tracker, built for iPhone Safari as an add-to-home-screen web app. Track places you want to go and places you've been — categorised, rateable, photo-backed, with a map view and Instagram-post import.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v3 + shadcn/ui · Supabase (Postgres, Storage, Auth) · Mapbox GL + Search Box API · Claude API (caption extraction) · framer-motion · Vercel.

**Design:** [PRODUCT.md](PRODUCT.md) holds the strategy (who it's for, what it should never look like); [DESIGN.md](DESIGN.md) holds the visual system — OKLCH tokens, light/dark palettes, type scale, motion rules. Read those before changing anything visual.

---

## Setup (one-time, ~15 minutes)

### 1. Supabase project

1. Create a project at [database.new](https://database.new) (any region near you; save the DB password).
2. Open **SQL Editor** and run the three migration files **in order**, one at a time:
   - `supabase/migrations/0001_schema.sql` — tables, enums, indexes, RLS policies
   - `supabase/migrations/0002_storage.sql` — private `photos` bucket + storage policies
   - `supabase/migrations/0003_rate_limit.sql` — rate-limit table + RPC
   - `supabase/migrations/0004_shared_access.sql` — `members` allowlist; switches every policy from owner-only to shared
3. Verify: **Table Editor** shows `places`, `visits`, `photos`, `rate_limits` all with an RLS badge; **Storage** shows a private `photos` bucket.
4. **Authentication → URL Configuration**:
   - Site URL: your production URL (use `http://localhost:3000` until you deploy)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and later `https://<your-app>.vercel.app/auth/callback`
5. Optional for a personal app: **Authentication → Sign In / Providers → Email → disable "Confirm email"** so sign-up logs you straight in.
6. Copy from **Project Settings → API**: the Project URL and the anon/publishable key.

### 2. Mapbox

Create an account at [mapbox.com](https://account.mapbox.com) and create a public token (starts with `pk.`). **Recommended:** add URL restrictions to the token (your Vercel domain + `http://localhost:3000`) — the token ships in the browser bundle, and URL restrictions are the only thing stopping someone from lifting it and billing your account. Free tier: 50k map loads/month — plenty.

### 3. Anthropic

Create an API key at [console.anthropic.com](https://console.anthropic.com). Caption extraction uses Claude Haiku — each import costs a fraction of a cent.

### 4. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon/publishable key) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox account (public token) |
| `ANTHROPIC_API_KEY` | Anthropic console (server-side only, never shipped to the client) |
| `META_OEMBED_TOKEN` | Optional — `APP_ID\|CLIENT_TOKEN` from a Meta developer app with the **oEmbed Read** feature approved. Skip freely; the caption-paste import path needs nothing. |

### 5. Run it

```bash
npm install
npm run dev
```

To test on your iPhone during development: connect to the same Wi-Fi and open `http://<your-mac-LAN-IP>:3000` in Safari.

### 6. Deploy to Vercel

**Live:** https://spots-beryl.vercel.app

Already set up: the repo is linked to the Vercel project `joventungs-projects/spots`,
all four env vars are set for Production, Preview and Development, and every push to
`master` ships to production automatically.

Two things Vercel can't do for you — do these once, or auth and the map will
break in production:

1. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://spots-beryl.vercel.app`
   - Redirect URLs: add `https://spots-beryl.vercel.app/auth/callback`

   Without this, sign-up confirmation links redirect to localhost.

2. **Mapbox → your public token → URL restrictions**
   - Add `https://spots-beryl.vercel.app` (keep `http://localhost:3000`).

   The token ships in the browser bundle; URL restrictions are the only thing
   stopping someone lifting it and billing your account.

Then on your iPhone: open the URL in Safari → Share → **Add to Home Screen**.

#### Redeploying

Push to `master` and Vercel builds it. To deploy without a commit:

```bash
vercel deploy --prod
```

If you ever add a new `NEXT_PUBLIC_*` variable, redeploy after setting it —
those are inlined at build time, so an existing build won't pick them up.

---

## Sharing the app with someone

Spots is a **shared** space, not a per-user one. Anyone on the allowlist sees
and can edit every spot, visit and photo; `user_id` on each row records who
added it, for the "added by" labels, and no longer controls access.

Access is an explicit allowlist, because Supabase sign-up is open by default:
registering an account grants nothing until you add that account to `members`.

**To add someone:** have them sign up in the app first, then run this in the
Supabase SQL editor:

```sql
insert into public.members (user_id, display_name)
select id, 'Their Name' from auth.users where email = 'them@example.com'
on conflict (user_id) do nothing;
```

**To remove someone:**

```sql
delete from public.members where user_id = (
  select id from auth.users where email = 'them@example.com'
);
```

There are deliberately no insert/update/delete RLS policies on `members`, so
the allowlist can only be changed from the SQL editor or the dashboard — never
from a browser session.

Worth doing once you're both registered: **Authentication → Sign In / Providers
→ Email → disable "Allow new users to sign up"**. The allowlist already blocks
strangers from seeing anything; this stops them creating accounts at all.

## How the Instagram import works (honest version)

1. **Paste a post link** → the server tries Meta's oEmbed API (only if `META_OEMBED_TOKEN` is set) and then the post page's `og:` meta tags. Both are best-effort — Instagram usually login-walls anonymous datacenter requests.
2. **When that fails** (expected), the form asks you to paste the caption — copy it from the Instagram share sheet. This path works every time.
3. Either way, the caption goes to Claude, which extracts `{place name, city, category}` and prefills the add-place form. Nothing is saved until you confirm.

Imports are rate-limited to 10/hour per account.

## Security model

- **RLS everywhere** — every table and the storage bucket enforce access at the database level via the `members` allowlist (see *Sharing the app with someone*); the app never uses the Supabase service-role key (it doesn't exist in this codebase at all). Membership is checked through a `SECURITY DEFINER` function with a pinned `search_path`, so policies can't recurse.
- Every server action and API route re-checks auth (`getUser()`) and validates input with Zod.
- Photo uploads are magic-byte sniffed server-side (JPEG/PNG/WebP only, 10MB cap; the client compresses to ~1MB before upload) and stored in a private bucket under `{user_id}/…` with signed, expiring URLs.
- The Instagram fetch only ever requests an exact-host `instagram.com` post URL rebuilt from validated parts, with redirects disabled and a capped response read (SSRF-hardened).
- Rate limiting is backed by a Postgres table + `SECURITY DEFINER` RPC with an action allowlist and bounded windows — the table itself is unreachable from clients.
- The Next.js image optimizer is pinned to this project's Supabase storage path only; Instagram thumbnails render unoptimized so `/_next/image` can't be used as an unauthenticated fetch relay.

**Verify RLS yourself** (recommended once): create a third account, sign in with it, and confirm it sees *nothing* — no places, no photos — because it isn't on the allowlist. Then add it to `members` and confirm everything appears.

## Known limitations

- Supabase free tier pauses projects after ~1 week of inactivity — the app will error until you resume it from the dashboard.
- HEIC photos decode in Safari (target platform); desktop Chrome can't read HEIC and those uploads will fail with a toast.
- Bulk-importing an entire Instagram saved collection is out of scope — there's no public API for it.
- `npm audit` reports two moderate advisories in Next.js's own bundled postcss (build-time CSS tooling, not reachable by user input); they'll clear when Next ships a patch release.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build + typecheck |
| `npm run lint` | ESLint |
