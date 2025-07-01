import { useIndexedDb } from "./useIndexedDb";
import { CHESS_USER_PROFILE_KEY } from "../constants/localIndexedDbKeys";
import { dateToDDMMYYYY } from "../utils/dateHelpers";

/**
 * @typedef {object} UserProfile
 * @property {number} points - Total points earned by the user.
 * @property {number} currentStreak - Current learning streak in days.
 * @property {string | null} lastActivityDate - The last date (DD-MM-YYYY) a learning activity was recorded.
 * @property {Object.<string, boolean>} earnedBadges - Object mapping badge IDs to true if earned.
 */

/**
 * Custom hook to manage the user's learning profile (points, streak, badges) in IndexedDB.
 * @returns {[UserProfile, (points: number) => void, (activityDate: Date) => void, (badgeId: string) => void, boolean, Error]}
 *          [userProfile, addPoints, updateStreak, earnBadge, loading, error]
 */
export function useUserProfile() {
  const [userProfile, setUserProfile, loading, error] = useIndexedDb(
    CHESS_USER_PROFILE_KEY,
    /** @type {UserProfile} */
    {
      points: 0,
      currentStreak: 0,
      lastActivityDate: null,
      earnedBadges: {},
    }
  );

  /**
   * Adds points to the user's profile.
   * @param {number} pointsToAdd - The number of points to add.
   */
  const addPoints = (pointsToAdd) => {
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      points: prevProfile.points + pointsToAdd,
    }));
  };

  /**
   * Updates the user's learning streak based on activity date.
   * @param {Date} activityDate - The date of the current activity.
   */
  const updateStreak = (activityDate) => {
    setUserProfile((prevProfile) => {
      // Ensure activityDate is a Date object
      let currentActivityDate = activityDate;
      if (!(activityDate instanceof Date)) {
        // Assuming activityDate might be a string in DD-MM-YYYY format if not a Date object
        const parts = activityDate.split('-');
        currentActivityDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }

      const todayStr = dateToDDMMYYYY(currentActivityDate);
      const yesterday = new Date(currentActivityDate);
      yesterday.setDate(currentActivityDate.getDate() - 1);
      const yesterdayStr = dateToDDMMYYYY(yesterday);

      let newStreak = prevProfile.currentStreak;
      if (prevProfile.lastActivityDate === todayStr) {
        // Activity already recorded for today, streak doesn't change
        return prevProfile;
      } else if (prevProfile.lastActivityDate === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else {
        // New streak or streak broken
        newStreak = 1;
      }

      return {
        ...prevProfile,
        currentStreak: newStreak,
        lastActivityDate: todayStr,
      };
    });
  };

  /**
   * Marks a badge as earned.
   * @param {string} badgeId - The ID of the badge to mark as earned.
   */
  const earnBadge = (badgeId) => {
    setUserProfile((prevProfile) => {
      if (prevProfile.earnedBadges[badgeId]) {
        return prevProfile; // Already earned
      }
      return {
        ...prevProfile,
        earnedBadges: { ...prevProfile.earnedBadges, [badgeId]: true },
      };
    });
  };

  return [userProfile, addPoints, updateStreak, earnBadge, loading, error];
}
