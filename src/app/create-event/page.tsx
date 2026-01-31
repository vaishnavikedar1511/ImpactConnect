/**
 * Create Event Page
 * Allows users to submit events for admin review
 * Content fetched from Contentstack (with fallback defaults)
 */

import type { Metadata } from 'next';
import { getCreateEventPageContent } from '@/lib/contentstack';
import { CreateEventForm } from '@/components/events';

export const metadata: Metadata = {
  title: 'Create Event | ImpactConnect',
  description: 'Submit your event for review. Once approved, it will be visible to the community.',
};

export default async function CreateEventPage() {
  const content = await getCreateEventPageContent();
  
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <CreateEventForm content={content} />
      </div>
    </main>
  );
}
