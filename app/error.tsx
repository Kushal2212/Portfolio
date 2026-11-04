"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-card text-amber-500">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Something broke on my end.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          An unexpected error interrupted the page. It&apos;s been logged. Try again, or head back
          and take a different path.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-muted-foreground/70">digest: {error.digest}</p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="rounded-full">
            <RotateCcw className="size-4" /> Try again
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="size-4" /> Go home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
