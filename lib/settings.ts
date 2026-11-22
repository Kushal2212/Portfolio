import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseSocials } from "@/lib/utils";

export type SocialLink = { label: string; href: string };

export type Settings = {
  fullName: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  hometown: string;
  avatarUrl: string;
  resumeUrl: string;
  availability: string;
  heroNote: string;
  seoTitle: string;
  seoDescription: string;
  socials: SocialLink[];
};

export const defaultSettings: Settings = {
  fullName: "Kushal Dahal",
  title: "Full-Stack Engineer",
  tagline: "I build web apps and AI-powered tools.",
  bio: "I'm a full-stack developer from Madi, Sankhuwasabha, Nepal. I build web apps and AI-powered tools with Next.js, React, Node.js and Python, and I care about interfaces that are simple to use and code another person can pick up without a meeting.",
  email: "dahalkushal00@gmail.com",
  phone: "+977 9841835949",
  location: "Madi, Sankhuwasabha, Nepal",
  education: "BSc.CSIT, Biratnagar Multiple College",
  hometown: "Madi, Sankhuwasabha",
  avatarUrl: "/images/avatar.jpg",
  resumeUrl: "/Kushal_Dahal_Resume.pdf",
  availability: "Open to freelance work",
  heroNote:
    "Working as a full-stack developer at AvyantaTech while finishing my BSc CSIT, and exploring machine learning for agriculture.",
  seoTitle: "Kushal Dahal — Full-Stack Developer in Nepal",
  seoDescription:
    "Kushal Dahal is a full-stack developer from Madi, Sankhuwasabha, Nepal, building web apps and AI tools with Next.js, Node.js and Python.",
  socials: [
    { label: "GitHub", href: "https://github.com/Kushal2212" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/kushal-dahal-a0449b2a1/" },
    { label: "X / Twitter", href: "https://x.com/KushalD21609720" },
  ],
};

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) return defaultSettings;
    return {
      fullName: row.fullName || defaultSettings.fullName,
      title: row.title || defaultSettings.title,
      tagline: row.tagline || defaultSettings.tagline,
      bio: row.bio || defaultSettings.bio,
      email: row.email || defaultSettings.email,
      phone: row.phone || defaultSettings.phone,
      location: row.location || defaultSettings.location,
      education: row.education || defaultSettings.education,
      hometown: row.hometown || defaultSettings.hometown,
      avatarUrl: row.avatarUrl || defaultSettings.avatarUrl,
      resumeUrl: row.resumeUrl || defaultSettings.resumeUrl,
      availability: row.availability || defaultSettings.availability,
      heroNote: row.heroNote || defaultSettings.heroNote,
      seoTitle: row.seoTitle || defaultSettings.seoTitle,
      seoDescription: row.seoDescription || defaultSettings.seoDescription,
      socials: parseSocials(row.socials).length ? parseSocials(row.socials) : defaultSettings.socials,
    };
  } catch {
    return defaultSettings;
  }
});
