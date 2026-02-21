/**
 * Hard filters for vendor candidates — eliminates vendors that
 * cannot possibly serve a given task (wrong area, unlicensed, etc.).
 */

import type { Vendor, ServiceProfile, VendorSearchContext } from '@/types';

export function passesHardFilters(
  v: Vendor,
  service: ServiceProfile,
  ctx: VendorSearchContext
): boolean {
  // Onsite work: vendor must serve the same state at minimum
  if (service.onsite) {
    const vendorState = v.serviceArea?.state ?? extractState(v.location);
    if (vendorState && vendorState.toLowerCase() !== ctx.state.toLowerCase()) return false;
  }

  // Regulated work: must be licensed and insured
  if (service.requiresLicense?.length) {
    if (!v.licensed) return false;
    if (!v.insured) return false;
  }

  // Non-standard urgency: avoid low-signal vendors
  if (service.urgency !== 'standard') {
    if ((v.reviewCount ?? 0) < 10) return false;
    if ((v.rating ?? 0) < 3.8) return false;
  }

  return true;
}

/** Best-effort state extraction from freeform location string */
function extractState(location: string): string | undefined {
  if (!location) return undefined;
  // Match trailing two-letter state code: "Austin, TX" -> "TX"
  const match = location.match(/\b([A-Z]{2})\b/);
  return match?.[1];
}
