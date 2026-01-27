/**
 * User Storage Utilities
 * 
 * Manages user data in localStorage for tracking:
 * - User email
 * - Registrations
 * - Created events
 */

const STORAGE_KEYS = {
  USER_EMAIL: 'impactconnect_user_email',
  USER_NAME: 'impactconnect_user_name',
  REGISTRATIONS: 'impactconnect_registrations',
  CREATED_EVENTS: 'impactconnect_created_events',
} as const;

export interface Registration {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug: string;
  opportunityDate: string;
  opportunityLocation: string;
  causeSlugs?: string[]; // Causes associated with this opportunity
  registeredAt: string;
  name: string;
  email: string;
}

export interface CreatedEvent {
  id: string;
  title: string;
  slug?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  organizerEmail: string;
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user email from storage
 */
export function getUserEmail(): string | null {
  if (!isStorageAvailable()) return null;
  return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
}

/**
 * Set user email in storage
 */
export function setUserEmail(email: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email.toLowerCase().trim());
}

/**
 * Get user name from storage
 */
export function getUserName(): string | null {
  if (!isStorageAvailable()) return null;
  return localStorage.getItem(STORAGE_KEYS.USER_NAME);
}

/**
 * Set user name in storage
 */
export function setUserName(name: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
}

/**
 * Get all registrations from storage
 */
export function getRegistrations(): Registration[] {
  if (!isStorageAvailable()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new registration to storage
 */
export function addRegistration(registration: Omit<Registration, 'id' | 'registeredAt'>): Registration {
  if (!isStorageAvailable()) {
    throw new Error('Storage not available');
  }
  
  const registrations = getRegistrations();
  const newRegistration: Registration = {
    ...registration,
    id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    registeredAt: new Date().toISOString(),
  };
  
  registrations.push(newRegistration);
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  
  // Also save user info
  setUserEmail(registration.email);
  setUserName(registration.name);
  
  return newRegistration;
}

/**
 * Get registrations for a specific email
 */
export function getRegistrationsByEmail(email: string): Registration[] {
  const registrations = getRegistrations();
  return registrations.filter(r => r.email.toLowerCase() === email.toLowerCase());
}

/**
 * Check if user is registered for an opportunity
 */
export function isRegisteredForOpportunity(opportunityId: string): boolean {
  const email = getUserEmail();
  if (!email) return false;
  
  const registrations = getRegistrationsByEmail(email);
  return registrations.some(r => r.opportunityId === opportunityId);
}

/**
 * Get all created events from storage
 */
export function getCreatedEvents(): CreatedEvent[] {
  if (!isStorageAvailable()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CREATED_EVENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new created event to storage
 */
export function addCreatedEvent(event: Omit<CreatedEvent, 'submittedAt' | 'status'>): CreatedEvent {
  if (!isStorageAvailable()) {
    throw new Error('Storage not available');
  }
  
  const events = getCreatedEvents();
  const newEvent: CreatedEvent = {
    ...event,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  events.push(newEvent);
  localStorage.setItem(STORAGE_KEYS.CREATED_EVENTS, JSON.stringify(events));
  
  // Also save user email
  setUserEmail(event.organizerEmail);
  
  return newEvent;
}

/**
 * Get created events for a specific email
 */
export function getCreatedEventsByEmail(email: string): CreatedEvent[] {
  const events = getCreatedEvents();
  return events.filter(e => e.organizerEmail.toLowerCase() === email.toLowerCase());
}

/**
 * Update event status (when approved/rejected)
 */
export function updateEventStatus(eventId: string, status: CreatedEvent['status']): void {
  if (!isStorageAvailable()) return;
  
  const events = getCreatedEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index].status = status;
    localStorage.setItem(STORAGE_KEYS.CREATED_EVENTS, JSON.stringify(events));
  }
}

/**
 * Clear all user data
 */
export function clearUserData(): void {
  if (!isStorageAvailable()) return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Get primary cause from user's most recent registration
 * Returns the first cause from the most recently registered opportunity
 * 
 * @param email - User email (optional, uses current user if not provided)
 * @returns Primary cause slug or null if no registrations
 */
export function getPrimaryCause(email?: string): string | null {
  const registrations = email ? getRegistrationsByEmail(email) : getRegistrations();
  
  if (registrations.length === 0) {
    return null;
  }
  
  // Sort by registeredAt timestamp (most recent first)
  const sortedRegistrations = [...registrations].sort((a, b) => {
    return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
  });
  
  // Get the most recent registration
  const mostRecentRegistration = sortedRegistrations[0];
  
  // Return the first cause from that registration
  if (mostRecentRegistration.causeSlugs && mostRecentRegistration.causeSlugs.length > 0) {
    return mostRecentRegistration.causeSlugs[0];
  }
  
  return null;
}

/**
 * Get all causes user has registered for, sorted by frequency
 * 
 * @param email - User email (optional, uses current user if not provided)
 * @returns Array of cause slugs sorted by registration count (descending)
 */
export function getUserCausesByFrequency(email?: string): Array<{ causeSlug: string; count: number }> {
  const registrations = email ? getRegistrationsByEmail(email) : getRegistrations();
  
  if (registrations.length === 0) {
    return [];
  }
  
  // Count occurrences of each cause
  const causeCounts: Record<string, number> = {};
  
  registrations.forEach(reg => {
    if (reg.causeSlugs && reg.causeSlugs.length > 0) {
      reg.causeSlugs.forEach(causeSlug => {
        causeCounts[causeSlug] = (causeCounts[causeSlug] || 0) + 1;
      });
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(causeCounts)
    .map(([causeSlug, count]) => ({ causeSlug, count }))
    .sort((a, b) => b.count - a.count);
}
