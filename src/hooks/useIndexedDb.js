import { useState, useEffect, useCallback, useDebugValue } from "react";
import Dexie from 'dexie';

// --- Dexie Database Setup ---
// This db instance is exported so it can be used elsewhere (e.g., for a reset function)
export const db = new Dexie('keyval-db');
db.version(1).stores({
  // We will store items as {id: key, value: data}
  // The 'id' field will be our primary key (the string key we pass to the hook)
  'keyval-store': 'id'
});


// --- useIndexedDb Hook ---

/**
 * A custom React hook that syncs state with IndexedDB.
 * @param {string} key - The IndexedDB key to use.
 * @param {any} defaultValue - The initial value to use if no value is found.
 * @returns {[any, function(any): void]} A stateful value, and a function to update it.
 */
export function useIndexedDb(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);

  // Effect to load initial value from IndexedDB on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchValue = async () => {
      console.log(`[useIndexedDB] Fetching for key: "${key}"`);
      try {
        // Dexie will automatically open the database if it's not already open.
        const storedRecord = await db['keyval-store'].get(key);
        if (storedRecord) {
          console.log(`[useIndexedDB] Found for key: "${key}", value:`, storedRecord.value);
          setValue(storedRecord.value);
        } else {
          console.log(`[useIndexedDB] Not Found for key: "${key}". Using default value.`);
        }
      } catch (error) {
        console.error(`[useIndexedDB] Error Fetching for key: "${key}"`, error);
      }
    };

    fetchValue();
  }, [key]);

  /**
   * Provides a STABLE setter function that updates React state and writes to IndexedDB.
   */
  const setStoredValue = useCallback(
    (valOrFn) => {
      // Use the functional update form to get the previous value
      setValue(prevValue => {
        const newValue = typeof valOrFn === 'function' ? valOrFn(prevValue) : valOrFn;

        console.log(`[useIndexedDB] Saving for key: "${key}", new value:`, newValue);
        
        // Perform the async database write operation immediately.
        (async () => {
          try {
            await db['keyval-store'].put({ id: key, value: newValue });
            console.log(`[useIndexedDB] Save successful for key: "${key}"`);
          } catch (error) {
            console.error(`[useIndexedDB] Error Saving for key: "${key}"`, error);
          }
        })();

        // Return the new value to update React state.
        return newValue;
      });
    },
    [key] // Dependency on key ensures the correct key is used in the closure.
  );

  useDebugValue(value, (val) => `IndexedDB['${key}']: ${JSON.stringify(val)}`);

  return [value, setStoredValue];
}

export default useIndexedDb;
