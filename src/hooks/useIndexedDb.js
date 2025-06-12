import { useState, useEffect, useCallback, useDebugValue, useRef } from "react";
import Dexie from "dexie";

// --- Dexie Database Setup ---
// Keep db instance module-local. Export functions for specific global operations.
const db = new Dexie("keyval-db");
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
  if (typeof window === "undefined") {
    console.warn(
      "[useIndexedDb] clearEntireDatabase called in a non-browser environment."
    );
    return;
  }
  try {
    await db.delete();
    console.log(
      "[useIndexedDb] Database cleared successfully. You may need to reload the page for changes to fully apply if the DB was in use."
    );
  } catch (error) {
    console.error("[useIndexedDb] Error clearing database:", error);
    throw error; // Re-throw to allow callers to handle if needed
  }
}

// --- The Final, Stable useIndexedDb Hook ---

/**
 * A robust and stable React hook that syncs state with IndexedDB.
 *
 * @param {string} key - The unique key for the data in IndexedDB.
 * @param {any} defaultValue - The initial value to use if none is found in the database.
 * @returns {[any, function(any | function(any): any): void]} A stateful value and a function to update it.
 */
export function useIndexedDb(key, defaultValue) {
  // The core state for our value.
  const [value, setValueState] = useState(defaultValue);
  const [hasLoaded, setHasLoaded] = useState(false); // Tracks if initial load is complete

  // Tracks if the user has explicitly called setStoredValue,
  // to prevent overwriting user's intent during initial load.
  const userHasSetValue = useRef(false);

  // --- EFFECT 1: Load initial value from IndexedDB ---
  // This effect runs once when the component mounts or when the key changes.
  useEffect(() => {
    // Don't run on the server.
    if (typeof window === "undefined") {
      setHasLoaded(true); // Mark as "loaded" for SSR to prevent save attempts
      return;
    }

    let didUnmount = false;
    userHasSetValue.current = false; // Reset on key change or mount
    setHasLoaded(false); // Signal that we are about to load for this key

    const fetchValue = async () => {
      try {
        // Dexie automatically handles opening the database.
        const storedRecord = await db["keyval-store"].get(key);
        if (!didUnmount) {
          if (storedRecord) {
            // Only set from DB if user hasn't already set a value.
            if (!userHasSetValue.current) {
              setValueState(storedRecord.value);
            }
          }
          // else, defaultValue is already in state via useState.
          // If nothing in DB, defaultValue will be saved by the save effect once hasLoaded is true.
        }
      } catch (error) {
        console.error(`[useIndexedDb] Error fetching for key "${key}":`, error);
      } finally {
        if (!didUnmount) {
          setHasLoaded(true); // Mark load attempt as complete
        }
      }
    };

    fetchValue();
    return () => {
      didUnmount = true;
    };
  }, [key]); // Only re-run if key changes

  // --- EFFECT 2: Write state changes to IndexedDB ---
  // This effect runs whenever `value` changes or `hasLoaded` becomes true.
  useEffect(() => {
    // Don't save if initial load hasn't completed or if on server.
    if (!hasLoaded || typeof window === "undefined") {
      return;
    }

    const saveValue = async () => {
      try {
        await db["keyval-store"].put({ id: key, value });
      } catch (error) {
        console.error(`[useIndexedDb] Error saving for key "${key}":`, error);
      }
    };
    saveValue();
  }, [key, value, hasLoaded]); // Run if key, value, or hasLoaded changes

  /**
   * Provides a STABLE setter function that updates the component's state.
   * The change in state will then trigger the save-effect above.
   */
  const setStoredValue = useCallback(
    (valOrFn) => {
      userHasSetValue.current = true; // Mark that user has intervened
      setValueState(valOrFn);
    },
    [] // setValueState from useState is stable
  );

  // Provides a helpful label in React DevTools.
  useDebugValue(value, (val) => `[IndexedDB] ${key}: ${JSON.stringify(val)}`);

  return [value, setStoredValue];
}

// The default export is the hook itself.
export default useIndexedDb;
