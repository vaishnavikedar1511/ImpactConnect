/**
 * Cause-based Listing Page
 * ISR with 30-minute revalidation
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RevalidationTimes } from '@/lib/config';
import { getCauseBySlug, getOpportunitiesByCause } from '@/lib/contentstack';
import { OpportunityCard } from '@/components/opportunities';

// Configure ISR
export const revalidate = RevalidationTimes.TAXONOMY;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const cause = await getCauseBySlug(slug);
    if (!cause) {
      return { title: 'Cause Not Found | ImpactConnect' };
    }

    return {
      title: `${cause.name} Opportunities | ImpactConnect`,
      description: cause.description || `Find ${cause.name} volunteering and impact opportunities near you.`,
    };
  } catch {
    return { title: 'Cause Not Found | ImpactConnect' };
  }
}

export default async function CauseListingPage({ params }: PageProps) {
  const { slug } = await params;
  
  let cause;
  let opportunities;

  try {
    cause = await getCauseBySlug(slug);
    if (!cause) {
      notFound();
    }
    opportunities = await getOpportunitiesByCause(slug, 24);
  } catch (error) {
    console.error('Error fetching cause data:', error);
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #f9fafb)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back Link */}
        <Link
          href="/opportunities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            fontSize: '0.9375rem',
            color: 'var(--accent-color, #3b82f6)',
          }}
        >
          ← All opportunities
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary, #111827)',
          }}>
            {cause.name}
          </h1>
          {cause.description && (
            <p style={{
              margin: 0,
              fontSize: '1.0625rem',
              color: 'var(--text-secondary, #6b7280)',
              maxWidth: 700,
            }}>
              {cause.description}
            </p>
          )}
          <p style={{
            marginTop: 16,
            fontSize: '0.9375rem',
            color: 'var(--text-tertiary, #9ca3af)',
          }}>
            {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'} available
          </p>
        </header>

        {/* Opportunities Grid */}
        {opportunities.length === 0 ? (
          <div style={{
            padding: 64,
            textAlign: 'center',
            background: 'var(--card-bg, #fff)',
            borderRadius: 12,
            border: '1px solid var(--border-color, #e5e7eb)',
          }}>
            <p style={{
              margin: '0 0 8px',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text-primary, #111827)',
            }}>
              No opportunities yet
            </p>
            <p style={{
              margin: '0 0 24px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              Check back soon for {cause.name.toLowerCase()} opportunities.
            </p>
            <Link
              href="/opportunities"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'white',
                background: 'var(--accent-color, #3b82f6)',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Browse all opportunities
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.uid}
                opportunity={opportunity}
                priority={index < 6}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
