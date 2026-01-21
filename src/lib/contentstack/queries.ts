/**
 * Contentstack Query Builders
 * Build complex queries for filtering and searching
 */

import type { OpportunityFilters, ContributionType, OpportunityStatus } from '@/types';

/**
 * Contentstack query operators
 */
type QueryOperator =
  | '$in'
  | '$nin'
  | '$exists'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$ne'
  | '$regex'
  | '$and'
  | '$or';

type QueryValue = string | number | boolean | string[] | QueryCondition | QueryCondition[];

interface QueryCondition {
  [key: string]: QueryValue | { [K in QueryOperator]?: QueryValue };
}

/**
 * Build query for opportunity filtering
 * Supports both reference fields and slug fields
 */
export function buildOpportunityQuery(filters: OpportunityFilters): QueryCondition {
  const conditions: QueryCondition[] = [];

  // Location filter - check both reference field and slug field
  if (filters.location) {
    conditions.push({
      $or: [
        { 'location.slug': filters.location },
        { location_slug: filters.location },
      ],
    });
  }

  // Cause filter - check both reference field and slug array field
  if (filters.causes && filters.causes.length > 0) {
    conditions.push({
      $or: [
        { 'causes.slug': { $in: filters.causes } },
        { cause_slugs: { $in: filters.causes } },
      ],
    });
  }

  // Contribution type filter
  if (filters.contributionTypes && filters.contributionTypes.length > 0) {
    conditions.push({
      contribution_types: { $in: filters.contributionTypes },
    });
  }

  // Date range filter
  if (filters.startDate) {
    conditions.push({
      start_date: { $gte: filters.startDate },
    });
  }

  if (filters.endDate) {
    conditions.push({
      start_date: { $lte: filters.endDate },
    });
  }

  // Virtual filter
  if (filters.isVirtual !== undefined) {
    conditions.push({
      is_virtual: filters.isVirtual,
    });
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    conditions.push({
      status: { $in: filters.status },
    });
  }

  // Organizer filter - check both reference field and slug field
  if (filters.organizerId) {
    conditions.push({
      $or: [
        { 'organizer.uid': filters.organizerId },
        { organizer_slug: filters.organizerId },
      ],
    });
  }

  // Text search (title and summary)
  if (filters.search) {
    conditions.push({
      $or: [
        { title: { $regex: filters.search } },
        { summary: { $regex: filters.search } },
      ],
    });
  }

  // Combine all conditions with $and
  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

/**
 * Build query for featured opportunities
 */
export function buildFeaturedQuery(): QueryCondition {
  return {
    is_featured: true,
    status: 'upcoming',
  };
}

/**
 * Build query for upcoming opportunities
 */
export function buildUpcomingQuery(): QueryCondition {
  const today = new Date().toISOString().split('T')[0];

  return {
    $and: [
      { status: 'upcoming' },
      { start_date: { $gte: today } },
    ],
  };
}

/**
 * Build query for opportunities by organizer
 * Supports both reference field and slug field
 */
export function buildOrganizerOpportunitiesQuery(organizerId: string): QueryCondition {
  return {
    $or: [
      { 'organizer.uid': organizerId },
      { organizer_slug: organizerId },
    ],
  };
}

/**
 * Build query for opportunities by cause
 * Supports both reference field and slug field
 */
export function buildCauseOpportunitiesQuery(causeSlug: string): QueryCondition {
  return {
    $and: [
      {
        $or: [
          { 'causes.slug': causeSlug },
          { cause_slugs: causeSlug },
        ],
      },
      { status: { $in: ['upcoming', 'ongoing'] } },
    ],
  };
}

/**
 * Build query for opportunities by location with nearby support
 * Supports both reference field and slug field
 */
export function buildLocationQuery(
  locationSlug: string,
  includeParent = true
): QueryCondition {
  if (includeParent) {
    return {
      $or: [
        { 'location.slug': locationSlug },
        { location_slug: locationSlug },
        { 'address.location.slug': locationSlug },
      ],
    };
  }

  return {
    $or: [
      { 'location.slug': locationSlug },
      { location_slug: locationSlug },
    ],
  };
}

/**
 * Get default fields to include in opportunity queries
 * These are the reference fields that need to be expanded
 */
export function getOpportunityIncludes(): string[] {
  return ['organizer', 'causes', 'location', 'address.location'];
}

/**
 * Get fields for summary/list view (performance optimization)
 */
export function getOpportunitySummaryFields(): Record<string, string[]> {
  return {
    BASE: [
      'uid',
      'title',
      'slug',
      'summary',
      'cover_image',
      'contribution_types',
      'is_virtual',
      'start_date',
      'end_date',
      'start_time',
      'spots_available',
      'status',
      'is_featured',
      // Include slug fields for non-reference data
      'organizer_slug',
      'location_slug',
      'cause_slugs',
    ],
  };
}
