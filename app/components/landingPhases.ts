/** Normalized scroll progress through the sticky landing (0 → 1). */

/** Zoom level at end of opening; second layer keeps this scale and only slides. */
export const LANDING_FINAL_SCALE = 1.5;

/** After this point, second layer (horizontal slide) drives the story. */
export const LANDING_OPENING_END = 0.48;

/** Opening: zoom only — 0 → 1 over the first segment. */
export function openingZoomT(p: number): number {
  if (p <= 0) return 0;
  if (p >= LANDING_OPENING_END) return 1;
  return p / LANDING_OPENING_END;
}

/** Room: horizontal slide only — 0 → 1 in the remainder of scroll. */
export function roomSlideT(p: number): number {
  if (p <= LANDING_OPENING_END) return 0;
  return (p - LANDING_OPENING_END) / (1 - LANDING_OPENING_END);
}
