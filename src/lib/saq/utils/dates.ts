/**
 * Date utilities for the SAQ modules.
 */

/**
 * Convert a Date into an ISO date string (YYYY-MM-DD).
 */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Parse an ISO date string (YYYY-MM-DD) into a Date object.
 * Returns undefined for invalid input.
 */
export function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

