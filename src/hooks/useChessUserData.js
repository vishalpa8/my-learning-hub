import { useCallback } from "react";
import { useIndexedDb } from "./useIndexedDb";
import { useUserProfile } from "./useUserProfile";
import {
  CHESS_LEARNING_PROGRESS_KEY,
} from "../constants/localIndexedDbKeys";

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
  const [userProfile, updatePoints] = useUserProfile();

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
          updatedCompletedVideos[videoGlobalId] = new Date().toISOString(); // Store completion date
        } else {
          delete updatedCompletedVideos[videoGlobalId];
        }

        const pointsChange = newCompletedStatus ? videoPoints : -videoPoints;
        const activityDate = newCompletedStatus ? updatedCompletedVideos[videoGlobalId] : prevCompletedVideos[videoGlobalId];

        // Use the updatePoints from useUserProfile to update points, ELO, streak, and badges
        updatePoints(pointsChange, activityDate, updatedCompletedVideos, structuredChessData);

        return updatedCompletedVideos;
      });
    },
    [structuredChessData, setCompletedVideos, updatePoints]
  );

  return { completedVideos, userProfile, handleToggleVideoComplete };
};

export default useChessUserData;
