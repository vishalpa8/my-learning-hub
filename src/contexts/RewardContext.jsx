import React, {
  useState,
  useCallback,
  useEffect,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DSA_REWARD_TRACKER_KEY } from "../constants/localStorageKeys";
import { RewardContext } from "./useReward"; // Import RewardContext from the new file

/** A list of predefined reward messages. */
const REWARDS = [
  "Go and Enjoy Chaap!",
  "Go and Watch any movie of your choice",
  "Go and Drink Mango Shake of your size choice",
  "Go and Watch any series of your type",
  "Go and drink or eat anything of your like",
];
/** The number of newly completed DSA questions required to contribute to a reward. */
const DSA_QUESTIONS_THRESHOLD = 5; // Example: 3 DSA problems
/** The number of newly completed Chess videos required to contribute to a reward. */
const CHESS_VIDEOS_THRESHOLD = 6; // Example: 2 Chess videos

/**
 * @typedef {object} RewardTracker
 * Tracks progress towards the next reward based on completed DSA problems and Chess videos.
 * @property {number} lastKnownTotalCompletedDSA - The total number of completed DSA problems known at the last check.
 * @property {number} completedSinceLastRewardDSA - Count of DSA problems completed since the last reward was triggered.
 * @property {number} lastKnownTotalCompletedChess - The total number of completed Chess videos known at the last check.
 * @property {number} completedSinceLastRewardChess - Count of Chess videos completed since the last reward was triggered.
 * @property {string[]} availableRewards - Pool of reward messages yet to be shown in the current cycle.
 * @property {boolean} rewardPending - Flag indicating if a reward has been determined and is waiting to be shown.
 * @property {string} pendingMessage - The message for the pending reward.
 */
// The RewardContext object is now imported from './useReward.js'.
// Consumers will import the useReward hook directly from './useReward.js'.
/**
 * Provides reward-related state and functions to its children.
 * Manages modal visibility, reward messages, and the logic for triggering rewards
 * based on the number of DSA problems and Chess videos completed.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The child components that can access the context.
 */
export const RewardProvider = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [rewardTracker, setRewardTracker] = useLocalStorage(
    DSA_REWARD_TRACKER_KEY,
    /** @type {RewardTracker} */
    {
      lastKnownTotalCompletedDSA: 0,
      completedSinceLastRewardDSA: 0,
      lastKnownTotalCompletedChess: 0,
      completedSinceLastRewardChess: 0,
      availableRewards: [...REWARDS],
      rewardPending: false,
      pendingMessage: "",
    }
  );

  /**
   * Helper function to handle the logic for triggering a reward.
   * @param {RewardTracker} tracker - The current reward tracker state.
   * @returns {RewardTracker} The updated reward tracker state after triggering a reward.
   */
  const triggerRewardLogic = (tracker) => {
    let rewardsPool = [...tracker.availableRewards];
    if (rewardsPool.length === 0) {
      rewardsPool = [...REWARDS]; // Replenish if empty
    }
    const randomIndex = Math.floor(Math.random() * rewardsPool.length);
    const selectedMessage = rewardsPool[randomIndex];
    const updatedAvailableRewards = rewardsPool.filter(
      (_, index) => index !== randomIndex
    );

    return {
      ...tracker,
      completedSinceLastRewardDSA: 0, // Reset DSA counter
      completedSinceLastRewardChess: 0, // Reset Chess counter
      availableRewards: updatedAvailableRewards,
      rewardPending: true,
      pendingMessage: selectedMessage,
    };
  };

  /**
   * Records the progress of completed DSA problems and checks if a combined reward should be triggered.
   * @param {number} currentTotalCompletedDSA - The current total number of DSA problems completed.
   */
  const recordDsaProgress = useCallback(
    (currentTotalCompletedDSA) => {
      setRewardTracker((prevTracker) => {
        let updatedTracker = { ...prevTracker };

        // Handle decrease in DSA problems
        if (currentTotalCompletedDSA < prevTracker.lastKnownTotalCompletedDSA) {
          updatedTracker = {
            ...prevTracker,
            lastKnownTotalCompletedDSA: currentTotalCompletedDSA,
            completedSinceLastRewardDSA: 0, // Reset only DSA reward counter
          };
        } else {
          const newlyCompletedDSA =
            currentTotalCompletedDSA - prevTracker.lastKnownTotalCompletedDSA;

          if (newlyCompletedDSA > 0) {
            updatedTracker = {
              ...prevTracker,
              lastKnownTotalCompletedDSA: currentTotalCompletedDSA,
              completedSinceLastRewardDSA:
                prevTracker.completedSinceLastRewardDSA + newlyCompletedDSA,
            };
          }
        }

        // Check for combined reward
        if (
          updatedTracker.completedSinceLastRewardDSA >=
            DSA_QUESTIONS_THRESHOLD &&
          updatedTracker.completedSinceLastRewardChess >= CHESS_VIDEOS_THRESHOLD
        ) {
          console.log(
            "[RewardContext] DSA Update: THRESHOLD MET! Triggering reward."
          );
          return triggerRewardLogic(updatedTracker);
        }
        // console.log("[RewardContext] DSA Update: Threshold NOT met. DSA Progress:", updatedTracker.completedSinceLastRewardDSA, "Chess Progress:", updatedTracker.completedSinceLastRewardChess);
        return updatedTracker;
      });
    },
    [setRewardTracker]
  );

  /**
   * Records the progress of completed Chess videos and checks if a combined reward should be triggered.
   * @param {number} currentTotalCompletedChess - The current total number of Chess videos completed.
   */
  const recordChessProgress = useCallback(
    (currentTotalCompletedChess) => {
      setRewardTracker((prevTracker) => {
        let updatedTracker = { ...prevTracker };

        // Handle decrease in Chess videos
        if (
          currentTotalCompletedChess < prevTracker.lastKnownTotalCompletedChess
        ) {
          updatedTracker = {
            ...prevTracker,
            lastKnownTotalCompletedChess: currentTotalCompletedChess,
            completedSinceLastRewardChess: 0, // Reset only Chess reward counter
          };
        } else {
          const newlyCompletedChess =
            currentTotalCompletedChess -
            prevTracker.lastKnownTotalCompletedChess;

          if (newlyCompletedChess > 0) {
            updatedTracker = {
              ...prevTracker,
              lastKnownTotalCompletedChess: currentTotalCompletedChess,
              completedSinceLastRewardChess:
                prevTracker.completedSinceLastRewardChess + newlyCompletedChess,
            };
          }
        }

        // Check for combined reward
        if (
          updatedTracker.completedSinceLastRewardDSA >=
            DSA_QUESTIONS_THRESHOLD &&
          updatedTracker.completedSinceLastRewardChess >= CHESS_VIDEOS_THRESHOLD
        ) {
          console.log(
            "[RewardContext] Chess Update: THRESHOLD MET! Triggering reward."
          );
          return triggerRewardLogic(updatedTracker);
        }
        // console.log("[RewardContext] Chess Update: Threshold NOT met. DSA Progress:", updatedTracker.completedSinceLastRewardDSA, "Chess Progress:", updatedTracker.completedSinceLastRewardChess);
        return updatedTracker;
      });
    },
    [setRewardTracker]
  );

  // Effect to display the modal when a reward is pending.
  useEffect(() => {
    if (rewardTracker.rewardPending) {
      setModalMessage(rewardTracker.pendingMessage);
      setIsModalVisible(true);

      // Clear the pending state from the tracker once the modal is set to be visible.
      setRewardTracker((prevTracker) => ({
        ...prevTracker,
        rewardPending: false,
        pendingMessage: "",
      }));
    }
  }, [rewardTracker, setRewardTracker]);

  /** Closes the reward modal. */
  const closeRewardModal = () => {
    setIsModalVisible(false);
  };

  const value = {
    isModalVisible,
    modalMessage,
    closeRewardModal,
    recordDsaProgress, // Expose new function
    recordChessProgress, // Expose new function
  };

  return (
    <RewardContext.Provider value={value}>{children}</RewardContext.Provider>
  );
};
