'use client';

/**
 * Global Error Boundary
 * Catches unhandled errors in the app
 */

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console (in production, send to error tracking service)
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #f9fafb)' }}>
      <ErrorFallback
        type="server_error"
        showRetry
        onRetry={reset}
        showHome
      />
    </div>
  );
}
