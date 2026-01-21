/**
 * Approve/Reject Event API Route
 * Called when admin clicks approve/reject link in email
 * - Approve: Creates entry via Management API, then notifies organizer
 * - Reject: Notifies organizer to update details
 */

import { NextRequest, NextResponse } from 'next/server';

interface EventData {
  submissionId?: string;
  title: string;
  slug: string;
  description?: string;
  summary?: string;
  coverImageUid?: string;
  coverImageUrl?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  isVirtual?: boolean;
  causeSlugs?: string[];
  contributionTypes?: string[];
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  organizerName?: string;
  organizerEmail: string;
  spotsAvailable?: number;
  requirements?: string;
}

/**
 * Create opportunity entry via Contentstack Management API
 */
async function createOpportunityEntry(eventData: EventData): Promise<{ success: boolean; uid?: string; error?: string }> {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

  if (!apiKey || !managementToken) {
    return { success: false, error: 'Missing API credentials' };
  }

  // Build entry data
  const entryData: { entry: Record<string, unknown> } = {
    entry: {
      title: eventData.title,
      slug: eventData.slug,
      summary: eventData.summary || '',
      description: eventData.description || '',
      status: 'upcoming',
      is_virtual: eventData.isVirtual || false,
      country: eventData.country || '',
      state: eventData.state || '',
      city: eventData.city || '',
      address: eventData.address || '',
      cause_slugs: eventData.causeSlugs || [],
      contribution_types: eventData.contributionTypes || [],
      start_date: eventData.startDate,
      end_date: eventData.endDate || eventData.startDate,
      start_time: eventData.startTime || '',
      end_time: eventData.endTime || '',
      organizer_name: eventData.organizerName || '',
      organizer_email: eventData.organizerEmail,
      spots_available: eventData.spotsAvailable || 50,
      requirements: eventData.requirements || '',
    },
  };

  // Add cover image if provided
  if (eventData.coverImageUid) {
    entryData.entry.cover_image = eventData.coverImageUid;
  }

  console.log('[ApproveEvent] Creating entry:', JSON.stringify(entryData, null, 2));

  try {
    // Create entry
    const createResponse = await fetch(
      'https://api.contentstack.io/v3/content_types/opportunity/entries?locale=en-us',
      {
        method: 'POST',
        headers: {
          'api_key': apiKey,
          'authorization': managementToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      }
    );

    const createResult = await createResponse.json();

    if (!createResponse.ok) {
      console.error('[ApproveEvent] Create failed:', createResult);
      return { success: false, error: createResult.error_message || 'Failed to create entry' };
    }

    const entryUid = createResult.entry?.uid;
    console.log('[ApproveEvent] Entry created:', entryUid);

    // Publish entry
    const publishResponse = await fetch(
      `https://api.contentstack.io/v3/content_types/opportunity/entries/${entryUid}/publish`,
      {
        method: 'POST',
        headers: {
          'api_key': apiKey,
          'authorization': managementToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry: {
            environments: ['production'],
            locales: ['en-us'],
          },
        }),
      }
    );

    if (!publishResponse.ok) {
      const publishResult = await publishResponse.json();
      console.error('[ApproveEvent] Publish failed:', publishResult);
      // Entry was created but not published - still return success
      return { success: true, uid: entryUid };
    }

    console.log('[ApproveEvent] Entry published successfully');
    return { success: true, uid: entryUid };

  } catch (error) {
    console.error('[ApproveEvent] API error:', error);
    return { success: false, error: 'API request failed' };
  }
}

/**
 * Send notification email via Automate webhook
 */
async function sendNotificationEmail(
  webhookUrl: string,
  eventData: EventData,
  action: 'approve' | 'reject'
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        title: eventData.title,
        organizerName: eventData.organizerName || 'Organizer',
        organizerEmail: eventData.organizerEmail,
        startDate: eventData.startDate,
        city: eventData.city,
        state: eventData.state,
        country: eventData.country,
        isVirtual: eventData.isVirtual,
        processedAt: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[ApproveEvent] Webhook error:', error);
    return false;
  }
}

/**
 * GET /api/approve-event?action=approve|reject&data=base64EncodedEventData
 * Handles admin approval/rejection of event submissions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as 'approve' | 'reject' | null;
    const encodedData = searchParams.get('data');

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return new NextResponse(
        generateHtmlResponse('Error', 'Invalid action. Must be approve or reject.', 'error'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Validate and decode event data
    if (!encodedData) {
      return new NextResponse(
        generateHtmlResponse('Error', 'Missing event data', 'error'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    let eventData: EventData;
    try {
      const decodedData = Buffer.from(decodeURIComponent(encodedData), 'base64').toString('utf-8');
      eventData = JSON.parse(decodedData);
    } catch {
      return new NextResponse(
        generateHtmlResponse('Error', 'Invalid event data', 'error'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    console.log('[ApproveEvent] Processing:', {
      action,
      title: eventData.title,
      organizerEmail: eventData.organizerEmail,
    });

    if (action === 'approve') {
      // Create and publish entry
      const result = await createOpportunityEntry(eventData);

      if (!result.success) {
        return new NextResponse(
          generateHtmlResponse('Error', `Failed to create event: ${result.error}`, 'error'),
          { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Send approval notification email
      const approveWebhook = process.env.CONTENTSTACK_AUTOMATE_APPROVE_WEBHOOK;
      if (approveWebhook) {
        await sendNotificationEmail(approveWebhook, eventData, 'approve');
      }

      return new NextResponse(
        generateHtmlResponse(
          '✅ Event Approved',
          `The event "${eventData.title}" has been approved and published! The organizer will be notified.`,
          'success'
        ),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );

    } else {
      // Reject: Just send notification email
      const rejectWebhook = process.env.CONTENTSTACK_AUTOMATE_REJECT_WEBHOOK;
      
      if (rejectWebhook) {
        await sendNotificationEmail(rejectWebhook, eventData, 'reject');
      }

      return new NextResponse(
        generateHtmlResponse(
          '❌ Event Rejected',
          `The event "${eventData.title}" has been rejected. The organizer will be notified to update the details.`,
          'warning'
        ),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

  } catch (error) {
    console.error('[ApproveEvent] Unexpected error:', error);
    return new NextResponse(
      generateHtmlResponse('Error', 'An unexpected error occurred.', 'error'),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Generate HTML response page
 */
function generateHtmlResponse(title: string, message: string, type: 'success' | 'warning' | 'error'): string {
  const colors = {
    success: { bg: '#10b981', light: '#d1fae5' },
    warning: { bg: '#f59e0b', light: '#fef3c7' },
    error: { bg: '#ef4444', light: '#fee2e2' },
  };

  const color = colors[type];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - ImpactConnect</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: ${color.bg};
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 24px; }
    .content {
      padding: 30px;
      text-align: center;
    }
    .content p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: ${color.bg};
      color: white;
      text-decoration: none;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p>${message}</p>
      <a href="/opportunities" class="button">Browse Opportunities</a>
    </div>
  </div>
</body>
</html>
  `;
}
