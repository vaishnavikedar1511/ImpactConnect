/**
 * Revalidation Webhook API
 * Handles Contentstack publish/update/unpublish events
 * Triggers on-demand ISR revalidation for affected pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Contentstack webhook payload structure
 */
interface ContentstackWebhookPayload {
  event: string;
  module: string;
  api_key: string;
  data: {
    entry?: {
      uid: string;
      title?: string;
      slug?: string;
      locale?: string;
      _content_type_uid?: string;
    };
    content_type?: {
      uid: string;
      title: string;
    };
    asset?: {
      uid: string;
      filename: string;
    };
  };
}

/**
 * Content type to path mapping
 */
const CONTENT_TYPE_PATHS: Record<string, (slug?: string) => string[]> = {
  opportunity: (slug) => [
    '/opportunities',
    slug ? `/opportunities/${slug}` : '',
    '/', // Home page shows featured opportunities
  ].filter(Boolean),
  
  organizer: (slug) => [
    slug ? `/organizers/${slug}` : '',
    '/opportunities', // Organizer info shown on cards
  ].filter(Boolean),
  
  cause: (slug) => [
    slug ? `/causes/${slug}` : '',
    '/opportunities', // Cause filters
  ].filter(Boolean),
  
  location: () => [
    '/opportunities', // Location filters
  ],
};

/**
 * Event types we handle
 */
const HANDLED_EVENTS = [
  'entry.publish',
  'entry.update',
  'entry.unpublish',
  'entry.delete',
];

/**
 * Validate webhook secret (optional, recommended for production)
 */
function validateWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.CONTENTSTACK_WEBHOOK_SECRET;
  
  // If no secret configured, skip validation (dev mode)
  if (!secret) {
    console.warn('[Revalidate] No webhook secret configured, skipping validation');
    return true;
  }

  const providedSecret = request.headers.get('x-webhook-secret');
  return providedSecret === secret;
}

/**
 * Parse content type from event data
 */
function getContentType(payload: ContentstackWebhookPayload): string | null {
  return (
    payload.data?.entry?._content_type_uid ||
    payload.data?.content_type?.uid ||
    null
  );
}

/**
 * Get slug from entry data
 */
function getSlug(payload: ContentstackWebhookPayload): string | undefined {
  return payload.data?.entry?.slug;
}

/**
 * Revalidate paths for a content type
 */
async function revalidateForContentType(
  contentType: string,
  slug?: string
): Promise<{ paths: string[]; success: boolean }> {
  const pathGenerator = CONTENT_TYPE_PATHS[contentType];
  
  if (!pathGenerator) {
    console.log(`[Revalidate] Unknown content type: ${contentType}`);
    return { paths: [], success: true };
  }

  const paths = pathGenerator(slug);
  const results: boolean[] = [];

  for (const path of paths) {
    try {
      revalidatePath(path);
      console.log(`[Revalidate] Revalidated path: ${path}`);
      results.push(true);
    } catch (error) {
      console.error(`[Revalidate] Failed to revalidate path: ${path}`, error);
      results.push(false);
    }
  }

  return {
    paths,
    success: results.every(Boolean),
  };
}

/**
 * POST /api/revalidate
 * Handle Contentstack webhook
 */
export async function POST(request: NextRequest) {
  // Validate webhook secret
  if (!validateWebhookSecret(request)) {
    console.warn('[Revalidate] Invalid webhook secret');
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const payload: ContentstackWebhookPayload = await request.json();
    const { event, module: module_ } = payload;

    console.log('[Revalidate] Received webhook:', {
      event,
      module: module_,
      entryUid: payload.data?.entry?.uid,
      contentType: getContentType(payload),
    });

    // Only handle entry events
    if (!HANDLED_EVENTS.includes(event)) {
      console.log(`[Revalidate] Ignoring event: ${event}`);
      return NextResponse.json({
        success: true,
        message: 'Event ignored',
        event,
      });
    }

    const contentType = getContentType(payload);
    if (!contentType) {
      console.log('[Revalidate] No content type found in payload');
      return NextResponse.json({
        success: true,
        message: 'No content type to revalidate',
      });
    }

    const slug = getSlug(payload);
    const result = await revalidateForContentType(contentType, slug);

    // Also revalidate by tag if available
    try {
      if (slug) {
        revalidateTag(`${contentType}:${slug}`);
      }
      revalidateTag(`${contentType}s`); // Plural for list pages
    } catch (error) {
      console.error('[Revalidate] Tag revalidation error:', error);
    }

    return NextResponse.json({
      success: result.success,
      message: 'Revalidation complete',
      event,
      contentType,
      slug,
      revalidatedPaths: result.paths,
    });
  } catch (error) {
    console.error('[Revalidate] Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate
 * Manual revalidation endpoint (for debugging)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const contentType = searchParams.get('type');
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  // Validate secret for manual revalidation
  const expectedSecret = process.env.REVALIDATION_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, message: 'Invalid secret' },
      { status: 401 }
    );
  }

  if (path) {
    try {
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        message: `Revalidated: ${path}`,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Revalidation failed' },
        { status: 500 }
      );
    }
  }

  if (contentType) {
    const result = await revalidateForContentType(contentType, slug || undefined);
    return NextResponse.json({
      success: result.success,
      message: 'Revalidation complete',
      revalidatedPaths: result.paths,
    });
  }

  return NextResponse.json({
    success: false,
    message: 'Provide ?path= or ?type= parameter',
  });
}
