// src/lib/searchUtils.ts
import Fuse from 'fuse.js';

/**
 * Simple partial word matching (fast, no typo tolerance)
 */
export function matchesPartialWord(target: string, query: string): boolean {
  if (!query.trim()) return true;
  const queryWords = query.toLowerCase().split(/\s+/);
  const targetLower = target.toLowerCase();
  return queryWords.some(word => targetLower.includes(word));
}

/**
 * Fuzzy search using Fuse.js (handles typos)
 * @param items Array of items to search
 * @param query Search query (can have typos)
 * @param keys Array of field names to search in
 * @param threshold Match threshold (0.0 = exact, 0.6 = very fuzzy, default 0.4)
 * @returns Filtered array of items
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  keys: (keyof T)[],
  threshold: number = 0.4
): T[] {
  if (!query.trim()) return items;
  if (query.trim().length < 2) {
    // For very short queries, fall back to partial match
    return items.filter(item => {
      const text = keys.map(k => String(item[k] ?? '')).join(' ');
      return matchesPartialWord(text, query);
    });
  }
  const fuse = new Fuse(items, {
    keys: keys as string[],
    threshold,
    ignoreLocation: true,   // match anywhere in the string
    useExtendedSearch: true,
    minMatchCharLength: 2,
  });
  const results = fuse.search(query);
  return results.map(result => result.item);
}

/**
 * Smart search: tries fuzzy first, falls back to partial if no results
 * Best for user-facing search where typos are common
 */
export function smartSearch<T>(
  items: T[],
  query: string,
  keys: (keyof T)[],
  threshold: number = 0.4
): T[] {
  if (!query.trim()) return items;
  let results = fuzzySearch(items, query, keys, threshold);
  if (results.length === 0) {
    // No fuzzy results – fall back to simple partial match
    results = items.filter(item => {
      const text = keys.map(k => String(item[k] ?? '')).join(' ');
      return matchesPartialWord(text, query);
    });
  }
  return results;
}

// Product-specific helper (common use case)
export function searchProducts<T extends { name: string; vendorName?: string; category?: string; description?: string }>(
  products: T[],
  query: string,
  useFuzzy: boolean = true
): T[] {
  const keys: (keyof T)[] = ['name', 'vendorName', 'category', 'description'];
  if (useFuzzy) {
    return smartSearch(products, query, keys, 0.4);
  } else {
    return products.filter(product => {
      const text = keys.map(k => String(product[k] ?? '')).join(' ');
      return matchesPartialWord(text, query);
    });
  }
}