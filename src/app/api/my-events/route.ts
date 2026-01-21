/**
 * My Events API Route
 * Fetches events from Contentstack by organizer email
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.CONTENTSTACK_API_KEY;
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production';

    if (!apiKey || !deliveryToken) {
      return NextResponse.json(
        { error: 'API not configured' },
        { status: 500 }
      );
    }

    // Query Contentstack for events by organizer email
    const query = JSON.stringify({
      organizer_email: email.toLowerCase(),
    });

    const url = `https://cdn.contentstack.io/v3/content_types/opportunity/entries?environment=${environment}&query=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error('[MyEvents] Contentstack error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const entries = data.entries || [];

    // Transform to simplified format
    const events = entries.map((entry: Record<string, unknown>) => ({
      uid: entry.uid,
      title: entry.title,
      slug: entry.slug || entry.uid,
      startDate: entry.start_date,
      city: entry.city,
      status: entry.status || 'upcoming',
    }));

    return NextResponse.json({ events });

  } catch (error) {
    console.error('[MyEvents] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
