# Kushal Dahal — Portfolio & Admin

A personal portfolio and writing site with a protected admin panel. The public
site is designed to be read: editorial typography, generated cover art, motion
that respects `prefers-reduced-motion`, and no image bloat. The admin side covers
the whole publishing loop — posts, media, messages, analytics and site settings.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind
CSS v4**, **Prisma**, **Motion**, **Recharts**, **Zod** and **React Hook Form**.

---

## Quick start

Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env
# Set DATABASE_URL, AUTH_SECRET (openssl rand -base64 48),
# NEXT_PUBLIC_SITE_URL and a strong ADMIN_PASSWORD.

npm run db:push   # create collections and indexes
npm run dev
```

Open <http://localhost:3000>. Sign in at `/admin/login` with the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. The owner account is created on
the first successful sign-in while the user table is empty. Change the password
from **Admin → Settings** afterwards.

Demo content is opt-in:

```bash
ALLOW_DB_SEED=true npm run db:seed
```

Never run it against a real database — it replaces posts, interests, messages
and visitor history with sample data.

### Scripts

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start the dev server                                     |
| `npm run check:env` | Validate environment variables without building          |
| `npm run build`     | Validate env, generate Prisma Client and build           |
| `npm start`         | Serve the production build                               |
| `npm run lint`      | Run ESLint                                               |
| `npm run db:push`   | Sync `prisma/schema.prisma` to the database              |
| `npm run db:seed`   | Seed demo content (requires `ALLOW_DB_SEED=true`)        |
| `npm run db:studio` | Open Prisma Studio                                       |
| `npm run setup`     | `db:push` (seed separately if you want demo content)     |
| `node scripts/generate-resume.mjs` | Regenerate `public/resume.pdf`            |

The database is MongoDB (Atlas or local). `DATABASE_URL` must include the
database name before any query string, e.g.
`mongodb+srv://user:pass@cluster0.example.mongodb.net/portfolio`.

---

## What's included

### Public site

- Landing page with animated hero, skills marquee, personal bento, selected
  projects, latest writing, testimonials and contact call-to-action. Projects and
  testimonials are managed from the admin panel and fall back to built-in copy
  until the first entry is added.
- About and Interests pages backed by real content.
- Listening page at `/music`: an admin-curated grid of albums, tracks and
  playlists with cover art, notes and optional listen links. Three recent picks
  also appear on the homepage.
- Photo gallery at `/photos`: published photos and compressed MP4/WebM videos
  from the media library open in a calm lightbox with captions and keyboard
  navigation.
- Blog index with full-text search, tag filters, pagination and a featured post.
- Blog post page with table of contents, reading progress, generated cover art,
  view counts, share/copy-link buttons and related posts.
- Contact form with server validation, honeypot, optional Cloudflare Turnstile,
  rate limiting and Resend notifications.
- Privacy & cookies page, cookie consent banner, custom 404/error pages.
- Dark/light themes, responsive navigation, reduced-motion support.
- Metadata, Open Graph/Twitter cards, dynamic OG image, sitemap and robots.

### Admin panel

- Credentials login with bcrypt, signed HTTP-only JWT session and rate limiting.
- `proxy.ts` guards every `/admin/*` route (Next 16's replacement for middleware).
- Dashboard with visitor counts, traffic chart, top pages, devices, recent posts
  and inbox summary.
- Blog manager: search, status/tag filters, sorting, bulk actions and delete
  confirmation.
- Markdown editor with live preview, local autosave, cover/media picker, tags,
  SEO fields, draft/published/scheduled states and featured toggle.
- Media library: drag-and-drop or picker upload, multi-file, previews, alt text,
  gallery captions, a "show in gallery" toggle, copy URL and bulk delete. Photos
  are re-encoded to WebP; videos use signed direct uploads to Cloudinary with
  automatic compression. Local storage is the fallback when Cloudinary is not
  configured.
- Music manager: add tracks or albums with cover art, year, note, listen link,
  publish/hide controls, ordering and delete confirmation.
- Testimonials manager: add, edit, reorder, hide and delete the quotes shown on
  the homepage. The built-in examples are used until the first entry exists.
- Projects manager: add, edit, reorder, hide and delete selected work, including
  a cover photo upload (JPG/PNG/WebP), live and repository links, tags and an
  optional highlight metric. Uploaded covers also land in the media library.
- Visitors: 7/30/90-day ranges, page views, uniques, active-now, countries,
  referrers, devices, browsers and CSV export.
- Messages: unread/read/replied/archived filters, detail pane, status changes,
  bulk actions, `mailto:` reply and copy address.
- Settings: identity, contact, education, hometown, availability, images,
  socials, SEO defaults, interests manager and password change.

### Demo content

The seed is deliberately opt-in: `ALLOW_DB_SEED=true npm run db:seed`. It creates
an admin, six substantial essays, six interests, six messages, two media records
and about 30 days of anonymised visitor history so every screen looks alive on
first run. The script refuses to run in production and exits without
`ALLOW_DB_SEED=true`, so a real site cannot be filled with demo data by
accident.

---

## Environment variables

| Variable                       | Required | Purpose                                                        |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`                 | Yes      | MongoDB connection string including the database name          |
| `AUTH_SECRET`                  | Yes      | Signs the session JWT. 32+ random characters                   |
| `ADMIN_EMAIL`                  | Yes      | First-run admin account / notification fallback                |
| `ADMIN_PASSWORD`               | Yes      | First-run admin password (12+ characters in production)        |
| `NEXT_PUBLIC_SITE_URL`         | Yes      | Canonical site origin used by metadata and sitemap             |
| `CONTACT_TO_EMAIL`             | No       | Where contact notifications are sent                           |
| `RESEND_API_KEY`               | No       | Enables Resend email notifications                             |
| `RESEND_FROM_EMAIL`            | No       | Verified sender, e.g. `Portfolio <hello@yourdomain.com>`       |
| `TURNSTILE_SECRET_KEY`         | No       | Server-side Turnstile verification                             |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No     | Renders the Turnstile widget when set                          |
| `CLOUDINARY_CLOUD_NAME`        | No       | Enables remote media storage                                   |
| `CLOUDINARY_API_KEY`           | No       | Cloudinary upload/delete signing                               |
| `CLOUDINARY_API_SECRET`        | No       | Cloudinary upload/delete signing                               |
| `ALLOW_DB_SEED`                | No       | Must be `true` before the demo seed script will run            |

Without Resend or Turnstile, contact messages still save to the database. Without
Cloudinary, uploads go to `public/uploads/`.

To switch media storage to Cloudinary later, add `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` to `.env` and restart. New
uploads (and gallery posts) go straight to Cloudinary; existing local files keep
working. No code change or multer middleware is needed — the App Router upload
route parses the multipart form with the native Web `FormData` API.

---

## Architecture notes

```
app/
  (public)/        Public pages with the marketing shell
  admin/
    login/         Sign-in page (unauthenticated)
    (dashboard)/   Protected shell: dashboard, blog, media, music, projects,
                   testimonials, visitors, messages, settings
  api/             Contact, tracking, post views, upload, analytics CSV, health
  og/              Dynamic Open Graph image
actions/           Server actions for auth, posts, media, messages, interests, settings
components/        UI kit, Aceternity-style effects, public sections, admin features
lib/               Prisma, session, settings, posts, analytics, mail, rate limiting, Cloudinary
prisma/            Schema and seed
proxy.ts           Route protection for /admin/*
```

- **Auth.** A small credentials flow instead of a full auth framework: bcrypt
  hashes, a `jose` HS256 JWT in an HTTP-only cookie, first-run bootstrap from
  `ADMIN_*`, and login rate limiting per IP and email. `proxy.ts` checks the
  token before the admin segment renders; every server action calls
  `requireAdmin()`, which verifies the token *and* re-reads the user from the
  database, so deleted or demoted accounts lose access immediately. There are no
  fallback secrets: the app refuses to start without a strong `AUTH_SECRET`, and
  production bootstrap requires a 12+ character `ADMIN_PASSWORD`.
- **Data.** Prisma models for users, posts, media, messages, visits, interests,
  testimonials, projects and singleton site settings, backed by MongoDB. Tags are
  stored on each post as a `String[]` because MongoDB does not support Prisma's
  implicit many-to-many relations; `lib/posts.ts` maps them to `{ id, name, slug }`
  for the UI. Post and message statuses remain strings.
- **Analytics.** First-party only. `/api/track` stores an anonymous visitor id,
  path, referrer, coarse device/browser/OS and optional Vercel country headers —
  no raw IP addresses. The tracker skips admin routes and the owner's session,
  and respects the cookie banner's "Essential only" choice.
- **Media.** Photo uploads accept JPG, PNG and WebP up to 5 MB. SVG is rejected
  because it is an active document format. Every photo is decoded and re-encoded
  with `sharp` to WebP at a maximum of 4096px, which validates the bytes and
  strips EXIF/GPS metadata. Videos (MP4, WebM, MOV) up to 100 MB are uploaded
  directly from the browser to Cloudinary with a short-lived signature, then
  delivered as compressed MP4. Local files live in `public/uploads`; setting the
  Cloudinary variables switches uploads and deletes to the Cloudinary REST API.
  Uploaded files stay out of the public gallery until an admin adds a caption and
  enables **Show in gallery** — or switches on **Publish uploads to the public
  gallery** before uploading. Route handlers parse multipart bodies with the
  native Web `FormData` API (the App Router equivalent of multer), and Cloudinary
  is used automatically once its three environment variables are set.
- **Email.** Contact notifications use the Resend REST API. Messages are always
  stored first, so a provider outage never loses an enquiry.
- **Motion.** Framer Motion/Motion animations are paired with
  `prefers-reduced-motion` CSS and a `useReducedMotion` check in the hero.

### Database notes

The schema targets MongoDB. Run `npx prisma db push` to create collections and
indexes; add demo content only with `ALLOW_DB_SEED=true npm run db:seed`. The
seed is destructive: it replaces posts, interests, messages and visitor history,
and upserts settings plus the two seeded media records. It is blocked in
production and when `ALLOW_DB_SEED` is not explicitly `true`.

Switching providers (for example to PostgreSQL) is possible but requires more
than a connection string: remove the `@map("_id")` annotations and replace the
`String[]` tags on `Post` with an explicit relation model. The rest of the schema
uses portable scalar types.

### Deploying

`npm run build` runs `scripts/check-env.mjs` first. A missing or weak secret, a
partial Cloudinary/Turnstile configuration, or a localhost production URL stops
the build with a specific message. Set `SKIP_ENV_VALIDATION=1` only for a
throwaway preview.

- **Vercel:** set every required env var, point `DATABASE_URL` at MongoDB Atlas,
  and allow the deployment's IPs in Atlas (or use `0.0.0.0/0` for a quick start).
  `prisma generate` is already part of the build and `postinstall`.
- **Node host:** run `npm ci`, `npm run build`, then `npm start`. Persist
  `public/uploads` or use Cloudinary, which is the recommended production store
  because serverless filesystems are ephemeral.
- **Secrets:** `AUTH_SECRET` must be at least 32 random characters and
  `ADMIN_PASSWORD` at least 12 in production. The first login creates the owner
  account while the user table is empty; change the password from **Admin →
  Settings** immediately afterwards.
- **Site URL:** set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin so canonical
  links, OG images, cookies and the sitemap are correct. Admin cookies derive
  `Secure` from `x-forwarded-proto`, so TLS-terminating proxies work too.
- **Email:** verify your domain in Resend and set `RESEND_FROM_EMAIL`. The
  default `onboarding@resend.dev` sender only works for limited testing.
- **Health check:** point uptime monitoring at `GET /api/health`; it pings
  MongoDB and returns `503` when the database is unreachable.
- **Headers:** production responses include HSTS, a content security policy,
  `nosniff`, frame/referrer/permissions policies, and `noindex` on `/admin` and
  `/api`. `poweredByHeader` is disabled.
- **Audit:** run `npm audit` after dependency changes. Current transitive
  advisories are tracked; apply non-breaking updates with `npm audit fix` and
  review breaking upgrades individually.

---

## Accessibility & performance

- Semantic landmarks, visible focus styles, labelled form controls, `aria-current`
  navigation state and keyboard-friendly dialogs/sheets.
- Theme is class-based with a no-flash inline script from `next-themes`.
- Cover art is generated SVG/CSS, so most pages ship no large hero images.
- Above-the-fold avatar uses `next/image` with `priority`; remote images are
  allow-listed for Unsplash, Cloudinary and UploadThing.
- Reduced motion is respected globally in CSS and in the hero animation.

## Résumé

`public/resume.pdf` is a real one-page PDF generated by
`scripts/generate-resume.mjs`. Edit the content in that script and rerun it, or
upload a replacement through the media library and update **Settings → Résumé
URL**.
