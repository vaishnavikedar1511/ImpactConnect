/**
 * ImpactConnect - Common Types
 * Shared base types and utility interfaces
 */

/**
 * Base entity with CMS metadata
 * All content types from Contentstack will extend this
 */
export interface BaseEntity {
  uid: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rich text content from CMS
 */
export interface RichText {
  type: 'doc';
  content: unknown[];
}

/**
 * Image asset from CMS
 */
export interface ImageAsset {
  uid: string;
  url: string;
  title: string;
  filename: string;
  contentType: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Contact information for organizers
 */
export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

/**
 * Social media links
 */
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

/**
 * Date and time range for opportunities
 */
export interface DateTimeRange {
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

/**
 * Registration CTA metadata
 */
export interface RegistrationCTA {
  label: string;
  type: 'external_link' | 'email' | 'phone' | 'form';
  url?: string;
  email?: string;
  phone?: string;
  instructions?: string;
}

/**
 * Lightweight location reference (extracted from opportunities)
 * Used for filter dropdowns in Discover page
 */
export interface LocationReference {
  uid: string;
  name: string;
  slug: string;
  type?: string;
}
