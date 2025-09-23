"use client";

// PUBLIC_INTERFACE
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// PUBLIC_INTERFACE
export function pickDistractors(answer: string, pool: string[], count = 3): string[] {
  const filtered = pool.filter((p) => p !== answer);
  return shuffle(filtered).slice(0, count);
}
