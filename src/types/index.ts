/**
 * ImpactConnect - Type Definitions
 * Central export for all TypeScript types
 */

// Enums & Constants
export {
  ContributionType,
  ContributionTypeLabels,
  OrganizerType,
  OrganizerTypeLabels,
  OpportunityStatus,
} from './enums';

// Common Types
export type {
  ImageAsset,
  LocationReference,
} from './common';

// Taxonomy Types (Cause only)
export type {
  Cause,
  CauseReference,
  CauseSlug,
} from './taxonomy';
export { CauseSlugs } from './taxonomy';

// Opportunity Types
export type {
  Opportunity,
  OpportunitySummary,
  OpportunityFilters,
  OpportunitySortOption,
  OpportunityListResponse,
} from './opportunity';
