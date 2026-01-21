/**
 * Contentstack Automate Integration
 * Sends email notifications via Contentstack Automate webhooks
 */

import type {
  EmailPayload,
  EmailResult,
  AutomateWebhookResponse,
  ParticipantConfirmationEmail,
  OrganizerNotificationEmail,
} from './types';

/**
 * Contentstack Automate configuration
 */
interface AutomateConfig {
  participantWebhookUrl: string;
  organizerWebhookUrl: string;
  apiKey?: string;
}

/**
 * Get Automate configuration from environment
 */
function getAutomateConfig(): AutomateConfig {
  return {
    participantWebhookUrl: process.env.CONTENTSTACK_AUTOMATE_PARTICIPANT_WEBHOOK || '',
    organizerWebhookUrl: process.env.CONTENTSTACK_AUTOMATE_ORGANIZER_WEBHOOK || '',
    apiKey: process.env.CONTENTSTACK_AUTOMATE_API_KEY,
  };
}

/**
 * Check if Automate is configured
 */
export function isAutomateConfigured(): boolean {
  const config = getAutomateConfig();
  return !!(config.participantWebhookUrl || config.organizerWebhookUrl);
}

/**
 * Send webhook request to Contentstack Automate
 */
async function sendWebhook(
  webhookUrl: string,
  payload: EmailPayload,
  apiKey?: string
): Promise<EmailResult> {
  // If no webhook URL configured, log and return mock success
  if (!webhookUrl) {
    console.log('[Email Mock] Would send email:', JSON.stringify(payload, null, 2));
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        _metadata: {
          source: 'impactconnect',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Automate Webhook] Error response:', errorText);
      return {
        success: false,
        error: `Webhook failed with status ${response.status}`,
      };
    }

    const result = (await response.json()) as AutomateWebhookResponse;

    return {
      success: result.success !== false,
      messageId: result.execution_id,
    };
  } catch (error) {
    console.error('[Automate Webhook] Request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send confirmation email to participant
 */
export async function sendParticipantConfirmation(
  data: Omit<ParticipantConfirmationEmail, 'type'>
): Promise<EmailResult> {
  const config = getAutomateConfig();
  
  const payload: ParticipantConfirmationEmail = {
    type: 'participant_confirmation',
    ...data,
  };

  console.log(`[Email] Sending participant confirmation to ${data.recipient.email}`);
  
  return sendWebhook(config.participantWebhookUrl, payload, config.apiKey);
}

/**
 * Send notification email to organizer
 */
export async function sendOrganizerNotification(
  data: Omit<OrganizerNotificationEmail, 'type'>
): Promise<EmailResult> {
  const config = getAutomateConfig();
  
  const payload: OrganizerNotificationEmail = {
    type: 'organizer_notification',
    ...data,
  };

  console.log(`[Email] Sending organizer notification to ${data.recipient.email}`);
  
  return sendWebhook(config.organizerWebhookUrl, payload, config.apiKey);
}

/**
 * Send both participant confirmation and organizer notification
 */
export async function sendRegistrationEmails(params: {
  participant: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  opportunity: {
    id: string;
    title: string;
    slug: string;
    date: string;
    time?: string;
    location: string;
    isVirtual: boolean;
  };
  organizer: {
    name: string;
    email?: string;
  };
  registrationId: string;
}): Promise<{ participant: EmailResult; organizer: EmailResult | null }> {
  const { participant, opportunity, organizer, registrationId } = params;
  const submittedAt = new Date().toISOString();

  // Send participant confirmation
  const participantResult = await sendParticipantConfirmation({
    recipient: {
      name: participant.name,
      email: participant.email,
    },
    opportunity,
    organizer,
    registrationId,
    submittedAt,
  });

  // Send organizer notification if email is available
  let organizerResult: EmailResult | null = null;
  if (organizer.email) {
    organizerResult = await sendOrganizerNotification({
      recipient: {
        name: organizer.name,
        email: organizer.email,
      },
      participant,
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        slug: opportunity.slug,
        date: opportunity.date,
      },
      registrationId,
      submittedAt,
    });
  }

  return {
    participant: participantResult,
    organizer: organizerResult,
  };
}
