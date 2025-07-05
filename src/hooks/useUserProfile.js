import { useIndexedDb } from "./useIndexedDb";
import { CHESS_USER_PROFILE_KEY } from "../constants/localIndexedDbKeys";
import { dateToDDMMYYYY, parseDDMMYYYYToDateObj } from "../utils/dateHelpers";
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
        // Convert ISO date string to DD-MM-YYYY format for consistent storage
        const formattedDate = dateToDDMMYYYY(new Date(activityDate));
        if (pointsChange > 0) { // Marking complete, add date
          newAllActivityDates.push(formattedDate);
        } else if (pointsChange < 0) { // Unmarking, remove date
          const index = newAllActivityDates.indexOf(formattedDate);
          if (index > -1) {
            newAllActivityDates.splice(index, 1);
          }
        }
      }

      // Recalculate streak based on the updated activity dates
      const { currentStreak, longestStreak, lastActivityDate } =
        calculateStreak(newAllActivityDates);

      let updatedProfile = {
        ...prevProfile,
        points: Math.max(0, (isNaN(Number(prevProfile.points)) ? 0 : Number(prevProfile.points)) + pointsChange),
        allActivityDates: newAllActivityDates,
        currentStreak,
        longestStreak: Math.max(prevProfile.longestStreak || 0, longestStreak),
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
      console.log("useUserProfile: Updated profile before return", updatedProfile);
      return updatedProfile;
    });
  };

  const calculateStreak = (activityDates) => {
    if (!activityDates || activityDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      };
    }

    // Dates are now stored in DD-MM-YYYY, so parse them correctly
    const uniqueDates = Array.from(new Set(activityDates))
      .map(dateStr => parseDDMMYYYYToDateObj(dateStr))
      .filter(Boolean) // Remove any nulls from parsing errors
      .sort((a, b) => a.getTime() - b.getTime());

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    // Check if the most recent activity is today or yesterday to continue the streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecentDate = uniqueDates[uniqueDates.length - 1];

    const diffFromToday = (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffFromToday > 1) {
      // If the last activity was more than a day ago, streak is broken
      return {
        currentStreak: 0,
        longestStreak: calculateLongestStreak(uniqueDates), // Recalculate longest streak historically
        lastActivityDate: dateToDDMMYYYY(mostRecentDate),
      };
    }

    // If streak is not broken, calculate the current streak
    currentStreak = 1;
    lastDate = mostRecentDate;

    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currentDate = uniqueDates[i];
      const diffTime = lastDate.getTime() - currentDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break; // Streak is broken
      }
      lastDate = currentDate;
    }

    longestStreak = calculateLongestStreak(uniqueDates);

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: dateToDDMMYYYY(mostRecentDate),
    };
  };

  // Helper function to calculate the longest streak from a sorted list of unique dates
  const calculateLongestStreak = (sortedDates) => {
    if (sortedDates.length === 0) return 0;

    let longest = 1;
    let current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
      } else {
        longest = Math.max(longest, current);
        current = 1;
      }
    }
    return Math.max(longest, current);
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
      const updatedProfile = {
        ...prevProfile,
        earnedBadges: { ...prevProfile.earnedBadges, [badgeId]: true },
      };
      return updatedProfile;
    });
  };

  return [userProfile, updatePoints, earnBadge, loading, error];
}
