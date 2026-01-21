/**
 * Email Service
 * Central export for email functionality
 */

export {
  sendParticipantConfirmation,
  sendOrganizerNotification,
  sendRegistrationEmails,
  isAutomateConfigured,
} from './contentstack-automate';

export type {
  EmailPayload,
  EmailResult,
  ParticipantConfirmationEmail,
  OrganizerNotificationEmail,
} from './types';
