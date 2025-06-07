import { useState, useEffect, useCallback, useDebugValue } from "react";

/**
 * Retrieves a value from localStorage.
 * Gracefully handles potential errors during parsing and SSR.
 * @param {string} key - The localStorage key.
 * @param {any} defaultValue - The default value to return if the key is not found or an error occurs.
 * @returns {any} The stored value or the default value.
 */
function getStorageValue(key, defaultValue) {
  // Return defaultValue immediately if window is not defined (SSR).
  if (typeof window === "undefined") return defaultValue;

  try {
    const saved = window.localStorage.getItem(key);
    // Parse the saved value if it exists, otherwise return defaultValue.
    // JSON.parse(null) returns null, so explicitly checking saved !== null is good practice.
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    // Return defaultValue in case of any error during parsing.
    return defaultValue;
  }
}

/**
 * A custom React hook that syncs state with localStorage.
 * @param {string} key - The localStorage key to use.
 * @param {any} defaultValue - The initial value to use if no value is found in localStorage or if running on the server.
 * @returns {[any, function(any): void]} A stateful value, and a function to update it.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue));

  useEffect(() => {
    // Do nothing on the server.
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Provides a stable setter function, similar to the one returned by useState.
  // This allows for functional updates, e.g., setStoredValue(prev => prev + 1).
  const setStoredValue = useCallback((valOrFn) => {
    setValue((prev) =>
      typeof valOrFn === "function" ? valOrFn(prev) : valOrFn
    );
  }, []);

  // useDebugValue is helpful for inspecting the hook's state in React DevTools.
  // It shows the localStorage key and its current value.
  useDebugValue(value, (val) => `localStorage['${key}']: ${JSON.stringify(val)}`);

  return [value, setStoredValue];
}

export default useLocalStorage;
