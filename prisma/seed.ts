import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

/**
 * This script writes demo posts, messages, interests and visits. It must never
 * run against a real site by accident, so it is opt-in and refuses production.
 */
if (process.env.ALLOW_DB_SEED !== "true") {
  console.error(
    "Seed disabled. Prisma's seed script writes demo content and is opt-in.\n" +
      "Run `ALLOW_DB_SEED=true npm run db:seed` only against an empty development database.",
  );
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed a production environment.");
  process.exit(1);
}

function readPost(name: string) {
  return readFileSync(path.join(process.cwd(), "prisma", "seed-posts", `${name}.md`), "utf8");
}

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const posts = [
  {
    title: "Motion that earns its place",
    slug: "designing-motion-that-respects-users",
    excerpt:
      "Most interface animation is decoration. I try to keep the parts that answer a question.",
    tags: ["Design", "Accessibility", "Motion"],
    status: "PUBLISHED",
    featured: true,
    publishedAt: daysAgo(44, 9),
    views: 1842,
    seoTitle: "Motion that earns its place",
    seoDesc:
      "A practical approach to interface animation: purpose, duration, reduced motion and performance.",
    content: readPost("motion"),
  },
  {
    title: "Server components, once the fog cleared",
    slug: "server-component-mental-model",
    excerpt:
      "I spent a week putting \"use client\" on everything. Then the mental model clicked.",
    tags: ["React", "Next.js", "Architecture"],
    status: "PUBLISHED",
    featured: false,
    publishedAt: daysAgo(91, 11),
    views: 2310,
    seoTitle: "Server components, once the fog cleared",
    seoDesc:
      "A plain explanation of React Server Components, the client boundary and data fetching in the Next.js App Router.",
    content: readPost("server-components"),
  },
  {
    title: "Postgres habits I keep coming back to",
    slug: "postgres-patterns-i-reach-for",
    excerpt:
      "Partial indexes, cursor pagination and a few rules I wish I had learned earlier.",
    tags: ["Postgres", "Database", "Backend"],
    status: "PUBLISHED",
    featured: false,
    publishedAt: daysAgo(74, 14),
    views: 1266,
    seoTitle: "Postgres habits I keep coming back to",
    seoDesc:
      "Practical Postgres patterns for application developers: partial indexes, cursor pagination, constraints and short transactions.",
    content: readPost("postgres"),
  },
  {
    title: "A type-safe API without the ceremony",
    slug: "type-safe-api-with-trpc-zod",
    excerpt:
      "TypeScript only helps when the types match what the server returns. Here is the setup I use.",
    tags: ["TypeScript", "tRPC", "API"],
    status: "PUBLISHED",
    featured: false,
    publishedAt: daysAgo(118, 8),
    views: 987,
    seoTitle: "A type-safe API without the ceremony",
    seoDesc:
      "Build a small type-safe API with tRPC and Zod: schemas, inferred clients, error shapes and when to use something else.",
    content: readPost("type-safe-api"),
  },
  {
    title: "What forty side projects taught me",
    slug: "what-40-side-projects-taught-me",
    excerpt:
      "Most of my side projects did not survive. The ones that did were smaller than I wanted them to be.",
    tags: ["Career", "Process", "Product"],
    status: "PUBLISHED",
    featured: false,
    publishedAt: daysAgo(161, 19),
    views: 3120,
    seoTitle: "What forty side projects taught me",
    seoDesc:
      "Notes from a decade of side projects: scoping, finishing, distribution, boring stacks and knowing when to stop.",
    content: readPost("side-projects"),
  },
  {
    title: "Dark mode is a second design",
    slug: "practical-guide-to-dark-mode",
    excerpt:
      "Inverting the light theme is the quickest way to make dark mode feel wrong.",
    tags: ["Design", "CSS", "Accessibility"],
    status: "PUBLISHED",
    featured: false,
    publishedAt: daysAgo(212, 16),
    views: 1604,
    seoTitle: "Dark mode is a second design",
    seoDesc:
      "How to design dark mode that works: semantic tokens, elevation, contrast, images and the states people forget.",
    content: readPost("dark-mode"),
  },
];

const messages = [
  {
    name: "Elena Duarte",
    email: "elena.duarte@northwind.studio",
    subject: "Design system audit for a fintech product",
    body: "Hi Kushal,\n\nI found your site through the motion article and really liked the way you think about restraint. We're rebuilding the front end of a fintech dashboard (React + TypeScript) and our component library has drifted badly over two years.\n\nWe're looking for someone to lead a four-week audit and help us rebuild the tokens and core components. Is that something you'd consider? Happy to share more context on a call.\n\nElena",
    status: "UNREAD",
    createdAt: daysAgo(1, 9, 12),
  },
  {
    name: "Arjun Shrestha",
    email: "arjun@sajilo.co",
    subject: "Collaboration — local commerce app",
    body: "Kushal dai,\n\nWe met at the Kathmandu meetup last year. We're launching a small commerce app for local makers and would love your help with the checkout flow and the merchant dashboard.\n\nWe have a modest budget but a lot of enthusiasm. Would you be open to a short call next week?\n\nArjun",
    status: "UNREAD",
    createdAt: daysAgo(1, 16, 40),
  },
  {
    name: "Thomas Becker",
    email: "t.becker@studiohilde.de",
    subject: "Freelance frontend — 6 week project",
    body: "Hello Kushal,\n\nWe're a design studio in Berlin working on a cultural archive. The design is done and we need an engineer to build the public site in Next.js with a CMS.\n\nSix weeks, starting in March, remote. Could you send your rate and availability?\n\nBest,\nThomas",
    status: "READ",
    createdAt: daysAgo(3, 11, 5),
  },
  {
    name: "Priya Menon",
    email: "priya@writebetter.dev",
    subject: "Guest post idea for your blog",
    body: "Hi! I write about developer education and loved your post on server components. Would you be interested in a guest piece on teaching React to career switchers?\n\nNo pressure at all — just thought it might fit your readership.\n\nPriya",
    status: "REPLIED",
    createdAt: daysAgo(8, 14, 22),
  },
  {
    name: "Daniel Okafor",
    email: "daniel@okafor.dev",
    subject: "Question about your analytics setup",
    body: "Hey Kushal,\n\nI'm building a privacy-first analytics tool for a small community site and your approach to anonymous visitor IDs is exactly what I'm after. Do you store the ID in a cookie or localStorage? And how do you handle consent?\n\nThanks!\nDaniel",
    status: "READ",
    createdAt: daysAgo(12, 8, 45),
  },
  {
    name: "Maya Lindqvist",
    email: "maya@fathomlabs.io",
    subject: "Welcome to the team — onboarding details",
    body: "Kushal,\n\nExcellent first week. Attaching the onboarding doc separately. For Monday: access to the design repo, a walkthrough of the query layer, and lunch with the team.\n\nGlad you're here.\nMaya",
    status: "ARCHIVED",
    createdAt: daysAgo(21, 17, 8),
  },
];

async function main() {
  console.log("Seeding portfolio…");

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding.");
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Kushal Dahal", role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Kushal Dahal",
      role: "ADMIN",
    },
  });

  const settings = {
    fullName: "Kushal Dahal",
    title: "Full-Stack Engineer & Interaction Designer",
    tagline: "I build calm, useful websites and write about the work.",
    bio: "I'm a full-stack engineer and interaction designer from Madi, Sankhuwasabha, now working with teams wherever the internet reaches. I've spent the last six years helping small teams turn complicated ideas into products that are easy to use. I like simple interfaces, clear writing and code that another person can pick up without a meeting.",
    email: "hello@kushaldahal.dev",
    phone: "+977 980 123 4567",
    location: "Madi, Sankhuwasabha, Nepal · UTC+5:45",
    education: "BSc.CSIT, Tribhuvan University",
    hometown: "Madi, Sankhuwasabha",
    avatarUrl: "/images/avatar.jpg",
    resumeUrl: "/resume.pdf",
    availability: "Open to freelance work",
    heroNote: "Currently building developer tools at Fathom Labs.",
    seoTitle: "Kushal Dahal — Full-Stack Engineer & Interaction Designer",
    seoDescription:
      "Kushal Dahal is a full-stack engineer and interaction designer from Madi, Sankhuwasabha. Portfolio, writing and occasional experiments.",
    socials: JSON.stringify([
      { label: "GitHub", href: "https://github.com/kushaldahal" },
      { label: "LinkedIn", href: "https://linkedin.com/in/kushaldahal" },
      { label: "X / Twitter", href: "https://x.com/kushaldahal" },
      { label: "Dribbble", href: "https://dribbble.com/kushaldahal" },
    ]),
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: settings,
    create: { id: "singleton", ...settings },
  });

  await prisma.post.deleteMany();

  for (const post of posts) {
    const wordCount = post.content.split(/\s+/).length;
    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        featured: post.featured,
        views: post.views,
        readingTime: Math.max(1, Math.ceil(wordCount / 220)),
        seoTitle: post.seoTitle,
        seoDesc: post.seoDesc,
        publishedAt: post.publishedAt,
        tags: post.tags,
      },
    });
  }

  await prisma.interest.deleteMany();
  await Promise.all(
    [
      {
        title: "Photography",
        description:
          "I take a small camera on walks. Most photos are of streets, mountains and friends who agreed to stand still.",
        icon: "camera",
        order: 0,
      },
      {
        title: "Trail running",
        description:
          "Slowly working up to a 50k. The first hour is hard. The rest is usually fine.",
        icon: "mountain",
        order: 1,
      },
      {
        title: "Espresso",
        description:
          "A small setup at home. I am not good at it yet, but the coffee is better than it was last year.",
        icon: "coffee",
        order: 2,
      },
      {
        title: "Reading",
        description:
          "Mostly fiction and design writing. I keep coming back to Ursula K. Le Guin.",
        icon: "book",
        order: 3,
      },
      {
        title: "Open source",
        description:
          "I maintain a small UI library and send the occasional patch upstream.",
        icon: "github",
        order: 4,
      },
      {
        title: "Synth music",
        description:
          "Ambient loops on a tiny modular setup. Nothing finished, most of it recorded.",
        icon: "music",
        order: 5,
      },
    ].map((data) => prisma.interest.create({ data })),
  );

  await prisma.media.upsert({
    where: { id: "seed-avatar" },
    update: {
      altText: "Portrait of Kushal Dahal",
      caption: null,
      published: false,
      order: 0,
    },
    create: {
      id: "seed-avatar",
      url: "/images/avatar.jpg",
      filename: "avatar.jpg",
      altText: "Portrait of Kushal Dahal",
      caption: null,
      published: false,
      order: 0,
      size: 115979,
      mimeType: "image/jpeg",
      width: 900,
      height: 1125,
    },
  });

  await prisma.media.upsert({
    where: { id: "seed-studio" },
    update: {
      altText: "A collaborative studio workspace",
      caption: "A studio day, somewhere between the sketch and the deploy.",
      published: true,
      order: 0,
    },
    create: {
      id: "seed-studio",
      url: "/images/studio.jpg",
      filename: "studio.jpg",
      altText: "A collaborative studio workspace",
      caption: "A studio day, somewhere between the sketch and the deploy.",
      published: true,
      order: 0,
      size: 152869,
      mimeType: "image/jpeg",
      width: 1200,
      height: 800,
    },
  });

  await prisma.message.deleteMany();
  await Promise.all(messages.map((data) => prisma.message.create({ data })));

  // ── Analytics history ─────────────────────────────────────────────────────
  await prisma.visit.deleteMany();

  const random = mulberry32(20261101);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];

  const paths = [
    "/",
    "/",
    "/",
    "/blog",
    "/blog",
    "/about",
    "/about",
    "/contact",
    "/interests",
    "/blog/server-component-mental-model",
    "/blog/designing-motion-that-respects-users",
    "/blog/postgres-patterns-i-reach-for",
    "/blog/practical-guide-to-dark-mode",
    "/privacy",
  ];
  const referrers = ["Direct", "Direct", "google.com", "github.com", "linkedin.com", "x.com", "news.ycombinator.com", "dribbble.com"];
  const countries = ["Nepal", "United States", "India", "Germany", "United Kingdom", "Canada", "Australia", "Singapore", "Netherlands", "Japan"];
  const devices = ["Mobile", "Mobile", "Mobile", "Desktop", "Desktop", "Tablet"];
  const browsers = ["Chrome", "Chrome", "Chrome", "Safari", "Safari", "Firefox", "Edge"];
  const systems = ["Android", "iOS", "Windows", "macOS", "Linux"];

  const visits: {
    visitorId: string;
    path: string;
    referrer: string;
    country: string;
    city: string | null;
    device: string;
    browser: string;
    os: string;
    createdAt: Date;
  }[] = [];

  for (let day = 29; day >= 0; day--) {
    const base = 8 + Math.floor(random() * 22) + (day < 7 ? 6 : 0);
    for (let i = 0; i < base; i++) {
      const hour = Math.floor(random() * 24);
      const minute = Math.floor(random() * 60);
      // Avoid future timestamps for today.
      if (day === 0 && hour > new Date().getHours()) continue;
      visits.push({
        visitorId: `seed-visitor-${Math.floor(random() * 160) + 1}`,
        path: pick(paths),
        referrer: pick(referrers),
        country: pick(countries),
        city: null,
        device: pick(devices),
        browser: pick(browsers),
        os: pick(systems),
        createdAt: daysAgo(day, hour, minute),
      });
    }
  }

  // A few "live" visits in the last half hour for the real-time card.
  for (let i = 0; i < 3; i++) {
    const date = new Date(Date.now() - Math.floor(random() * 25 * 60 * 1000));
    visits.push({
      visitorId: `seed-visitor-${Math.floor(random() * 160) + 1}`,
      path: pick(paths),
      referrer: "Direct",
      country: pick(countries),
      city: null,
      device: pick(devices),
      browser: pick(browsers),
      os: pick(systems),
      createdAt: date,
    });
  }

  for (let i = 0; i < visits.length; i += 200) {
    await Promise.all(
      visits.slice(i, i + 200).map((data) => prisma.visit.create({ data })),
    );
  }

  console.log(
    `Seeded: 1 admin, ${posts.length} posts, ${messages.length} messages, 6 interests, ${visits.length} visits.`,
  );
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
