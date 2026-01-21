/**
 * Contentstack REST API Client
 * Handles API requests with proper authentication and error handling
 */

import { getApiBaseUrl, getContentstackConfig, type ContentTypeUid } from './config';

/**
 * Contentstack API error
 */
export class ContentstackError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ContentstackError';
  }
}

/**
 * Query parameters for Contentstack API
 */
export interface QueryParams {
  query?: Record<string, unknown>;
  limit?: number;
  skip?: number;
  include?: string[];
  only?: Record<string, string[]>;
  except?: Record<string, string[]>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Fetch options for caching
 */
export interface FetchOptions {
  /** Revalidation time in seconds (default: 60) */
  revalidate?: number;
  /** Cache tags for on-demand revalidation */
  tags?: string[];
}

/**
 * Performance limits
 */
const LIMITS = {
  /** Maximum entries per request */
  MAX_LIMIT: 100,
  /** Default entries per request */
  DEFAULT_LIMIT: 20,
  /** Maximum depth for references */
  MAX_REFERENCE_DEPTH: 2,
} as const;

/**
 * Contentstack API response wrapper
 */
export interface ContentstackResponse<T> {
  entries?: T[];
  entry?: T;
  count?: number;
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.query && Object.keys(params.query).length > 0) {
    searchParams.set('query', JSON.stringify(params.query));
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }

  if (params.skip !== undefined) {
    searchParams.set('skip', params.skip.toString());
  }

  if (params.include && params.include.length > 0) {
    params.include.forEach((ref) => {
      searchParams.append('include[]', ref);
    });
  }

  if (params.only) {
    searchParams.set('only', JSON.stringify(params.only));
  }

  if (params.except) {
    searchParams.set('except', JSON.stringify(params.except));
  }

  if (params.orderBy) {
    const direction = params.orderDirection === 'desc' ? '-' : '';
    searchParams.set('order_by', `${direction}${params.orderBy}`);
  }

  return searchParams.toString();
}

/**
 * Make authenticated request to Contentstack API
 */
async function fetchFromContentstack<T>(
  endpoint: string,
  requestOptions: RequestInit = {},
  fetchOptions: FetchOptions = {}
): Promise<T> {
  const config = getContentstackConfig();
  const baseUrl = getApiBaseUrl();

  const url = `${baseUrl}/v3${endpoint}`;

  const headers: HeadersInit = {
    'api_key': config.apiKey,
    'access_token': config.deliveryToken,
    'Content-Type': 'application/json',
  };

  if (config.branch) {
    (headers as Record<string, string>)['branch'] = config.branch;
  }

  // Build Next.js fetch options
  const nextOptions: { revalidate?: number; tags?: string[] } = {};
  
  if (fetchOptions.revalidate !== undefined) {
    nextOptions.revalidate = fetchOptions.revalidate;
  } else {
    nextOptions.revalidate = 60; // Default 60 seconds
  }

  if (fetchOptions.tags && fetchOptions.tags.length > 0) {
    nextOptions.tags = fetchOptions.tags;
  }

  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      ...headers,
      ...requestOptions.headers,
    },
    next: nextOptions,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ContentstackError(
      errorBody.error_message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorBody.error_code
    );
  }

  return response.json();
}

/**
 * Enforce limit bounds
 */
function enforceLimit(limit?: number): number {
  if (limit === undefined) return LIMITS.DEFAULT_LIMIT;
  return Math.min(Math.max(1, limit), LIMITS.MAX_LIMIT);
}

/**
 * Fetch multiple entries of a content type
 */
export async function getEntries<T>(
  contentType: ContentTypeUid,
  params: QueryParams = {},
  fetchOptions: FetchOptions = {}
): Promise<{ entries: T[]; count: number }> {
  const config = getContentstackConfig();
  
  // Enforce limit bounds to prevent over-fetching
  const safeParams = {
    ...params,
    limit: enforceLimit(params.limit),
  };
  
  const queryString = buildQueryString(safeParams);
  const endpoint = `/content_types/${contentType}/entries?environment=${config.environment}${queryString ? `&${queryString}` : ''}`;

  // Add content type to cache tags
  const tags = [
    `${contentType}s`, // e.g., "opportunities"
    ...(fetchOptions.tags || []),
  ];

  const response = await fetchFromContentstack<ContentstackResponse<T>>(
    endpoint,
    {},
    { ...fetchOptions, tags }
  );

  return {
    entries: response.entries || [],
    count: response.count || response.entries?.length || 0,
  };
}

/**
 * Fetch a single entry by UID
 */
export async function getEntryByUid<T>(
  contentType: ContentTypeUid,
  uid: string,
  params: Pick<QueryParams, 'include' | 'only' | 'except'> = {},
  fetchOptions: FetchOptions = {}
): Promise<T | null> {
  const config = getContentstackConfig();
  const searchParams = new URLSearchParams();

  if (params.include && params.include.length > 0) {
    params.include.forEach((ref) => {
      searchParams.append('include[]', ref);
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/content_types/${contentType}/entries/${uid}?environment=${config.environment}${queryString ? `&${queryString}` : ''}`;

  // Add entry-specific cache tag
  const tags = [
    `${contentType}:${uid}`,
    ...(fetchOptions.tags || []),
  ];

  try {
    const response = await fetchFromContentstack<ContentstackResponse<T>>(
      endpoint,
      {},
      { ...fetchOptions, tags }
    );
    return response.entry || null;
  } catch (error) {
    if (error instanceof ContentstackError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetch a single entry by field value (e.g., slug)
 */
export async function getEntryByField<T>(
  contentType: ContentTypeUid,
  fieldName: string,
  fieldValue: string,
  params: Pick<QueryParams, 'include' | 'only' | 'except'> = {}
): Promise<T | null> {
  const response = await getEntries<T>(contentType, {
    query: { [fieldName]: fieldValue },
    limit: 1,
    ...params,
  });

  return response.entries[0] || null;
}

/**
 * Fetch entry count for a content type with optional query
 */
export async function getEntryCount(
  contentType: ContentTypeUid,
  query?: Record<string, unknown>
): Promise<number> {
  const config = getContentstackConfig();
  const queryString = query ? `&query=${JSON.stringify(query)}` : '';
  const endpoint = `/content_types/${contentType}/entries?environment=${config.environment}&count=true${queryString}`;

  const response = await fetchFromContentstack<{ entries: number }>(endpoint);
  return response.entries || 0;
}
