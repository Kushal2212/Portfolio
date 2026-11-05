export const siteConfig = {
  name: "Kushal Dahal",
  shortName: "Kushal",
  role: "Full-Stack Engineer",
  description:
    "Kushal Dahal is a full-stack engineer from Madi, Sankhuwasabha. He builds calm, useful websites and writes about the work.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_US",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Interests", href: "/interests" },
  { label: "Music", href: "/music" },
  { label: "Blog", href: "/blog" },
  { label: "Photos", href: "/photos" },
  { label: "Contact", href: "/contact" },
];

export const skills = [
  { name: "TypeScript", group: "Language" },
  { name: "React", group: "Frontend" },
  { name: "Next.js", group: "Frontend" },
  { name: "Tailwind CSS", group: "Frontend" },
  { name: "Node.js", group: "Backend" },
  { name: "PostgreSQL", group: "Backend" },
  { name: "Prisma", group: "Backend" },
  { name: "Zod", group: "Backend" },
  { name: "Docker", group: "Tooling" },
  { name: "Git", group: "Tooling" },
];

export const skillGroups = [
  {
    title: "Frontend",
    description: "Interfaces that are quick to understand and pleasant to use.",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Radix UI"],
  },
  {
    title: "Backend & data",
    description: "APIs and schemas that stay readable as the product grows.",
    items: ["Node.js", "PostgreSQL", "Prisma", "Zod", "Redis"],
  },
];

export type Project = {
  slug: string;
  name: string;
  year: string;
  summary: string;
  description: string;
  tags: string[];
  href: string;
  repo?: string;
  accent: string;
  metric: string;
  metricLabel: string;
  status: "Live" | "Open source" | "Case study";
};

export const projects: Project[] = [
  {
    slug: "Cardamom",
    name: "Orbit Analytics",
    year: "2025",
    summary: "A small, privacy-first analytics tool I use on my own sites.",
    description:
      "A cookieless page-view tracker with a short list of charts. I built it to see how far a simple Postgres query layer could go without adding a warehouse.",
    tags: ["Next.js", "Postgres", "tRPC", "Recharts"],
    href: "#",
    repo: "https://github.com",
    accent: "from-emerald-300/40 via-stone-400/20 to-cyan-400/15",
    metric: "3",
    metricLabel: "sites using it",
    status: "Live",
  },
  {
    slug: "lumen",
    name: "Lumen UI",
    year: "2024",
    summary: "A small component library I maintain for my own projects.",
    description:
      "A set of accessible React components with sensible defaults and a few motion helpers. It is not trying to replace anything. It just saves me from rebuilding the same buttons every year.",
    tags: ["TypeScript", "Radix", "Tailwind", "Motion"],
    href: "#",
    repo: "https://github.com",
    accent: "from-violet-300/40 via-stone-300/20 to-amber-300/15",
    metric: "48",
    metricLabel: "components",
    status: "Open source",
  },
  {
    slug: "papertrail",
    name: "Papertrail",
    year: "2024",
    summary: "A shared writing space I built to learn how sync works.",
    description:
      "Local-first notes with version history and offline editing. The interesting part was the sync server. The rest is a quiet interface that stays out of the way.",
    tags: ["React", "Yjs", "WebSockets", "Node"],
    href: "#",
    accent: "from-amber-300/50 via-orange-300/25 to-rose-300/20",
    metric: "2024",
    metricLabel: "side project",
    status: "Case study",
  },
];


export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  location: string;
  description: string;
  tags: string[];
  kind: "work" | "education";
};

export const timeline: TimelineItem[] = [
  
  {
    period: "2026 — 2027",
    title: "Full-Stack Engineer",
    org: "AvyantaTech Private Limited",
    location: "Itahari, Nepal",
    description:
    "Made websites for construction clients. Worked closely with designers on type, small interaction details that are easy to skip.",
    tags: ["React", "Tailwind", "Next.js", "Node.js", "PostgreSQL"],
    kind: "work",
  },
  {
    period: "2022 — 2026",
    title: "BSc.CSIT",
    org: "Biratnagar Multiple College",
    location: "Biratnagar, Nepal",
    description:
      "I have studied Computer Science at this institution.",
    tags: ["DSA", "AI", "Web Development", "Mathematics", "Physics"],
    kind: "education",
  },
  {
    period: "2019 — 2022",
    title: "+2 Science",
    org: "Arniko Higher Secondary School",
    location: "Biratnagar, Nepal",
    description:
      "I have studied science at this institution.",
    tags: ["Computer Science", "Mathematics", "Physics"],
    kind: "education",
  },
  {
    period: "2015 — 2019",
    title: "Secondary School",
    org: "Madi Higher Secondary School",
    location: "Madi, Sankhuwasabha",
    description:
      "Completed my Secondary level eduction from my hometown.",
    tags: ["Nepali", "English", "Mathematics", "Science"],
    kind: "education",
  },
];

export const certifications = [
  { name: "AWS Certified Developer — Associate", issuer: "Amazon Web Services", year: "2024" },
  { name: "Professional Scrum Master I", issuer: "Scrum.org", year: "2023" },
  { name: "Google UX Design Certificate", issuer: "Google", year: "2021" },
];

export const testimonials = [
  {
    quote:
      "Kushal asks a lot of questions before he writes code. The result is usually simpler than what we started with, and easier for the team to keep.",
    name: "Maya Lindqvist",
    role: "Product lead, Fathom Labs",
    initials: "ML",
  },
  {
    quote:
      "He rebuilt our design system without making it feel like a redesign. Two weeks in, the team had stopped complaining about the frontend.",
    name: "Arjun Shrestha",
    role: "Founder, Sajilo",
    initials: "AS",
  },
  {
    quote:
      "I hired Kushal for a landing page and he fixed our accessibility issues too. He cares about the parts most people never notice.",
    name: "Elena Duarte",
    role: "Engineering lead, Northwind",
    initials: "ED",
  },
];

export const interestsFallback = [
  {
    title: "Photography",
    description: "I take a small camera on walks. Most photos are of streets, mountains and friends who agreed to stand still.",
    icon: "camera",
    order: 0,
  },
  {
    title: "Trail running",
    description: "Slowly working up to a 50k. The first hour is hard. The rest is usually fine.",
    icon: "mountain",
    order: 1,
  },
  {
    title: "Espresso",
    description: "A small setup at home. I am not good at it yet, but the coffee is better than it was last year.",
    icon: "coffee",
    order: 2,
  },
  {
    title: "Reading",
    description: "Mostly fiction and design writing. I keep coming back to Ursula K. Le Guin.",
    icon: "book",
    order: 3,
  },
  {
    title: "Open source",
    description: "I maintain a small UI library and send the occasional patch upstream.",
    icon: "github",
    order: 4,
  },
  {
    title: "Synth music",
    description: "Ambient loops on a tiny modular setup. Nothing finished, most of it recorded.",
    icon: "music",
    order: 5,
  },
  {
    title: "Cricket",
    description:
      "South Africa, mostly. Test matches, fast bowling and a scorecard I check more often than I should.",
    icon: "trophy",
    order: 6,
  },
  {
    title: "Football",
    description:
      "Brazil, always. Yellow shirts and the kind of football that makes an ordinary evening better.",
    icon: "goal",
    order: 7,
  },
];
