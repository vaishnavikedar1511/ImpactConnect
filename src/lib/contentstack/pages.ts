/**
 * Page Content Fetching
 * Fetches singleton page content from Contentstack
 */

import { getEntries } from './client';

/**
 * Navbar Content Type
 */
export interface NavbarContent {
  site_name: string;
  logo_url?: string;
  nav_links_json?: string; // JSON array of {label, url, icon?, new_tab?}
  cta_text?: string;
  cta_url?: string;
  show_cta?: boolean;
  show_user_menu?: boolean;
  my_registrations_label?: string;
  my_events_label?: string;
}

export interface NavLink {
  label: string;
  url: string;
  icon?: string;
  new_tab?: boolean;
}

export function parseNavLinks(json?: string): NavLink[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Landing Page Content Type
 */
export interface LandingPageContent {
  hero_title: string;
  hero_subtitle: string;
  hero_background_image?: {
    url: string;
    title?: string;
  };
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  stats_json?: string;
  how_it_works_title?: string;
  steps_json?: string;
  causes_title?: string;
  causes_background_image?: {
    url: string;
    title?: string;
  };
  causes_json?: string;
  cta_title?: string;
  cta_description?: string;
  cta_button_text?: string;
  cta_button_link?: string;
}

export interface LandingStat {
  number: string;
  label: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface LandingCause {
  icon: string;
  name: string;
  description: string;
  slug: string;
}

export function parseLandingStats(json?: string): LandingStat[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseLandingSteps(json?: string): LandingStep[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseLandingCauses(json?: string): LandingCause[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * My Events Page Content Type
 */
export interface MyEventsPageContent {
  page_title: string;
  page_subtitle?: string;
  pending_title?: string;
  pending_description?: string;
  published_title?: string;
  published_description?: string;
  empty_title?: string;
  empty_message?: string;
  create_cta_text?: string;
  create_cta_link?: string;
}

/**
 * My Registrations Page Content Type
 */
export interface MyRegistrationsPageContent {
  page_title: string;
  page_subtitle?: string;
  upcoming_title?: string;
  upcoming_description?: string;
  past_title?: string;
  past_description?: string;
  empty_title?: string;
  empty_message?: string;
  browse_cta_text?: string;
  browse_cta_link?: string;
  confirmation_message?: string;
}

/**
 * Discover Page Content Type
 */
export interface DiscoverPageContent {
  page_title: string;
  page_description?: string;
  subtitle_all?: string;
  search_placeholder?: string;
  filters_title?: string;
  location_filter_label?: string;
  virtual_label?: string;
  clear_filters_text?: string;
  sort_options_json?: string;
  empty_title?: string;
  empty_message?: string;
  loading_text?: string;
  info_banner_text?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export function parseSortOptions(json?: string): SortOption[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Create Event Page Content Type
 */
export interface CreateEventPageContent {
  page_title: string;
  page_subtitle?: string;
  section_details_title?: string;
  section_location_title?: string;
  virtual_label?: string;
  section_categories_title?: string;
  section_datetime_title?: string;
  section_contact_title?: string;
  section_additional_title?: string;
  submit_button_text?: string;
  submitting_text?: string;
  success_icon?: string;
  success_title?: string;
  success_message?: string;
  success_button_text?: string;
  success_button_link?: string;
  field_labels_json?: string;
  field_placeholders_json?: string;
  validation_messages_json?: string;
}

export interface FieldLabels {
  title?: string;
  summary?: string;
  description?: string;
  cover_image?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  causes?: string;
  contribution_types?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  email?: string;
  organizer_name?: string;
  spots?: string;
  requirements?: string;
}

export interface FieldPlaceholders {
  title?: string;
  summary?: string;
  description?: string;
  address?: string;
  email?: string;
  organizer_name?: string;
  spots?: string;
  requirements?: string;
}

export interface ValidationMessages {
  title?: string;
  summary?: string;
  country?: string;
  causes?: string;
  contribution_types?: string;
  start_date?: string;
  future_date?: string;
  email_required?: string;
  email_invalid?: string;
}

export function parseFieldLabels(json?: string): FieldLabels {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function parseFieldPlaceholders(json?: string): FieldPlaceholders {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function parseValidationMessages(json?: string): ValidationMessages {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * Default content for Landing Page (fallback if Contentstack not available)
 */
export const DEFAULT_LANDING_PAGE: LandingPageContent = {
  hero_title: 'Make an {Impact} in Your Community',
  hero_subtitle: 'Discover volunteer opportunities, connect with causes you care about, and create meaningful change in your city.',
  primary_cta_text: 'Discover Opportunities',
  primary_cta_link: '/opportunities',
  secondary_cta_text: 'Create an Event',
  secondary_cta_link: '/create-event',
  stats_json: JSON.stringify([
    { number: '500+', label: 'Volunteers' },
    { number: '50+', label: 'Events' },
    { number: '20+', label: 'Cities' },
    { number: '4', label: 'Causes' },
  ]),
  how_it_works_title: 'How It Works',
  steps_json: JSON.stringify([
    { title: 'Discover', description: 'Browse opportunities by location, cause, or contribution type' },
    { title: 'Register', description: 'Sign up for events that match your interests and availability' },
    { title: 'Contribute', description: 'Show up, make an impact, and connect with your community' },
  ]),
  causes_title: 'Causes We Support',
  causes_json: JSON.stringify([
    { icon: '📚', name: 'Education', description: 'Teaching, mentoring, skill development', slug: 'education' },
    { icon: '🌱', name: 'Environment', description: 'Cleanups, tree plantation, conservation', slug: 'environment' },
    { icon: '🏥', name: 'Healthcare', description: 'Health camps, blood donation, awareness', slug: 'healthcare' },
    { icon: '🐾', name: 'Animal Welfare', description: 'Shelter support, rescue, care', slug: 'animal-welfare' },
  ]),
  cta_title: 'Ready to Make a Difference?',
  cta_description: 'Join thousands of volunteers creating positive change every day.',
  cta_button_text: 'Get Started',
  cta_button_link: '/opportunities',
};

/**
 * Default content for My Events Page
 */
export const DEFAULT_MY_EVENTS_PAGE: MyEventsPageContent = {
  page_title: 'My Events',
  page_subtitle: 'Events you have created and submitted for approval',
  pending_title: 'Pending Approval',
  pending_description: 'These events are waiting for admin approval before they go live.',
  published_title: 'Published Events',
  published_description: 'Your events that are live and visible to volunteers.',
  empty_title: 'No Events Yet',
  empty_message: 'You have not created any events yet. Create your first event to start making an impact!',
  create_cta_text: 'Create Your First Event',
  create_cta_link: '/create-event',
};

/**
 * Default content for My Registrations Page
 */
export const DEFAULT_MY_REGISTRATIONS_PAGE: MyRegistrationsPageContent = {
  page_title: 'My Registrations',
  page_subtitle: 'Events you have registered for',
  upcoming_title: 'Upcoming Events',
  upcoming_description: 'Events you are registered for that have not happened yet.',
  past_title: 'Past Events',
  past_description: 'Events you have attended. Thank you for making a difference!',
  empty_title: 'No Registrations Yet',
  empty_message: 'You have not registered for any events yet. Explore opportunities and start making an impact!',
  browse_cta_text: 'Browse Opportunities',
  browse_cta_link: '/opportunities',
  confirmation_message: 'You are registered! Check your email for details.',
};

/**
 * Default content for Discover Page
 */
export const DEFAULT_DISCOVER_PAGE: DiscoverPageContent = {
  page_title: 'Discover Opportunities',
  page_description: 'Discover volunteering, donation drives, and community service opportunities.',
  subtitle_all: 'Showing all opportunities. Apply filters to narrow results.',
  search_placeholder: 'Search opportunities... e.g., "tree plantation pune" or "online teaching"',
  filters_title: 'Filters',
  location_filter_label: 'Location',
  virtual_label: 'Virtual / Remote',
  clear_filters_text: 'Clear All Filters',
  sort_options_json: JSON.stringify([
    { value: 'date_asc', label: 'Date (Earliest)' },
    { value: 'date_desc', label: 'Date (Latest)' },
    { value: 'relevance', label: 'Relevance' },
    { value: 'spots_available', label: 'Spots Available' },
  ]),
  empty_title: 'No opportunities found',
  empty_message: 'We could not find any opportunities matching your criteria. Try adjusting your filters or check back later.',
  loading_text: 'Finding opportunities...',
  info_banner_text: 'Showing all opportunities. Use the filters to narrow your search.',
};

/**
 * Default content for Navbar
 */
export const DEFAULT_NAVBAR: NavbarContent = {
  site_name: 'ImpactConnect',
  nav_links_json: JSON.stringify([{ label: 'Discover', url: '/opportunities' }]),
  cta_text: 'Create Event',
  cta_url: '/create-event',
  show_cta: true,
  show_user_menu: true,
  my_registrations_label: 'My Registrations',
  my_events_label: 'My Events',
};

/**
 * Default content for Create Event Page
 */
export const DEFAULT_CREATE_EVENT_PAGE: CreateEventPageContent = {
  page_title: 'Create an Event',
  page_subtitle: 'Submit your event for review. Once approved, it will be visible to the community.',
  section_details_title: 'Event Details',
  section_location_title: 'Location',
  virtual_label: 'This is a virtual/remote event',
  section_categories_title: 'Categories',
  section_datetime_title: 'Date & Time',
  section_contact_title: 'Contact Information',
  section_additional_title: 'Additional Information',
  submit_button_text: 'Submit Event for Review',
  submitting_text: 'Submitting...',
  success_icon: '🎉',
  success_title: 'Event Submitted!',
  success_message: 'Thank you for submitting your event. Our team will review it shortly. Once approved, it will appear in the Discover section.',
  success_button_text: 'Browse Opportunities',
  success_button_link: '/opportunities',
  field_labels_json: JSON.stringify({
    title: 'Event Title',
    summary: 'Short Summary',
    description: 'Full Description',
    cover_image: 'Cover Image',
    country: 'Country',
    state: 'State / Province',
    city: 'City',
    address: 'Street Address / Venue',
    causes: 'Cause(s)',
    contribution_types: 'Contribution Type(s)',
    start_date: 'Start Date',
    end_date: 'End Date',
    start_time: 'Start Time',
    end_time: 'End Time',
    email: 'Contact Email',
    organizer_name: 'Organization / Your Name',
    spots: 'Available Spots',
    requirements: 'Requirements / Notes',
  }),
  field_placeholders_json: JSON.stringify({
    title: 'e.g., Beach Cleanup Drive at Juhu',
    summary: 'Briefly describe your event (shown in listings)',
    description: 'Provide detailed information about the event...',
    address: 'e.g., Central Park, Near Main Gate',
    email: 'you@example.com',
    organizer_name: 'e.g., Green Earth Foundation',
    spots: 'e.g., 50',
    requirements: 'e.g., Bring gloves, wear comfortable shoes...',
  }),
  validation_messages_json: JSON.stringify({
    title: 'Title must be at least 5 characters',
    summary: 'Summary must be at least 20 characters',
    country: 'Please select a country',
    causes: 'Please select at least one cause',
    contribution_types: 'Please select at least one contribution type',
    start_date: 'Start date is required',
    future_date: 'Start date must be in the future',
    email_required: 'Contact email is required',
    email_invalid: 'Please enter a valid email address',
  }),
};

/**
 * Fetch singleton page content from Contentstack
 */
async function getSingletonContent<T>(contentTypeUid: string): Promise<T | null> {
  try {
    // Include assets to get full file field data
    const result = await getEntries<T>(contentTypeUid, { 
      limit: 1,
      include: ['assets']
    });
    return result.entries[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch ${contentTypeUid} content:`, error);
    return null;
  }
}

/**
 * Transform Contentstack file field to image asset
 */
function transformFileField(fileField: any): { url: string; title?: string } | undefined {
  if (!fileField) return undefined;
  
  // Contentstack Delivery API returns file fields as objects with url property
  if (typeof fileField === 'object') {
    // If it has a url property (full asset object)
    if (fileField.url) {
      return {
        url: fileField.url,
        title: fileField.title || fileField.filename,
      };
    }
    
    // If it's just a reference with uid, Delivery API should have expanded it
    // But if not, we can't construct the URL without stack/folder info
    if (fileField.uid && !fileField.url) {
      console.warn('[LandingPage] Asset reference not expanded:', fileField.uid);
      return undefined;
    }
  }
  
  return undefined;
}

/**
 * Fetch Landing Page content
 */
export async function getLandingPageContent(): Promise<LandingPageContent> {
  const rawContent = await getSingletonContent<any>('landing_page');
  
  if (!rawContent) {
    return DEFAULT_LANDING_PAGE;
  }
  
  // Transform the background image fields
  const transformedHeroImage = transformFileField(rawContent.hero_background_image);
  const transformedCausesImage = transformFileField(rawContent.causes_background_image);
  
  const content: LandingPageContent = {
    ...rawContent,
    hero_background_image: transformedHeroImage,
    causes_background_image: transformedCausesImage,
  };
  
  return content;
}

/**
 * Fetch My Events Page content
 */
export async function getMyEventsPageContent(): Promise<MyEventsPageContent> {
  const content = await getSingletonContent<MyEventsPageContent>('my_events_page');
  return content || DEFAULT_MY_EVENTS_PAGE;
}

/**
 * Fetch My Registrations Page content
 */
export async function getMyRegistrationsPageContent(): Promise<MyRegistrationsPageContent> {
  const content = await getSingletonContent<MyRegistrationsPageContent>('my_registrations_page');
  return content || DEFAULT_MY_REGISTRATIONS_PAGE;
}

/**
 * Fetch Discover Page content
 */
export async function getDiscoverPageContent(): Promise<DiscoverPageContent> {
  const content = await getSingletonContent<DiscoverPageContent>('discover_page');
  return content || DEFAULT_DISCOVER_PAGE;
}

/**
 * Fetch Create Event Page content
 */
export async function getCreateEventPageContent(): Promise<CreateEventPageContent> {
  const content = await getSingletonContent<CreateEventPageContent>('create_event_page');
  return content || DEFAULT_CREATE_EVENT_PAGE;
}

/**
 * Fetch Navbar content
 */
export async function getNavbarContent(): Promise<NavbarContent> {
  const content = await getSingletonContent<NavbarContent>('navbar');
  return content || DEFAULT_NAVBAR;
}

/**
 * Footer Content Type
 */
export interface FooterContent {
  copyright_text?: string;
  tagline?: string;
  links_json?: string; // JSON array of {title, links: [{label, url, new_tab?}]}
  social_links_json?: string; // JSON array of {platform, url, label?}
  show_newsletter?: boolean;
  newsletter_title?: string;
  newsletter_description?: string;
  newsletter_placeholder?: string;
  newsletter_button_text?: string;
}

export interface FooterLinkColumn {
  title: string;
  links?: Array<{ label: string; url: string; new_tab?: boolean }>;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'email';
  url: string;
  label?: string;
}

export function parseFooterLinks(json?: string): FooterLinkColumn[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseSocialLinks(json?: string): SocialLink[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Default content for Footer
 */
export const DEFAULT_FOOTER: FooterContent = {
  copyright_text: '© {year} ImpactConnect. All rights reserved.',
  tagline: 'Connecting people with opportunities to make a difference.',
  links_json: JSON.stringify([
    { title: 'Explore', links: [{ label: 'Discover Opportunities', url: '/opportunities' }, { label: 'Create Event', url: '/create-event' }] },
    { title: 'Your Activity', links: [{ label: 'My Registrations', url: '/my-registrations' }, { label: 'My Events', url: '/my-events' }] },
    { title: 'Help', links: [{ label: 'FAQ', url: '/faq' }] },
  ]),
  social_links_json: '[]',
  show_newsletter: false,
};

/**
 * Fetch Footer content
 */
export async function getFooterContent(): Promise<FooterContent> {
  const content = await getSingletonContent<FooterContent>('footer');
  return content || DEFAULT_FOOTER;
}

/**
 * Announcement Banner Content Type
 */
export interface AnnouncementBannerContent {
  enabled?: boolean;
  message: string;
  link_text?: string;
  link_url?: string;
  background_color?: 'info' | 'success' | 'warning' | 'error' | 'accent';
  dismissible?: boolean;
  start_date?: string;
  end_date?: string;
  icon?: string;
}

/**
 * Default content for Announcement Banner
 */
export const DEFAULT_ANNOUNCEMENT_BANNER: AnnouncementBannerContent = {
  enabled: false,
  message: '',
  dismissible: true,
  background_color: 'info',
};

/**
 * Fetch Announcement Banner content
 */
export async function getAnnouncementBannerContent(): Promise<AnnouncementBannerContent> {
  const content = await getSingletonContent<AnnouncementBannerContent>('announcement_banner');
  return content || DEFAULT_ANNOUNCEMENT_BANNER;
}

/**
 * Global Settings Content Type
 */
export interface GlobalSettingsContent {
  site_name: string;
  default_meta_title?: string;
  default_meta_description?: string;
  default_og_image_url?: string;
  favicon_url?: string;
  google_analytics_id?: string;
  enable_registration?: boolean;
  enable_event_creation?: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  contact_email?: string;
  support_email?: string;
}

/**
 * Default content for Global Settings
 */
export const DEFAULT_GLOBAL_SETTINGS: GlobalSettingsContent = {
  site_name: 'ImpactConnect',
  default_meta_title: 'ImpactConnect - Discover Social Impact Opportunities',
  default_meta_description: 'Connect with volunteering, donation drives, and community service opportunities. Make a difference in education, health, environment, and more.',
  enable_registration: true,
  enable_event_creation: true,
  maintenance_mode: false,
  maintenance_message: 'We\'re currently performing scheduled maintenance. Please check back soon!',
};

/**
 * Fetch Global Settings content
 */
export async function getGlobalSettingsContent(): Promise<GlobalSettingsContent> {
  const content = await getSingletonContent<GlobalSettingsContent>('global_settings');
  return content || DEFAULT_GLOBAL_SETTINGS;
}

/**
 * Error Pages Content Type
 */
export interface ErrorPagesContent {
  not_found_title?: string;
  not_found_message?: string;
  not_found_image_url?: string;
  not_found_button_text?: string;
  not_found_button_url?: string;
  error_title?: string;
  error_message?: string;
  error_image_url?: string;
  error_button_text?: string;
  show_contact_on_error?: boolean;
  contact_message?: string;
}

/**
 * Default content for Error Pages
 */
export const DEFAULT_ERROR_PAGES: ErrorPagesContent = {
  not_found_title: 'Page Not Found',
  not_found_message: 'Sorry, we couldn\'t find the page you\'re looking for. It may have been moved or deleted.',
  not_found_button_text: 'Go to Homepage',
  not_found_button_url: '/',
  error_title: 'Something Went Wrong',
  error_message: 'We\'re sorry, but something unexpected happened. Please try again later.',
  error_button_text: 'Try Again',
  show_contact_on_error: true,
  contact_message: 'If the problem persists, please contact support.',
};

/**
 * Fetch Error Pages content
 */
export async function getErrorPagesContent(): Promise<ErrorPagesContent> {
  const content = await getSingletonContent<ErrorPagesContent>('error_pages');
  return content || DEFAULT_ERROR_PAGES;
}

// About page removed - keeping parse functions for potential future use
export interface ImpactStat {
  number: string;
  label: string;
  icon?: string;
}

export interface ValueItem {
  title: string;
  description?: string;
  icon?: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  photo_url?: string;
  bio?: string;
  linkedin_url?: string;
}

export function parseImpactStats(json?: string): ImpactStat[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseValues(json?: string): ValueItem[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseTeamMembers(json?: string): TeamMember[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * FAQ Page Content Type
 */
export interface FAQPageContent {
  page_title: string;
  page_subtitle?: string;
  background_image?: {
    url: string;
    title?: string;
  };
  faqs_json?: string; // JSON array of {category, icon?, questions: [{q, a}]}
  contact_title?: string;
  contact_description?: string;
  contact_button_text?: string;
  contact_email?: string;
}

export interface FAQCategory {
  category: string;
  icon?: string;
  questions?: Array<{ q: string; a: string }>;
}

export function parseFAQs(json?: string): FAQCategory[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Default content for FAQ Page
 */
export const DEFAULT_FAQ_PAGE: FAQPageContent = {
  page_title: 'Frequently Asked Questions',
  page_subtitle: 'Find answers to common questions about volunteering and using ImpactConnect.',
  faqs_json: JSON.stringify([
    {
      category: 'Getting Started',
      icon: '🚀',
      questions: [
        { q: 'How do I sign up as a volunteer?', a: 'Simply browse opportunities on our Discover page and click "Register" on any event that interests you.' },
        { q: 'Is ImpactConnect free to use?', a: 'Yes! ImpactConnect is completely free for volunteers.' },
        { q: 'Do I need any special skills to volunteer?', a: 'Not at all! We have opportunities for all skill levels.' },
      ],
    },
    {
      category: 'For Organizers',
      icon: '📋',
      questions: [
        { q: 'How do I create an event?', a: 'Click on "Create Event" in the navigation. Fill out the form with your event details and submit for review.' },
        { q: 'How long does event approval take?', a: 'Most events are reviewed within 24-48 hours.' },
      ],
    },
    {
      category: 'Registrations',
      icon: '📝',
      questions: [
        { q: 'How do I cancel my registration?', a: 'Visit the My Registrations page to view your upcoming events. Contact the event organizer directly to cancel.' },
        { q: 'Will I receive a confirmation email?', a: 'Yes! After registering, you will receive a confirmation email with event details.' },
      ],
    },
  ]),
  contact_title: 'Still Have Questions?',
  contact_description: 'Can\'t find what you\'re looking for? We\'re here to help!',
  contact_button_text: 'Contact Us',
  contact_email: 'support@impactconnect.com',
};

/**
 * Fetch FAQ Page content
 */
export async function getFAQPageContent(): Promise<FAQPageContent> {
  try {
    // Include the background_image field specifically to get full asset data
    const result = await getEntries<any>('faq_page', { 
      limit: 1,
      include: ['background_image']
    });
    
    const rawContent = result.entries[0];
    
    if (!rawContent) {
      return DEFAULT_FAQ_PAGE;
    }
    
    // Transform the background image field
    const transformedBackgroundImage = transformFileField(rawContent.background_image);
    
    return {
      ...rawContent,
      background_image: transformedBackgroundImage,
    };
  } catch (error) {
    console.warn('Failed to fetch FAQ page content:', error);
    return DEFAULT_FAQ_PAGE;
  }
}
