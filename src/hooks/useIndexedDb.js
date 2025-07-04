import { useState, useEffect, useCallback, useRef } from "react";
import Dexie from "dexie";
import isEqual from "fast-deep-equal";
import { dateToDDMMYYYY } from "../utils/dateHelpers";
import { CHESS_USER_PROFILE_KEY } from "../constants/localIndexedDbKeys";

// Use a more specific database name to avoid potential conflicts
// Keep db instance module-local. Export functions for specific global operations.
const db = new Dexie("my-learning-hub-db"); // Changed database name
db.version(1).stores({
  // We will store items as {id: key, value: data}.
  // The 'id' field is our primary key (the string key we pass to the hook).
  "keyval-store": "id",
});

/**
 * Clears the entire IndexedDB database used by this hook.
 * @async
 */
export async function clearEntireDatabase() {
  if (typeof window === "undefined") return;
  try {
    await db["keyval-store"].clear();
  } catch (err) {
    console.error("Error clearing IndexedDB 'keyval-store':", err);
    throw err; // Re-throw to propagate the error
  }
}

/**
 * useIndexedDb - React hook for persistent state in IndexedDB.
 * @param {string} key
 * @param {any} initialValue
 * @returns [value, setValue, loading, error]
 */
export function useIndexedDb(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (key === CHESS_USER_PROFILE_KEY && initialValue) {
      let normalizedValue = { ...initialValue };
      if (Array.isArray(normalizedValue.allActivityDates)) {
        normalizedValue.allActivityDates = normalizedValue.allActivityDates
          .map((dateStr) => {
            if (dateStr && dateStr.includes("T") && dateStr.includes("Z")) {
              const dateObj = new Date(dateStr);
              return dateToDDMMYYYY(dateObj);
            } else {
              return dateStr;
            }
          })
          .filter(Boolean);
      }
      if (
        typeof normalizedValue.longestStreak !== "number" ||
        isNaN(normalizedValue.longestStreak)
      ) {
        normalizedValue.longestStreak = 0;
      }
      return normalizedValue;
    }
    return initialValue;
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  // This ref will hold the last value that was either loaded from or saved to the DB.
  // Initialize to a unique symbol or undefined to ensure the first save of initialValue happens if DB is empty.
  const lastPersistedValue = useRef(undefined);

  const [error, setError] = useState(null);

  // Load from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof window === "undefined") {
      setHasLoaded(true); // Treat as loaded if not in browser env
      return;
    }

    db["keyval-store"]
      .get(key)
      .then((result) => {
        // result is { id: key, value: data } or undefined
        if (isMounted) {
          if (result && "value" in result) {
            let loadedValue = result.value;

            // Normalize allActivityDates if this is the user profile key
            if (key === CHESS_USER_PROFILE_KEY && loadedValue) {
              // Normalize allActivityDates if it exists and is an array
              if (Array.isArray(loadedValue.allActivityDates)) {
                const normalizedDates = loadedValue.allActivityDates
                  .map((dateStr) => {
                    // If it's an ISO string, convert it to DD-MM-YYYY
                    if (dateStr && dateStr.includes("T") && dateStr.includes("Z")) {
                      const dateObj = new Date(dateStr);
                      return dateToDDMMYYYY(dateObj);
                    } else { 
                      // Otherwise, assume it's already DD-MM-YYYY or invalid, keep as is
                      return dateStr;
                    }
                  })
                  .filter(Boolean); // Remove any nulls or empty strings
                loadedValue = { ...loadedValue, allActivityDates: normalizedDates };
              }

              // Ensure longestStreak is a number, default to 0 if not
              if (
                typeof loadedValue.longestStreak !== "number" ||
                isNaN(loadedValue.longestStreak)
              ) {
                loadedValue.longestStreak = 0;
              }
            }

            setValue(loadedValue);
            lastPersistedValue.current = loadedValue; // Crucial: Sync ref with loaded value
          }
          setHasLoaded(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setHasLoaded(true);
        }
        console.error(`useIndexedDb: Error loading key "${key}":`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  // Save to IndexedDB when value changes (after initial load)
  useEffect(() => {
    if (!hasLoaded || typeof window === "undefined") {
      return; // Don't save until loaded or if not in browser
    }

    // Deep compare current value with the last known persisted value
    if (isEqual(value, lastPersistedValue.current)) {
      return;
    }

    const valueToSave = value;

    db["keyval-store"]
      .put({ id: key, value: valueToSave })
      .then(() => {
        // On successful save, update the ref to the value that was saved.
        lastPersistedValue.current = valueToSave;
      })
      .catch((err) => {
        setError(err);
        console.error(`useIndexedDb: Error saving key "${key}":`, err);
        // Optional: Revert optimistic update on error, though this might cause rapid re-saving.
        // For now, we'll log the error and let the next render attempt a save if the value is still different.
      });
  }, [key, value, hasLoaded]);

  // Stable setter
  const setStoredValue = useCallback((valOrUpdater) => {
    setValue((prev) =>
      typeof valOrUpdater === "function" ? valOrUpdater(prev) : valOrUpdater
    );
  }, []);

  // Return loading as !hasLoaded for clarity
  return [value, setStoredValue, !hasLoaded, error];
}

// The default export is the hook itself.
export default useIndexedDb;
