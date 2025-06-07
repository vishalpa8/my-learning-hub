import {
  difficultyOrder,
  TOPIC_DISPLAY_ORDER,
  NORMALIZED_TOPIC_MERGE_MAP,
} from "../data/dsaData";

const UNKNOWN_DIFFICULTY_SORT_VALUE = difficultyOrder.length; // Sort unknown difficulties last

/**
 * Helper function to get a sortable index for difficulty.
 * @param {string} difficulty - The normalized difficulty string.
 * @returns {number} The sort index for the difficulty.
 */
const getDifficultyIndex = (difficulty) => {
  const index = difficultyOrder.indexOf(difficulty);
  return index === -1 ? UNKNOWN_DIFFICULTY_SORT_VALUE : index;
};

/**
 * Normalizes a difficulty string.
 * @param {string} difficulty - The raw difficulty string.
 * @returns {string} The normalized difficulty ("Easy", "Medium", "Hard", or "N/A").
 */
export const getNormalizedDifficulty = (difficulty) => {
  if (!difficulty) return "N/A";
  const lowerDifficulty = difficulty.toLowerCase();
  if (lowerDifficulty.includes("easy")) return "Easy";
  if (lowerDifficulty.includes("medium")) return "Medium";
  if (lowerDifficulty.includes("hard")) return "Hard";
  return "N/A";
};

/**
 * Normalizes a topic string using a merge map.
 * @param {string} topic - The raw topic string.
 * @returns {string} The normalized topic string.
 */
export const getNormalizedTopic = (topic) => {
  if (!topic) return "Miscellaneous";
  const lowerTopic = topic.toLowerCase().trim();
  return NORMALIZED_TOPIC_MERGE_MAP.get(lowerTopic) || topic; // Fallback to original if not in map
};

/**
 * Extracts unique, normalized topics from the DSA data, sorted by TOPIC_DISPLAY_ORDER.
 * @param {Array<Object>} problemsData - The array of DSA problem objects.
 * @returns {Array<string>} An array of unique, sorted topic names.
 */
export const getUniqueTopics = (problemsData) => {
  const topics = new Set();
  problemsData.forEach((p) => topics.add(getNormalizedTopic(p.topic)));
  return Array.from(topics).sort((a, b) => {
    const indexA = TOPIC_DISPLAY_ORDER.indexOf(a);
    const indexB = TOPIC_DISPLAY_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
};

/**
 * Extracts unique patterns from the DSA data.
 * @param {Array<Object>} problemsData - The array of DSA problem objects.
 * @returns {Array<string>} An array of unique pattern names, sorted alphabetically.
 */
export const getUniquePatterns = (problemsData) => {
  const patterns = new Set();
  problemsData.forEach((p) => {
    if (p.pattern) {
      p.pattern
        .split(",")
        .map((pat) => pat.trim())
        .forEach((pat) => patterns.add(pat));
    }
  });
  return Array.from(patterns).sort();
};

/**
 * Calculates overall progress based on completed problems.
 * @param {Array<Object>} problemsData - The full list of DSA problems.
 * @param {Object.<string, boolean>} completedProblemsMap - An object mapping problem IDs to completion status.
 * @returns {{completed: number, total: number, percent: number}} Progress statistics.
 */
export const calculateOverallProgress = (problemsData, completedProblemsMap) => {
  const total = problemsData.length;
  const completed = Object.keys(completedProblemsMap || {}).filter(
    (id) => completedProblemsMap[id]
  ).length;
  return {
    completed,
    total,
    percent: total > 0 ? (completed / total) * 100 : 0,
  };
};

/**
 * Groups problems by topic, sorts them by difficulty and title, and marks completion status.
 * @param {Array<Object>} problems - The array of problems to group and sort.
 * @param {Object.<string, boolean>} completedProblemsMap - An object mapping problem IDs to their completion status.
 * @returns {Map<string, Array<Object>>} A Map where keys are topic names and values are arrays of sorted problem objects,
 * each augmented with an `isCompleted` property.
 */
export const groupAndSortProblemsByTopic = (problems, completedProblemsMap) => {
  const grouped = new Map();

  problems.forEach(problem => {
    const topic = getNormalizedTopic(problem.topic);
    const problemWithStatus = {
      ...problem,
      isCompleted: !!completedProblemsMap[problem.id], // Add completion status
    };

    if (!grouped.has(topic)) {
      grouped.set(topic, []);
    }
    grouped.get(topic).push(problemWithStatus);
  });

  // Sort topics based on TOPIC_DISPLAY_ORDER
  const sortedTopics = new Map(
    [...grouped.entries()].sort(([topicA], [topicB]) => {
      const indexA = TOPIC_DISPLAY_ORDER.indexOf(topicA);
      const indexB = TOPIC_DISPLAY_ORDER.indexOf(topicB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1; // topicA is in order, topicB is not
      if (indexB !== -1) return 1;  // topicB is in order, topicA is not
      return topicA.localeCompare(topicB); // Fallback to alphabetical if not in order
    })
  );

  // Sort problems within each topic
  sortedTopics.forEach((problemsInTopic) => {
    problemsInTopic.sort((a, b) => {
      const difficultyIndexA = getDifficultyIndex(getNormalizedDifficulty(a.difficulty));
      const difficultyIndexB = getDifficultyIndex(getNormalizedDifficulty(b.difficulty));

      if (difficultyIndexA !== difficultyIndexB) {
        return difficultyIndexA - difficultyIndexB;
      }
      return (a.title || "").localeCompare(b.title || "");
    });
  });

  return sortedTopics;
};


/**
 * Groups problems by topic and then by pattern, sorts them, and marks completion status.
 * @param {Array<Object>} problems - The array of problems to group and sort.
 * @param {Object.<string, boolean>} completedProblemsMap - An object mapping problem IDs to their completion status.
 * @returns {Map<string, Map<string, Array<Object>>>} A Map where keys are topic names,
 * and values are Maps where keys are pattern names and values are arrays of sorted problem objects,
 * each augmented with an `isCompleted` property.
 */
export const groupProblemsByTopicAndPattern = (problems, completedProblemsMap) => {
  const groupedByTopic = new Map();

  problems.forEach(problem => {
    const topic = getNormalizedTopic(problem.topic);
    const mainPattern = problem.pattern ? problem.pattern.split(" - Covered in ")[0].trim() : "General";
    const problemWithStatus = {
      ...problem,
      isCompleted: !!completedProblemsMap[problem.id],
    };

    if (!groupedByTopic.has(topic)) {
      groupedByTopic.set(topic, new Map());
    }
    const patternsMap = groupedByTopic.get(topic);
    if (!patternsMap.has(mainPattern)) {
      patternsMap.set(mainPattern, []);
    }
    patternsMap.get(mainPattern).push(problemWithStatus);
  });

  // Sort topics
  const sortedTopics = new Map(
    [...groupedByTopic.entries()].sort(([topicA], [topicB]) => {
      const indexA = TOPIC_DISPLAY_ORDER.indexOf(topicA);
      const indexB = TOPIC_DISPLAY_ORDER.indexOf(topicB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return topicA.localeCompare(topicB);
    })
  );

  // Sort patterns within each topic and problems within each pattern
  sortedTopics.forEach(patternsMap => {
    const sortedPatternsMap = new Map(
      [...patternsMap.entries()].sort(([patternA], [patternB]) =>
        patternA.localeCompare(patternB)
      )
    );
    patternsMap.clear(); // Clear original and repopulate with sorted
    sortedPatternsMap.forEach((problemsInPattern, pattern) => {
      problemsInPattern.sort((a, b) => {
        const difficultyIndexA = getDifficultyIndex(getNormalizedDifficulty(a.difficulty));
        const difficultyIndexB = getDifficultyIndex(getNormalizedDifficulty(b.difficulty));
        if (difficultyIndexA !== difficultyIndexB) {
          return difficultyIndexA - difficultyIndexB;
        }
        return (a.title || "").localeCompare(b.title || "");
      });
      patternsMap.set(pattern, problemsInPattern);
    });
  });

  return sortedTopics;
};
