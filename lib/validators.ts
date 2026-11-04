import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell me your name").max(80),
  email: z.email("Enter a valid email address").max(160),
  subject: z.string().trim().max(140).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail helps. At least 10 characters")
    .max(5000, "That's a bit long. Keep it under 5000 characters"),
  company: z.string().max(200).optional().or(z.literal("")), // honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is too short")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  content: z.string().min(20, "Add some content before saving"),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  featured: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDesc: z.string().trim().max(180).optional().or(z.literal("")),
  publishedAt: z.string().optional().or(z.literal("")),
});

export type PostInput = z.infer<typeof postSchema>;

export const interestSchema = z.object({
  title: z.string().trim().min(2, "Give it a title").max(60),
  description: z.string().trim().min(10, "Add a short description").max(300),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
});

export const musicSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(140),
  artist: z.string().trim().min(1, "Add an artist").max(140),
  album: z.string().trim().max(140).optional().or(z.literal("")),
  year: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().min(1900, "Use a year like 2025").max(2100).optional(),
  ),
  coverUrl: z.string().trim().max(500).optional().or(z.literal("")),
  link: z.string().trim().max(500).optional().or(z.literal("")),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(1200).optional().or(z.literal("")),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  education: z.string().trim().max(140).optional().or(z.literal("")),
  hometown: z.string().trim().max(120).optional().or(z.literal("")),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal("")),
  resumeUrl: z.string().trim().max(500).optional().or(z.literal("")),
  availability: z.string().trim().max(120).optional().or(z.literal("")),
  heroNote: z.string().trim().max(200).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  socials: z
    .array(z.object({ label: z.string().trim().min(1).max(40), href: z.string().trim().min(1).max(300) }))
    .max(8)
    .optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(100),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
