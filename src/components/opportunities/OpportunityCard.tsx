/**
 * OpportunityCard Component
 * Displays a single opportunity in card format
 */

import Link from 'next/link';
import Image from 'next/image';
import type { OpportunitySummary } from '@/types';
import { ContributionTypeLabels } from '@/types';
import { formatDisplayDate, formatTime, getRelativeDateLabel } from '@/lib/utils';
import styles from './OpportunityCard.module.css';

interface OpportunityCardProps {
  opportunity: OpportunitySummary;
  priority?: boolean;
}

export function OpportunityCard({ opportunity, priority = false }: OpportunityCardProps) {
  const {
    slug,
    title,
    summary,
    coverImage,
    organizerName,
    causeSlugs,
    contributionTypes,
    country,
    state,
    city,
    isVirtual,
    startDate,
    startTime,
    spotsAvailable,
    status,
  } = opportunity;

  const relativeDate = startDate ? getRelativeDateLabel(startDate) : null;
  const displayDate = startDate ? formatDisplayDate(startDate) : 'Date TBD';
  const displayTime = startTime ? formatTime(startTime) : null;
  const spotsLow = spotsAvailable !== undefined && spotsAvailable <= 5 && spotsAvailable > 0;

  // Build location display string
  const locationDisplay = isVirtual 
    ? 'Online / Virtual' 
    : [city, state, country].filter(Boolean).join(', ') || 'Location TBD';

  return (
    <article
      className={`${styles.card} ${status === 'completed' ? styles.statusCompleted : ''}`}
      aria-label={`Opportunity: ${title}`}
    >
      {/* Cover Image */}
      <div className={styles.imageWrapper}>
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.coverImage}
            priority={priority}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.79 1.706-5.27" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {relativeDate && (
            <span className={`${styles.badge} ${styles.dateBadge}`}>
              {relativeDate}
            </span>
          )}
          {isVirtual && (
            <span className={`${styles.badge} ${styles.virtualBadge}`}>
              Virtual
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <header className={styles.header}>
          <h3 className={styles.title}>
            <Link href={`/opportunities/${slug}`} className={styles.titleLink}>
              {title}
            </Link>
          </h3>
          {summary && <p className={styles.summary}>{summary}</p>}
        </header>

        {/* Tags */}
        <div className={styles.tags}>
          {causeSlugs?.slice(0, 2).map((causeSlug) => (
            <span key={causeSlug} className={`${styles.tag} ${styles.causeTag}`}>
              {causeSlug.replace(/-/g, ' ')}
            </span>
          ))}
          {contributionTypes?.slice(0, 1).map((type) => (
            <span key={type} className={`${styles.tag} ${styles.contributionTag}`}>
              {ContributionTypeLabels[type]}
            </span>
          ))}
        </div>

        {/* Meta Info */}
        <div className={styles.meta}>
          {/* Date & Time */}
          <div className={styles.metaRow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
            </svg>
            <span>
              {displayDate}
              {displayTime && ` at ${displayTime}`}
            </span>
          </div>

          {/* Location */}
          <div className={styles.metaRow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>{locationDisplay}</span>
          </div>

          {/* Spots Available */}
          {spotsAvailable !== undefined && (
            <div className={`${styles.spots} ${spotsLow ? styles.spotsLow : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <span>
                {spotsAvailable === 0
                  ? 'No spots left'
                  : `${spotsAvailable} spot${spotsAvailable !== 1 ? 's' : ''} left`}
              </span>
            </div>
          )}
        </div>

        {/* Organizer */}
        {organizerName && (
          <div className={styles.organizer}>
            <div className={styles.organizerLogo} aria-hidden="true" />
            <span className={styles.organizerName}>by {organizerName}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default OpportunityCard;
