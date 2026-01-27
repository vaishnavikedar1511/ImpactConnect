/**
 * Fetch Personalized Content from Contentstack
 * 
 * Uses the Personalize SDK to get variant aliases,
 * then fetches content using the Delivery SDK with variants
 * 
 * NOTE: This is a client-side function (uses personalizeService)
 */

'use client';

import { getContentstackConfig } from './config';
import { personalizeService } from './personalize-service';

/**
 * Fetch personalized entry from Contentstack
 * 
 * @param contentTypeUid - Content type UID
 * @param entryUid - Entry UID (optional, for singleton entries)
 * @returns Personalized entry content
 */
export async function getPersonalizedEntry<T = Record<string, unknown>>(
  contentTypeUid: string,
  entryUid?: string
): Promise<T> {
  const config = getContentstackConfig();
  
  // Get variant aliases from Personalize SDK
  const variantAliases = personalizeService.getVariantAliases();

  console.log('Variant Aliases==>:', variantAliases);
  
  // Build API URL
  const baseUrl = config.region === 'eu' 
    ? 'https://eu-cdn.contentstack.io'
    : config.region === 'azure-na'
    ? 'https://azure-na-cdn.contentstack.io'
    : config.region === 'azure-eu'
    ? 'https://azure-eu-cdn.contentstack.io'
    : 'https://cdn.contentstack.io';
  
  const endpoint = entryUid
    ? `/v3/content_types/${contentTypeUid}/entries/${entryUid}`
    : `/v3/content_types/${contentTypeUid}/entries`;
  
  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append('environment', config.environment);
  url.searchParams.append('locale', 'en-us');
  
  // Add variant aliases if available
  if (variantAliases.length > 0) {
    url.searchParams.append('variants', variantAliases.join(','));
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'api_key': config.apiKey,
      'access_token': config.deliveryToken,
    },
    cache: 'no-store', // Don't cache personalized content
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch personalized content: ${response.status}`);
  }
  
  const data = await response.json();
  return (entryUid ? data.entry : data.entries?.[0]) || data;
}
