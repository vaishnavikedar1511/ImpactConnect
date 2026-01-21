/**
 * SearchPage Component
 * 
 * Main search page that combines SmartSearchBar and SearchResults
 * with Algolia InstantSearch provider.
 * 
 * Features:
 * - Natural language query parsing
 * - City-based filtering
 * - Virtual event filtering
 * - Real-time search results
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { InstantSearch, Configure } from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEX_NAME, SEARCH_CONFIG } from '@/lib/algolia';
import { SmartSearchBar } from './SmartSearchBar';
import { SearchResults } from './SearchResults';
import styles from './SearchPage.module.css';

interface SearchPageProps {
  /** Initial search query */
  initialQuery?: string;
  /** Show header/title */
  showHeader?: boolean;
}

export function SearchPage({
  initialQuery = '',
  showHeader = true,
}: SearchPageProps) {
  // State for detected filters from natural language query
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [isVirtual, setIsVirtual] = useState(false);

  /**
   * Handle city detection from search query.
   */
  const handleCityDetected = useCallback((city: string | null) => {
    setDetectedCity(city);
  }, []);

  /**
   * Handle virtual filter detection.
   */
  const handleVirtualDetected = useCallback((virtual: boolean) => {
    setIsVirtual(virtual);
  }, []);

  /**
   * Build Algolia filter string based on detected filters.
   * 
   * Algolia filter syntax:
   * - city:"mumbai" for exact match
   * - is_virtual:true for boolean
   */
  const filters = useMemo(() => {
    const filterParts: string[] = [];

    // Add city filter if detected
    if (detectedCity) {
      // Case-insensitive matching - Algolia handles this if configured
      filterParts.push(`city:"${detectedCity}"`);
    }

    // Add virtual filter if detected
    if (isVirtual) {
      filterParts.push('is_virtual:true');
    }

    return filterParts.join(' AND ');
  }, [detectedCity, isVirtual]);

  return (
    <div className={styles.searchPage}>
      <InstantSearch
        searchClient={searchClient}
        indexName={ALGOLIA_INDEX_NAME}
        initialUiState={{
          [ALGOLIA_INDEX_NAME]: {
            query: initialQuery,
          },
        }}
      >
        {/* Algolia Configuration */}
        <Configure
          hitsPerPage={SEARCH_CONFIG.hitsPerPage}
          filters={filters}
          attributesToRetrieve={SEARCH_CONFIG.attributesToRetrieve}
          attributesToHighlight={SEARCH_CONFIG.attributesToHighlight}
        />

        {/* Header */}
        {showHeader && (
          <header className={styles.header}>
            <h1 className={styles.title}>Find Events</h1>
            <p className={styles.subtitle}>
              Search for volunteer opportunities, workshops, and community events
            </p>
          </header>
        )}

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <SmartSearchBar
            onCityDetected={handleCityDetected}
            onVirtualDetected={handleVirtualDetected}
            placeholder='Search events... e.g., "art workshop in mumbai"'
          />
        </div>

        {/* Results */}
        <div className={styles.resultsSection}>
          <SearchResults />
        </div>
      </InstantSearch>
    </div>
  );
}
