/**
 * `useAssets` — validates the runtime asset base URL and exposes a small helper
 * for constructing fully-qualified asset URLs via `new URL(path, base)` (no
 * string concatenation, no trailing-slash footguns).
 *
 * The base URL points at the Router's `/cdn` route, which fronts the now-private
 * public bucket via OAC. The raw S3 domain is no longer publicly addressable —
 * all asset references must go through this composable.
 *
 * Parsed at composable init. If missing or invalid, this throws immediately —
 * fail closed rather than silently emitting links to a broken or
 * attacker-controlled host.
 *
 * `http:` is only allowed for `localhost` / `127.0.0.1` / `[::1]`. Everything
 * else must be `https:`.
 */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function parseBaseUrl(raw: unknown): URL {
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(
      "useAssets: runtimeConfig.public.assetsBaseUrl is not configured",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `useAssets: runtimeConfig.public.assetsBaseUrl is not a valid URL: ${raw}`,
    );
  }

  const isLocal = LOCAL_HOSTNAMES.has(parsed.hostname);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocal)) {
    throw new Error(
      `useAssets: refusing non-https assetsBaseUrl (${parsed.protocol}//${parsed.hostname}). ` +
        `http: is only allowed for localhost.`,
    );
  }

  return parsed;
}

export function useAssets() {
  const config = useRuntimeConfig();
  const base = parseBaseUrl(config.public.assetsBaseUrl);

  /** Build a full asset URL from a path, resolved against the validated base. */
  function url(path: string): string {
    // `new URL(path, base)` handles leading slashes, query strings, and
    // prevents accidental double-slashes from string concat.
    return new URL(path, base).toString();
  }

  return { base, url };
}
