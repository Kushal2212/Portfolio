"use client";

import * as React from "react";

function read(key: string) {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Reads a score from localStorage without tripping hydration: the server
 * snapshot is always 0, then the client snapshot is read after hydration.
 */
export function useBestScore(key: string) {
  return React.useSyncExternalStore(
    React.useCallback(
      (onChange: () => void) => {
        const handler = (event: StorageEvent) => {
          if (event.key === key) onChange();
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
      },
      [key],
    ),
    () => read(key),
    () => 0,
  );
}

export function saveBestScore(key: string, value: number) {
  try {
    if (value <= (Number(window.localStorage.getItem(key)) || 0)) return;
    window.localStorage.setItem(key, String(value));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    // Private mode or a blocked storage API; the score just isn't saved.
  }
}

/** Fewest-moves variant: 0 means "no run recorded yet". */
export function useFewestMoves(key: string) {
  return React.useSyncExternalStore(
    React.useCallback(
      (onChange: () => void) => {
        const handler = (event: StorageEvent) => {
          if (event.key === key) onChange();
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
      },
      [key],
    ),
    () => read(key),
    () => 0,
  );
}

export function saveFewestMoves(key: string, value: number) {
  try {
    const current = Number(window.localStorage.getItem(key)) || 0;
    if (current > 0 && value >= current) return;
    window.localStorage.setItem(key, String(value));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    // Storage unavailable; the run just isn't recorded.
  }
}

