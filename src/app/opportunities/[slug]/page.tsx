/**
 * Opportunity Detail Page
 * ISR with 10-minute revalidation
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOpportunityBySlug, getAllOpportunitySlugs, isOpportunityExpired } from '@/lib/contentstack';
import { OpportunityDetailClient } from '@/components/opportunities/OpportunityDetailClient';
import { RevalidationTimes } from '@/lib/config';

// ISR Configuration
export const revalidate = RevalidationTimes.DETAIL; // 10 minutes
export const dynamicParams = true; // Allow pages not generated at build time

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static paths for all opportunities
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllOpportunitySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);

  if (!opportunity) {
    return {
      title: 'Opportunity Not Found | ImpactConnect',
    };
  }

  const description = opportunity.summary || `Join ${opportunity.title} and make an impact.`;

  return {
    title: `${opportunity.title} | ImpactConnect`,
    description,
    openGraph: {
      title: opportunity.title,
      description,
      type: 'article',
      images: opportunity.coverImage
        ? [
            {
              url: opportunity.coverImage.url,
              width: opportunity.coverImage.width || 1200,
              height: opportunity.coverImage.height || 630,
              alt: opportunity.coverImage.alt || opportunity.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: opportunity.title,
      description,
      images: opportunity.coverImage ? [opportunity.coverImage.url] : undefined,
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Validate slug format
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    notFound();
  }

  let opportunity;
  try {
    opportunity = await getOpportunityBySlug(slug);
  } catch (error) {
    console.error(`[OpportunityDetail] Error fetching ${slug}:`, error);
    notFound();
  }

  if (!opportunity) {
    notFound();
  }

  // Check if opportunity is expired (optional: show different UI)
  const isExpired = isOpportunityExpired(opportunity.endDate || opportunity.startDate);
  if (isExpired && opportunity.status !== 'completed') {
    // Log for monitoring - opportunity may need status update in CMS
    console.log(`[OpportunityDetail] Expired opportunity accessed: ${slug}`);
  }

  return <OpportunityDetailClient opportunity={opportunity} />;
}
