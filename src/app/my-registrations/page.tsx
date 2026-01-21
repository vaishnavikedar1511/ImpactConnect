/**
 * My Registrations Page
 * 
 * Displays events the user has registered for (from localStorage)
 * Content fetched from Contentstack (with fallback defaults)
 */

import { getMyRegistrationsPageContent } from '@/lib/contentstack';
import { MyRegistrationsClient } from './MyRegistrationsClient';

export default async function MyRegistrationsPage() {
  const content = await getMyRegistrationsPageContent();
  
  return <MyRegistrationsClient content={content} />;
}
