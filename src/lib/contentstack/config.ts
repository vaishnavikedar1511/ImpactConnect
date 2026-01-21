/**
 * Contentstack Configuration
 * Reads environment variables and provides typed configuration
 */

export type ContentstackRegion = 'na' | 'eu' | 'azure-na' | 'azure-eu';

export interface ContentstackConfig {
  apiKey: string;
  deliveryToken: string;
  environment: string;
  region: ContentstackRegion;
  branch?: string;
}

/**
 * Get the base URL for Contentstack API based on region
 */
function getBaseUrl(region: ContentstackRegion): string {
  const regionUrls: Record<ContentstackRegion, string> = {
    'na': 'https://cdn.contentstack.io',
    'eu': 'https://eu-cdn.contentstack.io',
    'azure-na': 'https://azure-na-cdn.contentstack.io',
    'azure-eu': 'https://azure-eu-cdn.contentstack.io',
  };
  return regionUrls[region];
}

/**
 * Validate and retrieve Contentstack configuration from environment
 */
export function getContentstackConfig(): ContentstackConfig {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const environment = process.env.CONTENTSTACK_ENVIRONMENT;
  const region = (process.env.CONTENTSTACK_REGION || 'na') as ContentstackRegion;
  const branch = process.env.CONTENTSTACK_BRANCH;

  if (!apiKey) {
    throw new Error('CONTENTSTACK_API_KEY environment variable is required');
  }

  if (!deliveryToken) {
    throw new Error('CONTENTSTACK_DELIVERY_TOKEN environment variable is required');
  }

  if (!environment) {
    throw new Error('CONTENTSTACK_ENVIRONMENT environment variable is required');
  }

  return {
    apiKey,
    deliveryToken,
    environment,
    region,
    branch,
  };
}

/**
 * Get the full API base URL for the configured region
 */
export function getApiBaseUrl(): string {
  const config = getContentstackConfig();
  return getBaseUrl(config.region);
}

/**
 * Content type UIDs in Contentstack
 * These should match your Contentstack content type definitions
 */
export const ContentTypes = {
  OPPORTUNITY: 'opportunity',
  ORGANIZER: 'organizer',
  CAUSE: 'cause',
  LOCATION: 'location',
} as const;

export type ContentTypeUid = (typeof ContentTypes)[keyof typeof ContentTypes];
