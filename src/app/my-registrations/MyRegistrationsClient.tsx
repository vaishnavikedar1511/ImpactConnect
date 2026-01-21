'use client';

/**
 * My Registrations Client Component
 * Handles localStorage data and renders the page
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRegistrations, getUserEmail, type Registration } from '@/lib/user';
import { formatDisplayDate } from '@/lib/utils';
import type { MyRegistrationsPageContent } from '@/lib/contentstack';
import styles from './my-registrations.module.css';

interface Props {
  content: MyRegistrationsPageContent;
}

export function MyRegistrationsClient({ content }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from localStorage
    const email = getUserEmail();
    setUserEmail(email);
    
    const allRegistrations = getRegistrations();
    // Filter by user's email if available, otherwise show all
    const userRegistrations = email 
      ? allRegistrations.filter(r => r.email.toLowerCase() === email.toLowerCase())
      : allRegistrations;
    
    setRegistrations(userRegistrations);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{content.page_title}</h1>
          <p className={styles.subtitle}>
            {userEmail 
              ? `${content.page_subtitle} as ${userEmail}`
              : `${content.page_subtitle} on this device`
            }
          </p>
        </header>

        {registrations.length === 0 ? (
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
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>{content.empty_title}</h2>
            <p className={styles.emptyText}>{content.empty_message}</p>
            <Link href={content.browse_cta_link || '/opportunities'} className={styles.discoverButton}>
              {content.browse_cta_text}
            </Link>
          </div>
        ) : (
          <div className={styles.registrationList}>
            {registrations.map((registration) => (
              <div key={registration.id} className={styles.registrationCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.eventTitle}>{registration.opportunityTitle}</h3>
                  <span className={styles.registeredBadge}>Registered</span>
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
                    <span>{formatDisplayDate(registration.opportunityDate)}</span>
                  </div>
                  
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
                    <span>{registration.opportunityLocation}</span>
                  </div>
                  
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
                    <span>Registered {formatDisplayDate(registration.registeredAt)}</span>
                  </div>
                </div>

                {content.confirmation_message && (
                  <p className={styles.confirmationMessage}>{content.confirmation_message}</p>
                )}

                <Link 
                  href={`/opportunities/${registration.opportunitySlug}`}
                  className={styles.viewButton}
                >
                  View Event Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
