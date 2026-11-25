"use client";

import * as React from "react";
import { Check, RotateCcw, Sparkles, Timer, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { shuffle, type MemoryCard } from "@/lib/games";
import { saveFewestMoves, useFewestMoves } from "@/components/games/best-score";

const BEST_KEY = "kd:arcade:memory";

function formatTime(ms: number) {
  if (!ms) return "0:00";
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function HudCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-2 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{children}</p>
    </div>
  );
}

/**
 * Memory match built from real project summaries plus tools from the stack.
 * The initial shuffled deck is rendered on the server and passed in, so the
 * first paint is already playable without a hydration mismatch.
 */
export function MemoryMatch({ deck: initialDeck }: { deck: MemoryCard[] }) {
  const [deck, setDeck] = React.useState(initialDeck);
  const [open, setOpen] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<string[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [note, setNote] = React.useState<MemoryCard | null>(null);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [sessionBest, setSessionBest] = React.useState(0);

  const lockRef = React.useRef(false);
  const timeoutRef = React.useRef<number | null>(null);
  const storedBest = useFewestMoves(BEST_KEY);

  const totalPairs = new Set(deck.map((card) => card.name)).size;
  const done = totalPairs > 0 && matched.length === totalPairs;

  const candidates = [storedBest, sessionBest].filter((value) => value > 0);
  const best = candidates.length > 0 ? Math.min(...candidates) : 0;

  React.useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!startedAt || done) return;
    const id = window.setInterval(() => setElapsed(performance.now() - startedAt), 250);
    return () => window.clearInterval(id);
  }, [done, startedAt]);

  function reset() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    lockRef.current = false;

    const pairs = [
      ...new Map(deck.map((card) => [card.name, { name: card.name, note: card.note }])).values(),
    ];
    setDeck(
      shuffle(
        pairs.flatMap((pair, index) => [
          { ...pair, id: `${index}-a` },
          { ...pair, id: `${index}-b` },
        ]),
      ),
    );
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setNote(null);
    setStartedAt(null);
    setElapsed(0);
  }

  function flip(card: MemoryCard, timestamp: number) {
    if (done || lockRef.current) return;
    if (open.includes(card.id) || matched.includes(card.name)) return;

    if (!startedAt) {
      setStartedAt(timestamp);
      setElapsed(0);
    }

    const nextOpen = [...open, card.id];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const first = deck.find((entry) => entry.id === nextOpen[0]);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (first && first.name === card.name) {
      const nextMatched = [...matched, card.name];
      setMatched(nextMatched);
      setOpen([]);
      setNote(card);

      if (nextMatched.length === totalPairs) {
        if (startedAt) setElapsed(timestamp - startedAt);
        setSessionBest((value) => (value > 0 ? Math.min(value, nextMoves) : nextMoves));
        saveFewestMoves(BEST_KEY, nextMoves);
      }
      return;
    }

    lockRef.current = true;
    timeoutRef.current = window.setTimeout(() => {
      setOpen([]);
      lockRef.current = false;
    }, 760);
  }

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div className="grid grid-cols-4 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card/60">
        <HudCell label="Moves">{moves}</HudCell>
        <HudCell label="Pairs">
          {matched.length}/{totalPairs}
        </HudCell>
        <HudCell label="Time">{formatTime(elapsed)}</HudCell>
        <HudCell label="Best">{best || "—"}</HudCell>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {deck.map((card) => {
          const isOpen = open.includes(card.id);
          const isMatched = matched.includes(card.name);

          return (
            <button
              key={card.id}
              type="button"
              onClick={(event) => flip(card, event.timeStamp)}
              disabled={isMatched}
              aria-pressed={isOpen || isMatched}
              aria-label={isMatched ? `${card.name}, matched` : isOpen ? card.name : "Face-down card"}
              className="memory-card group aspect-square rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              data-open={isOpen}
              data-matched={isMatched}
            >
              <span className="memory-card-inner">
                <span className="memory-face memory-face-front">
                  <span className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#b9cba4]/70">
                      KD
                    </span>
                    <span className="flex gap-1" aria-hidden="true">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <span key={index} className="size-1 rounded-full bg-[#b9cba4]/35" />
                      ))}
                    </span>
                  </span>
                </span>

                <span
                  className={cn(
                    "memory-face memory-face-back border",
                    isMatched
                      ? "border-brand/40 bg-brand-strong text-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  <span className="line-clamp-3 px-1.5 text-center text-[10px] font-medium leading-[1.2] sm:text-[11px]">
                    {card.name}
                  </span>
                  {isMatched && (
                    <span className="absolute bottom-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-background">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="mt-3 flex min-h-[76px] items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-3.5 py-3"
        aria-live="polite"
      >
        {done ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Trophy className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  Cleared in {moves} moves · {formatTime(elapsed)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {best > 0 && moves <= best
                    ? "That is your best run yet."
                    : best > 0
                      ? `Your best is ${best} moves.`
                      : "First finished round — saved as your best."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-brand/40 hover:text-brand"
            >
              <RotateCcw className="size-3.5" /> New deck
            </button>
          </div>
        ) : note ? (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Sparkles className="size-4" />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{note.name}</span> — {note.note}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Timer className="size-4" />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Flip two cards to pair a project or a tool from the stack. Every match opens its
              note.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>Six pairs · {moves === 0 ? "clock starts on your first flip" : formatTime(elapsed)}</span>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-brand"
        >
          <RotateCcw className="size-3.5" /> Shuffle again
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {done
          ? `Board cleared in ${moves} moves.`
          : note
            ? `${note.name}: ${note.note}`
            : ""}
      </p>
    </div>
  );
}
