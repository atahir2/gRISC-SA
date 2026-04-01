/**
 * Prevents open redirects after login: only same-origin relative paths are allowed.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/saq";
  }
  return next;
}
