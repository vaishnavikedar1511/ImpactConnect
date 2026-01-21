/**
 * Global Not Found Page
 */

import Link from 'next/link';
import Image from 'next/image';
import { getErrorPagesContent } from '@/lib/contentstack';

export default async function NotFound() {
  const content = await getErrorPagesContent();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'var(--page-bg, #f9fafb)',
      }}
    >
      {content.not_found_image_url ? (
        <div style={{ marginBottom: 32, width: 200, height: 200, position: 'relative' }}>
          <Image
            src={content.not_found_image_url}
            alt="404"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 100,
            height: 100,
            marginBottom: 32,
            borderRadius: '50%',
            background: 'var(--accent-light, #dbeafe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: 'var(--accent-color, #3b82f6)' }}
          >
            <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}

      <h1
        style={{
          margin: '0 0 12px',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary, #111827)',
        }}
      >
        {content.not_found_title || 'Page Not Found'}
      </h1>

      <p
        style={{
          margin: '0 0 32px',
          fontSize: '1.0625rem',
          color: 'var(--text-secondary, #6b7280)',
          maxWidth: 440,
        }}
      >
        {content.not_found_message || "Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."}
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href={content.not_found_button_url || '/'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
            background: 'var(--accent-color, #3b82f6)',
            borderRadius: 10,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
        >
          {content.not_found_button_text || 'Go to Homepage'}
        </Link>

        <Link
          href="/opportunities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            fontSize: '1rem',
            fontWeight: 500,
            color: 'var(--text-secondary, #6b7280)',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: 10,
            textDecoration: 'none',
            transition: 'border-color 0.15s ease',
          }}
        >
          Browse Opportunities
        </Link>
      </div>
    </div>
  );
}
