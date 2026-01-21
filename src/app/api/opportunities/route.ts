/**
 * Opportunities API Route
 * Handles client-side fetching with filters and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities } from '@/lib/contentstack';
import type { OpportunityFilters, OpportunitySortOption, ContributionType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const location = searchParams.get('location');
    const isVirtual = searchParams.get('virtual') === 'true';
    const types = searchParams.get('types');
    const causes = searchParams.get('causes');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const sort = (searchParams.get('sort') as OpportunitySortOption) || 'date_asc';

    // Build filters
    const filters: OpportunityFilters = {
      // Default to only showing active opportunities
      status: status 
        ? status.split(',') as OpportunityFilters['status']
        : ['upcoming', 'ongoing'],
    };

    if (location) {
      filters.location = location;
    }

    if (isVirtual) {
      filters.isVirtual = true;
    }

    if (types) {
      filters.contributionTypes = types.split(',') as ContributionType[];
    }

    if (causes) {
      filters.causes = causes.split(',');
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    if (search) {
      filters.search = search;
    }

    // Fetch opportunities
    const result = await getOpportunities(filters, {
      page,
      pageSize: Math.min(pageSize, 50), // Cap at 50 for performance
      sort,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching opportunities:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch opportunities',
        opportunities: [],
        total: 0,
        page: 1,
        pageSize: 12,
        hasMore: false,
        filters: {},
      },
      { status: 500 }
    );
  }
}
