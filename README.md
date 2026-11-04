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
# Set AUTH_SECRET (openssl rand -base64 32) and change the admin password.

npm run setup   # prisma db push + seed demo content
npm run dev
```

Open <http://localhost:3000>.

The demo admin is at <http://localhost:3000/admin/login>:

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | `admin@kushaldahal.dev`  |
| Password | `admin1234`              |

These come from `.env`. The login page shows them only outside production. Change
`ADMIN_EMAIL`, `ADMIN_PASSWORD` and `AUTH_SECRET` before deploying.

### Scripts

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start the dev server                                     |
| `npm run build`     | Generate Prisma Client and create a production build     |
| `npm start`         | Serve the production build                               |
| `npm run lint`      | Run ESLint                                               |
| `npm run db:push`   | Sync `prisma/schema.prisma` to the database              |
| `npm run db:seed`   | Seed demo content (idempotent enough to re-run locally)  |
| `npm run db:studio` | Open Prisma Studio                                       |
| `npm run setup`     | `db:push` + `db:seed`                                    |
| `node scripts/generate-resume.mjs` | Regenerate `public/resume.pdf`            |

The database is MongoDB (Atlas or local). `DATABASE_URL` must include the
database name before any query string, e.g.
`mongodb+srv://user:pass@cluster0.example.mongodb.net/portfolio`.

---

## What's included

### Public site

- Landing page with animated hero, skills marquee, personal bento, selected
  projects, latest writing, testimonials and contact call-to-action.
- About and Interests pages backed by real content.
- Listening page at `/music`: an admin-curated grid of albums, tracks and
  playlists with cover art, notes and optional listen links. Three recent picks
  also appear on the homepage.
- Photo gallery at `/photos`: published images from the media library open in a
  calm lightbox with captions and keyboard navigation.
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
  gallery captions, a "show in gallery" toggle, copy URL and bulk delete. Local
  storage by default, Cloudinary when configured.
- Music manager: add tracks or albums with cover art, year, note, listen link,
  publish/hide controls, ordering and delete confirmation.
- Visitors: 7/30/90-day ranges, page views, uniques, active-now, countries,
  referrers, devices, browsers and CSV export.
- Messages: unread/read/replied/archived filters, detail pane, status changes,
  bulk actions, `mailto:` reply and copy address.
- Settings: identity, contact, education, hometown, availability, images,
  socials, SEO defaults, interests manager and password change.

### Demo content

`npm run db:seed` creates an admin, six substantial essays, six interests, six
messages, two media records and about 30 days of anonymised visitor history so
every screen looks alive on first run.

---

## Environment variables

| Variable                       | Required | Purpose                                                        |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`                 | Yes      | MongoDB connection string including the database name          |
| `AUTH_SECRET`                  | Yes      | Signs the session JWT. Use a long random string                |
| `ADMIN_EMAIL`                  | Yes      | First-run admin account / notification fallback                |
| `ADMIN_PASSWORD`               | Yes      | First-run admin password                                       |
| `NEXT_PUBLIC_SITE_URL`         | Yes      | Canonical site origin used by metadata and sitemap             |
| `CONTACT_TO_EMAIL`             | No       | Where contact notifications are sent                           |
| `RESEND_API_KEY`               | No       | Enables Resend email notifications                             |
| `RESEND_FROM_EMAIL`            | No       | Verified sender, e.g. `Portfolio <hello@yourdomain.com>`       |
| `TURNSTILE_SECRET_KEY`         | No       | Server-side Turnstile verification                             |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No     | Renders the Turnstile widget when set                          |
| `CLOUDINARY_CLOUD_NAME`        | No       | Enables remote media storage                                   |
| `CLOUDINARY_API_KEY`           | No       | Cloudinary upload/delete signing                               |
| `CLOUDINARY_API_SECRET`        | No       | Cloudinary upload/delete signing                               |

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
    (dashboard)/   Protected shell: dashboard, blog, media, visitors, messages, settings
  api/             Contact, tracking, post views, upload, analytics CSV
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
  `requireAdmin()` as a second line of defence.
- **Data.** Prisma models for users, posts, media, messages, visits, interests
  and singleton site settings, backed by MongoDB. Tags are stored on each post as
  a `String[]` because MongoDB does not support Prisma's implicit many-to-many
  relations; `lib/posts.ts` maps them to `{ id, name, slug }` for the UI. Post
  and message statuses remain strings.
- **Analytics.** First-party only. `/api/track` stores an anonymous visitor id,
  path, referrer, coarse device/browser/OS and optional Vercel country headers —
  no raw IP addresses. The tracker skips admin routes and the owner's session,
  and respects the cookie banner's "Essential only" choice.
- **Media.** Uploads are validated for type and 5 MB max. SVGs are stripped of
  scripts and event handlers. Local files live in `public/uploads`; setting the
  Cloudinary variables switches uploads and deletes to the Cloudinary REST API.
  Uploaded images stay out of the public gallery until an admin adds a caption
  and enables **Show in gallery** — or switches on **Publish uploads to the
  public gallery** before uploading. Dimensions are read with `sharp` for layout.
  Route handlers parse multipart bodies with the native Web `FormData` API (the
  App Router equivalent of multer), and Cloudinary is used automatically once
  its three environment variables are set.
- **Email.** Contact notifications use the Resend REST API. Messages are always
  stored first, so a provider outage never loses an enquiry.
- **Motion.** Framer Motion/Motion animations are paired with
  `prefers-reduced-motion` CSS and a `useReducedMotion` check in the hero.

### Database notes

The schema targets MongoDB. Run `npx prisma db push` to create collections and
indexes, then `npm run db:seed` for demo content. The seed is safe to re-run: it
replaces posts, interests, messages and visitor history, and upserts settings and
the two seeded media records.

Switching providers (for example to PostgreSQL) is possible but requires more
than a connection string: remove the `@map("_id")` annotations and replace the
`String[]` tags on `Post` with an explicit relation model. The rest of the schema
uses portable scalar types.

### Deploying

- **Vercel:** set every required env var, run `prisma generate` in the build
  (already part of `npm run build`), and point `DATABASE_URL` at MongoDB Atlas.
  Allow the deployment's IPs in Atlas (or use `0.0.0.0/0` for a quick start).
- **Uploads:** the local filesystem is ephemeral on serverless hosts. Cloudinary
  is already supported and is the recommended production store.
- **Email:** verify your domain in Resend and set `RESEND_FROM_EMAIL`. The
  default `onboarding@resend.dev` sender only works for limited testing.
- **Secrets:** rotate `AUTH_SECRET` and the admin password. Seeding production is
  optional; if you skip it, the first login with `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` creates the account when the user table is empty.
- **Site URL:** set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin so canonical
  links, OG images and the sitemap are correct.

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
