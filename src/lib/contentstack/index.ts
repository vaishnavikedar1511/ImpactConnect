/**
 * Contentstack Integration
 * Central export for all CMS data fetching utilities
 */

// Configuration
export { ContentTypes, getContentstackConfig, getApiBaseUrl } from './config';
export type { ContentstackConfig, ContentstackRegion, ContentTypeUid } from './config';

// Client
export { ContentstackError, getEntries, getEntryByUid, getEntryByField, getEntryCount } from './client';
export type { QueryParams, ContentstackResponse } from './client';

// Opportunities
export {
  getOpportunities,
  getOpportunityById,
  getOpportunityBySlug,
  getFeaturedOpportunities,
  getUpcomingOpportunities,
  getOpportunitiesByOrganizer,
  getOpportunitiesByCause,
  getOpportunitiesByCity,
  getOpportunityCount,
  getAllOpportunitySlugs,
} from './opportunities';

// Taxonomies (Causes only - locations are extracted from opportunities)
export {
  getAllCauses,
  getCauseBySlug,
  getCauseReferences,
} from './taxonomies';

// Query Builders (for advanced usage)
export {
  buildOpportunityQuery,
  buildFeaturedQuery,
  buildUpcomingQuery,
  buildOrganizerOpportunitiesQuery,
  buildCauseOpportunitiesQuery,
  buildLocationQuery,
  getOpportunityIncludes,
  getOpportunitySummaryFields,
} from './queries';

// Transformers (for custom integrations)
export {
  transformOpportunity,
  transformOpportunitySummary,
  transformAsset,
  transformCauseReference,
} from './transformers';

// Error Handling
export {
  classifyError,
  safeFetch,
  withRetry,
  isOpportunityExpired,
  isOpportunityValid,
} from './error-handler';
export type { CMSError, CMSErrorType } from './error-handler';

// Utility functions
export {
  generateSlug,
  ManagementApiError,
} from './management';

// Page Content (Singleton pages from Contentstack)
export {
  getLandingPageContent,
  getMyEventsPageContent,
  getMyRegistrationsPageContent,
  getDiscoverPageContent,
  getCreateEventPageContent,
  getNavbarContent,
  getFooterContent,
  getAnnouncementBannerContent,
  getGlobalSettingsContent,
  getErrorPagesContent,
  getFAQPageContent,
  DEFAULT_LANDING_PAGE,
  DEFAULT_MY_EVENTS_PAGE,
  DEFAULT_MY_REGISTRATIONS_PAGE,
  DEFAULT_DISCOVER_PAGE,
  DEFAULT_CREATE_EVENT_PAGE,
  DEFAULT_NAVBAR,
  DEFAULT_FOOTER,
  DEFAULT_ANNOUNCEMENT_BANNER,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_ERROR_PAGES,
  DEFAULT_FAQ_PAGE,
  // Parse functions for JSON fields
  parseNavLinks,
  parseFooterLinks,
  parseSocialLinks,
  parseImpactStats,
  parseValues,
  parseTeamMembers,
  parseFAQs,
  parseFieldLabels,
  parseFieldPlaceholders,
  parseValidationMessages,
  parseLandingStats,
  parseLandingSteps,
  parseLandingCauses,
  parseSortOptions,
} from './pages';
export type {
  LandingPageContent,
  MyEventsPageContent,
  MyRegistrationsPageContent,
  DiscoverPageContent,
  CreateEventPageContent,
  NavbarContent,
  FooterContent,
  AnnouncementBannerContent,
  GlobalSettingsContent,
  ErrorPagesContent,
  FAQPageContent,
  NavLink,
  FooterLinkColumn,
  SocialLink,
  ImpactStat,
  ValueItem,
  TeamMember,
  FAQCategory,
} from './pages';

// Personalize
export {
  getPersonalizedContent,
  getUserAttributesFromClient,
  storeUserAttributes,
  getPersonalizedOpportunities,
} from './personalize';
export type { UserAttributes, PersonalizeOptions } from './personalize';
