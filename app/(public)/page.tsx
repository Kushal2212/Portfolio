import { Hero } from "@/components/sections/hero";
import { SkillsMarquee } from "@/components/sections/skills-marquee";
import { PersonalDetails } from "@/components/sections/personal-details";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { LatestPosts } from "@/components/sections/latest-posts";
import { Listening } from "@/components/sections/listening";
import { ArcadeBreak } from "@/components/sections/arcade-break";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactCTA } from "@/components/sections/contact-cta";
import { getSettings } from "@/lib/settings";
import { getRecentPosts } from "@/lib/posts";
import { getPublishedTracks } from "@/lib/music";
import { getPublicTestimonials } from "@/lib/testimonials";
import { getPublicProjects } from "@/lib/projects";
import { buildProjectDeck } from "@/lib/games";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, posts, tracks, testimonialRows, projectRows] = await Promise.all([
    getSettings(),
    getRecentPosts(3),
    getPublishedTracks(3),
    getPublicTestimonials(),
    getPublicProjects(),
  ]);

  const testimonials = testimonialRows ?? [];
  const projects = projectRows ?? [];
  const deck = buildProjectDeck(
    projects.map((project) => ({ name: project.name, note: project.summary })),
  );
  const githubUrl = settings.socials.find(
    (social) => social.label.toLowerCase() === "github",
  )?.href;

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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.fullName,
    url: absoluteUrl("/"),
    description: settings.seoDescription,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/blog")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Hero settings={settings} />
      <SkillsMarquee />
      <PersonalDetails settings={settings} />
      <FeaturedProjects items={projects} githubUrl={githubUrl} />
      <LatestPosts posts={posts} />
      <Listening tracks={tracks} />
      <ArcadeBreak deck={deck} />
      <Testimonials items={testimonials} />
      <ContactCTA settings={settings} />
    </>
  );
}
