/**
 * Registration API Route
 * Handles opportunity registration form submissions
 * Sends data to Automate webhook for confirmation email
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Registration request body
 */
interface RegistrationRequest {
  // Opportunity info
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug: string;
  opportunityDate?: string;
  opportunityTime?: string;
  opportunityLocation?: string;
  isVirtual?: boolean;
  
  // Organizer info
  organizerName: string;
  organizerEmail?: string;
  
  // Participant info
  name: string;
  email: string;
  phone?: string;
  message?: string;
  agreeToTerms: boolean;
}

/**
 * Validation error
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Generate unique registration ID
 */
function generateRegistrationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `REG-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format (basic)
 */
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Sanitize string input
 */
function sanitize(value: string | undefined): string {
  if (!value) return '';
  return value.trim().slice(0, 1000);
}

/**
 * Validate registration data
 */
function validateRegistration(data: Partial<RegistrationRequest>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.opportunityId) {
    errors.push({ field: 'opportunityId', message: 'Opportunity ID is required' });
  }

  if (!data.opportunityTitle) {
    errors.push({ field: 'opportunityTitle', message: 'Opportunity title is required' });
  }

  const name = sanitize(data.name);
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  const email = sanitize(data.email);
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  const phone = sanitize(data.phone);
  if (phone && !isValidPhone(phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!data.agreeToTerms) {
    errors.push({ field: 'agreeToTerms', message: 'You must agree to the terms' });
  }

  return errors;
}

/**
 * Format error response
 */
function errorResponse(
  message: string,
  errors: ValidationError[] = [],
  status = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    },
    { status }
  );
}

/**
 * POST /api/register
 * Handle registration form submission
 * Sends data to Automate webhook for confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: RegistrationRequest;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body');
    }

    // Validate the registration data
    const validationErrors = validateRegistration(body);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', validationErrors);
    }

    // Generate unique registration ID
    const registrationId = generateRegistrationId();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(body.name),
      email: sanitize(body.email).toLowerCase(),
      phone: sanitize(body.phone) || '',
      message: sanitize(body.message) || '',
    };

    // Location is either Virtual OR physical address (never empty)
    const isVirtual = body.isVirtual === true;
    const opportunityLocation = isVirtual 
      ? 'Virtual / Online' 
      : body.opportunityLocation;

    // Prepare webhook payload
    const webhookPayload = {
      // Registration info
      registrationId,
      registeredAt: new Date().toISOString(),
      
      // Participant info
      participantName: sanitizedData.name,
      participantEmail: sanitizedData.email,
      participantPhone: sanitizedData.phone,
      message: sanitizedData.message,
      
      // Opportunity info
      opportunityId: body.opportunityId,
      opportunityTitle: body.opportunityTitle,
      opportunitySlug: body.opportunitySlug,
      opportunityDate: body.opportunityDate || 'Date TBD',
      opportunityTime: body.opportunityTime || '',
      opportunityLocation: opportunityLocation,
      isVirtual: isVirtual,
      
      // Organizer info
      organizerName: body.organizerName || 'Organizer',
      organizerEmail: body.organizerEmail || '',
    };

    console.log('[Registration] Processing registration:', {
      registrationId,
      opportunityTitle: body.opportunityTitle,
      participantEmail: sanitizedData.email,
    });

    // Send to Automate webhook for confirmation email
    const webhookUrl = process.env.CONTENTSTACK_AUTOMATE_REGISTRATION_WEBHOOK;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          console.error('[Registration] Webhook failed:', await response.text());
        } else {
          console.log('[Registration] Webhook sent successfully');
        }
      } catch (webhookError) {
        console.error('[Registration] Webhook error:', webhookError);
        // Don't fail the registration if webhook fails
      }
    } else {
      console.warn('[Registration] CONTENTSTACK_AUTOMATE_REGISTRATION_WEBHOOK not configured');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully! A confirmation email will be sent shortly.',
      data: {
        registrationId,
        opportunityTitle: body.opportunityTitle,
        participantName: sanitizedData.name,
        participantEmail: sanitizedData.email,
        submittedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Registration] Unexpected error:', error);
    return errorResponse(
      'An unexpected error occurred. Please try again later.',
      [],
      500
    );
  }
}

/**
 * OPTIONS /api/register
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * GET /api/register
 * Return method not allowed
 */
export async function GET() {
  return errorResponse('Method not allowed. Use POST to submit registration.', [], 405);
}
