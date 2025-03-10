import { format, parseISO, addDays, addWeeks, addMonths, isSameDay } from 'date-fns';

/**
 * Gets the current date
 */
export const getCurrentGMTDate = (): Date => {
  return new Date();
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