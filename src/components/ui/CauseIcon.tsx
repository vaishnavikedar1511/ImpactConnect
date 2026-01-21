/**
 * Cause Icon Component
 * SVG icons for different cause types
 */

interface CauseIconProps {
  causeSlug: string;
  className?: string;
}

export function CauseIcon({ causeSlug, className }: CauseIconProps) {
  const iconProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (causeSlug.toLowerCase()) {
    case 'education':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h4" />
        </svg>
      );

    case 'environment':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
          <path d="M6 6l2 2M16 6l-2 2M6 18l2-2M16 18l-2-2" />
        </svg>
      );

    case 'healthcare':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );

    case 'animal-welfare':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="7" r="2.5" />
          <circle cx="15" cy="7" r="2.5" />
          <ellipse cx="12" cy="13" rx="3" ry="4" />
          <circle cx="8" cy="11" r="1.5" />
          <circle cx="16" cy="11" r="1.5" />
        </svg>
      );

    case 'community':
    case 'community-development':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'hunger-relief':
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 15.59 6 4 4 0 0 1 18 13.87V21H6Z" />
          <line x1="6" y1="17" x2="18" y2="17" />
          <path d="M9 9.5a1.5 1.5 0 0 1 3 0c0 .5-.5 1-1 1.5" />
          <path d="M12 9.5a1.5 1.5 0 0 1 3 0c0 .5-.5 1-1 1.5" />
        </svg>
      );

    default:
      // Default icon (help circle)
      return (
        <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}
