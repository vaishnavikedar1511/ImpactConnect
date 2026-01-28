'use client';

/**
 * My Events Client Component
 * Handles localStorage and API data, renders the page
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCreatedEvents, getUserEmail, type CreatedEvent } from '@/lib/user';
import { formatDisplayDate } from '@/lib/utils';
import type { MyEventsPageContent } from '@/lib/contentstack';
import styles from './my-events.module.css';

interface PublishedEvent {
  uid: string;
  title: string;
  slug: string;
  startDate: string;
  city: string;
  status: string;
}

interface Props {
  content: MyEventsPageContent;
}

export function MyEventsClient({ content }: Props) {
  const [pendingEvents, setPendingEvents] = useState<CreatedEvent[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    const email = getUserEmail();
    setUserEmail(email);
    
    // Get pending events from localStorage
    const localEvents = getCreatedEvents();
    const userLocalEvents = email 
      ? localEvents.filter(e => e.organizerEmail.toLowerCase() === email.toLowerCase())
      : localEvents;
    setPendingEvents(userLocalEvents);
    
    // Fetch published events from Contentstack if we have an email
    if (email) {
      fetchPublishedEvents(email);
    } else {
      setIsLoading(false);
      setShowEmailInput(true);
    }
  }, []);

  const fetchPublishedEvents = async (email: string) => {
    try {
      const response = await fetch(`/api/my-events?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setPublishedEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch published events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setUserEmail(emailInput.trim());
      setShowEmailInput(false);
      setIsLoading(true);
      fetchPublishedEvents(emailInput.trim());
    }
  };

  const handleDismissEvent = (eventId: string) => {
    // Remove from localStorage
    const allEvents = getCreatedEvents();
    const filtered = allEvents.filter(e => e.id !== eventId);
    localStorage.setItem('impactconnect_created_events', JSON.stringify(filtered));
    
    // Update state
    setPendingEvents(prev => prev.filter(e => e.id !== eventId));
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading your events...</div>
        </div>
      </div>
    );
  }

  const hasEvents = pendingEvents.length > 0 || publishedEvents.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{content.page_title}</h1>
            <p className={styles.subtitle}>
              {userEmail 
                ? `${content.page_subtitle} as ${userEmail}`
                : `${content.page_subtitle} on this device`
              }
            </p>
          </div>
          <Link href={content.create_cta_link || '/create-event'} className={styles.createButton}>
            + Create New Event
          </Link>
        </header>

        {/* Email Input for lookup */}
        {showEmailInput && (
          <div className={styles.emailSection}>
            <p className={styles.emailPrompt}>
              Enter your email to see all events you have created:
            </p>
            <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className={styles.emailInput}
                required
              />
              <button type="submit" className={styles.emailButton}>
                Find My Events
              </button>
            </form>
          </div>
        )}

        {!hasEvents ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>{content.empty_title}</h2>
            <p className={styles.emptyText}>{content.empty_message}</p>
            <Link href={content.create_cta_link || '/create-event'} className={styles.createEventButton}>
              {content.create_cta_text}
            </Link>
          </div>
        ) : (
          <div className={styles.eventSections}>
            {/* Pending Events */}
            {pendingEvents.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{content.pending_title}</h2>
                {content.pending_description && (
                  <p className={styles.sectionDescription}>{content.pending_description}</p>
                )}
                <div className={styles.eventList}>
                  {pendingEvents.map((event) => (
                    <div key={event.id} className={styles.eventCard}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <div className={styles.cardHeaderActions}>
                          <span className={`${styles.statusBadge} ${styles.pending}`}>
                            Pending
                          </span>
                          <button
                            onClick={() => handleDismissEvent(event.id)}
                            className={styles.dismissButton}
                            title="Remove from list"
                            aria-label="Dismiss event"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className={styles.cardDetails}>
                        <div className={styles.detailItem}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>Submitted {formatDisplayDate(event.submittedAt)}</span>
                        </div>
                      </div>
                      <p className={styles.pendingNote}>
                        This event is awaiting admin approval. You will receive an email once reviewed.
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Published Events */}
            {publishedEvents.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{content.published_title}</h2>
                {content.published_description && (
                  <p className={styles.sectionDescription}>{content.published_description}</p>
                )}
                <div className={styles.eventList}>
                  {publishedEvents.map((event) => (
                    <div key={event.uid} className={styles.eventCard}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <span className={`${styles.statusBadge} ${styles.published}`}>
                          Published
                        </span>
                      </div>
                      <div className={styles.cardDetails}>
                        <div className={styles.detailItem}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                          <span>{formatDisplayDate(event.startDate)}</span>
                        </div>
                        {event.city && (
                          <div className={styles.detailItem}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{event.city}</span>
                          </div>
                        )}
                      </div>
                      <Link 
                        href={`/opportunities/${event.slug}`}
                        className={styles.viewButton}
                      >
                        View Event
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
