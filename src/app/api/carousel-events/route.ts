/**
 * API Route: Carousel Events
 * 
 * Fetches personalized events for the landing page carousel
 * Supports cause-based filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCarouselOpportunities } from '@/lib/contentstack/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cause = searchParams.get('cause');

    console.log('[Carousel API] Fetching events for cause:', cause || 'all');

    // Fetch opportunities (filtered by cause if provided)
    const events = await getCarouselOpportunities(cause || undefined);

    console.log('[Carousel API] Found events:', events.length);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[Carousel API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel events' },
      { status: 500 }
    );
  }
}
