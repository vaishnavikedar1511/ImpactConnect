import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Subscribe to City Notifications
 * Creates a newsletter_subscription entry in Contentstack
 */

export async function POST(request: NextRequest) {
  try {
    const { email, citySlug } = await request.json();

    // Validate inputs
    if (!email || !citySlug) {
      return NextResponse.json(
        { error: 'Email and city are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, ' ');

    // Create entry in Contentstack
    const createResponse = await fetch(
      `https://api.contentstack.io/v3/content_types/newsletter_subscription/entries`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.CONTENTSTACK_API_KEY!,
          'authorization': process.env.CONTENTSTACK_NEWSLETTER_TOKEN!,
        },
        body: JSON.stringify({
          entry: {
            title: `${email} - ${cityName}`,
            email,
            city: cityName,
            city_slug: citySlug,
            subscribed: true,
            subscribed_at: new Date().toISOString(),
          },
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error('[Subscribe] Contentstack create error:', createData);
      console.error('[Subscribe] Status:', createResponse.status);
      console.error('[Subscribe] Error code:', createData.error_code);
      console.error('[Subscribe] Error message:', createData.error_message);
      
      // Check SPECIFICALLY for duplicate entry errors (error code 119)
      if (createData.error_code === 119) {
        return NextResponse.json(
          { error: 'This email is already subscribed to this city' },
          { status: 409 }
        );
      }
      
      // For other errors, return the actual error message
      return NextResponse.json(
        { error: createData.error_message || 'Subscription failed. Please try again later.' },
        { status: createResponse.status }
      );
    }

    // Publish the entry
    const publishResponse = await fetch(
      `https://api.contentstack.io/v3/content_types/newsletter_subscription/entries/${createData.entry.uid}/publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.CONTENTSTACK_API_KEY!,
          'authorization': process.env.CONTENTSTACK_NEWSLETTER_TOKEN!,
        },
        body: JSON.stringify({
          entry: {
            environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'production'],
            locales: ['en-us'],
          },
        }),
      }
    );

    if (!publishResponse.ok) {
      const publishData = await publishResponse.json();
      console.error('[Subscribe] Contentstack publish error:', publishData);
      // Entry created but not published - that's okay, user is still subscribed
    }

    console.log(`[Subscribe] Success: ${email} subscribed to ${cityName}`);

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed to notifications'
    });

  } catch (error) {
    console.error('[Subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Subscription failed. Please try again later.' },
      { status: 500 }
    );
  }
}
