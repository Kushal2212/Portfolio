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
  tagline: "I build calm, useful websites and write about the work.",
  bio: "I'm a full-stack engineer and from Madi, Sankhuwasabha, now working with teams wherever the internet reaches. I've spent the last six years helping small teams turn complicated ideas into products that are easy to use. I like simple interfaces, clear writing and code that another person can pick up without a meeting.",
  email: "dahalkushal00@gmail.com",
  phone: "+977 9841835949",
  location: "Madi, Sankhuwasabha, Nepal",
  education: "BSc.CSIT, Tribhuvan University",
  hometown: "Madi, Sankhuwasabha",
  avatarUrl: "/images/avatar.jpg",
  resumeUrl: "/resume.pdf",
  availability: "Open to freelance work",
  heroNote: "Currently I am doing nothing but learning and exploring new technologies.",
  seoTitle: "Kushal Dahal — Full-Stack Engineer",
  seoDescription:
    "Kushal Dahal is a full-stack engineer and from Madi, Sankhuwasabha. Portfolio, writing and occasional experiments.",
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
