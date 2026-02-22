'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AnnouncementBannerContent } from '@/lib/contentstack';
import {
  ANNOUNCEMENT_BANNER_ENTRY_UID,
  getCauseVariantUID,
} from '@/lib/contentstack/cause-variant-mapping';
import { personalizeService } from '@/lib/contentstack/personalize-service';
import { usePersonalize } from '@/components/context/PersonalizeContext';
import { getPrimaryCause } from '@/lib/user/storage';
import styles from './AnnouncementBanner.module.css';

/** Cause_experience Short UID (same as landing/carousel) */
const CAUSE_EXPERIENCE_SHORT_UID = 'a';

interface AnnouncementBannerProps {
  content: AnnouncementBannerContent;
}

export function AnnouncementBanner({ content }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<AnnouncementBannerContent | null>(null);
  const personalizeSDK = usePersonalize();

  // Fetch personalized content by cause (Cause_experience)
  useEffect(() => {
    const fetchPersonalizedContent = async () => {
      if (!personalizeSDK) return;
      if (!personalizeService.isInitialized()) {
        await personalizeService['ensureInitialized']();
      }

      const primaryCause = getPrimaryCause();
      if (!primaryCause) return;

      // Use same variant UIDs as landing page (Cause_experience) so personalized fetch runs
      const variantUID = getCauseVariantUID(primaryCause);
      if (!variantUID) return;

      try {
        await personalizeService.setUserAttributes({ primaryCause });
        await personalizeService.triggerImpression(CAUSE_EXPERIENCE_SHORT_UID);

        const response = await fetch('/api/personalize-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentTypeUid: 'announcement_banner',
            entryUid: ANNOUNCEMENT_BANNER_ENTRY_UID,
            variantUIDs: [variantUID],
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const personalized = result.content as AnnouncementBannerContent;
          if (personalized?.message) {
            setPersonalizedContent({ ...content, ...personalized, message: personalized.message });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch personalized content:', response.status, errorData);
        }
      } catch (error) {
        console.error('Failed to load personalized announcement banner:', error);
      }
    };

    fetchPersonalizedContent();

    const intervalId = setInterval(() => {
      const currentCause = getPrimaryCause();
      const lastCause = (window as any).__lastBannerCause;
      if (currentCause !== lastCause) {
        (window as any).__lastBannerCause = currentCause;
        if (currentCause) fetchPersonalizedContent();
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [personalizeSDK, content]);

  // Use personalized content if available, otherwise use default content
  const displayContent = personalizedContent || content;

  useEffect(() => {
    // Check if banner should be visible based on dates
    const now = new Date();
    const startDate = displayContent.start_date ? new Date(displayContent.start_date) : null;
    const endDate = displayContent.end_date ? new Date(displayContent.end_date) : null;

    const isWithinDateRange = 
      (!startDate || now >= startDate) && 
      (!endDate || now <= endDate);

    // Check if user has dismissed this banner (using message as key)
    const dismissedKey = `banner_dismissed_${btoa(displayContent.message || '').slice(0, 20)}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';

    setIsVisible(displayContent.enabled === true && isWithinDateRange && !wasDismissed);
  }, [displayContent]);

  const handleDismiss = () => {
    const dismissedKey = `banner_dismissed_${btoa(displayContent.message || '').slice(0, 20)}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  };

  if (!isVisible || dismissed || !displayContent.message) {
    return null;
  }

  const colorClass = styles[displayContent.background_color || 'info'] || styles.info;

  return (
    <div className={`${styles.banner} ${colorClass}`}>
      <div className={styles.content}>
        {displayContent.icon && <span className={styles.icon}>{displayContent.icon}</span>}
        <p className={styles.message}>
          {displayContent.message}
          {displayContent.link_text && displayContent.link_url && (
            <>
              {' '}
              <Link href={displayContent.link_url} className={styles.link}>
                {displayContent.link_text} →
              </Link>
            </>
          )}
        </p>
      </div>
      {displayContent.dismissible !== false && (
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
