/**
 * This file contains date constants used throughout the application
 * to ensure consistency in date handling.
 */

// March 2nd, 2025 is a Sunday
// Note: In JavaScript Date, months are 0-indexed (0=Jan, 1=Feb, 2=Mar)
// So for March 2nd, we use month index 2
export const FIXED_DATE = new Date(2025, 2, 2);

// Day of week names for reference
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Verify that our fixed date is a Sunday (day 0)
const dayOfWeek = FIXED_DATE.getDay();
console.log(`Fixed date is ${DAYS_OF_WEEK[dayOfWeek]}, March 2nd, 2025`);