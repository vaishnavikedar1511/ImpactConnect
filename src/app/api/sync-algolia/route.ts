/**
 * Algolia Sync Webhook
 * 
 * This endpoint is called by Contentstack webhooks when entries are:
 * - Published
 * - Updated
 * - Unpublished/Deleted
 * 
 * It syncs the changes to Algolia in real-time.
 */

import { NextRequest, NextResponse } from 'next/server';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = 'impactconnect_events';
const WEBHOOK_SECRET = process.env.CONTENTSTACK_WEBHOOK_SECRET;
const WEBHOOK_USERNAME = process.env.CONTENTSTACK_WEBHOOK_USERNAME || 'algolia';
const WEBHOOK_PASSWORD = process.env.CONTENTSTACK_WEBHOOK_PASSWORD || 'sync2026';

// Transform Contentstack entry to Algolia record
function transformForAlgolia(entry: Record<string, unknown>) {
  const coverImage = entry.cover_image as { url?: string; title?: string } | undefined;
  
  return {
    objectID: entry.uid as string,
    title: (entry.title as string) || '',
    description: (entry.description as string) || '',
    summary: (entry.summary as string) || '',
    cause: ((entry.cause_slugs as string[]) || [])[0] || '',
    causes: (entry.cause_slugs as string[]) || [],
    tags: (entry.cause_slugs as string[]) || [],
    city: (entry.city as string) || '',
    state: (entry.state as string) || '',
    country: (entry.country as string) || '',
    slug: (entry.slug as string) || (entry.uid as string),
    cover_image: coverImage ? {
      url: coverImage.url,
      title: coverImage.title || (entry.title as string),
    } : null,
    event_date: (entry.start_date as string) || null,
    start_date: (entry.start_date as string) || null,
    end_date: (entry.end_date as string) || null,
    start_time: (entry.start_time as string) || null,
    end_time: (entry.end_time as string) || null,
    is_virtual: (entry.is_virtual as boolean) || false,
    contribution_types: (entry.contribution_types as string[]) || [],
    status: (entry.status as string) || 'upcoming',
    organizer_name: (entry.organizer_name as string) || '',
    spots_available: (entry.spots_available as number) || null,
    requirements: (entry.requirements as string) || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate Basic Auth
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      
      if (username !== WEBHOOK_USERNAME || password !== WEBHOOK_PASSWORD) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }
    
    // Validate webhook secret (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (WEBHOOK_SECRET && webhookSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Algolia configuration
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
      console.error('Algolia credentials not configured');
      return NextResponse.json(
        { error: 'Algolia not configured' },
        { status: 500 }
      );
    }

    const payload = await request.json();
    
    // Contentstack webhook payload structure
    const { event, data } = payload;
    const contentType = data?.content_type?.uid;
    const entry = data?.entry;

    // Only process opportunity entries
    if (contentType !== 'opportunity') {
      return NextResponse.json({ 
        message: 'Skipped - not an opportunity entry',
        contentType 
      });
    }

    console.log(`Processing Algolia sync: ${event} for ${entry?.uid}`);

    // Handle different event types
    if (event === 'publish' || event === 'entry.publish') {
      // Add or update record in Algolia
      const record = transformForAlgolia(entry);
      
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${record.objectID}`,
        {
          method: 'PUT',
          headers: {
            'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Algolia update failed: ${error}`);
      }

      const result = await response.json();
      console.log(`Synced to Algolia: ${entry.title} (${result.taskID})`);
      
      return NextResponse.json({
        success: true,
        action: 'upsert',
        objectID: record.objectID,
        taskID: result.taskID,
      });

    } else if (event === 'unpublish' || event === 'delete' || 
               event === 'entry.unpublish' || event === 'entry.delete') {
      // Remove record from Algolia
      const objectID = entry?.uid;
      
      if (!objectID) {
        return NextResponse.json({ error: 'No entry UID found' }, { status: 400 });
      }

      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${objectID}`,
        {
          method: 'DELETE',
          headers: {
            'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Algolia delete failed: ${error}`);
      }

      const result = await response.json();
      console.log(`Removed from Algolia: ${objectID} (${result.taskID})`);
      
      return NextResponse.json({
        success: true,
        action: 'delete',
        objectID,
        taskID: result.taskID,
      });

    } else {
      // Unknown event type
      return NextResponse.json({
        message: 'Event type not handled',
        event,
      });
    }

  } catch (error) {
    console.error('Algolia sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'Algolia sync webhook is active',
    index: ALGOLIA_INDEX_NAME,
    configured: !!(ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY),
  });
}
