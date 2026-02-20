/**
 * Simulated vendor database — represents public information gathered
 * from Yelp, Google, BBB, and licensed contractor directories.
 * In production this would be a real web-scraping + API integration.
 */

import type { Vendor } from '@/types';

export const VENDOR_DATABASE: Vendor[] = [
  // HVAC
  {
    id: 'v-hvac-1',
    name: 'AirPro Comfort Solutions',
    specialty: ['hvac', 'heating', 'cooling', 'air_quality'],
    rating: 4.8,
    reviewCount: 312,
    priceRange: 'medium',
    reliabilityScore: 92,
    sources: ['Yelp', 'Google Maps', 'BBB Accredited'],
    estimatedPrice: 285,
    availability: '3-5 business days',
    location: 'Austin, TX',
    yearsInBusiness: 14,
    licensed: true,
    insured: true,
  },
  {
    id: 'v-hvac-2',
    name: 'TempRight Systems',
    specialty: ['hvac', 'heating', 'cooling'],
    rating: 4.5,
    reviewCount: 189,
    priceRange: 'low',
    reliabilityScore: 83,
    sources: ['Google Maps', 'HomeAdvisor'],
    estimatedPrice: 210,
    availability: '1-2 business days',
    location: 'Austin, TX',
    yearsInBusiness: 6,
    licensed: true,
    insured: true,
  },
  {
    id: 'v-hvac-3',
    name: 'Elite Climate Control',
    specialty: ['hvac', 'commercial', 'residential'],
    rating: 4.9,
    reviewCount: 540,
    priceRange: 'high',
    reliabilityScore: 97,
    sources: ['Yelp', 'Google Maps', 'Angi', 'BBB Accredited'],
    estimatedPrice: 420,
    availability: '7-10 business days',
    location: 'Austin, TX',
    yearsInBusiness: 22,
    licensed: true,
    insured: true,
  },

  // Plumbing / Water Heater
  {
    id: 'v-plumb-1',
    name: 'FlowStar Plumbing',
    specialty: ['plumbing', 'water_heater', 'pipes'],
    rating: 4.7,
    reviewCount: 428,
    priceRange: 'medium',
    reliabilityScore: 90,
    sources: ['Yelp', 'Google Maps', 'BBB Accredited'],
    estimatedPrice: 1450,
    availability: '2-4 business days',
    location: 'Austin, TX',
    yearsInBusiness: 18,
    licensed: true,
    insured: true,
  },
  {
    id: 'v-plumb-2',
    name: 'AquaTech Plumbing',
    specialty: ['plumbing', 'water_heater', 'water_treatment'],
    rating: 4.4,
    reviewCount: 203,
    priceRange: 'low',
    reliabilityScore: 80,
    sources: ['Google Maps', 'Thumbtack'],
    estimatedPrice: 1200,
    availability: 'Next day',
    location: 'Austin, TX',
    yearsInBusiness: 5,
    licensed: true,
    insured: false,
  },

  // Roofing
  {
    id: 'v-roof-1',
    name: 'SteelCap Roofing',
    specialty: ['roofing', 'inspection', 'repair', 'replacement'],
    rating: 4.6,
    reviewCount: 267,
    priceRange: 'medium',
    reliabilityScore: 88,
    sources: ['Yelp', 'Google Maps', 'BBB Accredited'],
    estimatedPrice: 350,
    availability: '3-7 business days',
    location: 'Austin, TX',
    yearsInBusiness: 11,
    licensed: true,
    insured: true,
  },
  {
    id: 'v-roof-2',
    name: 'PinnaclePro Roofing',
    specialty: ['roofing', 'gutters', 'siding'],
    rating: 4.8,
    reviewCount: 389,
    priceRange: 'high',
    reliabilityScore: 95,
    sources: ['Yelp', 'Google Maps', 'Angi', 'BBB A+ Rating'],
    estimatedPrice: 480,
    availability: '5-10 business days',
    location: 'Austin, TX',
    yearsInBusiness: 19,
    licensed: true,
    insured: true,
  },

  // Electrical
  {
    id: 'v-elec-1',
    name: 'Volt Masters Electric',
    specialty: ['electrical', 'panel_upgrade', 'wiring', 'inspection'],
    rating: 4.7,
    reviewCount: 356,
    priceRange: 'medium',
    reliabilityScore: 91,
    sources: ['Yelp', 'Google Maps', 'BBB Accredited'],
    estimatedPrice: 2200,
    availability: '5-7 business days',
    location: 'Austin, TX',
    yearsInBusiness: 16,
    licensed: true,
    insured: true,
  },

  // Fire Safety
  {
    id: 'v-fire-1',
    name: 'SafeGuard Fire Services',
    specialty: ['fire_inspection', 'smoke_detector', 'fire_extinguisher', 'compliance'],
    rating: 4.9,
    reviewCount: 512,
    priceRange: 'low',
    reliabilityScore: 96,
    sources: ['Google Maps', 'BBB Accredited', 'State Fire Marshal Directory'],
    estimatedPrice: 175,
    availability: 'Next available',
    location: 'Austin, TX',
    yearsInBusiness: 24,
    licensed: true,
    insured: true,
  },

  // IT / Digital / SSL
  {
    id: 'v-it-1',
    name: 'ClearPath IT Solutions',
    specialty: ['ssl', 'web_security', 'domain', 'backup', 'digital_compliance'],
    rating: 4.6,
    reviewCount: 144,
    priceRange: 'low',
    reliabilityScore: 89,
    sources: ['Clutch', 'Google Maps', 'Upwork Profile'],
    estimatedPrice: 120,
    availability: 'Same day',
    location: 'Remote / Austin, TX',
    yearsInBusiness: 8,
    licensed: true,
    insured: true,
  },

  // License / Legal / Compliance
  {
    id: 'v-legal-1',
    name: 'CompliancePro Advisors',
    specialty: ['business_license', 'gdpr', 'regulatory_compliance', 'documentation'],
    rating: 4.7,
    reviewCount: 98,
    priceRange: 'medium',
    reliabilityScore: 93,
    sources: ['LinkedIn', 'Google Maps', 'Bar Association'],
    estimatedPrice: 350,
    availability: '2-3 business days',
    location: 'Austin, TX',
    yearsInBusiness: 12,
    licensed: true,
    insured: true,
  },
];

export function findVendors(specialty: string, mode: 'cost' | 'quality' = 'quality'): Vendor[] {
  const lower = specialty.toLowerCase();
  const matches = VENDOR_DATABASE.filter((v) =>
    v.specialty.some((s) => s.includes(lower) || lower.includes(s))
  );
  if (mode === 'cost') {
    return matches.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
  }
  return matches.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
}

export function getMarketPrice(specialty: string): number {
  const vendors = findVendors(specialty);
  if (vendors.length === 0) return 500;
  const avg = vendors.reduce((sum, v) => sum + v.estimatedPrice, 0) / vendors.length;
  return Math.round(avg * 1.15); // market median is ~15% higher than what agents negotiate
}
