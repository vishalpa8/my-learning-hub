import { useState, useEffect, useCallback } from "react";
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
  if (typeof window === "undefined") return;
  await db["keyval-store"].clear();
}

/**
 * useIndexedDb - React hook for persistent state in IndexedDB.
 * @param {string} key
 * @param {any} initialValue
 * @returns [value, setValue, loading, error]
 */
export function useIndexedDb(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof window === "undefined") return;

    db["keyval-store"]
      .get(key)
      .then((result) => {
        if (isMounted) {
          if (result && "value" in result) {
            setValue(result.value);
          }
          setHasLoaded(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setHasLoaded(true);
        }
        console.error("IndexedDB load error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  // Save to IndexedDB when value changes (after initial load)
  useEffect(() => {
    if (!hasLoaded || typeof window === "undefined") return;
    db["keyval-store"].put({ id: key, value }).catch((err) => {
      setError(err);
      console.error("IndexedDB save error:", err);
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
