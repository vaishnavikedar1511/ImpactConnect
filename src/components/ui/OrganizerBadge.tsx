/**
 * OrganizerBadge Component
 * Displays organizer info in a compact badge format
 * CMS-safe: handles missing fields gracefully
 */

interface OrganizerBadgeProps {
  organizerName?: string | null;
  size?: 'small' | 'medium' | 'large';
}

export function OrganizerBadge({
  organizerName,
  size = 'medium',
}: OrganizerBadgeProps) {
  const name = organizerName || 'Unknown Organizer';
  const logoSize = size === 'small' ? 20 : size === 'large' ? 36 : 24;
  const fontSize = size === 'small' ? '0.8125rem' : size === 'large' ? '1rem' : '0.875rem';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'large' ? 12 : 8,
      }}
    >
      {/* Logo placeholder */}
      <div
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: 4,
          background: 'var(--accent-light, #dbeafe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-color, #3b82f6)',
          fontSize: logoSize * 0.5,
          fontWeight: 600,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <span
        style={{
          fontSize,
          fontWeight: size === 'large' ? 600 : 500,
          color: 'var(--text-primary, #111827)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </span>
    </div>
  );
}

export default OrganizerBadge;
