"use client";

import * as React from "react";
import { Bird, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlappyBird } from "@/components/games/flappy-bird";
import { MemoryMatch } from "@/components/games/memory-match";
import type { MemoryCard } from "@/lib/games";

type GameId = "flappy" | "memory";

const games: { id: GameId; label: string; hint: string; icon: typeof Bird }[] = [
  { id: "flappy", label: "Flappy bird", hint: "endless · one life", icon: Bird },
  { id: "memory", label: "Memory match", hint: "6 pairs · no clock", icon: Layers },
];

export function Arcade({ deck }: { deck: MemoryCard[] }) {
  const [game, setGame] = React.useState<GameId>("flappy");
  const tabRefs = React.useRef<Record<GameId, HTMLButtonElement | null>>({
    flappy: null,
    memory: null,
  });

  function onTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next: GameId = game === "flappy" ? "memory" : "flappy";
    setGame(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-border bg-card/60 shadow-[0_30px_80px_-60px_rgb(var(--shadow-color)/0.8)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="arcade-dot bg-brand" />
            <span className="arcade-dot bg-muted-foreground/40" />
            <span className="arcade-dot bg-muted-foreground/20" />
          </span>
          KD arcade
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          2 games
        </span>
      </div>

      <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="hidden items-center gap-2.5 pl-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground lg:flex">
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="arcade-dot bg-brand" />
              <span className="arcade-dot bg-muted-foreground/40" />
              <span className="arcade-dot bg-muted-foreground/20" />
            </span>
            KD arcade · 2 games
          </div>

          <div
            role="tablist"
            aria-label="Choose a game"
            aria-orientation="vertical"
            onKeyDown={onTabKeyDown}
            className="grid grid-cols-2 gap-2 lg:grid-cols-1"
          >
            {games.map(({ id, label, hint, icon: Icon }) => {
              const active = game === id;
              return (
                <button
                  key={id}
                  ref={(node) => {
                    tabRefs.current[id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={active}
                  aria-controls={`panel-${id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setGame(id)}
                  className={cn(
                    "group rounded-xl border px-3 py-2.5 text-left transition-colors lg:px-3.5 lg:py-3",
                    active
                      ? "border-brand/40 bg-brand/[0.08] text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:border-brand/25 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn("size-4", active ? "text-brand" : "text-muted-foreground")} />
                    <span className="text-xs font-semibold sm:text-sm">{label}</span>
                  </span>
                  <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:block">
                    {hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden border-t border-border/70 pt-4 lg:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Cabinet notes
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Best runs are saved in this browser only. Nothing is sent to the server or shared.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Both games pause when the tab loses focus. Switch games mid-flight and it waits for
              you.
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div
            role="tabpanel"
            id="panel-flappy"
            aria-labelledby="tab-flappy"
            hidden={game !== "flappy"}
            className="focus-visible:outline-none"
          >
            <FlappyBird active={game === "flappy"} />
          </div>

          <div
            role="tabpanel"
            id="panel-memory"
            aria-labelledby="tab-memory"
            hidden={game !== "memory"}
            className="focus-visible:outline-none"
          >
            <MemoryMatch deck={deck} />
          </div>
        </div>
      </div>
    </div>
  );
}
