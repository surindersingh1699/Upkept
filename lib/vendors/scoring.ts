/**
 * Two-stage vendor scoring — computes relevance, trust, compliance,
 * price, and availability scores then combines them with mode-aware weights.
 */

import type { Vendor, ServiceProfile, VendorScoreBreakdown, OptimizationMode } from '@/types';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function computeRelevanceScore(v: Vendor, service: ServiceProfile): number {
  // Lightweight text-based relevance (upgrade to embeddings/hybrid later)
  const vendorText = [
    v.name,
    ...(v.categories ?? []),
    ...(v.services ?? []),
    ...v.specialty,
  ]
    .join(' ')
    .toLowerCase();

  const keywords = service.keywords?.length ? service.keywords : [service.category];
  const hits = keywords.reduce(
    (acc, k) => (vendorText.includes(k.toLowerCase()) ? acc + 1 : acc),
    0
  );

  const categoryMatch = v.categories?.includes(service.category) ? 1 : 0;
  // Fall back to legacy specialty match
  const specialtyMatch =
    categoryMatch === 0 && v.specialty.some((s) => s.includes(service.category))
      ? 0.8
      : 0;

  const bestCategory = Math.max(categoryMatch, specialtyMatch);
  const keywordN = keywords.length ? hits / keywords.length : 0;

  return clamp01(0.65 * bestCategory + 0.35 * keywordN);
}

export function scoreVendor(
  v: Vendor,
  service: ServiceProfile,
  marketPrice: number,
  mode: OptimizationMode
): VendorScoreBreakdown {
  const ratingN = clamp01(((v.rating ?? 0) - 3.5) / 1.5);
  const reviewsN = clamp01(Math.log10((v.reviewCount ?? 0) + 1) / 3);
  const reliabilityN = clamp01((v.reliabilityScore ?? 50) / 100);

  const relevanceN = clamp01(v.matchScore ?? computeRelevanceScore(v, service));

  const needsCompliance = !!service.requiresLicense?.length;
  const hasLicense = needsCompliance ? !!v.licensed : true;
  const hasInsurance = needsCompliance ? !!v.insured : true;
  const complianceN = (hasLicense ? 0.5 : 0) + (hasInsurance ? 0.5 : 0);

  const estimate = v.estimatedPrice ?? marketPrice ?? 0;
  const priceDelta = marketPrice > 0 ? Math.abs(estimate - marketPrice) / marketPrice : 1;
  const priceN = clamp01(1 - priceDelta);

  const availabilityN = clamp01(v.availabilityScore ?? 0.5);
  const trustN = clamp01(0.5 * ratingN + 0.2 * reviewsN + 0.3 * reliabilityN);

  const weights =
    mode === 'cost'
      ? { relevance: 0.25, trust: 0.20, compliance: 0.15, price: 0.35, availability: 0.05 }
      : { relevance: 0.30, trust: 0.30, compliance: 0.20, price: 0.10, availability: 0.10 };

  const total =
    weights.relevance * relevanceN +
    weights.trust * trustN +
    weights.compliance * complianceN +
    weights.price * priceN +
    weights.availability * availabilityN;

  return {
    total,
    relevance: relevanceN,
    trust: trustN,
    compliance: complianceN,
    price: priceN,
    availability: availabilityN,
  };
}
