'use client';

/**
 * OpportunitiesPageClient Component
 * Client-side wrapper for the opportunities page with filter state management
 * Shows all opportunities by default, filters are optional
 * Includes smart search bar for filtering by text
 */

import { useState, useCallback, useEffect, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type {
  OpportunitySummary,
  CauseReference,
  LocationReference,
  ContributionType,
} from '@/types';
import type { TimeFilter } from '@/lib/utils';
import type { DiscoverPageContent } from '@/lib/contentstack';
import { getDateRangeForFilter } from '@/lib/utils';
import { getUserAttributesFromRegistrations } from '@/lib/contentstack/personalize';
import { OpportunityFilters as Filters } from './OpportunityFilters';
import { OpportunityList } from './OpportunityList';
import { LocationFilter } from './LocationFilter';
import styles from './OpportunitiesPage.module.css';

interface FilterState {
  contributionTypes: ContributionType[];
  causes: string[];
  timeFilter: TimeFilter | null;
}

interface OpportunitiesPageClientProps {
  initialOpportunities: OpportunitySummary[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  initialHasMore: boolean;
  initialStatusFilter?: 'active' | 'completed';
  causes: CauseReference[];
  locations: LocationReference[];
  initialLocation: string | null;
  initialIsVirtual: boolean;
  hasActiveFilters: boolean;
  content: DiscoverPageContent;
}

export function OpportunitiesPageClient({
  initialOpportunities,
  initialTotal,
  initialPage,
  pageSize,
  initialHasMore,
  initialStatusFilter = 'active',
  causes,
  locations,
  initialLocation,
  initialIsVirtual,
  hasActiveFilters,
  content,
}: OpportunitiesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  // State
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation);
  const [isVirtual, setIsVirtual] = useState(initialIsVirtual);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed'>(initialStatusFilter);
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    contributionTypes: [],
    causes: [],
    timeFilter: null,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter opportunities based on search query (client-side)
  const filteredOpportunities = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return opportunities;
    }

    const query = debouncedSearch.toLowerCase().trim();
    const searchTerms = query.split(/\s+/).filter(Boolean);

    return opportunities.filter((opp) => {
      // Build searchable text from opportunity fields
      const searchableText = [
        opp.title,
        opp.summary,
        opp.city,
        opp.state,
        opp.country,
        opp.organizerName,
        ...(opp.causeSlugs || []),
        ...(opp.contributionTypes || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Check if all search terms are found
      return searchTerms.every((term) => searchableText.includes(term));
    });
  }, [opportunities, debouncedSearch]);

  // Get filtered total
  const filteredTotal = debouncedSearch.trim() ? filteredOpportunities.length : total;

  // Check if any filters are active
  const hasAnyFilters = !!(
    selectedLocation ||
    isVirtual ||
    filters.contributionTypes.length > 0 ||
    filters.causes.length > 0 ||
    filters.timeFilter ||
    debouncedSearch.trim()
  );

  // Update URL when filters change
  const updateUrl = useCallback(
    (newLocation: string | null, newIsVirtual: boolean, newFilters: FilterState, newPage: number, newStatusFilter: 'active' | 'completed') => {
      const params = new URLSearchParams();

      if (newLocation) params.set('location', newLocation);
      if (newIsVirtual) params.set('virtual', 'true');
      if (newFilters.contributionTypes.length > 0) {
        params.set('types', newFilters.contributionTypes.join(','));
      }
      if (newFilters.causes.length > 0) {
        params.set('causes', newFilters.causes.join(','));
      }
      if (newFilters.timeFilter) {
        params.set('time', newFilters.timeFilter);
      }
      if (newPage > 1) params.set('page', newPage.toString());
      if (newStatusFilter !== 'active') params.set('status', newStatusFilter);

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : '/opportunities';

      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });
    },
    [router]
  );

  // Fetch opportunities when filters change
  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);

    try {
      // Build query params for API
      const params = new URLSearchParams();
      
      if (selectedLocation) params.set('location', selectedLocation);
      if (isVirtual) params.set('virtual', 'true');
      if (filters.contributionTypes.length > 0) {
        params.set('types', filters.contributionTypes.join(','));
      }
      if (filters.causes.length > 0) {
        params.set('causes', filters.causes.join(','));
      }
      if (filters.timeFilter) {
        const dateRange = getDateRangeForFilter(filters.timeFilter);
        params.set('startDate', dateRange.startDate);
        if (dateRange.endDate) params.set('endDate', dateRange.endDate);
      }
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());
      params.set('sort', 'date_asc'); // Always sort by date ascending
      // Set status based on filter
      if (statusFilter === 'active') {
        params.set('status', 'upcoming,ongoing');
      } else {
        params.set('status', 'completed');
      }

      // Add user attributes for personalization (only for active tab)
      if (statusFilter === 'active') {
        try {
          const userAttributes = getUserAttributesFromRegistrations();
          if (userAttributes && Object.keys(userAttributes).length > 0) {
            params.set('userAttributes', encodeURIComponent(JSON.stringify(userAttributes)));
          }
        } catch (error) {
          // Ignore errors getting user attributes
          console.warn('Failed to get user attributes for personalization:', error);
        }
      }

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await response.json();

      setOpportunities(data.opportunities);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, isVirtual, filters, page, pageSize, statusFilter, hasAnyFilters]);

  // Fetch when dependencies change (but not on initial mount)
  useEffect(() => {
    // Skip initial fetch as we have server-rendered data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Only skip if all conditions match initial state
      if (
        selectedLocation === initialLocation &&
        isVirtual === initialIsVirtual &&
        page === initialPage &&
        statusFilter === initialStatusFilter &&
        filters.contributionTypes.length === 0 &&
        filters.causes.length === 0 &&
        filters.timeFilter === null
      ) {
        return;
      }
    }

    fetchOpportunities();
  }, [fetchOpportunities, selectedLocation, isVirtual, initialLocation, initialIsVirtual, initialPage, initialStatusFilter, page, filters, statusFilter]);

  // Handle location selection
  const handleLocationSelect = useCallback(
    (locationSlug: string | null, virtual: boolean = false) => {
      setSelectedLocation(locationSlug);
      setIsVirtual(virtual);
      setPage(1);
      updateUrl(locationSlug, virtual, filters, 1, statusFilter);
    },
    [filters, statusFilter, updateUrl]
  );

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setPage(1);
      updateUrl(selectedLocation, isVirtual, newFilters, 1, statusFilter);
    },
    [selectedLocation, isVirtual, statusFilter, updateUrl]
  );

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (newStatusFilter: 'active' | 'completed') => {
      setStatusFilter(newStatusFilter);
      setPage(1);
      updateUrl(selectedLocation, isVirtual, filters, 1, newStatusFilter);
    },
    [selectedLocation, isVirtual, filters, updateUrl]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateUrl(selectedLocation, isVirtual, filters, newPage, statusFilter);
      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [selectedLocation, isVirtual, filters, statusFilter, updateUrl]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      contributionTypes: [],
      causes: [],
      timeFilter: null,
    };
    setFilters(clearedFilters);
    setSelectedLocation(null);
    setIsVirtual(false);
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
    updateUrl(null, false, clearedFilters, 1, statusFilter);
  }, [statusFilter, updateUrl]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    searchInputRef.current?.focus();
  }, []);

  // Get the title based on active filters
  const getPageTitle = () => {
    if (isVirtual) return 'Virtual Opportunities';
    if (selectedLocation) {
      const locationName = locations.find(l => l.slug === selectedLocation)?.name || selectedLocation;
      return `Opportunities in ${locationName}`;
    }
    return 'Discover Opportunities';
  };

  // Get selected location name
  const getSelectedLocationName = () => {
    if (isVirtual) return 'Virtual / Remote';
    if (selectedLocation) {
      const location = locations.find(l => l.slug === selectedLocation);
      return location?.name || selectedLocation;
    }
    return null;
  };

  // Get subtitle/helper text
  const getSubtitle = () => {
    if (!hasAnyFilters) {
      return content.subtitle_all || 'Showing all opportunities. Apply filters to narrow results.';
    }
    const activeFilterCount = [
      selectedLocation ? 1 : 0,
      isVirtual ? 1 : 0,
      filters.contributionTypes.length > 0 ? 1 : 0,
      filters.causes.length > 0 ? 1 : 0,
      filters.timeFilter ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
    
    return `${total} opportunity${total !== 1 ? 'ies' : ''} found with ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied.`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Page Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{getPageTitle()}</h1>
            <p className={styles.subtitle}>{getSubtitle()}</p>
          </div>

          {/* Clear Filters button (only show when filters are active) */}
          {hasAnyFilters && (
            <button
              type="button"
              className={styles.clearFiltersButton}
              onClick={handleClearFilters}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              {content.clear_filters_text || 'Clear All Filters'}
            </button>
          )}
        </header>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder={content.search_placeholder || 'Search opportunities...'}
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search opportunities"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={handleSearchClear}
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
          {debouncedSearch && (
            <p className={styles.searchResults}>
              Found {filteredTotal} result{filteredTotal !== 1 ? 's' : ''} for "{debouncedSearch}"
            </p>
          )}
        </div>

        <div className={styles.content}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            {/* Location Filter - Prominent Section */}
            <div className={styles.locationSection}>
              <LocationFilter
                locations={locations}
                selectedLocation={selectedLocation}
                isVirtual={isVirtual}
                onLocationChange={handleLocationSelect}
              />
            </div>

            {/* Other Filters */}
            <div className={styles.otherFilters}>
              <h2 className={styles.sidebarTitle}>{content.filters_title || 'Filters'}</h2>
              <Filters
                causes={causes}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                layout="vertical"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            <OpportunityList
              opportunities={filteredOpportunities}
              total={filteredTotal}
              page={page}
              pageSize={pageSize}
              hasMore={hasMore && !debouncedSearch.trim()}
              isLoading={isLoading || isPending}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
              showAllMessage={!hasAnyFilters}
              selectedLocationName={getSelectedLocationName()}
              content={content}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default OpportunitiesPageClient;
