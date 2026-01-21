/**
 * SmartSearchBar Component
 * 
 * A natural language search bar that understands queries like:
 * - "art workshop in mumbai"
 * - "tree plantation near pune"
 * - "online teaching volunteer"
 * 
 * Features:
 * - Automatic city detection and filtering
 * - Debounced input for performance
 * - Keyboard accessible
 * - Visual feedback for detected filters
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchBox } from 'react-instantsearch';
import { extractCityFromQuery, type ParsedQuery } from '@/lib/utils/search';
import styles from './SmartSearchBar.module.css';

interface SmartSearchBarProps {
  /** Callback when city filter is detected/changed */
  onCityDetected?: (city: string | null) => void;
  /** Callback when virtual filter is detected */
  onVirtualDetected?: (isVirtual: boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export function SmartSearchBar({
  onCityDetected,
  onVirtualDetected,
  placeholder = 'Search events... e.g., "art workshop in mumbai"',
  debounceMs = 300,
}: SmartSearchBarProps) {
  // Algolia search box hook
  const { query, refine } = useSearchBox();
  
  // Local state for the input value (before debounce)
  const [inputValue, setInputValue] = useState(query);
  
  // Parsed query state for UI feedback
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  
  // Ref for debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Input ref for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle input change with debouncing.
   * Parses the query for city detection and updates Algolia search.
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      
      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Debounce the search and parsing
      debounceTimer.current = setTimeout(() => {
        // Parse the query to extract city
        const parsed = extractCityFromQuery(value);
        setParsedQuery(parsed);
        
        // Notify parent of detected city
        if (onCityDetected) {
          onCityDetected(parsed.city);
        }
        
        // Notify parent of virtual detection
        if (onVirtualDetected) {
          onVirtualDetected(parsed.isVirtual);
        }
        
        // Send the cleaned search text to Algolia
        // The city filter will be applied separately via refinement
        refine(parsed.searchText);
      }, debounceMs);
    },
    [refine, onCityDetected, onVirtualDetected, debounceMs]
  );

  /**
   * Handle keyboard events for accessibility.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape clears the search
      if (event.key === 'Escape') {
        setInputValue('');
        setParsedQuery(null);
        refine('');
        if (onCityDetected) onCityDetected(null);
        if (onVirtualDetected) onVirtualDetected(false);
        inputRef.current?.blur();
      }
    },
    [refine, onCityDetected, onVirtualDetected]
  );

  /**
   * Clear the search input.
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    setParsedQuery(null);
    refine('');
    if (onCityDetected) onCityDetected(null);
    if (onVirtualDetected) onVirtualDetected(false);
    inputRef.current?.focus();
  }, [refine, onCityDetected, onVirtualDetected]);

  /**
   * Remove detected city filter.
   */
  const handleRemoveCity = useCallback(() => {
    if (!parsedQuery) return;
    
    // Remove city from input and re-search
    const newValue = parsedQuery.searchText;
    setInputValue(newValue);
    setParsedQuery({ ...parsedQuery, city: null, originalCityText: null });
    refine(newValue);
    if (onCityDetected) onCityDetected(null);
    inputRef.current?.focus();
  }, [parsedQuery, refine, onCityDetected]);

  /**
   * Remove virtual filter.
   */
  const handleRemoveVirtual = useCallback(() => {
    if (!parsedQuery) return;
    
    setParsedQuery({ ...parsedQuery, isVirtual: false });
    if (onVirtualDetected) onVirtualDetected(false);
    inputRef.current?.focus();
  }, [parsedQuery, onVirtualDetected]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Sync input value with Algolia query on mount
  useEffect(() => {
    if (query && !inputValue) {
      setInputValue(query);
    }
  }, [query, inputValue]);

  const hasFilters = parsedQuery?.city || parsedQuery?.isVirtual;

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        {/* Search Icon */}
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

        {/* Search Input */}
        <input
          ref={inputRef}
          type="search"
          className={styles.searchInput}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search events"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
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

      {/* Detected Filters Display */}
      {hasFilters && (
        <div className={styles.detectedFilters}>
          <span className={styles.filtersLabel}>Filtering by:</span>
          
          {parsedQuery?.city && (
            <span className={styles.filterTag}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.tagIcon}
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {parsedQuery.city}
              <button
                type="button"
                className={styles.removeFilter}
                onClick={handleRemoveCity}
                aria-label={`Remove ${parsedQuery.city} filter`}
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
            </span>
          )}
          
          {parsedQuery?.isVirtual && (
            <span className={styles.filterTag}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.tagIcon}
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              Virtual / Online
              <button
                type="button"
                className={styles.removeFilter}
                onClick={handleRemoveVirtual}
                aria-label="Remove virtual filter"
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
            </span>
          )}
        </div>
      )}

      {/* Search Hints */}
      {!inputValue && (
        <div className={styles.searchHints}>
          <span className={styles.hintLabel}>Try:</span>
          <button
            type="button"
            className={styles.hintExample}
            onClick={() => {
              setInputValue('art workshop in mumbai');
              handleChange({ target: { value: 'art workshop in mumbai' } } as React.ChangeEvent<HTMLInputElement>);
            }}
          >
            art workshop in mumbai
          </button>
          <button
            type="button"
            className={styles.hintExample}
            onClick={() => {
              setInputValue('online teaching');
              handleChange({ target: { value: 'online teaching' } } as React.ChangeEvent<HTMLInputElement>);
            }}
          >
            online teaching
          </button>
          <button
            type="button"
            className={styles.hintExample}
            onClick={() => {
              setInputValue('tree plantation');
              handleChange({ target: { value: 'tree plantation' } } as React.ChangeEvent<HTMLInputElement>);
            }}
          >
            tree plantation
          </button>
        </div>
      )}
    </div>
  );
}
