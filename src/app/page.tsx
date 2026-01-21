/**
 * Landing Page
 * 
 * Hero section with call-to-action to discover opportunities
 * Content fetched from Contentstack (with fallback defaults)
 */

import Link from 'next/link';
import { getLandingPageContent, parseLandingStats, parseLandingSteps, parseLandingCauses } from '@/lib/contentstack';
import { CauseIcon } from '@/components/ui/CauseIcon';
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
  const content = await getLandingPageContent();
  const titleParts = parseHeroTitle(content.hero_title);
  
  // Parse JSON fields
  const stats = parseLandingStats(content.stats_json);
  const steps = parseLandingSteps(content.steps_json);
  const causes = parseLandingCauses(content.causes_json);

  return (
    <div className={styles.landing}>
      {/* Hero Section */}
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
        <section 
          className={styles.causes}
          style={content.causes_background_image?.url ? {
            backgroundImage: `url(${content.causes_background_image.url})`,
          } : undefined}
        >
          <h2 className={styles.sectionTitle}>{content.causes_title}</h2>
          <div className={styles.causeGrid}>
            {causes.map((cause, index) => (
              <Link 
                key={index} 
                href={`/opportunities?causes=${cause.slug}`} 
                className={styles.causeCard}
              >
                <div className={styles.causeIcon}>
                  <CauseIcon causeSlug={cause.slug} />
                </div>
                <h3 className={styles.causeName}>{cause.name}</h3>
                <p className={styles.causeDesc}>{cause.description}</p>
              </Link>
            ))}
          </div>
        </section>
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
