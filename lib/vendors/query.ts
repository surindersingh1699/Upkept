/**
 * Vendor query builder — generates location-aware, constraint-aware
 * search queries for vendor discovery.
 */

import type { ServiceProfile, VendorSearchContext } from '@/types';

export function buildVendorQueries(
  service: ServiceProfile,
  ctx: VendorSearchContext,
  contextHints: string[] = []
): string[] {
  const base = `${ctx.city} ${ctx.state}`.trim();
  const primary = service.keywords?.[0] ?? `${service.category} service`;
  const hintSuffix = contextHints.length > 0 ? ` ${contextHints.join(' ')}` : '';

  const queries: string[] = [
    `${primary} ${base}${hintSuffix}`,
    `${service.category} ${service.subcategory ?? ''} ${base}`.replace(/\s+/g, ' ').trim(),
  ];

  if (ctx.propertyType) {
    queries.push(`${primary} ${base} ${ctx.propertyType}`);
  }

  if (!service.onsite) {
    queries.push(`${primary} remote`);
    queries.push(
      `${service.category} ${service.subcategory ?? ''} remote`.replace(/\s+/g, ' ').trim()
    );
  }

  if (service.requiresLicense?.length) {
    queries.push(`${primary} licensed insured ${base}`);
  }

  return [...new Set(queries)].slice(0, 5);
}
