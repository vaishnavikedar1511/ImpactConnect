/**
 * Personalized Hero Component Example
 * 
 * This is an example of how to use Contentstack Personalize
 * in a React component. Replace with your actual implementation.
 */

'use client';

import { useEffect, useState } from 'react';
import { getPersonalizedContent, getUserAttributesFromClient, type UserAttributes } from '@/lib/contentstack';
import Link from 'next/link';

interface PersonalizedHeroProps {
  /** Initial/default content */
  defaultContent?: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
}

export function PersonalizedHero({ defaultContent }: PersonalizedHeroProps) {
  const [content, setContent] = useState(defaultContent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user attributes from client-side storage
    const userAttributes = getUserAttributesFromClient();
    
    // Only personalize if we have user attributes
    if (Object.keys(userAttributes).length > 0) {
      setIsLoading(true);
      
      getPersonalizedContent('landing_page', userAttributes)
        .then((personalizedContent: any) => {
          if (personalizedContent?.hero_title) {
            setContent({
              title: personalizedContent.hero_title,
              subtitle: personalizedContent.hero_subtitle || '',
              ctaText: personalizedContent.hero_cta_text || 'Discover Opportunities',
              ctaLink: personalizedContent.hero_cta_link || '/opportunities',
            });
          }
        })
        .catch((error) => {
          console.error('Failed to load personalized content:', error);
          // Keep default content on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  if (!content) return null;

  return (
    <section className="hero">
      {isLoading && <div className="loading-indicator">Loading personalized content...</div>}
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
      <Link href={content.ctaLink} className="cta-button">
        {content.ctaText}
      </Link>
    </section>
  );
}
