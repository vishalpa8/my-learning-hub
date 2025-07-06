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
/** Key for storing DSA learning streak information. Expected value: An object like `{"currentStreak": 3, "lastCompletionDate": "DD-MM-YYYY"}`. */
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

/**
 * Key for tracking which tasks have already shown the "mark as completed" prompt.
 * Expected value: An object mapping task IDs (string/number) to boolean.
 * Example: { "12345": true, "67890": true }
 */
export const ENGAGEMENT_ALREADY_PROMPTED_FOR_COMPLETE_KEY =
  "engagementAlreadyPromptedForComplete";

/**
 * Key for storing aggregated daily activity data.
 * Useful for calendar views to quickly display daily engagement summaries.
 * Expected value: An object mapping dates (string "DD-MM-YYYY") to activity summary objects.
 * Example: `{"2023-10-27": { completedTasks: 3, totalTasks: 5, activityLevel: "medium" }}`
 */
export const ENGAGEMENT_ACTIVITY_KEY = "engagementActivity";

/**
 * Key for storing the IDs of daily chess nuggets that the user has already seen.
 * Expected value: An object mapping nugget IDs (string) to boolean (true if seen).
 * Example: `{"nugget_1": true, "nugget_3": true}`
 */
export const SEEN_NUGGETS_KEY = "seenNuggets";

// --- AI Feature Keys ---

/**
 * Key for storing the AI chat history.
 * Expected value: An array of message objects, e.g., `[{ role: "user", content: "Hello" }, { role: "model", content: "Hi there!" }]`
 */
export const AI_CHAT_HISTORY_KEY = "aiChatHistory";

/** Key for storing the custom order of DSA problems. Expected value: An object mapping view keys to an array of problem IDs. */
export const DSA_CUSTOM_PROBLEM_ORDER_KEY = "dsaCustomProblemOrder";
