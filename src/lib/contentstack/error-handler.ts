/**
 * Contentstack Error Handler
 * Centralized error handling for CMS operations
 */

import { ContentstackError } from './client';

/**
 * Error types for UI handling
 */
export type CMSErrorType =
  | 'network_error'
  | 'not_found'
  | 'rate_limited'
  | 'server_error'
  | 'invalid_response'
  | 'unknown';

/**
 * Structured error for UI consumption
 */
export interface CMSError {
  type: CMSErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Classify error type from Contentstack error
 */
export function classifyError(error: unknown): CMSError {
  // Contentstack API error
  if (error instanceof ContentstackError) {
    if (error.statusCode === 404) {
      return {
        type: 'not_found',
        message: 'The requested content was not found.',
        statusCode: 404,
        retryable: false,
      };
    }

    if (error.statusCode === 429) {
      return {
        type: 'rate_limited',
        message: 'Too many requests. Please try again in a moment.',
        statusCode: 429,
        retryable: true,
      };
    }

    if (error.statusCode >= 500) {
      return {
        type: 'server_error',
        message: 'The content server is experiencing issues.',
        statusCode: error.statusCode,
        retryable: true,
      };
    }

    return {
      type: 'unknown',
      message: error.message || 'An error occurred while fetching content.',
      statusCode: error.statusCode,
      retryable: true,
    };
  }

  // Network/fetch error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network_error',
      message: 'Unable to connect to the content server.',
      retryable: true,
    };
  }

  // Generic error
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      retryable: true,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    retryable: true,
  };
}

/**
 * Safe wrapper for CMS fetch operations
 * Returns null instead of throwing on errors
 */
export async function safeFetch<T>(
  fetchFn: () => Promise<T>,
  options: {
    fallback?: T;
    logError?: boolean;
    context?: string;
  } = {}
): Promise<{ data: T | null; error: CMSError | null }> {
  const { fallback = null, logError = true, context = '' } = options;

  try {
    const data = await fetchFn();
    return { data, error: null };
  } catch (error) {
    const cmsError = classifyError(error);

    if (logError) {
      console.error(`[CMS Error]${context ? ` ${context}:` : ''}`, {
        type: cmsError.type,
        message: cmsError.message,
        statusCode: cmsError.statusCode,
        originalError: error,
      });
    }

    return {
      data: fallback as T | null,
      error: cmsError,
    };
  }
}

/**
 * Retry wrapper for transient errors
 */
export async function withRetry<T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 2, delayMs = 1000, backoff = true } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      const cmsError = classifyError(error);

      // Don't retry non-retryable errors
      if (!cmsError.retryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`[CMS Retry] Attempt ${attempt + 1}/${maxRetries}`, {
        error: cmsError.message,
      });
    }
  }

  throw lastError;
}

/**
 * Check if opportunity is expired
 */
export function isOpportunityExpired(endDate?: string): boolean {
  if (!endDate) return false;
  
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return end < today;
}

/**
 * Check if opportunity is valid for display
 */
export function isOpportunityValid(opportunity: {
  status?: string;
  dateTime?: { endDate?: string };
}): boolean {
  // Check status
  if (opportunity.status === 'cancelled') {
    return false;
  }

  // Check if expired
  if (opportunity.dateTime?.endDate && isOpportunityExpired(opportunity.dateTime.endDate)) {
    return false;
  }

  return true;
}
