/**
 * Opportunities Page Loading State
 */

export default function OpportunitiesLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #f9fafb)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              width: 300,
              height: 36,
              background: 'var(--skeleton-base, #e5e7eb)',
              borderRadius: 8,
              marginBottom: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 200,
              height: 20,
              background: 'var(--skeleton-base, #e5e7eb)',
              borderRadius: 6,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Filter Bar Skeleton */}
        <div
          style={{
            height: 64,
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: 12,
            marginBottom: 32,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Grid Skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 380,
                background: 'var(--skeleton-base, #e5e7eb)',
                borderRadius: 12,
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
