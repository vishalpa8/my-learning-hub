/**
 * @file Defines constants for indexedDB keys used throughout the application.
 * This helps prevent typos and ensures consistency when accessing indexedDB.
 */

// --- Chess Feature Keys ---

/** Key for storing the user's chess video completion progress.
 *  Expected value: An object mapping video global IDs (string) to boolean (true if completed).
 *  Example: `{"elo1400_res1_cf_int_1": true, "elo1400_res1_cf_int_2": true}`
 */
export const CHESS_LEARNING_PROGRESS_KEY = "chessLearningProgress";

/** Key for storing the user's chess profile data.
 *  Expected value: An object containing points, streaks, earned badges, etc.
 *  Example: `{"points": 150, "currentStreak": 5, "earnedBadges": {"beginner_learner": true}}`
 */
export const CHESS_USER_PROFILE_KEY = "chessUserProfile";

// --- DSA & CP Feature Keys ---

/** Key for storing the completion status of DSA problems.
 *  Expected value: An object mapping problem IDs (string) to boolean (true if completed).
 *  Example: `{"lc_1": true, "lc_217": false}`
 */
export const DSA_COMPLETED_PROBLEMS_KEY = "dsaCompletedProblems";
/** Key for storing the last active view in the DSA section (e.g., "dashboard", "all", "core"). Expected value: string. */
export const DSA_LAST_ACTIVE_VIEW_KEY = "dsaLastActiveView";
/** Key for storing DSA learning streak information. Expected value: An object like `{"currentStreak": 3, "lastCompletionDate": "YYYY-MM-DD"}`. */
export const DSA_STREAK_KEY = "dsaStreakData";
/** Key for tracking DSA reward progress and earned rewards, used by RewardContext. Expected value: An object (see RewardContext for structure). */
export const DSA_REWARD_TRACKER_KEY = "dsaRewardProgress";
/** Key for storing user-selected filters for DSA problem views. Expected value: An object mapping view keys to filter objects. */
export const DSA_VIEW_FILTER_STATES_KEY = "dsaFilterStates";
/** Key for storing the last visited dates for different DSA views. Expected value: An object like `{"viewKey": "dd/MM/YYYY"}`. */
export const DSA_LAST_VISITED_VIEW_DATES_KEY = "dsaLastVisitedViewDates";

// --- Engagement Feature Keys ---

/** Key for storing the user's daily tasks. Expected value: An array of task objects. */
export const ENGAGEMENT_TASKS_KEY = "engagementTasks";
/** Key for storing the user's daily activity data (tasks completed, worked days). Expected value: An object mapping dates (YYYY-MM-DD) to activity details. */
export const ENGAGEMENT_ACTIVITY_KEY = "engagementActivity";
