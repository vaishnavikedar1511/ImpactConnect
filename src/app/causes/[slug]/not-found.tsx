/**
 * Cause Not Found Page
 */

import Link from 'next/link';

export default function CauseNotFound() {
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
      <div
        style={{
          width: 80,
          height: 80,
          marginBottom: 24,
          borderRadius: '50%',
          background: 'var(--placeholder-bg, #f3f4f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
        }}
      >
        🏷️
      </div>
      <h1
        style={{
          margin: '0 0 12px',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary, #111827)',
        }}
      >
        Cause Not Found
      </h1>
      <p
        style={{
          margin: '0 0 32px',
          fontSize: '1rem',
          color: 'var(--text-secondary, #6b7280)',
          maxWidth: 400,
        }}
      >
        The cause category you&apos;re looking for doesn&apos;t exist.
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
          background: 'var(--accent-color, #3b82f6)',
          borderRadius: 8,
          textDecoration: 'none',
        }}
      >
        Browse Opportunities
      </Link>
    </div>
  );
}
