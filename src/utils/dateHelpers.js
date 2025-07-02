import { parse, isValid } from "date-fns";

// Re-export from date-fns to have a single source for date utilities
export { isWithinInterval } from "date-fns";

// Helper to format a Date object to "DD-MM-YYYY" string
export const dateToDDMMYYYY = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    dateObj = new Date(); // Default to today if invalid date is passed
  }
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to parse DD-MM-YYYY string to a Date object
export const parseDDMMYYYYToDateObj = (dateStr) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};

// Helper to check if a date string (DD-MM-YYYY) is in the past (ignoring time)
export const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  const parsed = parseDDMMYYYYToDateObj(dateStr);
  if (!parsed) return false;
  return parsed < today;
};

/**
 * Converts a date string from DD-MM-YYYY to YYYY-MM-DD format.
 * Useful for <input type="date"> elements.
 * @param {string} dateString - The date string in DD-MM-YYYY format.
 * @returns {string} The formatted date string in YYYY-MM-DD format, or an empty string if input is invalid.
 */
export const ddmmyyyyToYYYYMMDD = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return "";
  const parts = dateString.split('-');
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

/**
 * Converts a date string from YYYY-MM-DD to DD-MM-YYYY format.
 * Useful for converting <input type="date"> values back to app's standard.
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {string} The formatted date string in DD-MM-YYYY format, or an empty string if input is invalid.
 */
export const yyyymmddToDDMMYYYY = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return "";
  const parts = dateString.split('-');
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};