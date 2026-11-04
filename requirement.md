# Portfolio Website: Requirements Document

## 1. Project Overview

A modern, animated personal portfolio website built with **Next.js**, using **shadcn/ui** and **Aceternity UI** for the interface. The site has a public-facing side (landing page, About, Interests, Blog, Contact) and a private **Admin Panel** where the owner can manage blog posts, upload images, view visitor analytics, and read messages/enquiries.

### Goals
- Make a strong first impression with a polished, animated landing page.
- Present personal details, skills, projects, and interests clearly.
- Let the owner manage content without touching code.
- Capture enquiries and understand who is visiting the site.

### Target Audience
Recruiters, potential clients, collaborators, and blog readers.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Server Components, Route Handlers, Server Actions |
| Language | **TypeScript** | Strict mode enabled |
| Styling | **Tailwind CSS** | Required by shadcn/ui and Aceternity UI |
| UI Components | **shadcn/ui** | Forms, dialogs, tables, tabs, toasts, sidebar, etc. |
| Animated Components | **Aceternity UI** | Hero effects, spotlight, cards, text effects, etc. |
| Animation Library | **Framer Motion** (`motion`) | Required by Aceternity components |
| Database | **PostgreSQL** (Neon / Supabase) | Alternative: MongoDB Atlas |
| ORM | **Prisma** | Type-safe DB access and migrations |
| Authentication | **Auth.js (NextAuth v5)** | Credentials login for the admin |
| Image Storage | **Cloudinary** or **UploadThing** | Image upload, optimization, CDN |
| Email | **Resend** (or Nodemailer) | Notify admin of new messages |
| Rich Text Editor | **Tiptap** (or MDX) | For writing blog posts |
| Form Handling | **React Hook Form + Zod** | Client and server validation |
| Charts | **Recharts** (via shadcn charts) | Admin analytics dashboard |
| Icons | **Lucide React** | |
| Deployment | **Vercel** | Preview and production environments |

---

## 3. Site Map

```
Public
├── /                  Landing page (hero + personal details + highlights)
├── /about             About me
├── /interests         Interests and hobbies
├── /blog              Blog listing
│   └── /blog/[slug]   Single blog post
└── /contact           Contact form

Admin (protected)
├── /admin/login
├── /admin             Dashboard overview
├── /admin/blog        Manage posts (list)
│   ├── /admin/blog/new
│   └── /admin/blog/[id]/edit
├── /admin/media       Image library
├── /admin/visitors    Visitor analytics
├── /admin/messages    Messages and enquiries inbox
└── /admin/settings    Profile details, social links, password
```

---

## 4. Functional Requirements: Public Website

### 4.1 Global Elements
- **FR-G1** Responsive navbar (floating or sticky) with links: Home, About, Interests, Blog, Contact.
- **FR-G2** Mobile navigation (hamburger / sheet menu).
- **FR-G3** Dark/Light theme toggle, defaulting to the system preference.
- **FR-G4** Footer with social links, email, copyright.
- **FR-G5** Smooth page transitions and scroll behaviour.
- **FR-G6** Custom 404 page and error boundary pages.
- **FR-G7** SEO: per-page metadata, Open Graph images, `sitemap.xml`, `robots.txt`.

### 4.2 Landing Page (`/`)
A visually rich, animation-heavy page with these sections:

1. **Hero Section**
   - Name, title/role, and a short tagline.
   - Animated background (e.g., Aceternity *Spotlight*, *Background Beams*, *Aurora Background*, or *Sparkles*).
   - Animated headline (e.g., *Typewriter Effect*, *Text Generate Effect*, or *Flip Words*).
   - Call-to-action buttons: "View Blog" / "Contact Me" / "Download Resume".
   - Profile photo or avatar with a subtle animation.
2. **Personal Details Section**
   - Name, location, email, phone (optional toggle), availability status.
   - Short bio.
   - Social links (GitHub, LinkedIn, X/Twitter, etc.).
   - Presented with cards (e.g., *3D Card Effect*, *Hover Effect Cards*, or *Bento Grid*).
3. **Skills / Tech Stack Section**
   - Animated grid, marquee, or *Infinite Moving Cards*.
4. **Featured Projects Section** (optional but recommended)
   - Project cards with image, description, tech tags, and live/GitHub links.
5. **Latest Blog Posts Section**
   - Shows the 3 most recent published posts.
6. **Testimonials / Quote Section** (optional)
7. **Contact CTA Section**
   - Short call-to-action leading to `/contact`.

**Animation requirements**
- Scroll-triggered reveal animations on each section.
- Hover micro-interactions on cards and buttons.
- Respect `prefers-reduced-motion` for accessibility.
- Animations must not drop below ~60 FPS on mid-range devices; lazy-load heavy effects.

### 4.3 About Page (`/about`)
- Detailed biography and personal story.
- Photo(s) / gallery.
- Education and work experience shown as an animated **timeline** (e.g., Aceternity *Timeline*).
- Skills and certifications.
- Downloadable resume (PDF).

### 4.4 Interests Page (`/interests`)
- Cards or a bento grid for each interest (e.g., music, travel, sports, reading, gaming, open source).
- Each interest has: title, icon/image, short description.
- Content is managed from the admin panel (or a config file in v1).

### 4.5 Blog (`/blog`, `/blog/[slug]`)
- **Listing page**: cards with cover image, title, excerpt, date, reading time, tags.
- Search by title and filter by tag/category.
- Pagination or infinite scroll.
- **Post page**: rich content (headings, code blocks with syntax highlighting, images, quotes, lists, links), table of contents, reading progress bar, share buttons, related posts.
- Only **published** posts are visible publicly; drafts are admin-only.
- Per-post SEO metadata and Open Graph image.
- Optional: view counter per post.

### 4.6 Contact Page (`/contact`)
- Form fields: Name, Email, Subject, Message (Phone optional).
- Client and server validation with Zod.
- Spam protection (honeypot field plus Cloudflare Turnstile or reCAPTCHA) and rate limiting.
- Success and error toasts.
- Submissions saved to the database and an email notification sent to the admin.
- Side panel with direct contact details and social links.

---

## 5. Functional Requirements: Admin Panel

### 5.1 Authentication and Security
- **FR-A1** Secure login page at `/admin/login` (email and password).
- **FR-A2** All `/admin/*` routes protected via middleware; unauthenticated users are redirected to login.
- **FR-A3** Single admin account (owner) in v1; the design should allow multiple roles later.
- **FR-A4** Passwords hashed (bcrypt/argon2); sessions via secure HTTP-only cookies.
- **FR-A5** Rate limiting and lockout on repeated failed logins.
- **FR-A6** Logout and session expiry.
- **FR-A7** Change password from Settings.

### 5.2 Dashboard (`/admin`)
- Summary cards: total visitors (today / 7 days / 30 days), total blog posts, unread messages, total images.
- Mini charts: visitors over time.
- Recent messages and recent posts lists.
- Quick actions: "New Post", "Upload Image".

### 5.3 Blog Management
- **Create / Edit / Delete** posts.
- Fields: title, slug (auto-generated, editable), excerpt, cover image, content (rich text), tags/categories, status (**Draft / Published / Scheduled**), published date, SEO title and description.
- Rich text editor with image insertion, code blocks, headings, links, and embeds.
- Live preview before publishing.
- Autosave drafts.
- List view with search, filter by status, sort, and bulk actions (delete, publish, unpublish).
- Confirmation dialog on destructive actions.

### 5.4 Media / Image Management
- Drag-and-drop **image upload** (multiple files).
- Supported formats: JPG, PNG, WebP, SVG (max size configurable, e.g., 5 MB).
- Automatic optimization and CDN delivery.
- Grid view of all images with preview, filename, size, upload date.
- Copy URL, rename, add alt text, and delete.
- Images reusable inside blog posts, the About page, and project cards.

### 5.5 Visitor Analytics
- Track every page view (privacy-conscious): timestamp, page path, referrer, country/city (IP-derived, IP itself hashed or anonymized), device type, browser, OS.
- Distinguish unique vs. returning visitors (anonymous cookie/fingerprint-free ID).
- Exclude bots and the admin's own visits.
- Dashboard views:
  - Visitors over time (line/area chart), with date range filter.
  - Top pages and top blog posts.
  - Top referrers/sources.
  - Countries map or list.
  - Device and browser breakdown.
  - Real-time or "last 30 minutes" active visitors (nice-to-have).
- Export data as CSV.
- Cookie/consent banner where legally required (GDPR-friendly approach).

### 5.6 Messages and Enquiries Inbox
- List of all contact form submissions with name, email, subject, date, and status.
- Status: **Unread / Read / Replied / Archived**.
- Open a message to see full details.
- Reply via `mailto:` link or direct email send (Resend) from the panel.
- Search, filter by status, delete, and bulk-mark as read.
- Unread count badge in the sidebar.
- Email notification to the admin on each new message.

### 5.7 Settings / Site Content
- Edit personal details shown on the landing page (name, title, tagline, bio, location, email, social links, availability).
- Upload or replace profile photo and resume.
- Manage Interests entries (add / edit / reorder / delete).
- Manage Skills and Projects (optional for v1).
- Site-wide SEO defaults.

### 5.8 Admin UI
- Sidebar layout (shadcn *Sidebar* component) with collapsible navigation.
- Data tables (shadcn *Data Table* with TanStack Table).
- Fully responsive, including mobile admin usage.
- Dark/Light mode.

---

## 6. Data Models (Initial Schema)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
}

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  content     String     // HTML / JSON / MDX
  coverImage  String?
  status      PostStatus @default(DRAFT)
  tags        Tag[]
  views       Int        @default(0)
  seoTitle    String?
  seoDesc     String?
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}

model Media {
  id        String   @id @default(cuid())
  url       String
  publicId  String?
  filename  String
  altText   String?
  size      Int
  mimeType  String
  createdAt DateTime @default(now())
}

model Message {
  id        String        @id @default(cuid())
  name      String
  email     String
  subject   String?
  body      String
  status    MessageStatus @default(UNREAD)
  createdAt DateTime      @default(now())
}

model Visit {
  id         String   @id @default(cuid())
  visitorId  String   // anonymous ID
  path       String
  referrer   String?
  country    String?
  city       String?
  device     String?
  browser    String?
  os         String?
  createdAt  DateTime @default(now())
}

model Interest {
  id          String @id @default(cuid())
  title       String
  description String
  icon        String?
  image       String?
  order       Int    @default(0)
}

model SiteSettings {
  id           String  @id @default("singleton")
  fullName     String
  title        String
  tagline      String?
  bio          String?
  email        String?
  phone        String?
  location     String?
  avatarUrl    String?
  resumeUrl    String?
  socials      Json?
  availability String?
}

enum Role          { ADMIN }
enum PostStatus    { DRAFT PUBLISHED SCHEDULED }
enum MessageStatus { UNREAD READ REPLIED ARCHIVED }
```

---

## 7. Non-Functional Requirements

### Performance
- Lighthouse score of **90+** for Performance, Accessibility, Best Practices, and SEO on key pages.
- Use `next/image`, font optimization (`next/font`), code-splitting, and lazy loading for heavy animations.
- Static generation / ISR for public pages and blog posts; revalidate on publish.

### Security
- Input validation and sanitization (Zod plus HTML sanitization for blog content).
- CSRF protection, secure headers (CSP, HSTS), and HTTPS only.
- Environment secrets stored in `.env` / Vercel env vars, never committed.
- Rate limiting on the contact form, login, and tracking endpoints.
- File upload validation (type, size) on the server.

### Accessibility
- WCAG 2.1 AA: keyboard navigation, focus states, semantic HTML, alt text, sufficient contrast.
- Reduced-motion support.

### Responsiveness
- Mobile-first design; tested at 360px, 768px, 1024px, and 1440px+.

### Privacy
- Analytics should not store raw IP addresses; hash or anonymize them.
- Cookie consent / privacy notice page.

### Maintainability
- Clean folder structure, reusable components, ESLint and Prettier, and Husky pre-commit hooks (optional).
- README with setup instructions and an `.env.example` file.

### Browser Support
- Latest two versions of Chrome, Edge, Firefox, and Safari; iOS Safari and Android Chrome.

---

## 8. Suggested Folder Structure

```
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing
│   │   ├── about/page.tsx
│   │   ├── interests/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   ├── blog/...
│   │   │   ├── media/page.tsx
│   │   │   ├── visitors/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   └── settings/page.tsx
│   ├── api/
│   │   ├── track/route.ts        # Visitor tracking
│   │   ├── contact/route.ts
│   │   ├── upload/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   ├── aceternity/               # Aceternity components
│   ├── sections/                 # Hero, Skills, Projects, etc.
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Navbar, Footer, ThemeToggle
├── lib/                          # prisma, auth, utils, validators
├── prisma/schema.prisma
├── actions/                      # Server actions
├── hooks/
├── public/
├── middleware.ts                 # Admin route protection
└── .env.example
```

---

## 9. Suggested Aceternity UI Components

| Section | Component Ideas |
|---|---|
| Hero | Spotlight, Background Beams, Aurora Background, Sparkles, Typewriter Effect, Text Generate Effect, Flip Words |
| Navbar | Floating Navbar |
| Personal Details / Interests | Bento Grid, 3D Card Effect, Card Hover Effect, Glare Card |
| Skills | Infinite Moving Cards, Icon Cloud, Tabs |
| About | Timeline, Parallax Scroll, Sticky Scroll Reveal |
| Projects | Expandable Cards, 3D Marquee, Direction-Aware Hover |
| Contact | Background Gradient, Moving Border buttons |
| Misc | Lamp Effect section headers, Meteors, Tracing Beam (blog post page) |

> Aceternity UI components are copy-paste (not an npm package); install their dependencies (`framer-motion`, `clsx`, `tailwind-merge`) and add any required Tailwind config/keyframes.

## 10. Suggested shadcn/ui Components

`button`, `card`, `input`, `textarea`, `form`, `label`, `select`, `dialog`, `sheet`, `dropdown-menu`, `tabs`, `table`, `badge`, `avatar`, `sonner (toast)`, `skeleton`, `sidebar`, `chart`, `calendar`, `popover`, `command`, `alert-dialog`, `pagination`, `switch`, `tooltip`, `separator`.

---

## 11. Development Phases / Milestones

| Phase | Scope | Outcome |
|---|---|---|
| **1. Setup** | Next.js + TypeScript + Tailwind, shadcn/ui, Aceternity deps, Prisma + DB, theme, layout, navbar/footer | Project skeleton running |
| **2. Public Pages** | Landing page with animations, About, Interests, Contact (static content first) | Public site UI complete |
| **3. Backend Foundations** | Auth.js, admin middleware, Prisma models, contact form API, email notifications | Secure admin login and message capture |
| **4. Blog System** | Blog CRUD, rich text editor, image upload, public blog pages | Fully working blog |
| **5. Admin Panel** | Dashboard, media library, messages inbox, settings and site content | Owner can manage content |
| **6. Analytics** | Visitor tracking endpoint, charts, filters, CSV export | Visitor insights live |
| **7. Polish and QA** | SEO, accessibility, performance tuning, responsive testing, security review | Production-ready |
| **8. Deploy** | Vercel deployment, domain, env variables, monitoring | Live website |

---

## 12. Acceptance Criteria (Summary)

- [ ] Landing page loads with smooth animations and displays personal details.
- [ ] About, Interests, Blog, and Contact pages are live and responsive.
- [ ] Contact form submissions are stored and trigger an email to the admin.
- [ ] Admin can log in securely; all admin routes are protected.
- [ ] Admin can create, edit, publish, and delete blog posts with images.
- [ ] Admin can upload, view, and delete images in the media library.
- [ ] Admin can view visitor statistics (page views, unique visitors, top pages, locations, devices).
- [ ] Admin can read, filter, and manage messages/enquiries.
- [ ] Site works in light and dark mode.
- [ ] Lighthouse scores of 90+ on the landing page.
- [ ] Deployed to production with environment variables configured securely.

---

## 13. Future Enhancements (Out of Scope for v1)

- Newsletter subscription and email campaigns.
- Blog comments and likes.
- Multi-language (i18n) support.
- Project case-study pages with CMS.
- RSS feed.
- AI chatbot assistant on the site.
- Multi-user admin roles.
- Scheduled posts via cron jobs.

---

## 14. Environment Variables (`.env.example`)

```
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
ADMIN_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_SITE_URL=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```