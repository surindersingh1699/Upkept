/**
 * Vendor discovery module — find, filter, and rank vendors.
 *
 * Uses the existing VENDOR_DATABASE with the new ServiceProfile-based
 * search, hard filters, and multi-signal scoring.
 *
 * In production, findVendors() would call Google Places / Yelp / Thumbtack APIs
 * using the generated queries. For now it searches the mock DB.
 */

import type { Vendor, VendorSearchRequest, ScoredVendor } from '@/types';
import { passesHardFilters } from './filters';
import { computeRelevanceScore, scoreVendor } from './scoring';
import { VENDOR_DATABASE } from './database';

export { buildVendorQueries } from './query';

export function getMarketPrice(categoryOrSubcategory: string): number {
  const key = categoryOrSubcategory.toLowerCase();
  // Match against the database vendors in the same category for a realistic price
  const matches = VENDOR_DATABASE.filter((v) =>
    v.specialty.some((s) => s.includes(key) || key.includes(s)) ||
    v.categories?.some((c) => c.includes(key) || key.includes(c))
  );
  if (matches.length > 0) {
    const avg = matches.reduce((sum, v) => sum + v.estimatedPrice, 0) / matches.length;
    return Math.round(avg * 1.15);
  }
  return 500;
}

export function findVendors(req: VendorSearchRequest): Vendor[] {
  const { service } = req;

  // Filter by category match (new categories field) or legacy specialty match
  return VENDOR_DATABASE.filter((v) => {
    const hasCategoryMatch = v.categories?.includes(service.category);
    const hasSpecialtyMatch = v.specialty.some(
      (s) => s.includes(service.category) || service.category.includes(s)
    );
    return hasCategoryMatch || hasSpecialtyMatch;
  });
}

export function rankVendors(
  candidates: Vendor[],
  req: VendorSearchRequest,
  marketPrice: number
): { selected?: Vendor; alternatives: Vendor[]; scored: ScoredVendor[] } {
  // Compute relevance score for each candidate
  const withMatch = candidates.map((v) => ({
    ...v,
    matchScore: computeRelevanceScore(v, req.service),
  }));

  // Stage A: hard filters
  const filtered = withMatch.filter((v) =>
    passesHardFilters(v, req.service, req.location)
  );

  // Stage B: scoring
  const scored: ScoredVendor[] = filtered
    .map((vendor) => ({
      vendor,
      score: scoreVendor(vendor, req.service, marketPrice, req.mode),
    }))
    .sort((a, b) => b.score.total - a.score.total);

  return {
    selected: scored[0]?.vendor,
    alternatives: scored.slice(1, 4).map((x) => x.vendor),
    scored,
  };
}
