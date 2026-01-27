/**
 * Event Carousel Component
 * 
 * Displays a slider with one large opportunity card at a time
 * Includes navigation arrows and dots indicator
 * Supports client-side personalization based on user registrations
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { OpportunitySummary } from '@/types';
import { getPrimaryCause } from '@/lib/user/storage';
import styles from './EventCarousel.module.css';

interface EventCarouselProps {
  title?: string;
  personalizedTitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: {
    url: string;
    title?: string;
  };
  events: OpportunitySummary[]; // Fallback SSR events
}

export function EventCarousel({
  title = 'Discover Opportunities Near You',
  personalizedTitle = 'Recommended For You',
  ctaText = 'Discover More',
  ctaLink = '/opportunities',
  backgroundImage,
  events: initialEvents,
}: EventCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState<OpportunitySummary[]>(initialEvents);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // State for personalized content from landing page variants
  const [carouselTitle, setCarouselTitle] = useState(title);
  const [carouselPersonalizedTitle, setCarouselPersonalizedTitle] = useState(personalizedTitle);
  const [carouselCtaText, setCarouselCtaText] = useState(ctaText);
  const [carouselCtaLink, setCarouselCtaLink] = useState(ctaLink);
  
  // State for animated smoke effect color
  const [effectColor, setEffectColor] = useState('#a855f7'); // Default purple

  // Fetch personalized landing page content and events on mount
  useEffect(() => {
    const fetchPersonalizedContent = async () => {
      try {
        // Get user's primary cause from registrations
        const primaryCause = getPrimaryCause();
        
        if (primaryCause) {
          console.log('[Carousel] Primary cause detected:', primaryCause);
          
          // Fetch personalized landing page content (titles, CTA, etc.)
          const landingResponse = await fetch(`/api/personalized-landing?primaryCause=${primaryCause}`);
          
          if (landingResponse.ok) {
            const landingData = await landingResponse.json();
            
            if (landingData.personalized && landingData.carousel) {
              console.log('[Carousel] Using personalized landing page content');
              setCarouselTitle(landingData.carousel.title || title);
              setCarouselPersonalizedTitle(landingData.carousel.personalizedTitle || personalizedTitle);
              setCarouselCtaText(landingData.carousel.ctaText || ctaText);
              setCarouselCtaLink(landingData.carousel.ctaLink || ctaLink);
            }
          }
          
          // Fetch personalized opportunities filtered by cause
          const eventsResponse = await fetch(`/api/carousel-events?cause=${primaryCause}`);
          
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            if (eventsData.events && eventsData.events.length > 0) {
              setEvents(eventsData.events);
              setIsPersonalized(true);
              console.log('[Carousel] Showing personalized events for:', primaryCause);
            }
          }
        } else {
          console.log('[Carousel] No primary cause, using default content');
        }
      } catch (error) {
        console.error('[Carousel] Failed to fetch personalized content:', error);
        // Keep using initial props on error
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedContent();
  }, [title, personalizedTitle, ctaText, ctaLink]);

  // Set smoke effect color based on primaryCause
  useEffect(() => {
    const fetchCauseColor = async () => {
      const primaryCause = getPrimaryCause();
      
      if (!primaryCause) {
        setEffectColor('#a855f7'); // Purple for base variant
        console.log('[Carousel] Using default purple smoke effect');
        return;
      }

      try {
        const response = await fetch('/api/causes');
        
        if (response.ok) {
          const causes = await response.json();
          const cause = causes.find((c: any) => c.slug === primaryCause);
          
          if (cause?.color) {
            setEffectColor(cause.color);
            console.log('[Carousel] Smoke effect color set to:', cause.color, 'for cause:', primaryCause);
          } else {
            setEffectColor('#a855f7');
          }
        }
      } catch (error) {
        console.error('[Carousel] Failed to fetch cause color:', error);
        setEffectColor('#a855f7');
      }
    };

    fetchCauseColor();
  }, [isPersonalized]); // Re-run when personalization changes

  // Auto-play effect when hovering
  useEffect(() => {
    // Only auto-play if hovering and there's more than 1 event
    if (isHovering && events.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
      }, 1000); // Change every 0.7 seconds (fast but readable)
    }

    // Cleanup: clear interval when not hovering or component unmounts
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isHovering, events.length]);

  // Don't render if no events
  if (events.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <section
      className={styles.carouselSection}
      style={{
        '--smoke-color': effectColor,
        ...(backgroundImage?.url && {
          backgroundImage: `url(${backgroundImage.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
      } as React.CSSProperties}
    >
      <div className={styles.carouselContainer}>
        {/* Header with title and CTA inline */}
        <div className={styles.carouselHeader}>
          <h2 className={styles.carouselTitle}>
            {isPersonalized ? carouselPersonalizedTitle : carouselTitle}
          </h2>
          <Link href={carouselCtaLink} className={styles.headerCta}>
            {carouselCtaText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel Slider */}
        <div 
          className={styles.carouselSlider}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Previous Arrow */}
          {events.length > 1 && (
            <button
              className={`${styles.arrowButton} ${styles.arrowPrev}`}
              onClick={handlePrevious}
              aria-label="Previous event"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Slider Wrapper */}
          <div className={styles.sliderWrapper}>
            <div 
              className={styles.sliderTrack}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {events.map((event, index) => (
                <div key={index} className={styles.slideItem}>
                  <Link
                    href={`/opportunities/${event.slug}`}
                    className={styles.eventCard}
                  >
                    {/* Event Image with Title Overlay */}
                    {event.coverImage?.url ? (
                      <div className={styles.eventImageWrapper}>
                        <Image
                          src={event.coverImage.url}
                          alt={event.title}
                          fill
                          className={styles.eventImage}
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 88vw, 1100px"
                          priority={index === 0}
                        />
                        {/* Title Overlay */}
                        <div className={styles.eventOverlay}>
                          <h3 className={styles.eventTitle}>{event.title}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.eventImagePlaceholder}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        {/* Title Overlay */}
                        <div className={styles.eventOverlay}>
                          <h3 className={styles.eventTitle}>{event.title}</h3>
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          {events.length > 1 && (
            <button
              className={`${styles.arrowButton} ${styles.arrowNext}`}
              onClick={handleNext}
              aria-label="Next event"
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Dots Indicator */}
        {events.length > 1 && (
          <div className={styles.dotsContainer}>
            {events.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === currentIndex ? styles.dotActive : ''
                }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
