/**
 * Opportunity Detail Page Loading State
 */

export default function OpportunityDetailLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #f9fafb)' }}>
      {/* Hero Skeleton */}
      <div
        style={{
          height: 450,
          background: 'linear-gradient(135deg, var(--accent-light, #dbeafe) 0%, var(--accent-lighter, #eff6ff) 100%)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />

      {/* Header Content Skeleton */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px',
          background: 'var(--card-bg, #fff)',
          borderBottom: '1px solid var(--border-color, #e5e7eb)',
        }}
      >
        <div
          style={{
            width: 150,
            height: 16,
            background: 'var(--skeleton-base, #e5e7eb)',
            borderRadius: 4,
            marginBottom: 16,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '60%',
            height: 40,
            background: 'var(--skeleton-base, #e5e7eb)',
            borderRadius: 8,
            marginBottom: 16,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ display: 'flex', gap: 24 }}>
          {[120, 100, 140].map((width, i) => (
            <div
              key={i}
              style={{
                width,
                height: 20,
                background: 'var(--skeleton-base, #e5e7eb)',
                borderRadius: 4,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Layout Skeleton */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 40,
        }}
      >
        {/* Main Content */}
        <div>
          <div
            style={{
              height: 300,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[180, 160, 200].map((height, i) => (
            <div
              key={i}
              style={{
                height,
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
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
