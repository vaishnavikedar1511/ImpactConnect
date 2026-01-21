/**
 * Cache Configuration
 * Centralized cache/revalidation settings for Next.js pages and API routes
 */

/**
 * Revalidation times in seconds
 */
export const RevalidationTimes = {
  /** Static pages that rarely change (home, about) */
  STATIC: 3600, // 1 hour

  /** Taxonomy pages (causes, locations) */
  TAXONOMY: 1800, // 30 minutes

  /** Listing pages (opportunities, organizers) */
  LISTINGS: 300, // 5 minutes

  /** Detail pages (opportunity, organizer profile) */
  DETAIL: 600, // 10 minutes

  /** Dynamic/frequently updated content */
  DYNAMIC: 60, // 1 minute

  /** API routes default */
  API: 60, // 1 minute
} as const;

/**
 * Page cache tags for granular revalidation
 */
export const CacheTags = {
  // Content types
  OPPORTUNITIES: 'opportunities',
  OPPORTUNITY: (slug: string) => `opportunity:${slug}`,
  ORGANIZERS: 'organizers',
  ORGANIZER: (slug: string) => `organizer:${slug}`,
  CAUSES: 'causes',
  CAUSE: (slug: string) => `cause:${slug}`,
  LOCATIONS: 'locations',

  // Pages
  HOME: 'page:home',
  LISTINGS: 'page:listings',
} as const;

/**
 * Fetch options for different data types
 */
export function getFetchOptions(type: keyof typeof RevalidationTimes): RequestInit {
  return {
    next: {
      revalidate: RevalidationTimes[type],
    },
  };
}

/**
 * Page rendering strategy documentation
 * 
 * | Page                    | Strategy | Revalidation | Reason |
 * |-------------------------|----------|--------------|--------|
 * | Home (/)                | ISR      | 1 hour       | Featured content, SEO |
 * | Opportunities listing   | ISR      | 5 min        | Filters via URL params |
 * | Opportunity detail      | ISR      | 10 min       | SEO, dynamic registration |
 * | Organizer profile       | ISR      | 30 min       | Less frequent updates |
 * | Cause listing           | ISR      | 30 min       | Taxonomy, SEO |
 * | Location listing        | ISR      | 5 min        | Primary filter |
 * 
 * ISR (Incremental Static Regeneration) chosen because:
 * - Best SEO performance (pre-rendered HTML)
 * - Fast initial page loads
 * - CMS updates reflected via on-demand revalidation
 * - Fallback to stale content during regeneration
 */
