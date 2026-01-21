/**
 * Opportunity Not Found Page
 */

import Link from 'next/link';

export default function OpportunityNotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ marginBottom: 24, color: '#9ca3af' }}
      >
        <path d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
      <h1
        style={{
          margin: '0 0 12px',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        Opportunity Not Found
      </h1>
      <p
        style={{
          margin: '0 0 32px',
          fontSize: '1rem',
          color: '#6b7280',
          maxWidth: 400,
        }}
      >
        The opportunity you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/opportunities"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'white',
          background: '#3b82f6',
          borderRadius: 8,
          textDecoration: 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Browse Opportunities
      </Link>
    </div>
  );
}
