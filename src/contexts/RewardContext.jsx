import React, { useState, useCallback, useEffect, useRef } from "react";
import { useIndexedDb } from "../hooks/useIndexedDb";
import { useUserProfile } from "../hooks/useUserProfile";
import { DSA_REWARD_TRACKER_KEY } from "../constants/localIndexedDbKeys";
import { RewardContext } from "./useReward";
import { chess_badges_definitions, BADGE_CRITERIA } from "../data/chessData";

/** A list of predefined reward messages. */
const REWARDS = [
  "Go and Enjoy Chaap!",
  "Go and Watch any movie of your choice",
  "Go and Drink Mango Shake of your size choice",
  "Go and Watch any series of your type",
  "Go and drink or eat anything of your like",
];
const POINTS_PER_REWARD = 10;
/** The number of newly completed DSA questions required to contribute to a reward. */
const DSA_QUESTIONS_THRESHOLD = 5; // Example: 5 DSA problems
/** The number of newly completed Chess videos required to contribute to a reward. */
const CHESS_VIDEOS_THRESHOLD = 5; // Example: 5 Chess videos

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
  const [rewardTracker, setRewardTracker] = useIndexedDb(
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

  const [userProfile, addPoints, earnBadge] = useUserProfile();

  const lastKnownPointsRef = useRef(userProfile.points);
  const lastKnownStreakRef = useRef(userProfile.currentStreak);

  // Effect to update lastKnownPointsRef when userProfile.points changes
  useEffect(() => {
    lastKnownPointsRef.current = userProfile.points;
  }, [userProfile.points]);

  // Effect to update lastKnownStreakRef when userProfile.currentStreak changes
  useEffect(() => {
    lastKnownStreakRef.current = userProfile.currentStreak;
  }, [userProfile.currentStreak]);

  /**
   * Handles the logic for triggering a reward: selects a message, updates available rewards,
   * and sets the reward as pending. Also awards points.
   * @param {RewardTracker} tracker - The current reward tracker state.
   * @returns {RewardTracker} The updated reward tracker state after triggering a reward.
   */
  const triggerRewardLogic = useCallback(
    (tracker) => {
      let rewardsPool = [...tracker.availableRewards];
      if (rewardsPool.length === 0) {
        rewardsPool = [...REWARDS]; // Replenish if empty
      }
      const randomIndex = Math.floor(Math.random() * rewardsPool.length);
      const selectedMessage = rewardsPool[randomIndex];
      const updatedAvailableRewards = rewardsPool.filter(
        (_, index) => index !== randomIndex
      );

      // Award points for the reward
      addPoints(POINTS_PER_REWARD); // Assuming CONSTANTS.POINTS_PER_REWARD is defined elsewhere

      return {
        ...tracker,
        completedSinceLastRewardDSA: 0, // Reset DSA counter
        completedSinceLastRewardChess: 0, // Reset Chess counter
        availableRewards: updatedAvailableRewards,
        rewardPending: true,
        pendingMessage: selectedMessage,
      };
    },
    [addPoints]
  ); // REWARDS is a module-level constant, so no dependencies needed.

  /**
   * Checks if the combined reward threshold is met and triggers the reward logic if so.
   * @param {RewardTracker} tracker - The current reward tracker state.
   * @param {string} source - The source of the progress update (e.g., "DSA_INCREASE", "CHESS_DECREASE").
   * @returns {RewardTracker} The potentially updated reward tracker state.
   */
  const checkAndTriggerCombinedReward = useCallback(
    (tracker) => {
      if (
        tracker.completedSinceLastRewardDSA >= DSA_QUESTIONS_THRESHOLD &&
        tracker.completedSinceLastRewardChess >= CHESS_VIDEOS_THRESHOLD
      ) {
        return triggerRewardLogic(tracker);
      }
      return tracker;
    },
    [triggerRewardLogic]
  );

  /**
   * Records the progress of completed DSA problems and checks if a combined reward should be triggered.
   * @param {number} currentTotalCompletedDSA - The current total number of DSA problems completed.
   */
  const recordDsaProgress = useCallback(
    (currentTotalCompletedDSA) => {
      setRewardTracker((prevTracker) => {
        // If current total is less, it means items were un-completed.
        // Reset the specific counter for this source.
        if (currentTotalCompletedDSA < prevTracker.lastKnownTotalCompletedDSA) {
          return checkAndTriggerCombinedReward({
            // Check if reward still met with other source
            ...prevTracker,
            lastKnownTotalCompletedDSA: currentTotalCompletedDSA,
            completedSinceLastRewardDSA: 0,
          });
        }

        // If the total hasn't changed, return the previous state to prevent unnecessary re-renders.
        if (
          currentTotalCompletedDSA === prevTracker.lastKnownTotalCompletedDSA
        ) {
          return prevTracker;
        }

        const newlyCompletedDSA =
          currentTotalCompletedDSA - prevTracker.lastKnownTotalCompletedDSA;
        const updatedCompletedSinceLastRewardDSA =
          prevTracker.completedSinceLastRewardDSA +
          Math.max(0, newlyCompletedDSA);

        const updatedTracker = {
          ...prevTracker,
          lastKnownTotalCompletedDSA: currentTotalCompletedDSA,
          completedSinceLastRewardDSA: updatedCompletedSinceLastRewardDSA,
        };
        return checkAndTriggerCombinedReward(updatedTracker);
      });
    },
    [setRewardTracker, checkAndTriggerCombinedReward]
  );

  /**
   * Records the progress of completed Chess videos and checks if a combined reward should be triggered.
   * @param {number} currentTotalCompletedChess - The current total number of Chess videos completed.
   */
  const recordChessProgress = useCallback(
    (currentTotalCompletedChess) => {
      setRewardTracker((prevTracker) => {
        // If current total is less, it means items were un-completed.
        // Reset the specific counter for this source.
        if (
          currentTotalCompletedChess < prevTracker.lastKnownTotalCompletedChess
        ) {
          return checkAndTriggerCombinedReward({
            // Check if reward still met with other source
            ...prevTracker,
            lastKnownTotalCompletedChess: currentTotalCompletedChess,
            completedSinceLastRewardChess: 0,
          });
        }

        const newlyCompletedChess =
          currentTotalCompletedChess - prevTracker.lastKnownTotalCompletedChess;
        const updatedCompletedSinceLastRewardChess =
          prevTracker.completedSinceLastRewardChess +
          Math.max(0, newlyCompletedChess);

        const updatedTracker = {
          ...prevTracker,
          lastKnownTotalCompletedChess: currentTotalCompletedChess,
          completedSinceLastRewardChess: updatedCompletedSinceLastRewardChess,
        };
        return checkAndTriggerCombinedReward(updatedTracker);
      });
    },
    [setRewardTracker, checkAndTriggerCombinedReward]
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

  // Effect to check and award badges when user profile data changes
  useEffect(() => {
    if (!userProfile || !userProfile.earnedBadges) return; // Ensure profile is loaded

    chess_badges_definitions.forEach((badge) => {
      if (!userProfile.earnedBadges[badge.id]) {
        let criteriaMet = false;
        switch (badge.criteria.type) {
          case BADGE_CRITERIA.POINTS_EARNED:
            criteriaMet = userProfile.points >= badge.criteria.value;
            break;
          case BADGE_CRITERIA.LEARNING_STREAK:
            criteriaMet = userProfile.currentStreak >= badge.criteria.value;
            break;
          // Add other criteria types as needed (e.g., TASKS_COMPLETED, STAGE_CLEARED, VIDEOS_WATCHED)
          // For now, these would need to be passed into the RewardProvider or fetched here.
          // For simplicity, we'll focus on points and streak for now.
          default:
            break;
        }

        if (criteriaMet) {
          earnBadge(badge.id);
          // Optionally, show a notification or a special modal for new badge earned
          console.log(`Badge earned: ${badge.name}`);
        }
      }
    });
  }, [userProfile, earnBadge]); // Depend on userProfile and earnBadge

  /** Closes the reward modal. */
  const closeRewardModal = () => {
    setIsModalVisible(false);
  };

  const value = {
    isModalVisible,
    modalMessage,
    closeRewardModal,
    recordDsaProgress,
    recordChessProgress,
  };

  return (
    <RewardContext.Provider value={value}>{children}</RewardContext.Provider>
  );
};
