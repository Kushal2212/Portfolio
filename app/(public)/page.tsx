import { Hero } from "@/components/sections/hero";
import { SkillsMarquee } from "@/components/sections/skills-marquee";
import { PersonalDetails } from "@/components/sections/personal-details";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { LatestPosts } from "@/components/sections/latest-posts";
import { Listening } from "@/components/sections/listening";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactCTA } from "@/components/sections/contact-cta";
import { getSettings } from "@/lib/settings";
import { getRecentPosts } from "@/lib/posts";
import { getPublishedTracks } from "@/lib/music";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, posts, tracks] = await Promise.all([
    getSettings(),
    getRecentPosts(3),
    getPublishedTracks(3),
  ]);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.fullName,
    jobTitle: settings.title,
    description: settings.seoDescription,
    url: absoluteUrl("/"),
    image: absoluteUrl(settings.avatarUrl),
    email: `mailto:${settings.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.hometown.split(",")[0]?.trim(),
      addressRegion: "Sankhuwasabha",
      addressCountry: "NP",
    },
    sameAs: settings.socials.map((s) => s.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Hero settings={settings} />
      <SkillsMarquee />
      <PersonalDetails settings={settings} />
      <FeaturedProjects />
      <LatestPosts posts={posts} />
      <Listening tracks={tracks} />
      <Testimonials />
      <ContactCTA settings={settings} />
    </>
  );
}
