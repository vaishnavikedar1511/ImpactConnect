/**
 * API Route: Personalized Landing Page
 * 
 * Fetches landing page content personalized by user's primary cause
 * Uses Contentstack Personalize Experience 'a' (Cause_experience)
 * Uses variant UID header method (same as AnnouncementBanner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContentstackConfig } from '@/lib/contentstack/config';
import { getCauseVariantUID, LANDING_PAGE_ENTRY_UID } from '@/lib/contentstack/cause-variant-mapping';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const primaryCause = searchParams.get('primaryCause');
    
    console.log('[Personalized Landing API] Primary cause:', primaryCause);
    
    if (!primaryCause) {
      return NextResponse.json(
        { personalized: false, message: 'No primary cause provided' },
        { status: 400 }
      );
    }

    // Get full variant UID for the cause
    const variantUID = getCauseVariantUID(primaryCause);
    
    if (!variantUID) {
      console.warn('[Personalized Landing API] No variant UID found for cause:', primaryCause);
      return NextResponse.json(
        { personalized: false, message: `No variant mapping for cause: ${primaryCause}` },
        { status: 400 }
      );
    }
    
    console.log('[Personalized Landing API] Cause:', primaryCause, '→ Variant UID:', variantUID);

    const config = getContentstackConfig();
    
    // Build Contentstack API URL for landing page
    const baseUrl = config.region === 'eu' 
      ? 'https://eu-cdn.contentstack.io'
      : config.region === 'azure-na'
      ? 'https://azure-na-cdn.contentstack.io'
      : config.region === 'azure-eu'
      ? 'https://azure-eu-cdn.contentstack.io'
      : 'https://cdn.contentstack.io';
    
    // Use specific entry UID for landing page
    const url = new URL(`${baseUrl}/v3/content_types/landing_page/entries/${LANDING_PAGE_ENTRY_UID}`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('locale', 'en-us');
    url.searchParams.append('include_fallback', 'true');
    
    console.log('[Personalized Landing API] Fetching from:', url.toString());
    console.log('[Personalized Landing API] Using x-cs-variant-uid header:', variantUID);
    
    // Use x-cs-variant-uid header method (same as AnnouncementBanner)
    const response = await fetch(url.toString(), {
      headers: {
        'api_key': config.apiKey,
        'access_token': config.deliveryToken,
        'x-cs-variant-uid': variantUID, // Variant UID in header
      },
      cache: 'no-store', // Don't cache personalized content
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Personalized Landing API] Error response:', errorText);
      throw new Error(`Failed to fetch landing page: ${response.status}`);
    }
    
    const data = await response.json();
    const landingPage = data.entry;
    
    if (!landingPage) {
      console.warn('[Personalized Landing API] No landing page entry found');
      return NextResponse.json({
        personalized: false,
        message: 'No landing page entry found'
      });
    }
    
    console.log('[Personalized Landing API] ✅ Success! Retrieved personalized landing page');
    console.log('[Personalized Landing API] Hero title:', landingPage.hero_title);
    console.log('[Personalized Landing API] Carousel title:', landingPage.event_carousel_title);
    
    // Extract carousel-specific fields
    const carouselData = {
      title: landingPage.event_carousel_title || 'Discover Opportunities Near You',
      personalizedTitle: landingPage.event_carousel_personalized_title || 'Recommended For You',
      ctaText: landingPage.event_carousel_cta_text || 'Discover More',
      ctaLink: landingPage.event_carousel_cta_link || '/opportunities',
    };
    
    return NextResponse.json({
      personalized: true,
      primaryCause,
      variantUID,
      carousel: carouselData,
      landingPage, // Include full landing page data for future use
    });
  } catch (error) {
    console.error('[Personalized Landing API] Error:', error);
    return NextResponse.json(
      { 
        personalized: false,
        error: 'Failed to fetch personalized landing page' 
      },
      { status: 500 }
    );
  }
}
