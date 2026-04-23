export type Stage = "dev" | "stage" | "production" | (string & {});

export function isProduction(stage: string | undefined): boolean {
  return stage === "production";
}

export * from "./types";
