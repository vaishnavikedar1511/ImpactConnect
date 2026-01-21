'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AnnouncementBannerContent } from '@/lib/contentstack';
import styles from './AnnouncementBanner.module.css';

interface AnnouncementBannerProps {
  content: AnnouncementBannerContent;
}

export function AnnouncementBanner({ content }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner should be visible based on dates
    const now = new Date();
    const startDate = content.start_date ? new Date(content.start_date) : null;
    const endDate = content.end_date ? new Date(content.end_date) : null;

    const isWithinDateRange = 
      (!startDate || now >= startDate) && 
      (!endDate || now <= endDate);

    // Check if user has dismissed this banner (using message as key)
    const dismissedKey = `banner_dismissed_${btoa(content.message || '').slice(0, 20)}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';

    setIsVisible(content.enabled === true && isWithinDateRange && !wasDismissed);
  }, [content]);

  const handleDismiss = () => {
    const dismissedKey = `banner_dismissed_${btoa(content.message || '').slice(0, 20)}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  };

  if (!isVisible || dismissed || !content.message) {
    return null;
  }

  const colorClass = styles[content.background_color || 'info'] || styles.info;

  return (
    <div className={`${styles.banner} ${colorClass}`}>
      <div className={styles.content}>
        {content.icon && <span className={styles.icon}>{content.icon}</span>}
        <p className={styles.message}>
          {content.message}
          {content.link_text && content.link_url && (
            <>
              {' '}
              <Link href={content.link_url} className={styles.link}>
                {content.link_text} →
              </Link>
            </>
          )}
        </p>
      </div>
      {content.dismissible !== false && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
