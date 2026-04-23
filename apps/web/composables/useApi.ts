/**
 * `useApi` — a tiny `$fetch` wrapper that validates the runtime API base URL
 * before issuing any request and constructs full URLs via `new URL(path, base)`
 * (no string concatenation, no trailing-slash footguns).
 *
 * The base URL is parsed at composable init. If it is missing or invalid, this
 * throws immediately — fail closed rather than silently issuing requests to a
 * broken or attacker-controlled host.
 *
 * `http:` is only allowed for `localhost` / `127.0.0.1` / `[::1]`. Everything
 * else must be `https:`.
 */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function parseBaseUrl(raw: unknown): URL {
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error("useApi: runtimeConfig.public.apiUrl is not configured");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`useApi: runtimeConfig.public.apiUrl is not a valid URL: ${raw}`);
  }

  const isLocal = LOCAL_HOSTNAMES.has(parsed.hostname);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocal)) {
    throw new Error(
      `useApi: refusing non-https apiUrl (${parsed.protocol}//${parsed.hostname}). ` +
        `http: is only allowed for localhost.`,
    );
  }

  return parsed;
}

export function useApi() {
  const config = useRuntimeConfig();
  const base = parseBaseUrl(config.public.apiUrl);

  /** Build a full URL from a path, resolved against the validated base. */
  function url(path: string): string {
    // `new URL(path, base)` handles leading slashes, query strings, and
    // prevents accidental double-slashes from string concat.
    return new URL(path, base).toString();
  }

  /** Thin `$fetch` wrapper that resolves `path` against the validated base. */
  function apiFetch<T>(path: string, opts?: Parameters<typeof $fetch<T>>[1]) {
    return $fetch<T>(url(path), opts);
  }

  /** `useFetch`-equivalent that resolves `path` against the validated base. */
  function apiUseFetch<T>(
    path: string,
    opts?: Parameters<typeof useFetch<T>>[1],
  ) {
    return useFetch<T>(() => url(path), opts);
  }

  return { base, url, apiFetch, apiUseFetch };
}
