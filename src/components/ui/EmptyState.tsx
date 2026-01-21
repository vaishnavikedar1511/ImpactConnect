/**
 * EmptyState Component
 * Displays a friendly message when no content is available
 */

import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  variant?: 'default' | 'compact' | 'inline';
}

const defaultIcon = (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    style={{ color: 'var(--text-tertiary, #9ca3af)' }}
  >
    <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export function EmptyState({
  icon = defaultIcon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  if (isInline) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          background: 'var(--placeholder-bg, #f9fafb)',
          borderRadius: 8,
          color: 'var(--text-secondary, #6b7280)',
          fontSize: '0.9375rem',
        }}
      >
        {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
        <span>{title}</span>
        {action && (
          <Link
            href={action.href}
            style={{
              marginLeft: 'auto',
              color: 'var(--accent-color, #3b82f6)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {action.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isCompact ? '32px 20px' : '64px 20px',
        textAlign: 'center',
        background: 'var(--card-bg, #ffffff)',
        borderRadius: 12,
        border: '1px solid var(--border-color, #e5e7eb)',
      }}
    >
      {icon && (
        <div style={{ marginBottom: isCompact ? 16 : 20 }}>
          {icon}
        </div>
      )}

      <h3
        style={{
          margin: 0,
          fontSize: isCompact ? '1rem' : '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary, #111827)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: isCompact ? '0.875rem' : '0.9375rem',
            color: 'var(--text-secondary, #6b7280)',
            maxWidth: 400,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: isCompact ? 16 : 24,
            padding: isCompact ? '10px 20px' : '12px 24px',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'white',
            background: 'var(--accent-color, #3b82f6)',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
