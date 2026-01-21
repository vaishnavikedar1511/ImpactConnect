/**
 * Date Utilities
 * Helper functions for date filtering and formatting
 */

/**
 * Time filter options for opportunity search
 */
export type TimeFilter = 'today' | 'tomorrow' | 'this_week' | 'this_weekend' | 'this_month' | 'upcoming';

/**
 * Get date range for a time filter
 */
export function getDateRangeForFilter(filter: TimeFilter): { startDate: string; endDate?: string } {
  const now = new Date();
  // Use UTC dates to avoid timezone issues
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const formatDate = (date: Date): string => {
    // Format as YYYY-MM-DD in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (filter) {
    case 'today': {
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };
    }

    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      return {
        startDate: formatDate(tomorrow),
        endDate: formatDate(tomorrow),
      };
    }

    case 'this_week': {
      const endOfWeek = new Date(today);
      const daysUntilSunday = 7 - today.getUTCDay();
      endOfWeek.setUTCDate(endOfWeek.getUTCDate() + daysUntilSunday);
      return {
        startDate: formatDate(today),
        endDate: formatDate(endOfWeek),
      };
    }

    case 'this_weekend': {
      const dayOfWeek = today.getUTCDay();
      const saturday = new Date(today);
      const sunday = new Date(today);

      // Calculate days until Saturday (6) and Sunday (0/7)
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      saturday.setUTCDate(today.getUTCDate() + daysUntilSaturday);
      sunday.setUTCDate(saturday.getUTCDate() + 1);

      // If today is Saturday or Sunday, start from today
      if (dayOfWeek === 0) {
        return {
          startDate: formatDate(today),
          endDate: formatDate(today),
        };
      }
      if (dayOfWeek === 6) {
        return {
          startDate: formatDate(today),
          endDate: formatDate(sunday),
        };
      }

      return {
        startDate: formatDate(saturday),
        endDate: formatDate(sunday),
      };
    }

    case 'this_month': {
      const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
      return {
        startDate: formatDate(today),
        endDate: formatDate(endOfMonth),
      };
    }

    case 'upcoming':
    default: {
      return {
        startDate: formatDate(today),
      };
    }
  }
}

/**
 * Format a date for display
 */
export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date range for display
 */
export function formatDateRange(startDate: string, endDate?: string): string {
  if (!endDate || startDate === endDate) {
    return formatDisplayDate(startDate);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}`;
  }

  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
}

/**
 * Format time for display
 */
export function formatTime(timeString?: string): string {
  if (!timeString) return '';

  // Handle HH:MM format
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * Compares dates at midnight UTC to avoid timezone issues
 */
export function isPast(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  
  // Set both to midnight UTC for accurate comparison
  const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  
  return dateUTC < todayUTC;
}

/**
 * Get relative date label
 */
export function getRelativeDateLabel(dateString: string): string | null {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  }

  if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  // Check if this weekend
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  if (dateOnly.getTime() === saturday.getTime() || dateOnly.getTime() === sunday.getTime()) {
    return 'This Weekend';
  }

  return null;
}
