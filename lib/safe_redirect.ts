// Post-login redirects must stay on this site. A plain startsWith("/") check is
// not enough: browsers read "/\evil.com" (and "/<tab>/evil.com") as "//evil.com".
export function safeRedirect(raw: string | null | undefined, fallback: string, requiredPrefix = "/") {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  try {
    const origin = typeof window === "undefined" ? "https://local.invalid" : window.location.origin;
    const u = new URL(raw, origin);
    if (u.origin !== origin) return fallback;
    const path = u.pathname + u.search + u.hash;
    return path === requiredPrefix || path.startsWith(requiredPrefix.endsWith("/") ? requiredPrefix : `${requiredPrefix}/`) || path.startsWith(`${requiredPrefix}?`) ? path : fallback;
  } catch {
    return fallback;
  }
}
