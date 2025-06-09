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
  const [value, setValue] = useState(defaultValue);

  // This ref helps us prevent saving to the DB during the initial render,
  // before we've had a chance to load existing data.
  const isInitialMount = useRef(true);

  // --- EFFECT 1: Load initial value from IndexedDB ---
  // This effect runs once when the component mounts.
  useEffect(() => {
    // Don't run on the server.
    if (typeof window === "undefined") return;

    const fetchValue = async () => {
      try {
        // Dexie automatically handles opening the database.
        const storedRecord = await db["keyval-store"].get(key);
        if (storedRecord) {
          // If we find data, we update our state with it.
          setValue(storedRecord.value);
        }
      } catch (error) {
        console.error(`[useIndexedDb] Error fetching for key "${key}":`, error);
      }
    };

    fetchValue();
  }, [key]);

  // --- EFFECT 2: Write state changes to IndexedDB ---
  // This effect runs whenever `value` changes.
  useEffect(() => {
    // On the very first render, we don't want to save anything.
    // We set the ref to false and exit, so this only runs on subsequent updates.
    if (isInitialMount.current) {
      isInitialMount.current = false;
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
  }, [key, value]);

  /**
   * Provides a STABLE setter function that updates the component's state.
   * The change in state will then trigger the save-effect above.
   */
  const setStoredValue = useCallback(
    (valOrFn) => {
      setValue(valOrFn);
    },
    [] // This setter function is stable and will not cause re-renders.
  );

  // Provides a helpful label in React DevTools.
  useDebugValue(value, (val) => `[IndexedDB] ${key}: ${JSON.stringify(val)}`);

  return [value, setStoredValue];
}

// The default export is the hook itself.
export default useIndexedDb;
