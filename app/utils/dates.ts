/**
 * Date formatting and timezone handling utilities
 */

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'time' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
  };

  switch (format) {
    case 'short':
      options.dateStyle = 'short';
      break;
    case 'medium':
      options.dateStyle = 'medium';
      break;
    case 'long':
      options.dateStyle = 'full';
      break;
    case 'time':
      delete options.dateStyle;
      options.timeStyle = 'short';
      break;
  }

  return new Intl.DateTimeFormat(undefined, options).format(dateObj);
}

/**
 * Calculate relative time (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, 'week');
  } else if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, 'month');
  } else {
    return rtf.format(diffYears, 'year');
  }
}

/**
 * Format countdown to date
 */
export function getCountdown(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Past due';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else {
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffMins > 0) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else {
      return 'Less than a minute';
    }
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return dateObj >= startOfWeek && dateObj < endOfWeek;
}

/**
 * Format date range
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startObj = typeof start === 'string' ? new Date(start) : start;
  const endObj = typeof end === 'string' ? new Date(end) : end;

  if (startObj.getFullYear() !== endObj.getFullYear()) {
    return `${formatDate(startObj, 'short')} - ${formatDate(endObj, 'short')}`;
  }

  if (startObj.getMonth() !== endObj.getMonth()) {
    return `${formatDate(startObj, 'short')} - ${formatDate(endObj, 'short')}`;
  }

  return `${startObj.getDate()} - ${endObj.getDate()}, ${startObj.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
}

/**
 * Parse date string safely
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setHours(23, 59, 59, 999);
  return result;
}
