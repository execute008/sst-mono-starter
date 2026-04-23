import type { Stage } from "./types";

/**
 * Stages treated as "development". Extend this list (and the `Stage` type in
 * `./types`) if you add a new dev-like stage — never widen the check itself.
 */
export const DEVELOPMENT_STAGES = ["dev", "local"] as const satisfies readonly Stage[];

/**
 * The single stage treated as production. Exact match only; trimmed and
 * lowercased so `" Production "` does not slip through.
 */
export const PRODUCTION_STAGE: Stage = "production";

function normalize(stage: string | undefined): string {
  return (stage ?? "").trim().toLowerCase();
}

/**
 * Returns true only when the given stage is the production stage (exact match,
 * trimmed, lowercased).
 *
 * IMPORTANT: never write `!isProduction(stage)` to gate dev-only behaviour —
 * unknown or typoed stages would then evaluate to "dev" and could leak debug
 * mode into a real environment. Use {@link isDevelopment} for the dev branch.
 */
export function isProduction(stage: string | undefined): boolean {
  return normalize(stage) === PRODUCTION_STAGE;
}

/**
 * Returns true only when the given stage is one of the explicitly whitelisted
 * development stages (`DEVELOPMENT_STAGES`). Unknown stages return `false`,
 * which means dev-only behaviour fails closed.
 *
 * IMPORTANT: never write `!isProduction(stage)` to gate dev-only behaviour —
 * unknown or typoed stages would then evaluate to "dev". Use this helper
 * instead.
 */
export function isDevelopment(stage: string | undefined): boolean {
  const n = normalize(stage);
  return (DEVELOPMENT_STAGES as readonly string[]).includes(n);
}

export * from "./types";
