/**
 * Landing Page
 * 
 * Hero section with call-to-action to discover opportunities
 * Content fetched from Contentstack (with fallback defaults)
 */

import Link from 'next/link';
import Image from 'next/image';
import { getLandingPageContent, getNavbarContent, parseLandingStats, parseLandingSteps } from '@/lib/contentstack';
import { getAllCauses } from '@/lib/contentstack/taxonomies';
import { getCarouselOpportunities } from '@/lib/contentstack/events';
import { EventCarousel } from '@/components/events/EventCarousel';
import { CauseCardsSection } from '@/components/layout/CauseCardsSection';
import styles from './landing.module.css';

/**
 * Parse hero title to extract highlighted word
 * Format: "Make an {Impact} in Your Community"
 */
function parseHeroTitle(title: string): { before: string; highlight: string; after: string } {
  const match = title.match(/^(.*?)\{(.+?)\}(.*)$/);
  if (match) {
    return { before: match[1], highlight: match[2], after: match[3] };
  }
  return { before: title, highlight: '', after: '' };
}

export default async function LandingPage() {
  // Fetch landing page, navbar content, and causes
  const [content, navbarContent, causes] = await Promise.all([
    getLandingPageContent(),
    getNavbarContent(),
    getAllCauses(),
  ]);
  
  const titleParts = parseHeroTitle(content.hero_title);
  
  // Parse JSON fields
  const stats = parseLandingStats(content.stats_json);
  const steps = parseLandingSteps(content.steps_json);
  
  // Fetch carousel opportunities (filtered by cause if specified)
  const carouselEvents = await getCarouselOpportunities(
    content.event_carousel_cause_filter || undefined
  );

  return (
    <div className={styles.landing}>
      {/* Hero Section (with Logo & Brand on Image) */}
      <section 
        className={styles.hero}
        style={content.hero_background_image?.url ? {
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.7)), url(${content.hero_background_image.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        <div className={styles.heroContent}>
          {/* Logo & Brand on Hero Image */}
          <div className={styles.heroBrand}>
            <div className={styles.heroLogo}>
              {navbarContent.logo_url ? (
                <Image
                  src={navbarContent.logo_url}
                  alt="ImpactConnect Logo"
                  width={300}
                  height={300}
                  priority
                />
              ) : (
                <div className={styles.logoFallback}>
                  IC
                </div>
              )}
            </div>
            <div className={styles.brandNameWrapper}>
              <h2 className={styles.brandName}>
                {'ImpactConnect'.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={styles.letter}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </h2>
              <div className={styles.brandUnderline}></div>
            </div>
          </div>
          
          <h1 className={styles.heroTitle}>
            {titleParts.before}
            {titleParts.highlight && (
              <span className={styles.highlight}>{titleParts.highlight}</span>
            )}
            {titleParts.after}
          </h1>
          <p className={styles.heroSubtitle}>
            {content.hero_subtitle}
          </p>
          <div className={styles.heroCtas}>
            <Link href={content.primary_cta_link} className={styles.primaryCta}>
              {content.primary_cta_text}
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
            {content.secondary_cta_text && content.secondary_cta_link && (
              <Link href={content.secondary_cta_link} className={styles.secondaryCta}>
                {content.secondary_cta_text}
              </Link>
            )}
          </div>
        </div>
        
        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.stat}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Carousel */}
      <EventCarousel
        title={content.event_carousel_title}
        personalizedTitle={content.event_carousel_personalized_title}
        ctaText={content.event_carousel_cta_text}
        ctaLink={content.event_carousel_cta_link}
        backgroundImage={content.event_carousel_background_image}
        events={carouselEvents}
      />

      {/* How It Works */}
      {steps && steps.length > 0 && (
        <section className={styles.howItWorks}>
          <h2 className={styles.sectionTitle}>{content.how_it_works_title}</h2>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Causes */}
      {causes && causes.length > 0 && (
        <CauseCardsSection
          title={content.causes_title}
          causes={causes}
          backgroundImage={content.causes_background_image}
        />
      )}

      {/* CTA Section */}
      {content.cta_title && (
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>{content.cta_title}</h2>
          {content.cta_description && (
            <p className={styles.ctaDesc}>{content.cta_description}</p>
          )}
          {content.cta_button_text && content.cta_button_link && (
            <Link href={content.cta_button_link} className={styles.primaryCta}>
              {content.cta_button_text}
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
          )}
        </section>
      )}
    </div>
  );
}
