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

// Helper to parse YYYY-MM-DD string to a Date object
export const parseYYYYMMDDToDateObj = (dateStr) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
};

// Helper to convert DD-MM-YYYY to YYYY-MM-DD for date inputs
export const convertDDMMYYYYtoYYYYMMDD = (ddmmyyyy) => {
  // Make the function more robust by handling if a Date object is passed by mistake.
  if (ddmmyyyy instanceof Date) {
    // If it's a Date object, format it to the expected string format first.
    ddmmyyyy = dateToDDMMYYYY(ddmmyyyy);
  }
  if (typeof ddmmyyyy !== "string" || ddmmyyyy.split("-").length !== 3)
    return "";
  const [day, month, year] = ddmmyyyy.split("-");
  return `${year}-${month}-${day}`;
};

// Helper to check if a date string (DD-MM-YYYY) is in the past (ignoring time)
export const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  const parsed = parseDDMMYYYYToDateObj(dateStr);
  if (!parsed) return false;
  return parsed < today;
};
