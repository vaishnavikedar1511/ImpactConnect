'use client';

/**
 * OpportunityList Component
 * Grid container for opportunity cards with loading and empty states
 */

import type { OpportunitySummary } from '@/types';
import type { DiscoverPageContent } from '@/lib/contentstack';
import { OpportunityCard } from './OpportunityCard';
import styles from './OpportunityList.module.css';

type StatusFilter = 'active' | 'completed';

interface OpportunityListProps {
  opportunities: OpportunitySummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  isLoading?: boolean;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  onPageChange: (page: number) => void;
  onClearFilters?: () => void;
  showAllMessage?: boolean;
  selectedLocationName?: string | null;
  content?: DiscoverPageContent;
}

export function OpportunityList({
  opportunities,
  total,
  page,
  pageSize,
  hasMore,
  isLoading = false,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onClearFilters,
  showAllMessage = false,
  selectedLocationName = null,
  content,
}: OpportunityListProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading} role="status" aria-label="Loading opportunities">
          <div className={styles.spinner} aria-hidden="true" />
          <span className={styles.loadingText}>{content?.loading_text || 'Finding opportunities...'}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (opportunities.length === 0) {
    const emptyMessage = selectedLocationName
      ? `No events found for "${selectedLocationName}". Try selecting a different location or check back later.`
      : (content?.empty_message || "We couldn't find any opportunities matching your criteria. Try adjusting your filters or check back later.");

    return (
      <div className={styles.container}>
        <div className={styles.empty} role="status">
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <h3 className={styles.emptyTitle}>
            {selectedLocationName 
              ? `No events in ${selectedLocationName}`
              : (content?.empty_title || 'No opportunities found')
            }
          </h3>
          <p className={styles.emptyText}>{emptyMessage}</p>
          {onClearFilters && (
            <button
              type="button"
              className={styles.emptyButton}
              onClick={onClearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Info banner when showing all opportunities */}
      {showAllMessage && (
        <div className={styles.infoBanner} role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p>{content?.info_banner_text || 'Showing all opportunities. Use the filters to narrow your search.'}</p>
        </div>
      )}

      {/* Header with count and status filter */}
      <div className={styles.header}>
        <p className={styles.resultCount}>
          Showing <strong>{startItem}-{endItem}</strong> of <strong>{total}</strong> opportunities
        </p>

        <div className={styles.statusFilter}>
          <button
            type="button"
            className={`${styles.statusButton} ${statusFilter === 'active' ? styles.statusButtonActive : ''}`}
            onClick={() => onStatusFilterChange('active')}
            aria-pressed={statusFilter === 'active'}
          >
            Active
          </button>
          <button
            type="button"
            className={`${styles.statusButton} ${statusFilter === 'completed' ? styles.statusButtonActive : ''}`}
            onClick={() => onStatusFilterChange('completed')}
            aria-pressed={statusFilter === 'completed'}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Opportunity Grid */}
      <div className={styles.grid} role="list" aria-label="Opportunities">
        {opportunities.map((opportunity, index) => (
          <div key={opportunity.uid} role="listitem">
            <OpportunityCard
              opportunity={opportunity}
              priority={index < 6}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageButton} ${page === pageNum ? styles.pageButtonActive : ''}`}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
            aria-label="Next page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </nav>
      )}

      {/* Load More Alternative (for infinite scroll UX) */}
      {hasMore && totalPages <= 1 && (
        <div className={styles.loadMore}>
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => onPageChange(page + 1)}
          >
            Load more opportunities
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for opportunity list
 */
export function OpportunityListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
        ))}
      </div>
    </div>
  );
}

export default OpportunityList;
