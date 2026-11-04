"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, ArrowUpRight, Command } from "lucide-react";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Logo({ className, name = "Kushal Dahal" }: { className?: string; name?: string }) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? name;
  const last = parts.slice(1).join(" ");
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Home">
      <span className="relative flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-90">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-sm font-semibold tracking-tight">
        {first.toLowerCase()}
        {last && <span className="text-muted-foreground">.{last.toLowerCase()}</span>}
      </span>
    </Link>
  );
}

export function Navbar({ location, name }: { location?: string; name?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-5">
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border px-3 py-2 transition-all duration-500 sm:px-4",
          scrolled
            ? "glass border-border shadow-[0_8px_40px_-24px_rgba(0,0,0,0.45)]"
            : "border-transparent bg-transparent",
        )}
        aria-label="Main navigation"
      >
        <Logo className="pl-1" name={name} />

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground lg:flex">
            <span className="size-1.5 rounded-full bg-brand" />
            open to work
          </span>
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1 hidden rounded-full sm:inline-flex">
            <Link href="/contact">
              Say hello <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl font-normal">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col">
                {navLinks.map((link, i) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group flex items-center justify-between border-b border-border/70 py-4 text-2xl font-medium tracking-tight transition-colors",
                        isActive(link.href) ? "text-brand" : "text-foreground",
                      )}
                    >
                      <span>{link.label}</span>
                      <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        0{i + 1}
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-auto space-y-4 pt-8">
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-full">
                    <Link href="/contact">Get in touch</Link>
                  </Button>
                </SheetClose>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Command className="size-3" /> {location || "Nepal"}
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
