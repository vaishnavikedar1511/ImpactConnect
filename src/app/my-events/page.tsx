/**
 * My Events Page
 * 
 * Displays events the user has created/submitted
 * Content fetched from Contentstack (with fallback defaults)
 */

import { getMyEventsPageContent } from '@/lib/contentstack';
import { MyEventsClient } from './MyEventsClient';

export default async function MyEventsPage() {
  const content = await getMyEventsPageContent();
  
  return <MyEventsClient content={content} />;
}
