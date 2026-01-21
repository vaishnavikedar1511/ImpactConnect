/**
 * FAQ Icon Component
 * SVG icons for different FAQ categories
 */

interface FAQIconProps {
  category: string;
  className?: string;
}

export function FAQIcon({ category, className }: FAQIconProps) {
  const iconProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const categoryLower = category.toLowerCase();

  // Map category names to icons
  if (categoryLower.includes('getting started') || categoryLower.includes('getting-started')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    );
  }

  if (categoryLower.includes('organizer') || categoryLower.includes('for organizers')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    );
  }

  if (categoryLower.includes('registration') || categoryLower.includes('registrations')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    );
  }

  if (categoryLower.includes('account') || categoryLower.includes('profile')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (categoryLower.includes('payment') || categoryLower.includes('billing')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    );
  }

  if (categoryLower.includes('event') || categoryLower.includes('opportunity')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  if (categoryLower.includes('safety') || categoryLower.includes('security')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  if (categoryLower.includes('help') || categoryLower.includes('support')) {
    return (
      <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  // Default icon (question mark)
  return (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
