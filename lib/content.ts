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
  { name: "Python", group: "Language" },
  { name: "React", group: "Frontend" },
  { name: "Next.js", group: "Frontend" },
  { name: "Tailwind CSS", group: "Frontend" },
  { name: "Node.js", group: "Backend" },
  { name: "Express", group: "Backend" },
  { name: "Flask", group: "Backend" },
  { name: "PostgreSQL", group: "Backend" },
  { name: "MongoDB", group: "Backend" },
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
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Prisma", "Zod"],
  },
  {
    title: "AI & tooling",
    description: "Enough Python and computer vision to ship the cardamom detector.",
    items: ["Python", "Flask", "OpenCV", "Hugging Face", "Docker", "Git"],
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

// Projects are managed from the admin panel. Keep this empty so the site never
// falls back to invented example work when the database is empty.
export const projects: Project[] = [];


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
    period: "2026 — Present",
    title: "Full-Stack Engineer",
    org: "AvyantaTech Private Limited",
    location: "Itahari, Nepal",
    description:
      "Building client websites end to end — layouts, content structure, APIs and deployment. Most of the work is React and Node.js, with a focus on keeping small sites fast and easy to update.",
    tags: ["React", "Next.js", "Node.js", "Express", "MongoDB"],
    kind: "work",
  },
  {
    period: "2022 — 2026",
    title: "BSc.CSIT",
    org: "Biratnagar Multiple College",
    location: "Biratnagar, Nepal",
    description:
      "Final-year BSc CSIT student. Coursework in data structures, databases and computer networks, with most of my learning happening in side projects.",
    tags: ["DSA", "Databases", "Networking", "Web Development", "Mathematics"],
    kind: "education",
  },
  {
    period: "2019 — 2022",
    title: "+2 Science",
    org: "Arniko Higher Secondary School",
    location: "Biratnagar, Nepal",
    description:
      "Studied Physics, Chemistry, Mathematics and Computer Science.",
    tags: ["Computer Science", "Mathematics", "Physics"],
    kind: "education",
  },
  {
    period: "2015 — 2019",
    title: "Secondary School",
    org: "Madi Higher Secondary School",
    location: "Madi, Sankhuwasabha",
    description: "Completed my secondary education in my hometown.",
    tags: ["Nepali", "English", "Mathematics", "Science"],
    kind: "education",
  },
];

export const certifications = [
  { name: "AWS Certified Developer — Associate", issuer: "Amazon Web Services", year: "2024" },
  { name: "Professional Scrum Master I", issuer: "Scrum.org", year: "2023" },
  { name: "Google UX Design Certificate", issuer: "Google", year: "2021" },
];

// Real testimonials live in the admin panel. Keep this empty rather than
// showing invented quotes when there are no published rows.
export const testimonials: {
  quote: string;
  name: string;
  role: string;
  initials: string;
}[] = [];

export const interestsFallback = [
  {
    title: "Cricket",
    description:
      "South Africa, mostly. Test matches, fast bowling and a scorecard I check more often than I should.",
    icon: "trophy",
    order: 0,
  },
  {
    title: "Football",
    description:
      "Brazil, always. Yellow shirts and the kind of football that makes an ordinary evening better.",
    icon: "goal",
    order: 1,
  },
  {
    title: "Music",
    description:
      "Atif Aslam, Coke Studio and a long Pakistani playlist. Most of it plays while I am working.",
    icon: "music",
    order: 2,
  },
  {
    title: "Side projects",
    description:
      "Small apps built to answer a question I had. Some of them even survive the first week.",
    icon: "code",
    order: 3,
  },
];
