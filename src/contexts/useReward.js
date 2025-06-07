import { createContext, useContext } from "react";

// It's good practice to define the shape of the context value,
// especially if it's complex. This can be done with JSDoc or TypeScript.
/**
 * @typedef {object} RewardContextValue
 * @property {boolean} isModalVisible - Whether the reward modal is currently visible.
 * @property {string} modalMessage - The message to display in the reward modal.
 * @property {() => void} closeRewardModal - Function to close the reward modal.
 * @property {(currentTotalCompletedDSA: number) => void} recordDsaProgress - Function to record DSA progress.
 * @property {(currentTotalCompletedChess: number) => void} recordChessProgress - Function to record Chess progress.
 */

/**
 * React Context for managing reward states and actions.
 * The default value is `undefined` and will be overridden by the Provider.
 * Consumers must be descendants of `RewardProvider`.
 * @type {React.Context<RewardContextValue | undefined>}
 */
export const RewardContext = createContext(undefined);

/**
 * Custom hook to access the reward context.
 * This hook provides an easy way to consume reward-related state and functions.
 *
 * @returns {RewardContextValue} The current reward context value.
 * @throws {Error} If the hook is used outside of a `RewardProvider`.
 */
export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error(
      "useReward must be used within a RewardProvider. Ensure the component is wrapped in RewardProvider."
    );
  }
  return context;
};
