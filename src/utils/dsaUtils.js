// Difficulty order as an array for sorting and indexing
export const difficultyOrder = ["Easy", "Medium", "Hard"];

export const TOPIC_DISPLAY_ORDER = [
  "Arrays",
  "Two Pointers",
  "Matrix",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Trees",
  "Binary Search Trees",
  "Graphs",
  "Dynamic Programming",
  "Backtracking / Recursion",
  "Greedy",
  "Heaps",
  "Sliding Window",
  "Tries",
  "Bit Manipulation",
  "Math & Number Theory",
  "Geometry",
  "Sorting & Searching",
  "Advanced Data Structures & Algorithms",
];

export const TOPIC_MERGE_MAP = {
  Stacks: "Stacks & Queues",
  Queues: "Stacks & Queues",
  Stack: "Stacks & Queues",
  Queue: "Stacks & Queues",
  "Binary Trees": "Trees",
  BST: "Binary Search Trees",
  "Graphs (BFS/DFS)": "Graphs",
  XOR: "Bit Manipulation",
  Recursion: "Backtracking / Recursion",
  Backtracking: "Backtracking / Recursion",
  Bitwise: "Bit Manipulation",
  "Number Theory": "Math & Number Theory",
  Advanced: "Advanced Data Structures & Algorithms",
  "Array & Hashing": "Arrays",
  Sorting: "Sorting & Searching",
  Searching: "Sorting & Searching",
};

export const NORMALIZED_TOPIC_MERGE_MAP = new Map(
  Object.entries(TOPIC_MERGE_MAP).map(([k, v]) => [k.toLowerCase(), v])
);

const UNKNOWN_DIFFICULTY_SORT_VALUE = difficultyOrder.length;

const getDifficultyIndex = (difficulty) => {
  const index = difficultyOrder.indexOf(difficulty);
  return index === -1 ? UNKNOWN_DIFFICULTY_SORT_VALUE : index;
};

const difficultyCache = new Map();
export const getNormalizedDifficulty = (difficulty) => {
  if (difficultyCache.has(difficulty)) {
    return difficultyCache.get(difficulty);
  }

  let normalized = "N/A";
  if (difficulty) {
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty.includes("easy")) normalized = "Easy";
    else if (lowerDifficulty.includes("medium")) normalized = "Medium";
    else if (lowerDifficulty.includes("hard")) normalized = "Hard";
  }
  difficultyCache.set(difficulty, normalized);
  return normalized;
};

const topicCache = new Map();
export const getNormalizedTopic = (topic) => {
  if (topicCache.has(topic)) {
    return topicCache.get(topic);
  }

  let normalized = "Miscellaneous";
  if (topic) {
    const lowerTopic = topic.toLowerCase().trim();
    normalized = NORMALIZED_TOPIC_MERGE_MAP.get(lowerTopic) || topic;
  }
  topicCache.set(topic, normalized);
  return normalized;
};

export const preprocessDsaData = (data) => {
  return data.map((problem) => ({
    ...problem,
    normalizedDifficulty: getNormalizedDifficulty(problem.difficulty),
    normalizedTopic: getNormalizedTopic(problem.topic),
  }));
};

export const getUniqueTopics = (problemsData) => {
  const topics = new Set();
  problemsData.forEach((p) => topics.add(getNormalizedTopic(p.topic)));
  const sortedTopics = Array.from(topics).sort((a, b) => {
    const indexA = TOPIC_DISPLAY_ORDER.indexOf(a);
    const indexB = TOPIC_DISPLAY_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  return sortedTopics;
};

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
  const sortedPatterns = Array.from(patterns).sort();
  return sortedPatterns;
};

export const calculateOverallProgress = (
  problemsData,
  completedProblemsMap
) => {
  const total = problemsData.length;
  const completed = Object.keys(completedProblemsMap || {}).filter(
    (id) => !!completedProblemsMap[id]
  ).length;
  const result = {
    completed,
    total,
    percent: total > 0 ? (completed / total) * 100 : 0,
  };
  return result;
};

export const groupAndSortProblemsByTopic = (
  problems,
  completedProblemsMap,
  customProblemOrder = {}
) => {
  const grouped = new Map();

  // Group problems by topic first
  problems.forEach((problem) => {
    const topic = problem.normalizedTopic;
    const problemWithStatus = {
      ...problem,
      isCompleted: !!completedProblemsMap[problem.id],
    };
    if (!grouped.has(topic)) {
      grouped.set(topic, []);
    }
    grouped.get(topic).push(problemWithStatus);
  });

  // If the custom order is in the old array format, don't sort within topics
  if (Array.isArray(customProblemOrder)) {
    // The `problems` array is already sorted correctly by `problemsInView`
    // so we just need to sort the topics themselves.
  } else {
    // Sort problems within each topic based on custom order or default
    for (const [topic, problemsInTopic] of grouped.entries()) {
      const orderForTopic = customProblemOrder
        ? customProblemOrder[topic]
        : null;
      if (orderForTopic) {
        const problemMap = new Map(problemsInTopic.map((p) => [p.id, p]));
        const orderedProblems = orderForTopic
          .map((id) => problemMap.get(id))
          .filter(Boolean);
        const orderedIds = new Set(orderForTopic);
        problemsInTopic.forEach((p) => {
          if (!orderedIds.has(p.id)) {
            orderedProblems.push(p);
          }
        });
        grouped.set(topic, orderedProblems);
      } else {
        // Default sort if no custom order exists for this topic
        problemsInTopic.sort((a, b) => {
          const difficultyIndexA = getDifficultyIndex(a.normalizedDifficulty);
          const difficultyIndexB = getDifficultyIndex(b.normalizedDifficulty);
          if (difficultyIndexA !== difficultyIndexB) {
            return difficultyIndexA - difficultyIndexB;
          }
          return a.title.localeCompare(b.title);
        });
      }
    }
  }

  // Sort the topics themselves according to the display order
  const sortedTopics = new Map(
    [...grouped.entries()].sort(([topicA], [topicB]) => {
      const indexA = TOPIC_DISPLAY_ORDER.indexOf(topicA);
      const indexB = TOPIC_DISPLAY_ORDER.indexOf(topicB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return topicA.localeCompare(topicB);
    })
  );

  return sortedTopics;
};

export const groupProblemsByTopicAndPattern = (
  problems,
  completedProblemsMap
) => {
  const groupedByTopic = new Map();

  problems.forEach((problem) => {
    const topic = problem.normalizedTopic;
    const mainPattern = problem.pattern
      ? problem.pattern.split(" - Covered in ")[0].trim()
      : "General";
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

  sortedTopics.forEach((patternsMap) => {
    const sortedPatternsMap = new Map(
      [...patternsMap.entries()].sort(([patternA], [patternB]) =>
        patternA.localeCompare(patternB)
      )
    );
    patternsMap.clear();
    sortedPatternsMap.forEach((problemsInPattern, pattern) => {
      problemsInPattern.sort((a, b) => {
        const difficultyIndexA = getDifficultyIndex(a.normalizedDifficulty);
        const difficultyIndexB = getDifficultyIndex(b.normalizedDifficulty);
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
