/**
 * Taxonomy Data Fetching
 * Functions for fetching Causes from Contentstack
 * Note: Location is no longer a separate content model - locations are extracted from Opportunity entries
 */

import type { Cause, CauseReference } from '@/types';
import { ContentTypes } from './config';
import { getEntries, getEntryByField } from './client';

/**
 * Raw Contentstack cause entry
 */
interface ContentstackCause {
  uid: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  icon?: {
    uid: string;
    url: string;
    title: string;
    filename: string;
    content_type: string;
  };
  color?: string;
}

/**
 * Transform Contentstack cause to Cause type
 */
function transformCause(entry: ContentstackCause): Cause {
  return {
    uid: entry.uid,
    name: entry.name,
    slug: entry.slug,
    icon: entry.icon
      ? {
          uid: entry.icon.uid,
          url: entry.icon.url,
          title: entry.icon.title,
          filename: entry.icon.filename,
          contentType: entry.icon.content_type,
        }
      : undefined,
    color: entry.color,
  };
}

/**
 * Fetch all causes
 */
export async function getAllCauses(): Promise<Cause[]> {
  const result = await getEntries<ContentstackCause>(ContentTypes.CAUSE, {
    limit: 100,
    orderBy: 'name',
    orderDirection: 'asc',
  });

  return result.entries.map(transformCause);
}

/**
 * Fetch cause by slug
 */
export async function getCauseBySlug(slug: string): Promise<Cause | null> {
  const entry = await getEntryByField<ContentstackCause>(
    ContentTypes.CAUSE,
    'slug',
    slug
  );

  if (!entry) return null;

  return transformCause(entry);
}

/**
 * Fetch causes as references (for filters)
 */
export async function getCauseReferences(): Promise<CauseReference[]> {
  const result = await getEntries<ContentstackCause>(ContentTypes.CAUSE, {
    limit: 100,
    only: { BASE: ['uid', 'name', 'slug'] },
    orderBy: 'name',
    orderDirection: 'asc',
  });

  return result.entries.map((entry) => ({
    uid: entry.uid,
    name: entry.name,
    slug: entry.slug,
  }));
}
