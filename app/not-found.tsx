import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="relative z-10 max-w-lg text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Error 404 · off the map
        </p>
        <div className="mt-4 font-serif text-[8rem] leading-none tracking-tighter sm:text-[10rem]">
          4<span className="text-brand">0</span>4
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page took a wrong turn.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The link may be old, the post may have moved, or the page might never have existed. There
          are a few good places to go from here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/">
              <ArrowLeft className="size-4" /> Back home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">
              <Compass className="size-4" /> Browse the blog
            </Link>
          </Button>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <Link href="/about" className="link-underline">About</Link>
          <Link href="/interests" className="link-underline">Interests</Link>
          <Link href="/contact" className="link-underline">Contact</Link>
        </div>
      </div>
    </main>
  );
}
