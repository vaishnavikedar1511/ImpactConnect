/**
 * Contentstack Personalize Integration
 * 
 * Provides utilities for fetching personalized content based on user attributes
 * 
 * Setup:
 * 1. Enable Personalize in your Contentstack stack
 * 2. Add CONTENTSTACK_PERSONALIZE_API_KEY to .env.local
 * 3. Create user segments in Contentstack Personalize
 * 4. Add Personalize fields to your content types
 */

import { getContentstackConfig, getApiBaseUrl } from './config';

export interface UserAttributes {
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Interests & Preferences
  interests?: string[];
  preferredCauses?: string[];
  contributionTypes?: string[];
  
  // User Behavior
  userType?: 'new' | 'returning' | 'active';
  registrationCount?: number;
  lastVisitDate?: string;
  
  // Demographics (optional)
  age?: number;
  language?: string;
  
  // Custom attributes
  [key: string]: string | number | string[] | undefined;
}

export interface PersonalizeOptions {
  /** User attributes for personalization */
  userAttributes?: UserAttributes;
  /** Content type UID */
  contentTypeUid: string;
  /** Entry UID (optional, for specific entry) */
  entryUid?: string;
  /** Environment (defaults to configured environment) */
  environment?: string;
  /** Locale (defaults to 'en-us') */
  locale?: string;
}

/**
 * Get personalized content from Contentstack
 * 
 * @param contentTypeUid - Content type UID (e.g., 'landing_page')
 * @param userAttributes - User attributes for personalization
 * @param options - Additional options
 * @returns Personalized content entry
 */
export async function getPersonalizedContent<T = Record<string, unknown>>(
  contentTypeUid: string,
  userAttributes?: UserAttributes,
  options: Omit<PersonalizeOptions, 'contentTypeUid' | 'userAttributes'> = {}
): Promise<T> {
  const config = getContentstackConfig();
  const baseUrl = getApiBaseUrl();
  const environment = options.environment || config.environment;
  const locale = options.locale || 'en-us';
  
  // Build Personalize API URL
  const personalizeApiKey = process.env.CONTENTSTACK_PERSONALIZE_API_KEY;
  
  if (!personalizeApiKey) {
    console.warn('CONTENTSTACK_PERSONALIZE_API_KEY not set. Returning default content.');
    // Fallback to regular content fetch
    return getDefaultContent<T>(contentTypeUid, options.entryUid, environment, locale);
  }
  
  const endpoint = options.entryUid
    ? `/content_types/${contentTypeUid}/entries/${options.entryUid}`
    : `/content_types/${contentTypeUid}/entries`;
  
  const url = `${baseUrl}/v3${endpoint}?environment=${environment}&locale=${locale}`;
  
  // Build headers with Personalize API key
  const headers: HeadersInit = {
    'api_key': config.apiKey,
    'access_token': config.deliveryToken,
    'personalization_api_key': personalizeApiKey,
    'Content-Type': 'application/json',
  };
  
  // Add user attributes as query parameters or headers
  // Contentstack Personalize accepts user attributes in the request
  const searchParams = new URLSearchParams();
  
  if (userAttributes) {
    // Add user attributes as query parameters
    Object.entries(userAttributes).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`user_attributes[${key}][]`, String(v)));
        } else {
          searchParams.append(`user_attributes[${key}]`, String(value));
        }
      }
    });
  }
  
  const fullUrl = searchParams.toString() ? `${url}&${searchParams.toString()}` : url;
  
  try {
    const response = await fetch(fullUrl, {
      headers,
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    if (!response.ok) {
      console.warn(`Personalize API error: ${response.status}. Falling back to default content.`);
      return getDefaultContent<T>(contentTypeUid, options.entryUid, environment, locale);
    }
    
    const data = await response.json();
    return (options.entryUid ? data.entry : data.entries?.[0]) || data;
  } catch (error) {
    console.error('Error fetching personalized content:', error);
    // Fallback to default content
    return getDefaultContent<T>(contentTypeUid, options.entryUid, environment, locale);
  }
}

/**
 * Fallback: Get default (non-personalized) content
 */
async function getDefaultContent<T>(
  contentTypeUid: string,
  entryUid: string | undefined,
  environment: string,
  locale: string
): Promise<T> {
  const config = getContentstackConfig();
  const baseUrl = getApiBaseUrl();
  
  const endpoint = entryUid
    ? `/content_types/${contentTypeUid}/entries/${entryUid}`
    : `/content_types/${contentTypeUid}/entries`;
  
  const url = `${baseUrl}/v3${endpoint}?environment=${environment}&locale=${locale}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': config.apiKey,
      'access_token': config.deliveryToken,
    },
    next: { revalidate: 60 },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch default content: ${response.status}`);
  }
  
  const data = await response.json();
  return (entryUid ? data.entry : data.entries?.[0]) || data;
}

/**
 * Get user attributes from client-side storage (localStorage, cookies, etc.)
 * This is a helper function for client components
 */
export function getUserAttributesFromClient(): UserAttributes {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const attributes: UserAttributes = {};
  
  // Get from localStorage
  const storedCity = localStorage.getItem('userCity');
  const storedInterests = localStorage.getItem('userInterests');
  const storedUserType = localStorage.getItem('userType');
  
  if (storedCity) attributes.city = storedCity;
  if (storedInterests) {
    try {
      attributes.interests = JSON.parse(storedInterests);
    } catch {
      // Ignore parse errors
    }
  }
  if (storedUserType) {
    attributes.userType = storedUserType as 'new' | 'returning' | 'active';
  }
  
  // Get from cookies (if using a cookie library)
  // You can add cookie parsing here if needed
  
  return attributes;
}

/**
 * Store user attributes in client-side storage
 */
export function storeUserAttributes(attributes: Partial<UserAttributes>): void {
  if (typeof window === 'undefined') return;
  
  if (attributes.city) {
    localStorage.setItem('userCity', attributes.city);
  }
  
  if (attributes.interests) {
    localStorage.setItem('userInterests', JSON.stringify(attributes.interests));
  }
  
  if (attributes.userType) {
    localStorage.setItem('userType', attributes.userType);
  }
}

/**
 * Get personalized opportunities based on user attributes
 * This combines regular opportunity fetching with personalization
 */
export async function getPersonalizedOpportunities(
  userAttributes?: UserAttributes,
  filters?: {
    limit?: number;
    status?: string[];
  }
) {
  // First, get personalized content for opportunity recommendations
  // Then fetch actual opportunities based on personalized preferences
  
  // This is a placeholder - implement based on your Personalize setup
  // You might want to:
  // 1. Get personalized cause preferences
  // 2. Get personalized location preferences
  // 3. Fetch opportunities matching those preferences
  
  return [];
}
