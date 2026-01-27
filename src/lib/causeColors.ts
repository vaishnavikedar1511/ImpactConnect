/**
 * Cause Color Utilities
 * Works with colors from Contentstack dynamically
 */

/**
 * Get cause-specific colors for styling
 * @param causeSlug - The cause slug
 * @param causeColor - Optional hex color from Contentstack
 */
export function getCauseColor(
  causeSlug: string,
  causeColor?: string
): { bg: string; text: string; border: string } {
  // Use Contentstack color if provided
  if (causeColor) {
    const needsDarkText = isLightColor(causeColor);
    return {
      bg: causeColor,
      text: needsDarkText ? '#000000' : '#ffffff',
      border: lightenColor(causeColor, 15),
    };
  }

  // Fallback to purple if no color
  return { bg: '#a855f7', text: '#ffffff', border: '#c084fc' };
}

/**
 * Check if a color is light (needs dark text)
 */
function isLightColor(hex: string): boolean {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155; // Threshold for light colors
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Format cause name for display
 */
export function formatCauseName(causeSlug: string): string {
  return causeSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a cause color lookup map
 */
export function createCauseColorMap(causes: Array<{ slug: string; color?: string }>): Map<string, string> {
  const map = new Map<string, string>();
  causes.forEach(cause => {
    if (cause.color) {
      map.set(cause.slug, cause.color);
    }
  });
  return map;
}
