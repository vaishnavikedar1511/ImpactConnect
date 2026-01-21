'use client';

/**
 * FilterBar Component
 * Reusable filter bar with pills and dropdowns
 */

import { useCallback } from 'react';
import styles from './FilterBar.module.css';

interface FilterOption {
  value: string;
  label: string;
}

interface PillFilter {
  type: 'pills';
  id: string;
  label?: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

interface SelectFilter {
  type: 'select';
  id: string;
  label?: string;
  placeholder?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

type FilterConfig = PillFilter | SelectFilter;

interface FilterBarProps {
  filters: FilterConfig[];
  sticky?: boolean;
  onClear?: () => void;
  activeCount?: number;
}

export function FilterBar({
  filters,
  sticky = false,
  onClear,
  activeCount = 0,
}: FilterBarProps) {
  const renderFilter = useCallback((filter: FilterConfig) => {
    if (filter.type === 'pills') {
      return (
        <div key={filter.id} className={styles.filterGroup}>
          {filter.label && (
            <span className={styles.filterLabel}>{filter.label}</span>
          )}
          <div className={styles.pills} role="group" aria-label={filter.label || filter.id}>
            {filter.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.pill} ${filter.value === option.value ? styles.pillActive : ''}`}
                onClick={() => {
                  filter.onChange(filter.value === option.value ? null : option.value);
                }}
                aria-pressed={filter.value === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (filter.type === 'select') {
      return (
        <div key={filter.id} className={styles.filterGroup}>
          {filter.label && (
            <label htmlFor={filter.id} className={styles.filterLabel}>
              {filter.label}
            </label>
          )}
          <select
            id={filter.id}
            className={styles.select}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.placeholder && (
              <option value="">{filter.placeholder}</option>
            )}
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  }, []);

  return (
    <div
      className={`${styles.filterBar} ${sticky ? styles.filterBarSticky : ''}`}
      role="search"
      aria-label="Filter options"
    >
      {filters.map(renderFilter)}

      <div className={styles.spacer} />

      {activeCount > 0 && (
        <>
          <span className={styles.activeCount} title={`${activeCount} active filters`}>
            {activeCount}
          </span>
          <div className={styles.divider} />
        </>
      )}

      {onClear && activeCount > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClear}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}

export default FilterBar;
