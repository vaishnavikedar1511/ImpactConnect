/**
 * Contentstack Management API Utilities
 * Helper functions for generating slugs and IDs
 * 
 * NOTE: Entry creation is now handled by Contentstack Automate webhooks
 */

/**
 * Management API Error
 */
export class ManagementApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public errors?: Record<string, string>[]
  ) {
    super(message);
    this.name = 'ManagementApiError';
  }
}

/**
 * Generate a URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    + '-' + Date.now().toString(36);
}

/**
 * Generate a unique registration ID
 */
export function generateRegistrationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `REG-${timestamp}-${random}`.toUpperCase();
}
