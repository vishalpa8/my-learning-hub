import { useCallback } from "react";
import { useIndexedDb } from "./useIndexedDb";
import {
  INITIAL_CHESS_ELO, // Import the constant
  initialChessUserProfile,
  checkAndAwardChessBadges,
} from "../utils/chessUtils";
import {
  CHESS_LEARNING_PROGRESS_KEY,
  CHESS_USER_PROFILE_KEY,
} from "../constants/localStorageKeys";

const ELO_GAIN_PER_TWO_VIDEOS = 10; // Define how much ELO is gained for every 2 completed videos

/**
 * Custom hook to manage chess user data, including video completion progress,
 * user profile (points, streaks, badges), and provides a handler to toggle video completion.
 *
 * @param {Array<Object>} structuredChessData - The structured chess data containing ELO stages, playlists, and videos.
 * This is used by `checkAndAwardChessBadges`.
 * @returns {{
 *  completedVideos: Object.<string, boolean>,
 *  userProfile: Object,
 *  handleToggleVideoComplete: function(videoGlobalId: string, videoPoints?: number): void
 * }}
 */
export const useChessUserData = (structuredChessData) => {
  const [completedVideos, setCompletedVideos] = useIndexedDb(
    CHESS_LEARNING_PROGRESS_KEY,
    {}
  );
  const [userProfile, setUserProfile] = useIndexedDb(
    CHESS_USER_PROFILE_KEY,
    initialChessUserProfile
  );

  /**
   * Toggles the completion status of a video, updates user points,
   * updates learning streak, and checks for badge awards.
   * @param {string} videoGlobalId - The global ID of the video to toggle.
   * @param {number} [videoPoints=10] - The points to award or deduct for this video.
   */
  const handleToggleVideoComplete = useCallback(
    (videoGlobalId, videoPoints = 10) => {
      setCompletedVideos((prevCompletedVideos) => {
        const isCurrentlyCompleted = !!prevCompletedVideos[videoGlobalId];
        const newCompletedStatus = !isCurrentlyCompleted;

        const updatedCompletedVideos = { ...prevCompletedVideos };
        if (newCompletedStatus) {
          updatedCompletedVideos[videoGlobalId] = true;
        } else {
          delete updatedCompletedVideos[videoGlobalId];
        }

        setUserProfile((prevProfile) => {
          const pointsChange = newCompletedStatus ? videoPoints : -videoPoints;
          let updatedProfile = {
            ...prevProfile,
            points: Math.max(0, prevProfile.points + pointsChange),
          };

          // ELO Calculation: Recalculate based on total completed video pairs
          const totalCompletedVideoCount = Object.values(
            updatedCompletedVideos
          ).filter((isComplete) => isComplete === true).length;
          const completedVideoPairs = Math.floor(totalCompletedVideoCount / 2);

          // ELO is always INITIAL_ELO + gains from completed pairs
          updatedProfile.elo =
            INITIAL_CHESS_ELO + completedVideoPairs * ELO_GAIN_PER_TWO_VIDEOS;

          // Streak logic: Update only if a video is newly completed.
          if (newCompletedStatus) {
            const today = new Date();
            const todayDateString = today.toDateString();
            let newCurrentStreak = prevProfile.currentStreak || 0;
            let newLongestStreak = prevProfile.longestStreak || 0;

            // Only update streak if it's a new day of activity
            if (prevProfile.lastActiveDate !== todayDateString) {
              const lastCompletion = prevProfile.lastActiveDate
                ? new Date(prevProfile.lastActiveDate)
                : null;

              if (lastCompletion) {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                if (
                  lastCompletion.toDateString() === yesterday.toDateString()
                ) {
                  newCurrentStreak = (prevProfile.currentStreak || 0) + 1;
                } else {
                  newCurrentStreak = 1; // Reset streak if not consecutive
                }
              } else {
                newCurrentStreak = 1; // First completion or streak broken
              }
              updatedProfile.lastActiveDate = todayDateString;
            }
            updatedProfile.currentStreak = newCurrentStreak;
            updatedProfile.longestStreak = Math.max(
              newLongestStreak,
              newCurrentStreak
            );
          }

          // Check for badges after all profile updates
          updatedProfile = checkAndAwardChessBadges(
            updatedProfile,
            updatedCompletedVideos,
            structuredChessData
          );
          return updatedProfile;
        });

        return updatedCompletedVideos;
      });
    },
    [structuredChessData, setCompletedVideos, setUserProfile]
  );

  return { completedVideos, userProfile, handleToggleVideoComplete };
};

export default useChessUserData;
