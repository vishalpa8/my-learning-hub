import { parse, isValid } from "date-fns";

// Re-export from date-fns to have a single source for date utilities
export { isWithinInterval } from "date-fns";

export const dateToDDMMYYYY = (dateObj) => {
  let dateToFormat = dateObj;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    dateToFormat = new Date();
  }
  const day = String(dateToFormat.getDate()).padStart(2, "0");
  const month = String(dateToFormat.getMonth() + 1).padStart(2, "0");
  const year = dateToFormat.getFullYear();
  const result = `${day}-${month}-${year}`;
  return result;
};

export const parseDDMMYYYYToDateObj = (dateStr) => {
  if (!dateStr) {
    return null;
  }
  const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
  const result = isValid(parsed) ? parsed : null;
  return result;
};

export const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsed = parseDDMMYYYYToDateObj(dateStr);
  const result = parsed ? parsed < today : false;
  return result;
};

export const ddmmyyyyToYYYYMMDD = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return "";
  }
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return "";
  }
  const [day, month, year] = parts;
  const result = `${year}-${month}-${day}`;
  return result;
};

export const yyyymmddToDDMMYYYY = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return "";
  }
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return "";
  }
  const [year, month, day] = parts;
  const result = `${day}-${month}-${year}`;
  return result;
};