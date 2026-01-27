/**
 * Event/Opportunity Carousel Data Fetching
 * 
 * Fetches opportunities for the landing page carousel
 * Supports cause-based filtering for personalization
 */

import { getEntries } from './client';
import { ContentTypes } from './config';
import { transformOpportunitySummary } from './transformers';
import { OpportunityStatus } from '@/types';
import type { OpportunitySummary } from '@/types';

const MAX_CAROUSEL_ITEMS = 4;

/**
 * Fetch recent opportunities for carousel
 * 
 * @param causeSlug - Optional cause slug to filter opportunities (e.g., 'education', 'environment')
 * @returns Array of up to 4 opportunity summaries
 * 
 * Usage:
 * - getCarouselOpportunities() → Shows latest 4 opportunities from all causes
 * - getCarouselOpportunities('education') → Shows latest 4 education opportunities
 */
export async function getCarouselOpportunities(
  causeSlug?: string
): Promise<OpportunitySummary[]> {
  try {
    console.log('[Carousel] Fetching opportunities', causeSlug ? `for cause: ${causeSlug}` : '(all causes)');

    // Build query - only upcoming/ongoing opportunities
    const query: Record<string, unknown> = {
      status: {
        $in: [OpportunityStatus.UPCOMING, OpportunityStatus.ONGOING],
      },
    };

    // Fetch opportunities (fetch more than needed for filtering)
    const result = await getEntries<Record<string, unknown>>(
      ContentTypes.OPPORTUNITY,
      {
        query,
        limit: 50, // Fetch extra to allow for cause filtering
        orderBy: 'start_date',
        orderDirection: 'desc',
      },
      {
        revalidate: 0, // Don't cache - may be personalized
      }
    );

    // Transform opportunities
    let opportunities = result.entries
      .map((entry) => {
        try {
          return transformOpportunitySummary(
            entry as Parameters<typeof transformOpportunitySummary>[0]
          );
        } catch (error) {
          console.warn(`[Carousel] Failed to transform opportunity ${entry.uid}:`, error);
          return null;
        }
      })
      .filter((opp): opp is OpportunitySummary => opp !== null);

    // Filter by cause if provided
    if (causeSlug) {
      opportunities = opportunities.filter((opp) =>
        opp.causeSlugs?.includes(causeSlug)
      );
      console.log(
        `[Carousel] Filtered ${opportunities.length} opportunities for cause "${causeSlug}"`
      );
    } else {
      console.log(`[Carousel] Found ${opportunities.length} total opportunities`);
    }

    // Return top 4 most recent
    const carouselItems = opportunities.slice(0, MAX_CAROUSEL_ITEMS);
    console.log(`[Carousel] Returning ${carouselItems.length} carousel items`);
    
    return carouselItems;
  } catch (error) {
    console.error('[Carousel] Failed to fetch opportunities:', error);
    return [];
  }
}
