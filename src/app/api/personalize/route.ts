/**
 * Personalize API Route
 * 
 * Server-side endpoint for fetching personalized content
 * Use this when you need server-side personalization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedContent } from '@/lib/contentstack';
import type { UserAttributes } from '@/lib/contentstack/personalize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentTypeUid, userAttributes, entryUid } = body as {
      contentTypeUid: string;
      userAttributes?: UserAttributes;
      entryUid?: string;
    };

    if (!contentTypeUid) {
      return NextResponse.json(
        { error: 'contentTypeUid is required' },
        { status: 400 }
      );
    }

    const content = await getPersonalizedContent(
      contentTypeUid,
      userAttributes,
      { entryUid }
    );

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in personalize API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized content' },
      { status: 500 }
    );
  }
}
