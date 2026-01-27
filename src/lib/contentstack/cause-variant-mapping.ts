/**
 * Cause to Variant Mapping Utility
 * 
 * Maps cause slugs to Contentstack Personalize Experience variants
 * Based on Experience: Cause_experience (Short UID: a)
 */

/**
 * Full variant UIDs for each cause
 * Base Entry UID: blta0c7d89703e07f46
 */
const CAUSE_VARIANT_UIDS: Record<string, string> = {
  'environment': 'cs707ea3af73ad88d6',     // Variant 0
  'healthcare': 'csdf502737bc24da70',      // Variant 1
  'animal-welfare': 'cs8d09eb0af84f890a',  // Variant 2
  'education': 'cs9c5c46d58449eba6',       // Variant 3
};

/**
 * Landing page base entry UID
 */
export const LANDING_PAGE_ENTRY_UID = 'blta0c7d89703e07f46';

/**
 * Get full variant UID for a cause
 * 
 * @param causeSlug - Cause slug (e.g., 'animal-welfare', 'education')
 * @returns Full variant UID or null if not found
 */
export function getCauseVariantUID(causeSlug: string | null): string | null {
  if (!causeSlug) return CAUSE_VARIANT_UIDS['environment']; // Default to environment
  return CAUSE_VARIANT_UIDS[causeSlug] || null;
}

/**
 * Map cause slug to variant short UID
 * 
 * @param causeSlug - Cause slug (e.g., 'animal-welfare', 'education')
 * @returns Variant short UID for Experience 'a'
 */
export function mapCauseToVariant(causeSlug: string | null): string {
  if (!causeSlug) return '0'; // Default to environment
  
  const mapping: Record<string, string> = {
    'environment': '0',
    'healthcare': '1',
    'animal-welfare': '2',
    'education': '3',
    // Add more causes here as you add them to Contentstack:
    // 'poverty': '4',
    // 'children': '5',
    // 'disaster': '6',
    // etc.
  };
  
  return mapping[causeSlug] || '0'; // Default to environment if not found
}

/**
 * Map variant short UID back to cause slug
 * 
 * @param variantShortUid - Variant short UID (e.g., '0', '1', '2', '3')
 * @returns Cause slug
 */
export function mapVariantToCause(variantShortUid: string): string {
  const mapping: Record<string, string> = {
    '0': 'environment',
    '1': 'healthcare',
    '2': 'animal-welfare',
    '3': 'education',
    // Mirror the mapping above
  };
  
  return mapping[variantShortUid] || 'environment';
}

/**
 * Get all supported cause mappings
 * 
 * @returns Array of { cause, variant } mappings
 */
export function getAllCauseMappings(): Array<{ cause: string; variant: string }> {
  return [
    { cause: 'environment', variant: '0' },
    { cause: 'healthcare', variant: '1' },
    { cause: 'animal-welfare', variant: '2' },
    { cause: 'education', variant: '3' },
  ];
}

/**
 * Check if a cause has a variant mapping
 * 
 * @param causeSlug - Cause slug to check
 * @returns True if cause has a variant mapping
 */
export function hasCauseMapping(causeSlug: string): boolean {
  const mappings = getAllCauseMappings();
  return mappings.some(m => m.cause === causeSlug);
}
