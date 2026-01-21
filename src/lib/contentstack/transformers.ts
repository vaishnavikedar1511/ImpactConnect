/**
 * Contentstack Response Transformers
 * Transform raw CMS responses to typed application entities
 */

import type {
  Opportunity,
  OpportunitySummary,
  CauseReference,
  LocationReference,
  ImageAsset,
  ContributionType,
  OpportunityStatus,
} from '@/types';

/**
 * Raw Contentstack entry with system fields
 */
interface ContentstackEntry {
  uid: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Raw Contentstack file/asset reference
 */
interface ContentstackAsset {
  uid: string;
  url: string;
  title: string;
  filename: string;
  content_type: string;
  dimension?: {
    width: number;
    height: number;
  };
}

/**
 * Raw Contentstack reference
 */
interface ContentstackReference {
  uid: string;
  _content_type_uid?: string;
  [key: string]: unknown;
}

/**
 * Transform Contentstack asset to ImageAsset
 */
export function transformAsset(asset: ContentstackAsset | undefined): ImageAsset | undefined {
  if (!asset) return undefined;

  return {
    uid: asset.uid,
    url: asset.url,
    title: asset.title,
    filename: asset.filename,
    contentType: asset.content_type,
    width: asset.dimension?.width,
    height: asset.dimension?.height,
  };
}

/**
 * Transform Contentstack cause reference
 * Handles both reference fields and slug fields
 */
export function transformCauseReference(ref: ContentstackReference | string): CauseReference {
  if (typeof ref === 'string') {
    return {
      uid: ref,
      name: ref.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: ref,
    };
  }

  return {
    uid: ref.uid,
    name: (ref.name as string) || (ref.title as string) || 'Unknown Cause',
    slug: (ref.slug as string) || ref.uid,
  };
}

/**
 * Transform causes - handles both reference arrays and slug arrays
 */
function transformCauses(entry: ContentstackEntry): CauseReference[] {
  // Try reference field first
  const causesRef = entry.causes as ContentstackReference[] | undefined;
  if (causesRef && Array.isArray(causesRef) && causesRef.length > 0 && causesRef[0].uid) {
    return causesRef.map(transformCauseReference);
  }

  // Try slug array field
  const causeSlugs = entry.cause_slugs as string[] | undefined;
  if (causeSlugs && Array.isArray(causeSlugs)) {
    return causeSlugs.map(slug => transformCauseReference(slug));
  }

  return [];
}

/**
 * Get cause slugs from entry
 */
function getCauseSlugs(entry: ContentstackEntry): string[] {
  // Try slug array field first
  const causeSlugs = entry.cause_slugs as string[] | undefined;
  if (causeSlugs && Array.isArray(causeSlugs)) {
    return causeSlugs;
  }

  // Try reference field
  const causesRef = entry.causes as ContentstackReference[] | undefined;
  if (causesRef && Array.isArray(causesRef) && causesRef.length > 0) {
    return causesRef.map(ref => (ref.slug as string) || ref.uid);
  }

  return [];
}

/**
 * Transform raw Contentstack entry to Opportunity
 */
export function transformOpportunity(entry: ContentstackEntry): Opportunity {
  return {
    uid: entry.uid,
    title: entry.title as string,
    slug: entry.slug as string,
    summary: entry.summary as string | undefined,
    description: entry.description as string | undefined,
    coverImage: transformAsset(entry.cover_image as ContentstackAsset | undefined),

    // Location fields (direct, not reference)
    country: entry.country as string | undefined,
    state: entry.state as string | undefined,
    city: entry.city as string | undefined,
    address: entry.address as string | undefined,
    isVirtual: entry.is_virtual as boolean | undefined,

    // Categories
    causeSlugs: getCauseSlugs(entry),
    contributionTypes: (entry.contribution_types as ContributionType[]) || [],

    // Timing
    startDate: entry.start_date as string,
    endDate: entry.end_date as string | undefined,
    startTime: entry.start_time as string | undefined,
    endTime: entry.end_time as string | undefined,

    // Organizer (direct fields, not reference)
    organizerName: entry.organizer_name as string | undefined,
    organizerEmail: entry.organizer_email as string | undefined,

    // Capacity
    spotsAvailable: entry.spots_available as number | undefined,
    requirements: entry.requirements as string | undefined,

    // Status
    status: (entry.status as OpportunityStatus) || 'upcoming',

    // Metadata
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  };
}

/**
 * Transform raw Contentstack entry to OpportunitySummary (for list views)
 */
export function transformOpportunitySummary(entry: ContentstackEntry): OpportunitySummary {
  return {
    uid: entry.uid,
    title: entry.title as string,
    slug: entry.slug as string,
    summary: entry.summary as string | undefined,
    coverImage: transformAsset(entry.cover_image as ContentstackAsset | undefined),
    
    // Categories
    causeSlugs: getCauseSlugs(entry),
    contributionTypes: (entry.contribution_types as ContributionType[]) || [],
    
    // Location
    country: entry.country as string | undefined,
    state: entry.state as string | undefined,
    city: entry.city as string | undefined,
    isVirtual: entry.is_virtual as boolean | undefined,
    
    // Timing
    startDate: entry.start_date as string,
    endDate: entry.end_date as string | undefined,
    startTime: entry.start_time as string | undefined,
    
    // Organizer
    organizerName: entry.organizer_name as string | undefined,
    
    // Capacity
    spotsAvailable: entry.spots_available as number | undefined,
    
    // Status
    status: (entry.status as OpportunityStatus) || 'upcoming',
  };
}

// Legacy exports for backward compatibility with existing code
export { transformCauses };
export type { ContentstackEntry, ContentstackAsset, ContentstackReference };
