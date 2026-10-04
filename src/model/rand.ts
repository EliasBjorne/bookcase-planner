/** Deterministic PRNG so renders are stable per design. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const SPINES = [
  "#7d6b52", "#5c6b63", "#a1674a", "#6e4a43", "#45535f", "#8c8265",
  "#d6cbb6", "#5a6e52", "#8a4f3d", "#4a4e6a", "#b5a07a", "#3f4a42",
];
