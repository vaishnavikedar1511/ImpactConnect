/**
 * Email Types
 * Type definitions for email service
 */

/**
 * Registration email data sent to participant
 */
export interface ParticipantConfirmationEmail {
  type: 'participant_confirmation';
  recipient: {
    name: string;
    email: string;
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
  submittedAt: string;
}

/**
 * Registration notification sent to organizer
 */
export interface OrganizerNotificationEmail {
  type: 'organizer_notification';
  recipient: {
    name: string;
    email: string;
  };
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
  };
  registrationId: string;
  submittedAt: string;
}

/**
 * Union type for all email types
 */
export type EmailPayload = ParticipantConfirmationEmail | OrganizerNotificationEmail;

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Contentstack Automate webhook response
 */
export interface AutomateWebhookResponse {
  success: boolean;
  execution_id?: string;
  message?: string;
}
