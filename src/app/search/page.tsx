/**
 * Search Page
 * 
 * Smart search interface with natural language query support.
 * Uses Algolia InstantSearch for fast, typo-tolerant search.
 */

import { Metadata } from 'next';
import { SearchPage } from '@/components/search';

export const metadata: Metadata = {
  title: 'Search Events | ImpactConnect',
  description: 'Search for volunteer opportunities, workshops, and community events. Find the perfect way to make an impact.',
};

export default function Search() {
  return <SearchPage />;
}
