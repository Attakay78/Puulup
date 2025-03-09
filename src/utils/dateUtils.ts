import { format, parseISO, addDays, addWeeks, addMonths, isSameDay } from 'date-fns';

/**
 * Gets the current date
 * Hard-coded to March 2nd, 2025 (Sunday) for consistency
 */
export const getCurrentGMTDate = (): Date => {
  // Create a new date object for March 2nd, 2025 (Sunday)
  // Using direct year/month/day values to ensure correctness
  return new Date(2025, 2, 2);
};

/**
 * Formats a date to a string
 */
export const formatGMTDate = (date: Date | string, formatString: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Formats a date to ISO format (YYYY-MM-DD)
 */
export const formatGMTDateToISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Adds days to a date
 */
export const addDaysToGMTDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

/**
 * Adds weeks to a date
 */
export const addWeeksToGMTDate = (date: Date, weeks: number): Date => {
  return addWeeks(date, weeks);
};

/**
 * Adds months to a date
 */
export const addMonthsToGMTDate = (date: Date, months: number): Date => {
  return addMonths(date, months);
};

/**
 * Parses an ISO date string to a date
 */
export const parseISOToGMTDate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Checks if two dates are the same day
 */
export const isSameGMTDay = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};