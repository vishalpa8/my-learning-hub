import { useIndexedDb } from "./useIndexedDb";
import { CHESS_USER_PROFILE_KEY } from "../constants/localIndexedDbKeys";
import { dateToDDMMYYYY } from "../utils/dateHelpers";
import { INITIAL_CHESS_ELO } from "../constants/chessConstants";
import { checkAndAwardChessBadges } from "../utils/chessUtils";

const ELO_GAIN_PER_TWO_VIDEOS = 10;

/**
 * @typedef {object} UserProfile
 * @property {number} points - Total points earned by the user.
 * @property {number} currentStreak - Current learning streak in days.
 * @property {string | null} lastActivityDate - The last date (DD-MM-YYYY) a learning activity was recorded.
 * @property {Object.<string, boolean>} earnedBadges - Object mapping badge IDs to true if earned.
 * @property {string[]} allActivityDates - Array of ISO date strings for all recorded activities.
 */

/**
 * Custom hook to manage the user's learning profile (points, streak, badges) in IndexedDB.
 * @returns {[UserProfile, (pointsChange: number, activityDate?: string, completedVideos?: Object, structuredChessData?: Array<Object>) => void, (badgeId: string) => void, boolean, Error]}
 *          [userProfile, addPoints, updateStreak, earnBadge, loading, error]
 */
export function useUserProfile() {
  const [userProfile, setUserProfile, loading, error] = useIndexedDb(
    CHESS_USER_PROFILE_KEY,
    /** @type {UserProfile} */
    {
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      earnedBadges: {},
      allActivityDates: [],
    }
  );

  /**
   * Adds points to the user's profile.
   * @param {number} pointsToAdd - The number of points to add.
   */
  const updatePoints = (pointsChange, activityDate = null, completedVideos = null, structuredChessData = null) => {
    setUserProfile((prevProfile) => {
      const existingActivityDates = Array.isArray(prevProfile.allActivityDates) ? prevProfile.allActivityDates : [];
      let newAllActivityDates = [...existingActivityDates];

      if (activityDate) {
        if (pointsChange > 0) { // Marking complete, add date
          newAllActivityDates.push(activityDate);
        } else if (pointsChange < 0) { // Unmarking, remove date
          const index = newAllActivityDates.indexOf(activityDate);
          if (index > -1) {
            newAllActivityDates.splice(index, 1);
          }
        }
      }

      // Recalculate streak based on the updated activity dates
      const { currentStreak, longestStreak, lastActivityDate } =
        calculateStreak(newAllActivityDates, prevProfile.longestStreak);

      let updatedProfile = {
        ...prevProfile,
        points: Math.max(0, (isNaN(Number(prevProfile.points)) ? 0 : Number(prevProfile.points)) + pointsChange),
        allActivityDates: newAllActivityDates,
        currentStreak,
        longestStreak,
        lastActivityDate,
      };

      // ELO Calculation (only for Chess-related updates)
      if (completedVideos && structuredChessData) {
        const wasPairCompleted =
          Object.values(completedVideos).filter(Boolean).length % 2 === 0 && pointsChange > 0;
        const wasPairBroken =
          Object.values(completedVideos).filter(Boolean).length % 2 === 1 && pointsChange < 0;

        const currentElo = isNaN(Number(prevProfile.elo)) ? INITIAL_CHESS_ELO : Number(prevProfile.elo);
        if (wasPairCompleted) {
          updatedProfile.elo = currentElo + ELO_GAIN_PER_TWO_VIDEOS;
        } else if (wasPairBroken) {
          updatedProfile.elo = currentElo - ELO_GAIN_PER_TWO_VIDEOS;
        }
        // Ensure ELO doesn't drop below the initial value
        if (updatedProfile.elo < INITIAL_CHESS_ELO) {
          updatedProfile.elo = INITIAL_CHESS_ELO;
        }

        // Check for badges after all profile updates
        updatedProfile = checkAndAwardChessBadges(
          updatedProfile,
          completedVideos,
          structuredChessData
        );
      }

      return updatedProfile;
    });
  };

  const calculateStreak = (activityDates, prevLongestStreak) => {
    if (!activityDates || activityDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: prevLongestStreak,
        lastActivityDate: null,
      };
    }

    const uniqueDates = Array.from(
      new Set(activityDates.map((date) => dateToDDMMYYYY(new Date(date))))
    ).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    if (uniqueDates.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      lastDate = new Date(uniqueDates[0]);

      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1; // Reset streak if not consecutive
        }
        longestStreak = Math.max(longestStreak, currentStreak);
        lastDate = currentDate;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(prevLongestStreak, longestStreak),
      lastActivityDate: lastDate ? dateToDDMMYYYY(lastDate) : null,
    };
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

  return [userProfile, updatePoints, earnBadge, loading, error];
}
