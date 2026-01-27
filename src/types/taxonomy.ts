/**
 * ImpactConnect - Taxonomy Types
 * Cause taxonomy for categorization
 */

import type { ImageAsset } from './common';

/**
 * Cause taxonomy - categories for social impact areas
 * Examples: Education, Healthcare, Environment, Animal Welfare, etc.
 */
export interface Cause {
  uid: string;
  name: string;
  slug: string;
  description?: string;
  icon?: ImageAsset;
  image?: ImageAsset;
  color?: string;
}

/**
 * Lightweight cause reference for nested relationships
 */
export interface CauseReference {
  uid: string;
  name: string;
  slug: string;
  color?: string;
}

/**
 * Predefined cause slugs for type-safe filtering
 */
export const CauseSlugs = {
  EDUCATION: 'education',
  HEALTHCARE: 'healthcare',
  ENVIRONMENT: 'environment',
  ANIMAL_WELFARE: 'animal-welfare',
} as const;

export type CauseSlug = (typeof CauseSlugs)[keyof typeof CauseSlugs];
