/**
 * ImpactConnect - Opportunity Types
 * Central entity that users browse and interact with
 */

import type { ContributionType, OpportunityStatus } from './enums';
import type { ImageAsset } from './common';

/**
 * Opportunity - the central browsable entity
 * Represents impact opportunities like cleanup drives, blood donation camps, etc.
 */
export interface Opportunity {
  uid: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  coverImage?: ImageAsset;
  
  // Location
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  isVirtual?: boolean;

  // Categories
  causeSlugs?: string[];
  contributionTypes?: ContributionType[];

  // Timing
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;

  // Organizer (stored directly, no separate model)
  organizerName?: string;
  organizerEmail?: string;

  // Capacity & Requirements
  spotsAvailable?: number;
  requirements?: string;

  // Status
  status?: OpportunityStatus;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Opportunity card for list/grid views
 */
export interface OpportunitySummary {
  uid: string;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: ImageAsset;
  causeSlugs?: string[];
  contributionTypes?: ContributionType[];
  country?: string;
  state?: string;
  city?: string;
  isVirtual?: boolean;
  startDate: string;
  endDate?: string;
  startTime?: string;
  organizerName?: string;
  spotsAvailable?: number;
  status?: OpportunityStatus;
}

/**
 * Filter parameters for opportunity search
 */
export interface OpportunityFilters {
  country?: string;
  state?: string;
  city?: string;
  location?: string; // City slug for filtering
  causes?: string[];
  contributionTypes?: ContributionType[];
  startDate?: string;
  endDate?: string;
  isVirtual?: boolean;
  status?: OpportunityStatus[];
  search?: string;
  organizerId?: string;
}

/**
 * Sort options for opportunity listings
 */
export type OpportunitySortOption =
  | 'date_asc'
  | 'date_desc'
  | 'relevance'
  | 'spots_available';

/**
 * Paginated opportunity response
 */
export interface OpportunityListResponse {
  opportunities: OpportunitySummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: OpportunityFilters;
}
