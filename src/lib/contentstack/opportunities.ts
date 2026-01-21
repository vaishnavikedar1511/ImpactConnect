/**
 * Opportunity Data Fetching
 * High-level functions for fetching opportunities from Contentstack
 */

import type {
  Opportunity,
  OpportunitySummary,
  OpportunityFilters,
  OpportunityListResponse,
  OpportunitySortOption,
} from '@/types';
import { ContentTypes } from './config';
import { getEntries, getEntryByUid, getEntryByField, getEntryCount } from './client';
import { transformOpportunity, transformOpportunitySummary } from './transformers';
import { isPast } from '@/lib/utils/dates';

/**
 * Default page size for opportunity listings
 */
const DEFAULT_PAGE_SIZE = 12;
const MAX_FETCH_LIMIT = 100; // Fetch more to allow for filtering

/**
 * Map sort option to Contentstack order_by field
 */
function getSortField(sort: OpportunitySortOption): { field: string; direction: 'asc' | 'desc' } {
  switch (sort) {
    case 'date_asc':
      return { field: 'start_date', direction: 'asc' };
    case 'date_desc':
      return { field: 'start_date', direction: 'desc' };
    case 'spots_available':
      return { field: 'spots_available', direction: 'desc' };
    case 'relevance':
    default:
      return { field: 'created_at', direction: 'desc' };
  }
}

/**
 * Build basic query (non-reference filters only)
 */
function buildBasicQuery(filters: OpportunityFilters): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [];

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

  // Text search (title and summary)
  if (filters.search) {
    conditions.push({
      $or: [
        { title: { $regex: filters.search } },
        { summary: { $regex: filters.search } },
      ],
    });
  }

  // Country filter (direct field)
  if (filters.country) {
    conditions.push({
      country: filters.country,
    });
  }

  // State filter (direct field)
  if (filters.state) {
    conditions.push({
      state: filters.state,
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

/**
 * Filter opportunities by location (city) and causes after fetching
 * This is needed because city matching might need slug normalization
 */
function filterByLocationAndCauses(
  opportunities: OpportunitySummary[],
  filters: OpportunityFilters
): OpportunitySummary[] {
  let result = opportunities;

  // Filter by location (city slug match)
  if (filters.location) {
    const locationSlug = filters.location.toLowerCase();
    result = result.filter((opp) => {
      if (!opp.city) return false;
      const citySlug = opp.city.toLowerCase().replace(/\s+/g, '-');
      return citySlug === locationSlug || opp.city.toLowerCase() === locationSlug;
    });
  }

  // Filter by cause slugs
  if (filters.causes && filters.causes.length > 0) {
    result = result.filter((opp) => {
      if (!opp.causeSlugs || opp.causeSlugs.length === 0) return false;
      return filters.causes!.some((slug) => opp.causeSlugs!.includes(slug));
    });
  }

  return result;
}

/**
 * Fetch a paginated list of opportunities with filters
 */
export async function getOpportunities(
  filters: OpportunityFilters = {},
  options: {
    page?: number;
    pageSize?: number;
    sort?: OpportunitySortOption;
  } = {}
): Promise<OpportunityListResponse> {
  const page = options.page || 1;
  const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
  const sort = options.sort || 'date_asc';
  const { field, direction } = getSortField(sort);

  // Build basic query (non-reference filters)
  // For completed filter, we need to fetch all opportunities (not just status="completed")
  // so we can filter by date. We'll remove status filter temporarily.
  const isCompletedFilter = filters.status && filters.status.length === 1 && filters.status[0] === 'completed';
  const isActiveFilter = filters.status && (filters.status.includes('upcoming') || filters.status.includes('ongoing'));
  const needsDateFiltering = isCompletedFilter || isActiveFilter;
  
  const queryFilters = { ...filters };
  if (isCompletedFilter) {
    // Remove status filter temporarily - we'll filter by date after fetching
    queryFilters.status = undefined;
  }
  // For active filter, keep the status filter in the query - we'll just exclude past dates
  const query = buildBasicQuery(queryFilters);

  // Check if we need post-fetch filtering
  const needsPostFiltering = !!(filters.location || (filters.causes && filters.causes.length > 0) || needsDateFiltering);

  // Fetch more entries if we need to filter
  const fetchLimit = needsPostFiltering ? MAX_FETCH_LIMIT : pageSize;
  const fetchSkip = needsPostFiltering ? 0 : (page - 1) * pageSize;

  const entriesResult = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query,
    limit: fetchLimit,
    skip: fetchSkip,
    orderBy: field,
    orderDirection: direction,
  });

  // Transform all entries, filtering out any that fail transformation
  let opportunities = entriesResult.entries
    .map((entry) => {
      try {
        return transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0]);
      } catch (error) {
        console.warn(`Failed to transform opportunity ${entry.uid}:`, error);
        return null;
      }
    })
    .filter((opp): opp is OpportunitySummary => opp !== null);

  // Apply date-based filtering
  // For "completed" filter: show opportunities with status="completed" OR past dates
  // For "active" filter: show opportunities with status="upcoming"/"ongoing" AND exclude past dates
  if (filters.status && filters.status.length > 0) {
    const isCompletedFilter = filters.status.length === 1 && filters.status[0] === 'completed';
    const isActiveFilter = filters.status.includes('upcoming') || filters.status.includes('ongoing');
    
    if (isCompletedFilter) {
      // For completed: show status="completed" OR past-dated opportunities
      opportunities = opportunities.filter((opp) => {
        const eventDate = opp.endDate || opp.startDate;
        const hasPastDate = eventDate ? isPast(eventDate) : false;
        return opp.status === 'completed' || hasPastDate;
      });
    } else if (isActiveFilter) {
      // For active: exclude past-dated opportunities (status filter already applied in query)
      opportunities = opportunities.filter((opp) => {
        const eventDate = opp.endDate || opp.startDate;
        if (!eventDate) {
          // If no date, include it (status filter already applied)
          return true;
        }
        // Exclude if date is in the past (include today and future)
        return !isPast(eventDate);
      });
    }
  }

  // Apply post-fetch filters if needed
  if (needsPostFiltering) {
    opportunities = filterByLocationAndCauses(opportunities, filters);
  }

  // Calculate total and apply pagination for filtered results
  // Always use the actual transformed opportunities length to ensure accuracy
  const total = needsPostFiltering ? opportunities.length : opportunities.length;

  if (needsPostFiltering) {
    // Apply pagination after filtering
    const startIndex = (page - 1) * pageSize;
    opportunities = opportunities.slice(startIndex, startIndex + pageSize);
  }

  return {
    opportunities,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
    filters,
  };
}

/**
 * Fetch a single opportunity by UID
 */
export async function getOpportunityById(uid: string): Promise<Opportunity | null> {
  const entry = await getEntryByUid<Record<string, unknown>>(
    ContentTypes.OPPORTUNITY,
    uid
  );

  if (!entry) return null;

  return transformOpportunity(entry as Parameters<typeof transformOpportunity>[0]);
}

/**
 * Fetch a single opportunity by slug
 */
export async function getOpportunityBySlug(slug: string): Promise<Opportunity | null> {
  const entry = await getEntryByField<Record<string, unknown>>(
    ContentTypes.OPPORTUNITY,
    'slug',
    slug
  );

  if (!entry) return null;

  return transformOpportunity(entry as Parameters<typeof transformOpportunity>[0]);
}

/**
 * Fetch featured opportunities
 */
export async function getFeaturedOpportunities(
  limit = 6
): Promise<OpportunitySummary[]> {
  const query = {
    is_featured: true,
    status: 'upcoming',
  };

  const result = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query,
    limit,
    orderBy: 'start_date',
    orderDirection: 'asc',
  });

  return result.entries.map((entry) =>
    transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0])
  );
}

/**
 * Fetch upcoming opportunities
 */
export async function getUpcomingOpportunities(
  limit = 12
): Promise<OpportunitySummary[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const query = {
    $and: [
      { status: 'upcoming' },
      { start_date: { $gte: today } },
    ],
  };

  const result = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query,
    limit,
    orderBy: 'start_date',
    orderDirection: 'asc',
  });

  return result.entries.map((entry) =>
    transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0])
  );
}

/**
 * Fetch opportunities by organizer name
 */
export async function getOpportunitiesByOrganizer(
  organizerName: string,
  options: { limit?: number; includeCompleted?: boolean } = {}
): Promise<OpportunitySummary[]> {
  const limit = options.limit || 10;

  const result = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query: {
      $and: [
        { organizer_name: organizerName },
        options.includeCompleted ? {} : { status: { $in: ['upcoming', 'ongoing'] } },
      ].filter(obj => Object.keys(obj).length > 0),
    },
    limit,
    orderBy: 'start_date',
    orderDirection: 'asc',
  });

  return result.entries.map((entry) =>
    transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0])
  );
}

/**
 * Fetch opportunities by cause slug
 */
export async function getOpportunitiesByCause(
  causeSlug: string,
  limit = 12
): Promise<OpportunitySummary[]> {
  const result = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query: { status: { $in: ['upcoming', 'ongoing'] } },
    limit: MAX_FETCH_LIMIT,
    orderBy: 'start_date',
    orderDirection: 'asc',
  });

  const opportunities = result.entries
    .map((entry) => transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0]))
    .filter((opp) => opp.causeSlugs?.includes(causeSlug))
    .slice(0, limit);

  return opportunities;
}

/**
 * Fetch opportunities by city
 */
export async function getOpportunitiesByCity(
  city: string,
  limit = 12
): Promise<OpportunitySummary[]> {
  const result = await getEntries<Record<string, unknown>>(ContentTypes.OPPORTUNITY, {
    query: { 
      $and: [
        { status: { $in: ['upcoming', 'ongoing'] } },
        { city: city },
      ],
    },
    limit,
    orderBy: 'start_date',
    orderDirection: 'asc',
  });

  return result.entries.map((entry) =>
    transformOpportunitySummary(entry as Parameters<typeof transformOpportunitySummary>[0])
  );
}

/**
 * Get total opportunity count (with optional filters)
 */
export async function getOpportunityCount(filters: OpportunityFilters = {}): Promise<number> {
  // For simple filters, use count API
  if (!filters.location && (!filters.causes || filters.causes.length === 0)) {
    const query = buildBasicQuery(filters);
    return getEntryCount(ContentTypes.OPPORTUNITY, query);
  }

  // For location/cause filters, we need to fetch and count
  const result = await getOpportunities(filters, { page: 1, pageSize: 1 });
  return result.total;
}

/**
 * Get all opportunity slugs (for static generation)
 */
export async function getAllOpportunitySlugs(): Promise<string[]> {
  const result = await getEntries<{ slug: string }>(ContentTypes.OPPORTUNITY, {
    only: { BASE: ['slug'] },
    limit: 1000,
  });

  return result.entries.map((entry) => entry.slug);
}
