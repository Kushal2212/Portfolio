import { Github, Linkedin, Twitter, Dribbble, Globe, Mail, Instagram, Youtube } from "lucide-react";
import type { SocialLink } from "@/lib/settings";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  "x / twitter": Twitter,
  twitter: Twitter,
  dribbble: Dribbble,
  instagram: Instagram,
  youtube: Youtube,
  email: Mail,
  website: Globe,
};

export function socialIcon(label: string) {
  return icons[label.toLowerCase()] ?? Globe;
}

export function SocialLinks({
  socials,
  className,
  iconClassName,
}: {
  socials: SocialLink[];
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {socials.map((social) => {
        const Icon = socialIcon(social.label);
        return (
          <a
            key={`${social.label}-${social.href}`}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer noopener"
            aria-label={social.label}
            className="group inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:text-foreground"
          >
            <Icon className={cn("size-4", iconClassName)} />
          </a>
        );
      })}
    </div>
  );
}
