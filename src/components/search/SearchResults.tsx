/**
 * SearchResults Component
 * 
 * Displays Algolia search results as event cards.
 * Handles loading states, empty states, and result highlighting.
 */

'use client';

import { useHits, useInstantSearch } from 'react-instantsearch';
import Link from 'next/link';
import Image from 'next/image';
import styles from './SearchResults.module.css';

// Type for Algolia hit/result
interface EventHit {
  objectID: string;
  title: string;
  description?: string;
  cause?: string;
  city?: string;
  event_date?: string;
  tags?: string[];
  slug?: string;
  cover_image?: {
    url?: string;
    title?: string;
  };
  is_virtual?: boolean;
  contribution_types?: string[];
  _highlightResult?: {
    title?: { value: string };
    description?: { value: string };
  };
}

interface SearchResultsProps {
  /** Callback when a result is clicked */
  onResultClick?: (hit: EventHit) => void;
}

export function SearchResults({ onResultClick }: SearchResultsProps) {
  // Get hits from Algolia
  const { hits } = useHits<EventHit>();
  
  // Get search state for loading/error handling
  const { status, error } = useInstantSearch();

  const isLoading = status === 'loading' || status === 'stalled';
  const hasResults = hits.length > 0;

  /**
   * Format date for display.
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date TBA';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Date TBA';
    }
  };

  /**
   * Get display location.
   */
  const getLocation = (hit: EventHit): string => {
    if (hit.is_virtual) return 'Virtual / Online';
    return hit.city || 'Location TBA';
  };

  /**
   * Render highlighted text safely.
   */
  const renderHighlight = (highlighted?: string, fallback?: string): string => {
    if (!highlighted) return fallback || '';
    // Algolia returns HTML with <mark> tags for highlighting
    // We'll strip them for now and just return plain text
    return highlighted.replace(/<\/?mark>/g, '');
  };

  // Error state
  if (error) {
    return (
      <div className={styles.errorState}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.errorIcon}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <h3>Something went wrong</h3>
        <p>Unable to load search results. Please try again.</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonMeta} />
                <div className={styles.skeletonMeta} style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasResults) {
    return (
      <div className={styles.emptyState}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.emptyIcon}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M8 8h6" />
        </svg>
        <h3>No events found</h3>
        <p>
          Try adjusting your search or browse all available opportunities.
        </p>
        <Link href="/opportunities" className={styles.browseLink}>
          Browse all events
        </Link>
      </div>
    );
  }

  // Results grid
  return (
    <div className={styles.resultsContainer}>
      <p className={styles.resultsCount}>
        Found {hits.length} event{hits.length !== 1 ? 's' : ''}
      </p>
      
      <div className={styles.resultsGrid}>
        {hits.map((hit) => (
          <article
            key={hit.objectID}
            className={styles.resultCard}
            onClick={() => onResultClick?.(hit)}
          >
            {/* Event Image */}
            <div className={styles.cardImage}>
              {hit.cover_image?.url ? (
                <Image
                  src={hit.cover_image.url}
                  alt={hit.cover_image.title || hit.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              )}
              
              {/* Virtual Badge */}
              {hit.is_virtual && (
                <span className={styles.virtualBadge}>Virtual</span>
              )}
            </div>

            {/* Card Content */}
            <div className={styles.cardContent}>
              {/* Cause Tag */}
              {hit.cause && (
                <span className={styles.causeTag}>{hit.cause}</span>
              )}

              {/* Title */}
              <h3 className={styles.cardTitle}>
                {renderHighlight(
                  hit._highlightResult?.title?.value,
                  hit.title
                )}
              </h3>

              {/* Meta Info */}
              <div className={styles.cardMeta}>
                {/* Location */}
                <span className={styles.metaItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {getLocation(hit)}
                </span>

                {/* Date */}
                <span className={styles.metaItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  {formatDate(hit.event_date)}
                </span>
              </div>

              {/* Tags */}
              {hit.tags && hit.tags.length > 0 && (
                <div className={styles.tags}>
                  {hit.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {hit.tags.length > 3 && (
                    <span className={styles.moreTag}>
                      +{hit.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              <Link
                href={`/opportunities/${hit.slug || hit.objectID}`}
                className={styles.viewButton}
                onClick={(e) => e.stopPropagation()}
              >
                View Event
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
