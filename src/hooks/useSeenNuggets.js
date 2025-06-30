import { useIndexedDb } from "./useIndexedDb";
import { SEEN_NUGGETS_KEY } from "../constants/localStorageKeys";

/**
 * Custom hook to manage the state of seen daily chess nuggets in IndexedDB.
 * @returns {[Object.<string, boolean>, (nuggetId: string, onMarkedAsSeen?: () => void) => void, boolean, Error]} 
 *          [seenNuggets, markNuggetAsSeen, loading, error]
 */
export function useSeenNuggets() {
  const [seenNuggets, setSeenNuggets, loading, error] = useIndexedDb(
    SEEN_NUGGETS_KEY,
    {} // Initial state: an empty object
  );

  /**
   * Marks a specific nugget as seen.
   * @param {string} nuggetId - The ID of the nugget to mark as seen.
   * @param {() => void} [onMarkedAsSeen] - Optional callback to run after the nugget is marked as seen.
   */
  const markNuggetAsSeen = (nuggetId, onMarkedAsSeen) => {
    setSeenNuggets((prevSeenNuggets) => {
      if (prevSeenNuggets[nuggetId]) {
        return prevSeenNuggets; // Already seen, no change needed
      }
      // If not seen, mark as seen and then execute callback
      const newSeenNuggets = { ...prevSeenNuggets, [nuggetId]: true };
      if (onMarkedAsSeen && typeof onMarkedAsSeen === 'function') {
        // Execute callback immediately after state update is scheduled
        // This ensures it runs only when a *new* nugget is marked.
        onMarkedAsSeen();
      }
      return newSeenNuggets;
    });
  };

  return [seenNuggets, markNuggetAsSeen, loading, error];
}
