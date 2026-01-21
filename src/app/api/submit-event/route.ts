/**
 * Submit Event API Route
 * Sends event data to Contentstack Automate webhook for admin approval
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Event submission request body
 */
interface EventSubmission {
  title: string;
  summary: string;
  description: string;
  // Cover Image
  coverImageUid?: string;
  coverImageUrl?: string;
  // Location
  country: string;
  state: string;
  city: string;
  address: string;
  isVirtual: boolean;
  // Categories
  contributionTypes: string[];
  causes: string[];
  // Date & Time
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  // Organizer
  organizerEmail: string;
  organizerName?: string;
  // Other
  spotsAvailable?: number;
  requirements?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitize string input
 */
function sanitize(value: string | undefined): string {
  if (!value) return '';
  return value.trim().slice(0, 1000);
}

/**
 * Generate a unique submission ID
 */
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `EVT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36);
}

/**
 * POST /api/submit-event
 * Sends event data to Contentstack Automate for approval
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: EventSubmission;
    try {
      body = await request.json();
      console.log('[SubmitEvent] Received body:', {
        title: body.title,
        summaryLength: body.summary?.length,
        country: body.country,
        city: body.city,
        causes: body.causes,
        contributionTypes: body.contributionTypes,
        startDate: body.startDate,
        organizerEmail: body.organizerEmail,
        isVirtual: body.isVirtual,
      });
    } catch (e) {
      console.log('[SubmitEvent] JSON parse error:', e);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const errors: string[] = [];

    if (!body.title || body.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    }
    if (!body.summary || body.summary.length < 20) {
      errors.push('Summary must be at least 20 characters');
    }
    if (!body.organizerEmail || !isValidEmail(body.organizerEmail)) {
      errors.push('Valid organizer email is required');
    }
    if (!body.startDate) {
      errors.push('Start date is required');
    }
    // Location validation (not required for virtual events)
    if (!body.isVirtual) {
      if (!body.country) {
        errors.push('Country is required for non-virtual events');
      }
      if (!body.city) {
        errors.push('City is required for non-virtual events');
      }
    }
    if (!body.contributionTypes || body.contributionTypes.length === 0) {
      errors.push('At least one contribution type is required');
    }
    if (!body.causes || body.causes.length === 0) {
      errors.push('At least one cause is required');
    }

    if (errors.length > 0) {
      console.log('[SubmitEvent] Validation failed:', errors);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Generate IDs
    const submissionId = generateSubmissionId();
    const slug = generateSlug(body.title);

    // Get webhook URL from environment
    const webhookUrl = process.env.CONTENTSTACK_AUTOMATE_EVENT_WEBHOOK;

    if (!webhookUrl) {
      console.error('[SubmitEvent] CONTENTSTACK_AUTOMATE_EVENT_WEBHOOK not configured');
      return NextResponse.json(
        { success: false, error: 'Event submission is not configured' },
        { status: 500 }
      );
    }

    // Build formatted location string for email
    let formattedLocation = 'Virtual / Online';
    if (!body.isVirtual) {
      const locationParts = [
        sanitize(body.city),
        sanitize(body.state),
        sanitize(body.country),
      ].filter(Boolean);
      formattedLocation = locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
    }

    // Prepare payload for Automate (matches Opportunity content type)
    const payload = {
      submissionId,
      slug,
      title: sanitize(body.title),
      summary: sanitize(body.summary),
      description: sanitize(body.description),
      // Cover Image
      coverImageUid: body.coverImageUid || '',
      coverImageUrl: body.coverImageUrl || '',
      // Location fields (individual)
      country: sanitize(body.country),
      state: sanitize(body.state),
      city: sanitize(body.city),
      address: sanitize(body.address),
      isVirtual: body.isVirtual || false,
      // Formatted location for email
      location: formattedLocation,
      // Categories
      contributionTypes: body.contributionTypes,
      causeSlugs: body.causes,
      // Date & Time
      startDate: body.startDate,
      endDate: body.endDate || body.startDate,
      startTime: body.startTime || '',
      endTime: body.endTime || '',
      // Organizer
      organizerEmail: sanitize(body.organizerEmail).toLowerCase(),
      organizerName: sanitize(body.organizerName) || 'Community Member',
      // Other
      spotsAvailable: body.spotsAvailable || null,
      requirements: sanitize(body.requirements),
      // Metadata
      submittedAt: new Date().toISOString(),
    };

    // Encode event data for approval URLs
    const eventDataEncoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Add approval URLs with encoded data
    (payload as Record<string, unknown>).approveUrl = `${baseUrl}/api/approve-event?action=approve&data=${encodeURIComponent(eventDataEncoded)}`;
    (payload as Record<string, unknown>).rejectUrl = `${baseUrl}/api/approve-event?action=reject&data=${encodeURIComponent(eventDataEncoded)}`;

    console.log('[SubmitEvent] Sending to Automate:', {
      submissionId,
      title: payload.title,
      city: payload.city,
      country: payload.country,
      organizerEmail: payload.organizerEmail,
    });

    // Send to Contentstack Automate webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SubmitEvent] Automate webhook failed:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to submit event for review' },
        { status: 500 }
      );
    }

    console.log('[SubmitEvent] Successfully sent to Automate:', submissionId);

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Event submitted for review! You will receive an email once approved.',
      data: {
        submissionId,
        title: payload.title,
        organizerEmail: payload.organizerEmail,
        submittedAt: payload.submittedAt,
      },
    });

  } catch (error) {
    console.error('[SubmitEvent] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submit-event
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit an event.' },
    { status: 405 }
  );
}
