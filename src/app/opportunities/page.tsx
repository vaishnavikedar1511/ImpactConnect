/**
 * Opportunities Page (Discover)
 * Shows all published opportunities by default
 * Filters are optional and narrow results when applied
 * Locations are extracted from existing opportunity entries
 * Content fetched from Contentstack (with fallback defaults)
 */

import { Suspense } from 'react';
import {
  getOpportunities,
  getDiscoverPageContent,
} from '@/lib/contentstack';
import { getAllCauses } from '@/lib/contentstack/taxonomies';
import { OpportunitiesPageClient } from '@/components/opportunities/OpportunitiesPageClient';
import { OpportunityListSkeleton } from '@/components/opportunities';
import type { Metadata } from 'next';
import type { LocationReference, CauseReference } from '@/types';
import { OpportunityStatus } from '@/types';

export const metadata: Metadata = {
  title: 'Discover Opportunities | ImpactConnect',
  description:
    'Discover volunteering, donation drives, and community service opportunities. Filter by location, cause, and contribution type to find the perfect way to make an impact.',
  openGraph: {
    title: 'Discover Opportunities | ImpactConnect',
    description:
      'Discover volunteering and community service opportunities near you.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{
    location?: string;
    virtual?: string;
    types?: string;
    causes?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    status?: string;
  }>;
}

const PAGE_SIZE = 50; // Increased to show more opportunities per page

/**
 * Extract unique locations from opportunity entries
 * Combines city, state, country into location options
 */
function extractLocationsFromOpportunities(opportunities: Array<{
  city?: string;
  state?: string;
  country?: string;
}>): LocationReference[] {
  const locationMap = new Map<string, LocationReference>();

  opportunities.forEach((opp) => {
    // Add city if available
    if (opp.city && opp.city.trim()) {
      const citySlug = opp.city.toLowerCase().replace(/\s+/g, '-');
      if (!locationMap.has(citySlug)) {
        const displayName = opp.state 
          ? `${opp.city}, ${opp.state}` 
          : opp.city;
        locationMap.set(citySlug, {
          uid: citySlug,
          name: displayName,
          slug: citySlug,
        });
      }
    }
  });

  // Sort alphabetically by name
  return Array.from(locationMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

/**
 * Extract unique causes from opportunity entries
 * Uses cause slugs from opportunities to build dropdown options
 */
function extractCausesFromOpportunities(opportunities: Array<{
  causeSlugs?: string[];
}>): CauseReference[] {
  const causeMap = new Map<string, CauseReference>();

  opportunities.forEach((opp) => {
    if (opp.causeSlugs && opp.causeSlugs.length > 0) {
      opp.causeSlugs.forEach((slug) => {
        if (!causeMap.has(slug)) {
          // Convert slug to display name (e.g., "animal-welfare" -> "Animal Welfare")
          const name = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          causeMap.set(slug, {
            uid: slug, // Use slug as UID since we don't have real UID from opportunities
            name: name,
            slug: slug,
          });
        }
      });
    }
  });

  // Sort alphabetically by name
  return Array.from(causeMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

async function OpportunitiesContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  // Determine status filter from URL params
  const statusFilter = params.status === 'completed' ? 'completed' : 'active';
  
  // Build filters from search params (all optional)
  const filters: Parameters<typeof getOpportunities>[0] = {
    // Set status based on filter
    status: statusFilter === 'active' ? [OpportunityStatus.UPCOMING, OpportunityStatus.ONGOING] : [OpportunityStatus.COMPLETED],
  };

  // Location filter (optional) - match by city slug
  if (params.location) {
    filters.location = params.location;
  }

  // Virtual filter (optional)
  if (params.virtual === 'true') {
    filters.isVirtual = true;
  }

  // Contribution types filter (optional)
  if (params.types) {
    filters.contributionTypes = params.types.split(',') as any;
  }

  // Causes filter (optional)
  if (params.causes) {
    filters.causes = params.causes.split(',');
  }

  // Date range filter (optional)
  if (params.startDate) {
    filters.startDate = params.startDate;
  }

  if (params.endDate) {
    filters.endDate = params.endDate;
  }

  // Fetch opportunities, causes, page content in parallel
  // Also fetch ALL opportunities (without filters) to extract available locations
  const [opportunitiesResult, causesResult, allOpportunitiesForLocations, pageContent] = await Promise.all([
    getOpportunities(filters, {
      page,
      pageSize: PAGE_SIZE,
      sort: 'date_asc', // Always sort by date ascending
    }),
    getAllCauses(),
    // Fetch all opportunities to extract locations (with minimal filters)
    getOpportunities({ status: [OpportunityStatus.UPCOMING, OpportunityStatus.ONGOING] }, { page: 1, pageSize: 100 }),
    // Fetch page content from Contentstack
    getDiscoverPageContent(),
  ]);

  // Extract unique locations from all opportunities
  const locations = extractLocationsFromOpportunities(
    allOpportunitiesForLocations.opportunities.map((opp) => ({
      city: opp.city,
      state: opp.state,
      country: opp.country,
    }))
  );

  // Extract causes from actual opportunities
  const causesFromOpportunities = extractCausesFromOpportunities(
    allOpportunitiesForLocations.opportunities
  );

  // Merge Contentstack causes with extracted causes
  // Prioritize Contentstack causes (they have proper names/icons)
  // Add any missing causes from opportunities
  const allCauses = [
    ...causesResult,
    ...causesFromOpportunities.filter(
      c => !causesResult.some(cs => cs.slug === c.slug)
    )
  ];

  // Check if any filters are active
  const hasActiveFilters = !!(
    params.location ||
    params.virtual === 'true' ||
    params.types ||
    params.causes ||
    params.startDate ||
    params.endDate
  );

  return (
    <OpportunitiesPageClient
      initialOpportunities={opportunitiesResult.opportunities}
      initialTotal={opportunitiesResult.total}
      initialPage={page}
      pageSize={PAGE_SIZE}
      initialHasMore={opportunitiesResult.hasMore}
      initialStatusFilter={statusFilter}
      causes={allCauses}
      locations={locations}
      initialLocation={params.location || null}
      initialIsVirtual={params.virtual === 'true'}
      initialCauses={params.causes ? params.causes.split(',') : []}
      hasActiveFilters={hasActiveFilters}
      content={pageContent}
    />
  );
}

export default async function OpportunitiesPage(props: PageProps) {
  return (
    <Suspense fallback={<OpportunityListSkeleton count={6} />}>
      <OpportunitiesContent {...props} />
    </Suspense>
  );
}
