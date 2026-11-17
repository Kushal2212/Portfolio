# Portfolio Review: What to Improve

**Site reviewed:** https://portfolio-mocha-one-ifmd7bm8jc.vercel.app/
**Owner:** Kushal Dahal
**Pages reviewed:** Home, About, Interests, Blog, Contact (plus the links and content visible on Music, Photos and the footer)
**Review date:** 7 November 2026

> **Scope note:** This review is based on the page content, metadata and links of the live site. I could not see the rendered visuals, so animation quality, colors, spacing, mobile layout, and Lighthouse scores are **not** assessed. Items marked *(verify)* need a quick manual check on your side. I also did not review the admin panel (it is behind login).

---

## 1. Summary

**What's already good**
- Clear structure: Home, About, Interests, Music, Blog, Photos, Contact, plus a privacy page.
- A strong, real project (the AI cardamom disease detector) that solves a local problem.
- Good SEO basics are in place: canonical URLs, Open Graph/Twitter cards, robots meta, and a theme color.
- Contact form has useful enquiry types, a privacy note, and project-specific "Ask about this project" links.
- Blog with search, tags, reading time, and view counts; images served from Cloudinary.
- Personal touches (music, sport, interests) that make the site feel human.

**The biggest problem**
Several sections still contain **template/placeholder content** that contradicts your real story. Recruiters and clients notice this quickly, and it hurts trust more than anything else on the site. Fix Section 2 first.

---

## 2. Critical: Credibility and Content Accuracy (fix first)

### 2.1 Fake-looking testimonials on the home page
The "A few words from colleagues" section names three people (Maya Lindqvist, Arjun Shrestha, Elena Duarte) with company roles at Fathom Labs, Sajilo, and Northwind. These read as template placeholders. You are a student whose first job started in 2026, so invented testimonials could seriously damage your credibility if anyone checks.
- **Action:** Delete the section, or replace it with **real** quotes (a teacher, a senior at AvyantaTech, a client of the A.one website, a friend who used your app). Get permission and, if possible, a LinkedIn link.

### 2.2 Conflicting experience claims
- Home page says: *"I've spent the last six years helping small teams turn complicated ideas into products..."* But your timeline shows BSc CSIT (2022-2026) and your first job from 2026.
- Hero says: *"I build useless things. Currently I am doing nothing but learning..."* But About lists you as a **Full-Stack Engineer at AvyantaTech (2026-2027)**.
- The nav says "open to work" and the hero says "Open to freelance work", while the "Right now" text says you are doing nothing.
- **Action:** Make one honest, consistent story. Example: *"Full-stack developer and BSc CSIT student from Sankhuwasabha. I build web apps and AI tools with React, Next.js, and Node.js."*

### 2.3 Certifications may be placeholders *(verify)*
About lists **AWS Certified Developer - Associate (2024)**, **Professional Scrum Master I (2023)**, and **Google UX Design Certificate (2021)**. If these are not yours, remove them immediately. If they are real, add credential/verification links.

### 2.4 Experience entry reads like template text
- *"Made websites for construction clients. Worked closely with designers on type, small interaction details that are easy to skip."* is generic and the second sentence is unclear.
- The end date "2027" is in the future.
- **Action:** Rewrite with real specifics: what you built, the stack, what improved, and use "2026 - Present".

### 2.5 Interests page content does not match you
- The top of the page says your interests are **sport** and **music** (cricket, football, Atif Aslam, Coke Studio), which feels genuine.
- But the Home page says *"Running, film photography, espresso and a reading pile..."*, and the Interests page shows a book list (*The Overstory*, *Shape Up*, *The Dispossessed*), an "On repeat" list (Brian Eno, Radiohead, Floating Points) and **"Training for Annapurna 50K... week 14 of 24"**. These look like leftover template data and contradict your Music page.
- **Action:** Remove or replace everything that isn't true for you. Only keep what you would happily talk about in an interview.

### 2.6 Stock image and generic captions
- About page uses a stock "collaborative studio workspace" photo captioned "A studio day, somewhere between the sketch and the deploy." That is not your workspace.
- **Action:** Replace it with a real photo (your desk, college, hometown, a project demo) or remove it.

### 2.7 Education details look inaccurate *(verify)*
- "+2 Science" and "Secondary School" are both listed under **Tribhuvan University**. In Nepal, +2 is normally under NEB and secondary (SEE) under the Education Board/school. Use the correct institution names (for example, your actual college and school).
- Descriptions like "I have studied Computer Science at this institution" add nothing. Mention a final-year project, GPA/percentage if strong, or relevant coursework instead.

### 2.8 Skills do not match your projects
- Skills list **Redis** and **Docker**, but no project shows them. Your flagship project is built with **Python/AI**, but Python is missing from your skills.
- **Action:** Add Python, your ML/AI tools (TensorFlow/PyTorch/scikit-learn, whichever you used), Flask/FastAPI (if used), and remove anything you can't discuss confidently.

---

## 3. High Priority: Projects (your most important section)

Recruiters spend most of their time here, and you currently show only two projects.

| Issue | Recommendation |
|---|---|
| Only 2 projects | Add 4-6. You mention an **anonymous feedback web app** on the About page but it is not shown in Projects. Add it. |
| Descriptions are generic | The cardamom description explains the crop, not what you built. The A.one description is the company's own bio. Describe **the problem, your solution, your role, the stack, and the result**. |
| No outcomes | For the AI project, share model accuracy, dataset size, number of disease classes, and how users upload/predict. Add screenshots or a short demo video/GIF. |
| No case-study pages | Create `/projects/[slug]` pages: overview, architecture diagram, challenges, what you learned, links. |
| Hosting on a free tier | The AI app is on Render. Free instances may sleep and load slowly. Mention "may take ~30s to wake" or move to a faster host so recruiters don't see a broken demo. |
| Tech tags are thin | Tags show `#python #cardamom #Ai` and `#React #Node.js`. Use real tech tags (Python, TensorFlow, Flask, React, PostgreSQL...) and drop topic hashtags. |
| Missing roles | State whether each project was solo, team, or client work. |

---

## 4. Content and Copywriting

- **Tone:** "I build useless things" and "doing nothing" undersell you. Keep personality, but lead with value: what you build and how to hire you.
- **Hero name** may render as "KushalDahal" without a space in text/SEO output. Make sure there is a proper space or accessible text.
- **Spelling and grammar errors to fix:**
  - "Completed my Secondary level **eduction**" should be "education".
  - "I love **listening music**" should be "I love listening **to** music".
  - "when **i** am working" should be "I".
  - Meta description: "is a full-stack engineer **and from** Madi" should read "a full-stack engineer **from** Madi, Sankhuwasabha, Nepal."
  - "Atif aslam" should be "Atif Aslam".
- **Repeated phrases:** "Open to freelance work" and "Say hello" appear many times on each page. Keep one clear primary CTA per section.
- **About page repeats itself.** The top bio and "How I got here" tell the same story twice with near-identical wording. Merge them and add something new in the second part (a turning point, a lesson, a failure).
- **Contact "Good fits" list** mentions design systems, accessibility reviews, and technical writing, none of which are backed by your projects. List what you can actually deliver: business websites, React/Next.js apps, REST APIs, basic AI/ML integrations.
- **Photos page:** make sure it has real content and alt text; an empty gallery looks unfinished *(verify)*.

---

## 5. Bugs and Technical Issues Found

| # | Issue | Fix |
|---|---|---|
| 1 | **Music page links:** *Aadat* (Atif Aslam) and *King Shit* (Subh) both point to the **same Spotify track URL** (`.../track/1BpvuKIG7jK5EiTp2tv5z8`). | Use the correct Spotify link for each item. |
| 2 | **Mixed-content images:** some Cloudinary URLs use `http://` (Aadat and Faasle covers). | Use `https://` everywhere to avoid browser warnings. |
| 3 | **Local-time widget** shows "- : - NPT" when loaded (placeholder dashes). | Render the time on the client after mount, or hide until ready. |
| 4 | **Tag name** is stored as `cricket #proteas` (a hashtag inside a tag), so the tag filter URL is `?tag=cricket %23proteas`. | Split into two tags: `cricket` and `proteas`. |
| 5 | **Metadata is repeated across pages:** `og:title`, `og:description`, and `og:url` are the same homepage values on About, Contact, Blog, etc. (for example, `og:url` on `/about` points to the home page). | Set unique `og:title`, `og:description`, and `og:url` per page. |
| 6 | **Duplicated meta descriptions** on Home, Blog, and others. The Home description is short and has a grammar error. | Write a unique 140-160 character description per page. |
| 7 | **Keywords meta** includes "interaction designer", which does not match your work. | Remove, or change to keywords you want to rank for (Next.js developer Nepal, full-stack developer Sankhuwasabha, etc.). |
| 8 | **Resume** link `/resume.pdf` | Confirm the file exists, is current, and matches the site's content *(verify)*. |

---

## 6. Privacy and Safety

- **Your phone number (+977 98...) is public on the Contact page** as plain text and a `tel:` link. This invites spam and scam calls. Consider removing it, or showing it only after a click, or relying on the form and email.
- Your email is displayed in plain text several times, so expect bots. Use the form as the primary channel, and consider obfuscating the email.
- Confirm the contact form has **spam protection** (honeypot or Cloudflare Turnstile) and **rate limiting** *(verify)*.
- The "Company" field and "Phone (optional)" field should be clearly labelled optional vs required.
- Check that the Privacy & cookies page accurately describes your visitor tracking (see `requirement.md` section 5.5).

---

## 7. Blog

- Only **1 post** exists, about test cricket. The blog's own description says it covers "engineering, design and the small decisions that rarely make it into a changelog", which doesn't match.
- **Action:** Publish 3-5 technical posts before promoting the blog. Easy ideas from your own work:
  1. How I built an AI cardamom disease detector
  2. Deploying a Python ML app on Render (and what went wrong)
  3. Building an anonymous feedback app with Next.js and Prisma
  4. Lessons from building my first client website
  5. My Next.js + shadcn + Aceternity portfolio stack
- Keep the cricket post. It adds personality, but categorize it under "Life/Sports".
- **View counts** ("5 views") show low numbers publicly. Hide them until they are meaningful, or show them only in the admin panel.
- Add for each post: cover image, table of contents, share buttons, related posts, RSS feed, and per-post Open Graph image.

---

## 8. SEO and Discoverability

- Add **JSON-LD structured data** (`Person`, `WebSite`, `BlogPosting`) for richer search results.
- Add `sitemap.xml` and `robots.txt` (check they exist at `/sitemap.xml` and `/robots.txt`) *(verify)*.
- Generate **per-page Open Graph images** (title and image for each blog post and project).
- Title tags: use a descriptive pattern, such as "Kushal Dahal | Full-Stack & AI Developer in Nepal".
- Register the site in **Google Search Console** and submit the sitemap.
- Buy a **custom domain** (for example `kushaldahal.com.np` or `.dev`). A `*.vercel.app` URL looks temporary, and your meta tags currently point at it.

---

## 9. Design, Animation and UX *(verify visually)*

Since I could only read content, please check these yourself:

- Test on **real phones** (360px width) for overflow, tap-target size, and navigation.
- Ensure animations respect `prefers-reduced-motion`.
- Make sure the "marquee" skills strip doesn't hurt performance on low-end devices.
- Check color contrast in both dark and light themes (muted gray text on a dark background often fails WCAG AA).
- Add visible keyboard focus states and a "Skip to content" link.
- Add meaningful `alt` text for all images (project screenshots currently appear to have empty alt text).
- Add skeleton/loading states for images and the music/photos sections.
- Provide a friendly custom 404 page.
- Keep the navbar from feeling crowded: 7 links plus a CTA and "open to work" badge is a lot. Consider grouping Music, Photos, and Interests under a "Personal" or "More" menu.

---

## 10. Performance Checklist

- Run **Lighthouse** and **PageSpeed Insights** (mobile) and aim for 90+ in all categories.
- The home page image URL requests `w=3840`, which is very large. Set proper `sizes` on `next/image` so smaller screens download smaller files.
- Use `priority` only on the hero image; lazy-load everything else.
- Serve project screenshots in WebP/AVIF at sensible dimensions (you already use WebP, which is good).
- Check bundle size and defer heavy animation libraries below the fold.

---

## 11. Features to Add (aligned with `requirement.md`)

- [ ] Project detail/case-study pages
- [ ] Downloadable, up-to-date resume with a preview
- [ ] Real testimonials or a "recommendations" link to LinkedIn
- [ ] Newsletter or RSS for the blog (optional)
- [ ] GitHub activity or pinned repositories section
- [ ] Dark/light theme toggle *(verify it exists)*
- [ ] Admin: visitor analytics dashboard, messages inbox, image library, blog editor *(verify all are working)*
- [ ] Email notification when someone submits the contact form
- [ ] Cookie/consent banner if you track visitors

---

## 12. Prioritized Action Plan

### Do this week (highest impact, low effort)
1. Remove or replace the **fake testimonials**.
2. Remove the **"six years"** claim and fix the "doing nothing" line.
3. Remove unverified **certifications**.
4. Replace the **Interests** template data (books, Annapurna 50K, running, photography) with your real interests.
5. Remove the **stock "studio" photo**.
6. Fix the **duplicate Spotify links** and `http://` image URLs.
7. Fix spelling and grammar errors, and the meta description typo.
8. Hide or protect your **phone number**.

### Do within 2-4 weeks
9. Rewrite project descriptions with problem, solution, stack, and results; add screenshots or a demo video.
10. Add 2-4 more projects (including the anonymous feedback app).
11. Correct the education and experience timeline.
12. Fix skills to match what you actually use (add Python and AI/ML tools).
13. Set unique metadata and Open Graph images per page.
14. Publish 3+ technical blog posts.
15. Connect a custom domain.

### Do next
16. Add project case-study pages and JSON-LD structured data.
17. Run Lighthouse and fix performance, accessibility, and mobile issues.
18. Set up Search Console and the sitemap.
19. Add real testimonials once you have them.
20. Polish animations and the navbar organization.

---

## 13. Suggested Rewrite Examples

**Hero tagline (replace "I build useless things")**
> Full-stack developer from Sankhuwasabha, Nepal. I build web apps and AI-powered tools with React, Next.js, Node.js, and Python.

**Meta description (Home)**
> Kushal Dahal is a full-stack developer from Madi, Sankhuwasabha, Nepal, building web apps and AI tools with Next.js, Node.js, and Python.

**"Right now" section**
> Working as a full-stack developer at AvyantaTech while finishing my BSc CSIT. Currently exploring machine learning for agriculture and improving my Next.js skills.

**Project description template**
> **Problem:** Cardamom farmers in Sankhuwasabha lose crops to diseases like chhirke because they are identified too late.
> **Solution:** A web app where farmers upload a leaf photo and receive an AI-based disease prediction.
> **My role:** Solo developer (model training, backend API, frontend).
> **Stack:** Python, TensorFlow, Flask, React.
> **Result:** *(add accuracy, dataset size, number of users/testers)*

---

*Next step: after you fix the Section 2 items, I'm happy to re-review the live site, or to help rewrite the About page, projects, and meta tags.*