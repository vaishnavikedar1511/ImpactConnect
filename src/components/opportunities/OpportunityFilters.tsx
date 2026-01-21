'use client';

/**
 * OpportunityFilters Component
 * Filter controls for opportunity listings
 */

import { useCallback } from 'react';
import type { CauseReference } from '@/types';
import { ContributionType, ContributionTypeLabels } from '@/types';
import type { TimeFilter } from '@/lib/utils';
import styles from './OpportunityFilters.module.css';

interface FilterState {
  contributionTypes: ContributionType[];
  causes: string[];
  timeFilter: TimeFilter | null;
}

interface OpportunityFiltersProps {
  causes: CauseReference[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  layout?: 'horizontal' | 'vertical';
}

const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this_weekend', label: 'This Weekend' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
];

export function OpportunityFilters({
  causes,
  filters,
  onFiltersChange,
  layout = 'vertical',
}: OpportunityFiltersProps) {
  const handleContributionTypeToggle = useCallback(
    (type: ContributionType) => {
      const current = filters.contributionTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];

      onFiltersChange({
        ...filters,
        contributionTypes: updated,
      });
    },
    [filters, onFiltersChange]
  );

  const handleCauseChange = useCallback(
    (causeSlug: string) => {
      if (!causeSlug) {
        onFiltersChange({
          ...filters,
          causes: [],
        });
        return;
      }

      const current = filters.causes;
      const updated = current.includes(causeSlug)
        ? current.filter((c) => c !== causeSlug)
        : [...current, causeSlug];

      onFiltersChange({
        ...filters,
        causes: updated,
      });
    },
    [filters, onFiltersChange]
  );

  const handleTimeFilterChange = useCallback(
    (timeFilter: TimeFilter | null) => {
      onFiltersChange({
        ...filters,
        timeFilter: filters.timeFilter === timeFilter ? null : timeFilter,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      contributionTypes: [],
      causes: [],
      timeFilter: null,
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.contributionTypes.length > 0 ||
    filters.causes.length > 0 ||
    filters.timeFilter !== null;

  return (
    <div
      className={`${styles.filters} ${layout === 'horizontal' ? styles.filtersHorizontal : ''}`}
      role="search"
      aria-label="Filter opportunities"
    >
      {/* Contribution Type Filter */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel} id="contribution-type-label">
          Contribution Type
        </span>
        <div
          className={styles.chipGroup}
          role="group"
          aria-labelledby="contribution-type-label"
        >
          {Object.values(ContributionType).map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.chip} ${
                filters.contributionTypes.includes(type) ? styles.chipActive : ''
              }`}
              onClick={() => handleContributionTypeToggle(type)}
              aria-pressed={filters.contributionTypes.includes(type)}
            >
              {ContributionTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Cause Filter */}
      <div className={styles.filterGroup}>
        <label htmlFor="cause-select" className={styles.filterLabel}>
          Cause
        </label>
        <select
          id="cause-select"
          className={styles.select}
          value={filters.causes[0] || ''}
          onChange={(e) => handleCauseChange(e.target.value)}
        >
          <option value="">All Causes</option>
          {causes.map((cause) => (
            <option key={cause.uid} value={cause.slug}>
              {cause.name}
            </option>
          ))}
        </select>
      </div>

      {/* Time Filter */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel} id="time-filter-label">
          When
        </span>
        <div
          className={styles.timePills}
          role="group"
          aria-labelledby="time-filter-label"
        >
          {TIME_FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.timePill} ${
                filters.timeFilter === value ? styles.timePillActive : ''
              }`}
              onClick={() => handleTimeFilterChange(value)}
              aria-pressed={filters.timeFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearFilters}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      )}

      {/* Active Filters Summary (for screen readers) */}
      <div className="sr-only" aria-live="polite">
        {hasActiveFilters && (
          <span>
            Active filters:
            {filters.contributionTypes.length > 0 &&
              ` ${filters.contributionTypes.length} contribution types,`}
            {filters.causes.length > 0 && ` ${filters.causes.length} causes,`}
            {filters.timeFilter && ` time: ${filters.timeFilter}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default OpportunityFilters;
