/** A route change that can use the tile transition; hashes keep native scrolling. */
export function getNavigationTarget(href: string, currentUrl: string): string | null {
  try {
    const current = new URL(currentUrl);
    const next = new URL(href, current);
    if (!['http:', 'https:'].includes(next.protocol) || next.origin !== current.origin) return null;
    if (next.pathname === current.pathname && next.search === current.search) return null;
    return `${next.pathname}${next.search}${next.hash}`;
  } catch {
    return null;
  }
}
