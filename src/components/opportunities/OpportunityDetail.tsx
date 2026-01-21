/**
 * OpportunityDetail Component
 * Displays full opportunity information
 * Updated for simplified Opportunity model
 */

import Image from 'next/image';
import type { Opportunity } from '@/types';
import { ContributionTypeLabels, ContributionType } from '@/types';
import { formatDisplayDate, formatTime } from '@/lib/utils';
import { isPast } from '@/lib/utils/dates';
import styles from './OpportunityDetail.module.css';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onRegisterClick: () => void;
}

export function OpportunityDetail({ opportunity, onRegisterClick }: OpportunityDetailProps) {
  const {
    title,
    summary,
    description,
    coverImage,
    organizerName,
    organizerEmail,
    causeSlugs,
    contributionTypes,
    country,
    state,
    city,
    address,
    isVirtual,
    startDate,
    endDate,
    startTime,
    endTime,
    spotsAvailable,
    requirements,
    status,
  } = opportunity;

  const displayDate = formatDisplayDate(startDate);
  const displayEndDate = endDate ? formatDisplayDate(endDate) : null;
  const displayTime = startTime ? formatTime(startTime) : null;
  const displayEndTime = endTime ? formatTime(endTime) : null;
  const spotsLow = spotsAvailable !== undefined && spotsAvailable <= 5 && spotsAvailable > 0;
  const isFull = spotsAvailable === 0;
  
  // Check if opportunity is completed (by status or date)
  const eventDate = endDate || startDate;
  const isCompleted = status === 'completed' || status === 'cancelled' || (eventDate ? isPast(eventDate) : false);

  // Build location string
  const locationParts = [city, state, country].filter(Boolean);
  const locationString = isVirtual ? 'Virtual / Remote' : locationParts.join(', ') || 'Location TBD';

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          {coverImage ? (
            <>
              <Image
                src={coverImage.url}
                alt={coverImage.alt || title}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.heroOverlay} />
            </>
          ) : (
            <div className={styles.heroImagePlaceholder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className={styles.heroBadges}>
            {isVirtual && (
              <span className={`${styles.badge} ${styles.virtualBadge}`}>
                🌐 Virtual
              </span>
            )}
            {status === 'ongoing' && (
              <span className={`${styles.badge} ${styles.statusBadge}`}>
                Happening Now
              </span>
            )}
          </div>
        </div>

        {/* Header Content */}
        <div className={styles.heroContent}>
          <div className={styles.headerMeta}>
            {causeSlugs && causeSlugs.length > 0 && (
              <div className={styles.causes}>
                {causeSlugs.map((cause) => (
                  <span key={cause} className={styles.causeTag}>
                    {cause.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className={styles.title}>{title}</h1>

          {summary && <p className={styles.summary}>{summary}</p>}

          {/* Quick Info */}
          <div className={styles.quickInfo}>
            <div className={styles.infoItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span>
                {displayDate}
                {displayEndDate && displayEndDate !== displayDate && ` - ${displayEndDate}`}
              </span>
            </div>

            {displayTime && (
              <div className={styles.infoItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>
                  {displayTime}
                  {displayEndTime && ` - ${displayEndTime}`}
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>{locationString}</span>
            </div>

            {spotsAvailable !== undefined && (
              <div className={`${styles.infoItem} ${spotsLow ? styles.spotsLow : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <span>
                  {isFull ? 'No spots left' : `${spotsAvailable} spots available`}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Main Column */}
          <main className={styles.mainContent}>
            {/* Description */}
            {description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this Opportunity</h2>
                <div className={styles.description}>
                  {description.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Contribution Types */}
            {contributionTypes && contributionTypes.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>How You Can Contribute</h2>
                <div className={styles.contributionTypes}>
                  {contributionTypes.map((type) => (
                    <div key={type} className={styles.contributionType}>
                      <span className={styles.contributionIcon}>
                        {type === 'physical_effort' && '💪'}
                        {type === 'skills' && '🧠'}
                        {type === 'resources' && '🎁'}
                        {type === 'time' && '⏰'}
                      </span>
                      <span>{ContributionTypeLabels[type as ContributionType] || type}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {requirements && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Requirements</h2>
                <p className={styles.requirements}>{requirements}</p>
              </section>
            )}

            {/* Address Details */}
            {address && !isVirtual && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Venue Details</h2>
                <p>{address}</p>
                <p className={styles.locationText}>{locationString}</p>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Register Card */}
            <div className={styles.registerCard}>
              <h3 className={styles.registerTitle}>Ready to make an impact?</h3>
              
              <button
                onClick={onRegisterClick}
                className={styles.registerButton}
                disabled={isFull || isCompleted}
              >
                {isFull ? 'No Spots Available' : 
                 isCompleted ? 'Opportunity Ended' :
                 'Register Now'}
              </button>

              {spotsLow && !isFull && (
                <p className={styles.spotsWarning}>
                  ⚠️ Only {spotsAvailable} spots left!
                </p>
              )}
            </div>

            {/* Organizer Card */}
            {organizerName && (
              <div className={styles.organizerCard}>
                <div className={styles.organizerHeader}>
                  <div className={styles.organizerLogoPlaceholder}>
                    {organizerName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.organizerInfo}>
                    <h3 className={styles.organizerName}>{organizerName}</h3>
                    {organizerEmail && (
                      <a 
                        href={`mailto:${organizerEmail}`} 
                        className={styles.organizerEmail}
                      >
                        {organizerEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default OpportunityDetail;
