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
 * Extract user attributes from registrations stored in localStorage
 * Gets location and preferred causes from user's registration history
 */
export function getUserAttributesFromRegistrations(): UserAttributes {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    // Import dynamically to avoid SSR issues
    const { getRegistrations } = require('@/lib/user/storage');
    const registrations = getRegistrations();

    if (registrations.length === 0) {
      return {};
    }

    const attributes: UserAttributes = {};

    // Extract location from registrations
    // Get the most common location from registrations
    const locations = registrations
      .map(r => r.opportunityLocation)
      .filter(Boolean);
    
    if (locations.length > 0) {
      // Parse location string (format: "City, State, Country" or "Virtual / Online")
      const mostCommonLocation = locations[0];
      
      if (mostCommonLocation !== 'Virtual / Online') {
        const parts = mostCommonLocation.split(',').map(p => p.trim());
        if (parts.length >= 1) attributes.city = parts[0];
        if (parts.length >= 2) attributes.state = parts[1];
        if (parts.length >= 3) attributes.country = parts[2];
      }
    }

    // Extract preferred causes from registrations
    const causeSlugsSet = new Set<string>();
    registrations.forEach(reg => {
      if (reg.opportunityCauseSlugs && Array.isArray(reg.opportunityCauseSlugs)) {
        reg.opportunityCauseSlugs.forEach(causeSlug => {
          if (causeSlug) {
            causeSlugsSet.add(causeSlug.toLowerCase());
          }
        });
      }
    });
    
    const causeSlugs = Array.from(causeSlugsSet);
    if (causeSlugs.length > 0) {
      attributes.preferredCauses = causeSlugs;
      attributes.interests = causeSlugs;
    }

    // Set user type based on registration count
    if (registrations.length >= 5) {
      attributes.userType = 'active';
    } else if (registrations.length >= 1) {
      attributes.userType = 'returning';
    }

    attributes.registrationCount = registrations.length;

    return attributes;
  } catch (error) {
    console.error('Error extracting user attributes from registrations:', error);
    return {};
  }
}

/**
 * Get personalized opportunity ordering using Contentstack Personalize API
 * 
 * Priority:
 * 1. Location match (city, state, country)
 * 2. Cause match (causes user has registered for)
 * 3. Default order (date ascending)
 * 
 * @param opportunities - List of opportunities to personalize
 * @param userAttributes - User attributes for personalization
 * @returns Personalized and sorted opportunities
 */
export async function personalizeOpportunityOrder<T extends {
  uid: string;
  city?: string;
  state?: string;
  country?: string;
  causeSlugs?: string[];
  startDate: string;
}>(
  opportunities: T[],
  userAttributes?: UserAttributes
): Promise<T[]> {
  if (!userAttributes || Object.keys(userAttributes).length === 0 || opportunities.length === 0) {
    return opportunities;
  }

  const personalizeApiKey = process.env.CONTENTSTACK_PERSONALIZE_API_KEY;
  
  // If Personalize API is not configured, use client-side scoring
  if (!personalizeApiKey) {
    return scoreAndSortOpportunities(opportunities, userAttributes);
  }

  try {
    // Use Contentstack Personalize API to get personalized ordering
    // The API will return opportunities in personalized order based on user attributes
    const config = getContentstackConfig();
    const baseUrl = getApiBaseUrl();
    const environment = config.environment;
    
    // Build Personalize API request
    // Contentstack Personalize can return personalized entry lists
    const opportunityUids = opportunities.map(opp => opp.uid);
    
    const searchParams = new URLSearchParams();
    searchParams.set('environment', environment);
    searchParams.set('locale', 'en-us');
    searchParams.set('query', JSON.stringify({
      uid: { $in: opportunityUids }
    }));
    
    // Add user attributes for personalization
    Object.entries(userAttributes).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`user_attributes[${key}][]`, String(v)));
        } else {
          searchParams.append(`user_attributes[${key}]`, String(value));
        }
      }
    });
    
    const url = `${baseUrl}/v3/content_types/opportunity/entries?${searchParams.toString()}`;
    
    const headers: HeadersInit = {
      'api_key': config.apiKey,
      'access_token': config.deliveryToken,
      'personalization_api_key': personalizeApiKey,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });
    
    if (response.ok) {
      const data = await response.json();
      const personalizedEntries = data.entries || [];
      const personalizedUids = personalizedEntries.map((entry: { uid: string }) => entry.uid);
      
      // Reorder opportunities based on Personalize API response
      const opportunityMap = new Map(opportunities.map(opp => [opp.uid, opp]));
      const personalizedOrder: T[] = [];
      const remaining: T[] = [];
      
      // Add opportunities in personalized order
      personalizedUids.forEach((uid: string) => {
        const opp = opportunityMap.get(uid);
        if (opp) {
          personalizedOrder.push(opp);
          opportunityMap.delete(uid);
        }
      });
      
      // Add remaining opportunities (not in personalized response)
      opportunityMap.forEach(opp => remaining.push(opp));
      
      // Sort remaining by date
      remaining.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      return [...personalizedOrder, ...remaining];
    } else {
      // Fallback to client-side scoring if API fails
      console.warn('Personalize API request failed, using client-side scoring');
      return scoreAndSortOpportunities(opportunities, userAttributes);
    }
  } catch (error) {
    console.error('Error fetching personalized ordering:', error);
    // Fallback to client-side scoring
    return scoreAndSortOpportunities(opportunities, userAttributes);
  }
}

/**
 * Client-side scoring fallback when Personalize API is not available
 * Scores opportunities based on location and cause matches
 */
function scoreAndSortOpportunities<T extends {
  city?: string;
  state?: string;
  country?: string;
  causeSlugs?: string[];
  startDate: string;
}>(
  opportunities: T[],
  userAttributes: UserAttributes
): T[] {
  const userCity = userAttributes.city?.toLowerCase();
  const userState = userAttributes.state?.toLowerCase();
  const userCountry = userAttributes.country?.toLowerCase();
  const userPreferredCauses = (userAttributes.preferredCauses || userAttributes.interests || [])
    .map(c => c.toLowerCase());

  // Score each opportunity based on relevance
  const scoredOpportunities = opportunities.map(opp => {
    let score = 0;

    // Location scoring (higher priority)
    if (userCity && opp.city?.toLowerCase() === userCity) {
      score += 100; // Exact city match
    } else if (userState && opp.state?.toLowerCase() === userState) {
      score += 50; // State match
    } else if (userCountry && opp.country?.toLowerCase() === userCountry) {
      score += 25; // Country match
    }

    // Cause scoring (secondary priority)
    if (opp.causeSlugs && opp.causeSlugs.length > 0 && userPreferredCauses.length > 0) {
      const matchingCauses = opp.causeSlugs.filter(causeSlug =>
        userPreferredCauses.some(pref => 
          causeSlug.toLowerCase().includes(pref) || 
          pref.includes(causeSlug.toLowerCase())
        )
      );
      score += matchingCauses.length * 10; // 10 points per matching cause
    }

    return { opportunity: opp, score };
  });

  // Sort by score (descending), then by date (ascending)
  scoredOpportunities.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Higher score first
    }
    // If scores are equal, sort by date (earlier dates first)
    return new Date(a.opportunity.startDate).getTime() - 
           new Date(b.opportunity.startDate).getTime();
  });

  return scoredOpportunities.map(item => item.opportunity);
}
