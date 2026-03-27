/**
 * Scope-related helper functions for the SAQ engine.
 *
 * These helpers operate on runtime scope selections and static scope items.
 */

import type { ScopeItem } from "../questionnaire.types";
import type { ScopeSelection } from "../assessment.types";

/**
 * Build a quick lookup map of scopeId → inScope flag.
 */
export function buildInScopeMap(
  selections: ScopeSelection[]
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const sel of selections) {
    map.set(sel.scopeId, sel.inScope);
  }
  return map;
}

/**
 * Get all scope items that are currently in scope for a given assessment.
 */
export function getInScopeItems(
  scopeItems: ScopeItem[],
  selections: ScopeSelection[]
): ScopeItem[] {
  const inScopeMap = buildInScopeMap(selections);
  return scopeItems.filter((s) => inScopeMap.get(s.id));
}

