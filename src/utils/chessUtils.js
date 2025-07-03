import {
  playlistVideoData,
  chess_badges_definitions,
  BADGE_CRITERIA,
} from "../data/chessData";
import { ELO_STAGES, INITIAL_CHESS_ELO } from "../constants/chessConstants";
import { dateToDDMMYYYY, parseDDMMYYYYToDateObj } from "../utils/dateHelpers";

/**
 * @typedef {object} StructuredPlaylist
 * @property {string} id - Original playlist ID (key from playlistVideoData).
 * @property {string} name - Title of the playlist.
 * @property {string} playlistUrl - URL of the playlist.
 * @property {string} focusArea - Focus area of the playlist.
 * @property {StructuredVideo[]} videos - Array of video objects with global IDs.
 */

/**
 * Structures playlist video data by ELO stages.
 * Each video within a playlist is augmented with a `globalId`.
 * Each stage includes a `totalVideos` count.
 * Stages without any playlists are filtered out.
 * @returns {Array<{id: string, name: string, prefix: string, playlists: StructuredPlaylist[], totalVideos: number}>} Array of stage objects.
 */
export const getStructuredChessData = () =>
  ELO_STAGES.map((stage) => {
    const stagePlaylists = Object.entries(playlistVideoData)
      .filter(([playlistId]) => playlistId.startsWith(stage.prefix))
      .map(
        ([
          playlistId,
          { title, playlistUrl = "#", focusArea = "N/A", videos = [] },
        ]) => {
          const videosWithGlobalIds = videos.map((video) => ({
            ...video,
            globalId: `${playlistId}_${video.id}`,
          }));
          return {
            id: playlistId,
            name: title,
            playlistUrl,
            focusArea,
            videos: videosWithGlobalIds,
          };
        }
      );

    return {
      ...stage,
      playlists: stagePlaylists,
      totalVideos: stagePlaylists.reduce((sum, p) => sum + p.videos.length, 0),
    };
  }).filter((stage) => stage.playlists.length > 0);

/**
 * Default initial structure for a chess user's profile.
 * This is used as the default value in `useIndexedDb` for the chess user profile.
 * @type {Object}
 * @property {number} points - User's current points.
 * @property {string | null} lastActiveDate - Date string of the last active day.
 * @property {number} currentStreak - Current learning streak in days.
 * @property {number} longestStreak - Longest learning streak achieved.
 * @property {Object.<string, {earnedAt: string}>} earnedBadges - Badges earned by the user, with earning date.
 * @property {number} elo - User's current ELO rating.
 */

export const initialChessUserProfile = {
  elo: INITIAL_CHESS_ELO, // Set the initial ELO
  points: 0,
  lastActiveDate: null,
  currentStreak: 0,
  longestStreak: 0,
  earnedBadges: {},
};

/**
 * Checks if the POINTS_EARNED badge criteria is met.
 * @param {Object} userProfile - The current user profile.
 * @param {Object} badge - The badge definition.
 * @returns {boolean} True if criteria met, false otherwise.
 */
const checkPointsBadge = (userProfile, badge) => {
  const currentPoints = userProfile?.points ?? 0;
  return currentPoints >= badge.criteria.value;
};

/**
 * Checks if the VIDEOS_WATCHED badge criteria is met.
 * @param {Object} completedVideos - An object mapping video global IDs to their completion status.
 * @param {Object} badge - The badge definition.
 * @returns {boolean} True if criteria met, false otherwise.
 */
const checkVideosWatchedBadge = (completedVideos, badge, totalVideosCompleted) => {
  return totalVideosCompleted >= badge.criteria.value;
};

/**
 * Checks if the LEARNING_STREAK badge criteria is met.
 * @param {Object} userProfile - The current user profile.
 * @param {Object} badge - The badge definition.
 * @returns {boolean} True if criteria met, false otherwise.
 */
const checkLearningStreakBadge = (userProfile, badge) => {
  const currentStreak = userProfile?.currentStreak ?? 0;
  return currentStreak >= badge.criteria.value;
};

/**
 * Checks if the ELO_THRESHOLD badge criteria is met.
 * @param {Object} userProfile - The current user profile.
 * @param {Object} badge - The badge definition.
 * @returns {boolean} True if criteria met, false otherwise.
 */
const checkEloThresholdBadge = (userProfile, badge) => {
  const currentElo = userProfile?.elo ?? 0;
  return currentElo >= badge.criteria.value;
};

/**
 * Checks if the STAGE_CLEARED badge criteria is met.
 * @param {Object} completedVideos - An object mapping video global IDs to their completion status.
 * @param {Object} badge - The badge definition.
 * @param {Array<Object>} structuredChessData - The structured chess data.
 * @returns {boolean} True if criteria met, false otherwise.
 */
const checkStageClearedBadge = (
  completedVideos,
  badge,
  structuredChessData
) => {
  const targetStageId = badge.criteria.value;
  const stageToClear = structuredChessData.find((s) => s.id === targetStageId);
  if (stageToClear) {
    const stageVideos = stageToClear.playlists.flatMap((p) => p.videos);
    if (stageVideos.length > 0) {
      const completedStageVideos = stageVideos.filter(
        (v) => completedVideos[v.globalId]
      ).length;
      return completedStageVideos === stageVideos.length;
    }
  }
  return false;
};

/**
 * Checks and awards chess badges based on user progress and profile.
 * @param {Object} userProfile - The current user profile, including points, streak, etc.
 * @param {Object.<string, boolean>} completedVideos - An object mapping video global IDs to their completion status.
 * @param {Array<Object>} structuredChessData - The structured chess data containing ELO stages and playlists, as returned by `getStructuredChessData`.
 * @returns {Object} The updated userProfile object if new badges were earned, otherwise the original userProfile object.
 */
export const checkAndAwardChessBadges = (
  userProfile,
  completedVideos,
  structuredChessData
) => {
  const newEarnedBadges = {};
  const originalEarnedBadges = userProfile.earnedBadges || {};

  const totalVideosCompleted = Object.values(completedVideos).filter(Boolean).length;

  chess_badges_definitions.forEach((badge) => {
    let criteriaMet = false;

    switch (badge.criteria.type) {
      case BADGE_CRITERIA.POINTS_EARNED:
        criteriaMet = checkPointsBadge(userProfile, badge);
        break;
      case BADGE_CRITERIA.VIDEOS_WATCHED:
        criteriaMet = checkVideosWatchedBadge(completedVideos, badge, totalVideosCompleted);
        break;
      case BADGE_CRITERIA.LEARNING_STREAK:
        criteriaMet = checkLearningStreakBadge(userProfile, badge);
        break;
      case BADGE_CRITERIA.ELO_THRESHOLD:
        criteriaMet = checkEloThresholdBadge(userProfile, badge);
        break;
      case BADGE_CRITERIA.STAGE_CLEARED:
        criteriaMet = checkStageClearedBadge(
          completedVideos,
          badge,
          structuredChessData
        );
        break;
      default:
        if (import.meta.env.DEV) {
          console.warn(
            `Unknown badge criteria type: ${badge.criteria.type} for badge "${badge.id}"`
          );
        }
        break;
    }

    if (criteriaMet) {
      // If criteria are met, add/keep the badge.
      // Preserve original earnedAt date if it already existed.
      newEarnedBadges[badge.id] = originalEarnedBadges[badge.id]
        ? originalEarnedBadges[badge.id]
        : { earnedAt: new Date().toISOString() };
    }
  });

  // Determine if badges have changed (either added or removed)
  const currentBadgeIds = Object.keys(newEarnedBadges);
  const previousBadgeIds = Object.keys(originalEarnedBadges);

  const badgesAdded = currentBadgeIds.some(
    (id) => !previousBadgeIds.includes(id)
  );
  const badgesRemoved = previousBadgeIds.some(
    (id) => !currentBadgeIds.includes(id)
  );

  if (badgesAdded || badgesRemoved) {
    return { ...userProfile, earnedBadges: newEarnedBadges };
  } else {
    return userProfile;
  }
};

/**
 * Calculates the current and longest streak based on completed video dates.
 * @param {Object.<string, boolean>} completedVideos - An object mapping video global IDs to their completion status.
 * @returns {{currentStreak: number, longestStreak: number, lastActiveDate: string | null}}
 */
export const calculateStreakFromCompletedVideos = (
  completedVideos
) => {
  const completedDates = new Set();
  for (const videoId in completedVideos) {
    if (completedVideos[videoId]) {
      completedDates.add(dateToDDMMYYYY(new Date(completedVideos[videoId])));
    }
  }

  const sortedDates = Array.from(completedDates)
    .map((dateStr) => parseDDMMYYYYToDateObj(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let lastDate = null;

  if (sortedDates.length > 0) {
    currentStreak = 1;
    longestStreak = 1;
    lastDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
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
    longestStreak,
    lastActiveDate: lastDate ? dateToDDMMYYYY(lastDate) : null,
  };
};
