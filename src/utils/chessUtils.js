import {
  playlistVideoData,
  chess_badges_definitions,
  BADGE_CRITERIA,
} from "../data/chessData";

/** ELO stages for chess learning */
export const ELO_STAGES = [
  { id: "elo1400", name: "1400-1700 ELO Stage", prefix: "elo1400_" },
  { id: "elo1700", name: "1700-2000 ELO Stage", prefix: "elo1700_" },
  { id: "elo2000", name: "2000-2400 ELO Stage", prefix: "elo2000_" },
  { id: "elo2400", name: "2400+ ELO Stage", prefix: "elo2400_" },
];

/**
 * @typedef {object} StructuredVideo
 * @property {string} id - Original video ID within its playlist.
 * @property {string} title - Title of the video.
 * @property {string} globalId - Globally unique ID for the video (playlistKey_videoId).
 */

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
 * Calculates progress for a list of items.
 * @param {Array<Object>} items - The list of items to calculate progress for.
 * @param {Object.<string, boolean>} completedItems - An object mapping item IDs to their completion status (true if completed).
 * @param {function(Object): string} [getItemId=(item) => item.id] - A function to extract the ID from an item.
 * @param {function(Object): Array<Object>} [getSubItems=null] - Optional function to get sub-items if items are nested (e.g., playlists containing videos).
 * @returns {{completed: number, total: number, percent: number}} An object with the count of completed items, total items, and completion percentage.
 */
export const calculateProgress = (
  items,
  completedItems,
  getItemId = (item) => item.id,
  getSubItems = null
) => {
  let total = 0;
  let completed = 0;

  items.forEach((item) => {
    if (getSubItems) {
      const subItems = getSubItems(item) || [];
      total += subItems.length;
      subItems.forEach((subItem) => {
        if (completedItems[getItemId(subItem)]) completed++;
      });
    } else {
      total++;
      if (completedItems[getItemId(item)]) completed++;
    }
  });

  return {
    completed,
    total,
    percent: total > 0 ? (completed / total) * 100 : 0,
  };
};

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
export const INITIAL_CHESS_ELO = 1350; // Define your starting ELO here

export const initialChessUserProfile = {
  elo: INITIAL_CHESS_ELO, // Set the initial ELO
  points: 0,
  lastActiveDate: null,
  currentStreak: 0,
  longestStreak: 0,
  earnedBadges: {},
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
  const newEarnedBadges = {}; // Start with an empty object for badges for this evaluation
  const originalEarnedBadges = userProfile.earnedBadges || {}; // Keep track of previously earned badges
  let badgesChanged = false; // Flag to see if the set of earned badges actually changed

  const totalVideosCompleted =
    Object.values(completedVideos).filter(Boolean).length; // Count only true values

  chess_badges_definitions.forEach((badge) => {
    let criteriaMet = false;
    // Ensure userProfile and its properties are defined before accessing
    const currentPoints = userProfile?.points ?? 0;
    const currentStreak = userProfile?.currentStreak ?? 0;
    const currentElo = userProfile?.elo ?? 0; // Assuming ELO is part of the profile for ELO_THRESHOLD

    switch (badge.criteria.type) {
      case BADGE_CRITERIA.POINTS_EARNED:
        criteriaMet = currentPoints >= badge.criteria.value;
        break;
      case BADGE_CRITERIA.VIDEOS_WATCHED:
        criteriaMet = totalVideosCompleted >= badge.criteria.value;
        break;
      case BADGE_CRITERIA.LEARNING_STREAK:
        criteriaMet = currentStreak >= badge.criteria.value;
        break;
      case BADGE_CRITERIA.ELO_THRESHOLD: // Added ELO_THRESHOLD check
        criteriaMet = currentElo >= badge.criteria.value;
        break;
      case BADGE_CRITERIA.STAGE_CLEARED: {
        // Added block scope
        const targetStageId = badge.criteria.value; // e.g., "elo1400"
        const stageToClear = structuredChessData.find(
          (s) => s.id === targetStageId
        );
        if (stageToClear) {
          const stageVideos = stageToClear.playlists.flatMap((p) => p.videos);
          if (stageVideos.length > 0) {
            // Ensure stage has videos to complete
            const completedStageVideos = stageVideos.filter(
              (v) => completedVideos[v.globalId]
            ).length;
            criteriaMet = completedStageVideos === stageVideos.length;
          }
        }
        break;
      } // End block scope
      
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
        ? originalEarnedBadges[badge.id] // Keep original earnedAt
        : { earnedAt: new Date().toISOString() }; // New badge, set earnedAt
    }
  });

  // Check if the set of earned badges has actually changed.
  // Given current logic (only adding/keeping badges), a change in length is sufficient.
  if (
    Object.keys(newEarnedBadges).length !==
    Object.keys(originalEarnedBadges).length
  ) {
    badgesChanged = true;
  }

  return badgesChanged
    ? { ...userProfile, earnedBadges: newEarnedBadges } // Return updated profile only if badges changed
    : userProfile; // Otherwise, return the original profile to prevent unnecessary state updates
};
