/**
 * API Route for Fetching Personalized Content
 * 
 * Fetches content from Contentstack using variant UIDs (x-cs-variant-uid header method)
 * This is the recommended approach for personalization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContentstackConfig } from '@/lib/contentstack/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentTypeUid, entryUid, variantUIDs } = body as {
      contentTypeUid: string;
      entryUid?: string;
      variantUIDs?: string[]; // UIDs, not aliases
    };

    if (!contentTypeUid) {
      return NextResponse.json(
        { error: 'contentTypeUid is required' },
        { status: 400 }
      );
    }

    const config = getContentstackConfig();
    
    // Build API URL
    const baseUrl = config.region === 'eu' 
      ? 'https://eu-cdn.contentstack.io'
      : config.region === 'azure-na'
      ? 'https://azure-na-cdn.contentstack.io'
      : config.region === 'azure-eu'
      ? 'https://azure-eu-cdn.contentstack.io'
      : 'https://cdn.contentstack.io';
    
    const endpoint = entryUid
      ? `/v3/content_types/${contentTypeUid}/entries/${entryUid}`
      : `/v3/content_types/${contentTypeUid}/entries`;
    
    const url = new URL(`${baseUrl}${endpoint}`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('locale', 'en-us');
    url.searchParams.append('include_fallback', 'true');
    url.searchParams.append('include_publish_details', 'true');
      
    console.log('[Personalize Content API] Variant UIDs received:', variantUIDs);
    console.log('[Personalize Content API] Fetching URL:', url.toString());
    
    // Build headers with variant UIDs (x-cs-variant-uid header method)
    const headers: HeadersInit = {
      'api_key': config.apiKey,
      'access_token': config.deliveryToken,
    };

    // Add x-cs-variant-uid header if UIDs provided
    if (variantUIDs && variantUIDs.length > 0) {
      headers['x-cs-variant-uid'] = variantUIDs.join(',');
      console.log('[Personalize Content API] ✅ Using x-cs-variant-uid header:', headers['x-cs-variant-uid']);
    }
    
    const response = await fetch(url.toString(), {
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Personalize Content API] Error response:', errorText);
      throw new Error(`Failed to fetch personalized content: ${response.status}`);
    }
    
    const data = await response.json();
    const content = entryUid ? data.entry : data.entries?.[0] || data;
    
    console.log('[Personalize Content API] Message:', content?.message);
    console.log('[Personalize Content API] Full content keys:', Object.keys(content || {}));
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching personalized content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized content' },
      { status: 500 }
    );
  }
}
