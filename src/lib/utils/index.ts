/**
 * Utility Functions
 * Central export for all utility modules
 */

export {
  getDateRangeForFilter,
  formatDisplayDate,
  formatDateRange,
  formatTime,
  isToday,
  isPast,
  getRelativeDateLabel,
} from './dates';

export type { TimeFilter } from './dates';

export {
  extractCityFromQuery,
  normalizeCity,
  containsCity,
  getKnownCities,
} from './search';

export type { ParsedQuery } from './search';

/**
 * Combine class names (simple cn utility)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
