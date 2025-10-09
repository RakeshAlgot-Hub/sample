/**
 * Converts a JavaScript Date to backend format: YYYYMMDDHHMMSSMMM
 * Example: 20250821144706721
 */
export const dateToBackendFormat = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

/**
 * Converts backend date format (YYYYMMDDHHMMSS or YYYYMMDDHHMMSSMMM) to JavaScript Date (UTC)
 * Example: 20250821144706721 -> Date object
 */
export const backendFormatToDate = (backendDate: string): Date => {
  if (typeof backendDate !== 'string') {
    throw new Error('backendFormatToDate expects a string input.');
  }

  let year, month, day, hours, minutes, seconds, milliseconds = 0;

  if (backendDate.length >= 14) { // YYYYMMDDHHMMSS or YYYYMMDDHHMMSSMMM
    year = parseInt(backendDate.substring(0, 4));
    month = parseInt(backendDate.substring(4, 6)) - 1; // Month is 0-indexed
    day = parseInt(backendDate.substring(6, 8));
    hours = parseInt(backendDate.substring(8, 10));
    minutes = parseInt(backendDate.substring(10, 12));
    seconds = parseInt(backendDate.substring(12, 14));

    if (backendDate.length === 17) { // YYYYMMDDHHMMSSMMM
      milliseconds = parseInt(backendDate.substring(14, 17));
    }
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
  } else {
    // Fallback to ISO 8601 parsing if it doesn't match our custom format
    try {
      const date = new Date(backendDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      // Fall through
    }
    throw new Error(`Invalid backend date format: ${backendDate}. Expected YYYYMMDDHHMMSS[MMM] or ISO 8601.`);
  }
};

/**
 * Converts a JavaScript Date to ISO 8601 UTC string format (e.g., "2025-08-21T14:47:06.721Z")
 */
export const dateToISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Converts an ISO 8601 UTC string to JavaScript Date
 * Example: "2025-08-21T14:47:06.721Z" -> Date object
 */
export const isoStringToDate = (isoString: string): Date => {
  return new Date(isoString);
};

/**
 * Formats a date for display in the UI (local timezone)
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats backend date string for display
 */
export const formatBackendDateForDisplay = (backendDate: string): string => {
  try {
    const date = backendFormatToDate(backendDate);
    return formatDateForDisplay(date);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Validates if a date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

/**
 * Validates if a backend date string is in the future
 */
export const isBackendDateFuture = (backendDate: string): boolean => {
  try {
    const date = backendFormatToDate(backendDate);
    return isFutureDate(date);
  } catch {
    return false;
  }
};

/**
 * Converts HTML date input value (YYYY-MM-DD) to backend format (YYYYMMDDHHMMSSMMM UTC)
 */
export const htmlDateToBackendFormat = (htmlDate: string): string => {
  const date = new Date(htmlDate); // This creates a Date object in local timezone from YYYY-MM-DD
  // To get the end of the day in UTC for the *same calendar date*, we construct a UTC date.
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
  return dateToBackendFormat(utcDate);
};

/**
 * Converts backend date (YYYYMMDDHHMMSS[MMM]) to HTML date input format (YYYY-MM-DD UTC)
 */
export const backendDateToHtmlFormat = (backendDate: string): string => {
  try {
    const date = backendFormatToDate(backendDate);
    // toISOString().split('T')[0] gives YYYY-MM-DD in UTC, which is correct for HTML date input.
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};
