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
  primaryCause?: string; // Most frequently registered cause
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
  /** Experience UID (optional, for specific experience) */
  experienceUid?: string;
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
  const environment = options.environment || config.environment;
  const locale = options.locale || 'en-us';
  
  // Build Personalize API URL
  const personalizeApiKey = process.env.CONTENTSTACK_PERSONALIZE_API_KEY;
  
  if (!personalizeApiKey) {
    console.warn('CONTENTSTACK_PERSONALIZE_API_KEY not set. Returning default content.');
    // Fallback to regular content fetch
    return getDefaultContent<T>(contentTypeUid, options.entryUid, environment, locale);
  }
  
  // For Personalize API, use api.contentstack.io (not cdn.contentstack.io)
  // Determine base URL based on region
  const getPersonalizeBaseUrl = (region: string): string => {
    switch (region.toLowerCase()) {
      case 'eu':
        return 'https://eu-api.contentstack.io';
      case 'azure-na':
        return 'https://azure-na-api.contentstack.io';
      case 'azure-eu':
        return 'https://azure-eu-api.contentstack.io';
      default:
        return 'https://api.contentstack.io';
    }
  };
  
  const baseUrl = getPersonalizeBaseUrl(config.region);
  
  const endpoint = options.entryUid
    ? `/content_types/${contentTypeUid}/entries/${options.entryUid}`
    : `/content_types/${contentTypeUid}/entries`;
  
  // Build base URL with environment and locale
  const urlParams = new URLSearchParams();
  urlParams.append('environment', environment);
  urlParams.append('locale', locale);
  
  const url = `${baseUrl}/v3${endpoint}?${urlParams.toString()}`;
  
  // Build headers with Personalize API key
  const headers: HeadersInit = {
    'api_key': config.apiKey,
    'access_token': config.deliveryToken,
    'personalization_api_key': personalizeApiKey,
    'Content-Type': 'application/json',
  };
  
  // Contentstack Personalize accepts user attributes as query parameters
  // Format: user_attributes[attribute_name]=value
  const searchParams = new URLSearchParams();
  
  // Add experience UID if provided (can be short UID or full UID)
  if (options.experienceUid) {
    searchParams.append('experience_uid', options.experienceUid);
    console.log('[Personalize] Experience UID:', options.experienceUid);
  }
  
  if (userAttributes) {
    // Add user attributes as query parameters
    Object.entries(userAttributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`user_attributes[${key}][]`, String(v)));
        } else {
          searchParams.append(`user_attributes[${key}]`, String(value));
        }
      }
    });
  }
  
  const fullUrl = searchParams.toString() ? `${url}&${searchParams.toString()}` : url;
  
  // Debug logging - Detailed request information
    console.log('\n=== PERSONALIZE API REQUEST ===');
    console.log('[Personalize] Endpoint:', endpoint);
    console.log('[Personalize] Full Request URL:', fullUrl);
    console.log('[Personalize] User Attributes:', JSON.stringify(userAttributes, null, 2));
    console.log('[Personalize] Experience UID:', options.experienceUid || 'NONE');
    console.log('[Personalize] Query String:', searchParams.toString());
    console.log('[Personalize] Has Personalize API Key:', !!personalizeApiKey);
    console.log('[Personalize] API Key Length:', personalizeApiKey?.length || 0);
    console.log('[Personalize] Headers:', {
      'api_key': config.apiKey ? 'SET' : 'MISSING',
      'access_token': config.deliveryToken ? 'SET' : 'MISSING',
      'personalization_api_key': personalizeApiKey ? 'SET' : 'MISSING',
    });
    console.log('================================\n');
  
  try {
    const response = await fetch(fullUrl, {
      headers,
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    console.log('\n=== PERSONALIZE API RESPONSE ===');
    console.log('[Personalize] Response Status:', response.status);
    console.log('[Personalize] Response OK:', response.ok);
    console.log('[Personalize] Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Personalize] Error Response:', errorText);
      console.warn(`Personalize API error: ${response.status}. Falling back to default content.`);
      return getDefaultContent<T>(contentTypeUid, options.entryUid, environment, locale);
    }
    
    const data = await response.json();
    console.log('[Personalize] Response Data Keys:', Object.keys(data));
    console.log('[Personalize] Has Entry:', !!data.entry);
    console.log('[Personalize] Has Entries:', !!data.entries);
    console.log('[Personalize] Entries Count:', data.entries?.length || 0);
    
    // Check if response contains personalized content indicators
    if (data.entries && data.entries.length > 0) {
      const entry = data.entries[0];
      console.log('[Personalize] Entry Message:', entry?.message);
      console.log('[Personalize] Entry Keys:', Object.keys(entry || {}));
      
      // Check for personalization metadata
      if (entry?._personalization) {
        console.log('[Personalize] Personalization Metadata:', entry._personalization);
      }
      if (entry?.personalization) {
        console.log('[Personalize] Personalization Data:', entry.personalization);
      }
    }
    
    console.log('================================\n');
    
    // Debug logging
    console.log('[Personalize] API Response structure:', {
      hasEntry: !!data.entry,
      hasEntries: !!data.entries,
      entriesLength: data.entries?.length,
      keys: Object.keys(data),
    });
    
    // Handle different response formats:
    // - For specific entry: data.entry
    // - For entries list: data.entries[0] (singleton entries)
    // - Direct entry object: data (fallback)
    let entry;
    if (options.entryUid && data.entry) {
      entry = data.entry;
    } else if (data.entries && data.entries.length > 0) {
      entry = data.entries[0];
    } else {
      // Fallback: return data directly (might be entry object or wrapped)
      entry = data.entry || data;
    }
    
    console.log('[Personalize] Extracted entry:', {
      hasMessage: !!entry?.message,
      message: entry?.message,
      keys: Object.keys(entry || {}),
    });
    
    return entry;
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
 * Gets city and primaryCause attributes
 */
export function getUserAttributesFromClient(): UserAttributes {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const attributes: UserAttributes = {};
  
  // Get city attribute from localStorage (set when dropdown is selected)
  try {
    const city = localStorage.getItem('userCity');
    if (city) {
      attributes.city = city;
    }
  } catch (error) {
    // Ignore errors (e.g., if localStorage not available)
    console.debug('Could not get city attribute:', error);
  }
  
  // Get primary cause from most recent registration
  try {
    // Import getPrimaryCause dynamically to avoid circular dependencies
    const { getPrimaryCause } = require('@/lib/user/storage');
    const primaryCause = getPrimaryCause();
    if (primaryCause) {
      attributes.primaryCause = primaryCause;
    }
  } catch (error) {
    console.debug('Could not get primary cause:', error);
  }
  
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
