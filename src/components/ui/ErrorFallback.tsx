/**
 * ErrorFallback Component
 * Displays user-friendly error messages
 */

import Link from 'next/link';

type ErrorType = 
  | 'fetch_failed'
  | 'not_found'
  | 'expired'
  | 'invalid_slug'
  | 'server_error'
  | 'generic';

interface ErrorFallbackProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
}

const errorConfig: Record<ErrorType, { icon: string; title: string; message: string }> = {
  fetch_failed: {
    icon: '🔌',
    title: 'Connection Problem',
    message: 'We couldn\'t load the content. Please check your connection and try again.',
  },
  not_found: {
    icon: '🔍',
    title: 'Not Found',
    message: 'The content you\'re looking for doesn\'t exist or has been removed.',
  },
  expired: {
    icon: '⏰',
    title: 'Opportunity Expired',
    message: 'This opportunity has ended. Check out other upcoming opportunities.',
  },
  invalid_slug: {
    icon: '🔗',
    title: 'Invalid Link',
    message: 'This link appears to be broken or incorrect.',
  },
  server_error: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: 'We\'re experiencing technical difficulties. Please try again later.',
  },
  generic: {
    icon: '❌',
    title: 'Error',
    message: 'An unexpected error occurred.',
  },
};

export function ErrorFallback({
  type = 'generic',
  title,
  message,
  showRetry = false,
  onRetry,
  showHome = true,
}: ErrorFallbackProps) {
  const config = errorConfig[type];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
      role="alert"
    >
      <div
        style={{
          width: 80,
          height: 80,
          marginBottom: 24,
          borderRadius: '50%',
          background: 'var(--placeholder-bg, #fef2f2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
        }}
      >
        {config.icon}
      </div>

      <h1
        style={{
          margin: '0 0 12px',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary, #111827)',
        }}
      >
        {title || config.title}
      </h1>

      <p
        style={{
          margin: '0 0 32px',
          fontSize: '1rem',
          color: 'var(--text-secondary, #6b7280)',
          maxWidth: 400,
        }}
      >
        {message || config.message}
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        {showRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'white',
              background: 'var(--accent-color, #3b82f6)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try Again
          </button>
        )}

        {showHome && (
          <Link
            href="/opportunities"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--accent-color, #3b82f6)',
              background: 'var(--accent-light, #eff6ff)',
              border: '1px solid var(--accent-border, #bfdbfe)',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Browse Opportunities
          </Link>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;
