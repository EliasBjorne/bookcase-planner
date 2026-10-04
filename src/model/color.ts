/** Multiply a hex colour's channels by f (clamped). */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(c);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
