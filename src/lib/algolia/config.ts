/**
 * Algolia Configuration
 * 
 * Centralized configuration for Algolia search client.
 * Uses environment variables for API keys.
 */

import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia credentials from environment variables
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '';

// Index name for events/opportunities
export const ALGOLIA_INDEX_NAME = 'impactconnect_events';

// Validate configuration
if (typeof window !== 'undefined' && (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY)) {
  console.warn(
    'Algolia credentials not configured. Set NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY environment variables.'
  );
}

// Create and export the Algolia search client
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

// Search configuration defaults
export const SEARCH_CONFIG = {
  // Number of results per page
  hitsPerPage: 12,
  
  // Attributes to search in (order matters for ranking)
  searchableAttributes: [
    'title',
    'description',
    'tags',
    'cause',
    'city',
  ],
  
  // Attributes to retrieve in results
  attributesToRetrieve: [
    'objectID',
    'title',
    'description',
    'cause',
    'city',
    'event_date',
    'tags',
    'slug',
    'cover_image',
    'is_virtual',
    'contribution_types',
  ],
  
  // Attributes for highlighting
  attributesToHighlight: [
    'title',
    'description',
  ],
  
  // Facets for filtering
  facets: [
    'city',
    'cause',
    'tags',
    'is_virtual',
    'contribution_types',
  ],
};
