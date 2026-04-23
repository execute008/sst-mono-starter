/**
 * Known deployment stages. Keep this union narrow — adding a new stage should
 * be a deliberate change so stage-gated branches stay reviewed.
 *
 * Note: we intentionally do NOT widen with `string & {}`. Unknown stage strings
 * should fail typing rather than silently pass through `isProduction` /
 * `isDevelopment` checks.
 */
export type Stage = "dev" | "local" | "stage" | "production";

export interface User {
  id: string;
  provider: string;
  contact?: {
    email?: string;
    tel?: string;
  };
}
