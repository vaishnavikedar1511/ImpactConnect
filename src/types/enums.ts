/**
 * ImpactConnect - Enums & Constants
 * Core enumerated types for categorization and filtering
 */

/**
 * Types of contributions a user can make to an opportunity
 */
export enum ContributionType {
  PHYSICAL_EFFORT = 'physical_effort',
  SKILLS = 'skills',
  RESOURCES = 'resources',
  TIME = 'time',
}

/**
 * Human-readable labels for contribution types
 */
export const ContributionTypeLabels: Record<ContributionType, string> = {
  [ContributionType.PHYSICAL_EFFORT]: 'Physical Effort',
  [ContributionType.SKILLS]: 'Skills & Expertise',
  [ContributionType.RESOURCES]: 'Resources & Donations',
  [ContributionType.TIME]: 'Time & Presence',
};

/**
 * Types of organizers that can host opportunities
 */
export enum OrganizerType {
  NGO = 'ngo',
  INDIVIDUAL = 'individual',
  COMMUNITY_GROUP = 'community_group',
}

/**
 * Human-readable labels for organizer types
 */
export const OrganizerTypeLabels: Record<OrganizerType, string> = {
  [OrganizerType.NGO]: 'NGO',
  [OrganizerType.INDIVIDUAL]: 'Individual',
  [OrganizerType.COMMUNITY_GROUP]: 'Community Group',
};

/**
 * Status of an opportunity
 */
export enum OpportunityStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
