/**
 * Note visibility by distance from the judgement line, as practice modifiers in other rhythm games do it: notes
 * that fade out on the way down (Hidden), fade in late (Fade In / Sudden), or both (a visible band in between).
 *
 * Distances are approach values: 0 at the judgement line, 1 where notes appear. Judgement and hit effects are not
 * affected; only notes, hold ribbons and simultaneous lines are.
 */
export interface NoteVisibility {
  /** Fully seen at `fadeOut[0]`, gone at `fadeOut[1]` and closer (`fadeOut[0] > fadeOut[1]`). */
  readonly fadeOut?: readonly [number, number];
  /** Unseen at `fadeIn[0]` and further, fully seen at `fadeIn[1]` and closer (`fadeIn[0] > fadeIn[1]`). */
  readonly fadeIn?: readonly [number, number];
}

const smooth = (value: number) => {
  const t = value <= 0 ? 0 : value >= 1 ? 1 : value;
  return t * t * (3 - 2 * t);
};

/** How visible something at `approach` is, 0 to 1. */
export function visibilityAt(visibility: NoteVisibility | null | undefined, approach: number): number {
  if (!visibility || !Number.isFinite(approach)) return 1;
  let alpha = 1;
  const out = visibility.fadeOut;
  if (out && out[0] > out[1]) alpha *= smooth((approach - out[1]) / (out[0] - out[1]));
  const into = visibility.fadeIn;
  if (into && into[0] > into[1]) alpha *= smooth((into[0] - approach) / (into[0] - into[1]));
  return alpha;
}

/** A valid visibility, or null for none. */
export function normalizeNoteVisibility(value: unknown): NoteVisibility | null {
  if (!value || typeof value !== "object") return null;
  const pair = (input: unknown): readonly [number, number] | undefined => {
    if (!Array.isArray(input) || input.length !== 2) return undefined;
    const [far, near] = input as unknown[];
    return typeof far === "number" && typeof near === "number" && Number.isFinite(far) && Number.isFinite(near) && far > near
      ? [far, near]
      : undefined;
  };
  const fadeOut = pair((value as NoteVisibility).fadeOut);
  const fadeIn = pair((value as NoteVisibility).fadeIn);
  return fadeOut || fadeIn ? { ...(fadeOut ? { fadeOut } : {}), ...(fadeIn ? { fadeIn } : {}) } : null;
}
