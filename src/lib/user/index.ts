/**
 * User Module Exports
 */

export {
  getUserEmail,
  setUserEmail,
  getUserName,
  setUserName,
  getRegistrations,
  addRegistration,
  getRegistrationsByEmail,
  isRegisteredForOpportunity,
  getCreatedEvents,
  addCreatedEvent,
  getCreatedEventsByEmail,
  updateEventStatus,
  clearUserData,
  getPrimaryCause,
  getUserCausesByFrequency,
} from './storage';

export type { Registration, CreatedEvent } from './storage';
