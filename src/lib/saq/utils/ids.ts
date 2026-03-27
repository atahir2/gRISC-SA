/**
 * ID utilities for the SAQ modules.
 */

/**
 * Create a simple string ID with an optional prefix.
 *
 * This is a lightweight helper; production systems may replace this with a
 * stronger ID/UUID generator.
 */
export function createId(prefix?: string): string {
  const base = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${base}` : base;
}

