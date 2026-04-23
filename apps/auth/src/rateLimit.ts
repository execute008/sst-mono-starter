import { Storage, type StorageAdapter } from "@openauthjs/openauth/storage/storage";

// Per-(ip, claim) cooldown for the OTP send action.
//
// NOTE: implemented with the OpenAuth `Storage` adapter (Dynamo-backed) so we
// don't pull in the AWS SDK directly. Reads-then-writes are NOT atomic — at
// high concurrency for the same key a small number of extra sends can slip
// through. That's acceptable for an anti-pumping cooldown; for hard quotas
// (e.g. billing) swap to an atomic `UpdateItem` (see TODO in src/index.ts).

const SEND_BUCKET_TTL = 60 * 60; // 1h sliding window
const VERIFY_BUCKET_TTL = 60 * 15; // matches typical OTP lifetime

export interface SendCooldownConfig {
  /** Min seconds between sends for the same (ip, claim). */
  minIntervalSeconds: number;
  /** Max sends per (ip, claim) inside the rolling window. */
  maxPerWindow: number;
  /** Window size in seconds. */
  windowSeconds: number;
}

export const DEFAULT_SEND_COOLDOWN: SendCooldownConfig = {
  minIntervalSeconds: 60,
  maxPerWindow: 5,
  windowSeconds: 60 * 60,
};

interface SendBucket {
  windowStart: number;
  count: number;
  lastSendAt: number;
}

interface VerifyBucket {
  attempts: number;
}

export type SendCheck =
  | { ok: true }
  | { ok: false; reason: "cooldown" | "quota"; retryAfter: number };

export async function checkAndRecordSend(
  storage: StorageAdapter,
  ip: string,
  claim: string,
  cfg: SendCooldownConfig = DEFAULT_SEND_COOLDOWN,
): Promise<SendCheck> {
  const now = Math.floor(Date.now() / 1000);
  const key = ["ratelimit:send", ip, claim];
  const current = await Storage.get<SendBucket>(storage, key);

  if (current) {
    const sinceLast = now - current.lastSendAt;
    if (sinceLast < cfg.minIntervalSeconds) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfter: cfg.minIntervalSeconds - sinceLast,
      };
    }
    const withinWindow = now - current.windowStart < cfg.windowSeconds;
    if (withinWindow && current.count >= cfg.maxPerWindow) {
      return {
        ok: false,
        reason: "quota",
        retryAfter: cfg.windowSeconds - (now - current.windowStart),
      };
    }
    const next: SendBucket = withinWindow
      ? { windowStart: current.windowStart, count: current.count + 1, lastSendAt: now }
      : { windowStart: now, count: 1, lastSendAt: now };
    await Storage.set(storage, key, next, SEND_BUCKET_TTL);
    return { ok: true };
  }

  await Storage.set(
    storage,
    key,
    { windowStart: now, count: 1, lastSendAt: now } satisfies SendBucket,
    SEND_BUCKET_TTL,
  );
  return { ok: true };
}

/**
 * Per-state OTP attempt counter. Increments before the verify is processed.
 * Returns `{ ok: false }` once `maxAttempts` attempts have been recorded for
 * this state and removes the bucket so the caller can drop provider state.
 *
 * NOTE: non-atomic — see top-of-file note. For OTP brute-force this is fine;
 * the worst-case race lets ~1 extra attempt through under contention, still
 * orders of magnitude below an unbounded brute-force.
 */
export async function recordVerifyAttempt(
  storage: StorageAdapter,
  stateFingerprint: string,
  maxAttempts = 5,
): Promise<{ ok: true; remaining: number } | { ok: false }> {
  const key = ["ratelimit:verify", stateFingerprint];
  const current = (await Storage.get<VerifyBucket>(storage, key)) ?? {
    attempts: 0,
  };
  if (current.attempts >= maxAttempts) {
    await Storage.remove(storage, key);
    return { ok: false };
  }
  const next = current.attempts + 1;
  await Storage.set(storage, key, { attempts: next } satisfies VerifyBucket, VERIFY_BUCKET_TTL);
  return { ok: true, remaining: maxAttempts - next };
}

export async function clearVerifyAttempts(
  storage: StorageAdapter,
  stateFingerprint: string,
): Promise<void> {
  await Storage.remove(storage, ["ratelimit:verify", stateFingerprint]);
}
