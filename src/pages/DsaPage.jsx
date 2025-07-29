import React, { useState, useEffect, useMemo, useCallback } from "react";
import { dateToDDMMYYYY } from "../utils/dateHelpers";
import { dsaData } from "../data/dsaData";
import DashboardView from "../components/dsa/DashboardView";
import RewardModal from "../components/shared/RewardModal";
import { useReward } from "../contexts/useReward";
import { useIndexedDb } from "../hooks/useIndexedDb";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  DSA_LAST_ACTIVE_VIEW_KEY,
  DSA_LAST_VISITED_VIEW_DATES_KEY,
  DSA_CUSTOM_PROBLEM_ORDER_KEY,
} from "../constants/localIndexedDbKeys";
import {
  groupAndSortProblemsByTopic,
  getUniqueTopics,
  calculateOverallProgress,
} from "../utils/dsaUtils";
import "../styles/DsaStyles.css";
import ProblemListView from "../components/dsa/ProblemListView";

// Custom hook to trace component re-renders

const viewOptions = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "all", label: "All Problems", icon: "📚" },
  { key: "neetcode150", label: "NeetCode 150", icon: "🔥" },
  { key: "striverSdeSheet", label: "Striver SDE", icon: "⚙️" },
  { key: "lastMoment", label: "Last-Moment", icon: "⏰" },
];

const DsaPage = () => {
  // console.log("%c[DsaPage] Component rendering or re-rendering.", "color: #4CAF50; font-weight: bold;");
  // useTraceUpdate(props);

  const { isModalVisible, modalMessage, recordDsaProgress, closeRewardModal } =
    useReward();

  const [completedProblems, setCompletedProblems] = useIndexedDb(
    DSA_COMPLETED_PROBLEMS_KEY,
    {}
  );
  const [activeView, setActiveView] = useIndexedDb(
    DSA_LAST_ACTIVE_VIEW_KEY,
    "dashboard"
  );

  const [filters, setFilters] = useState(() => {
    const initialFilters = {
      difficulty: "all",
      topic: "all",
      pattern: "all",
      status: "all",
      searchTerm: "",
    };
    return initialFilters;
  });

  const [userProfile, updatePoints] = useUserProfile();

  const [lastVisitedViewDates, setLastVisitedViewDates] = useIndexedDb(
    DSA_LAST_VISITED_VIEW_DATES_KEY,
    {}
  );

  const [customProblemOrder, setCustomProblemOrder] = useIndexedDb(
    DSA_CUSTOM_PROBLEM_ORDER_KEY,
    {} // Initial value is an empty object
  );

  const overallProgressStats = useMemo(() => {
    const stats = calculateOverallProgress(dsaData, completedProblems);
    return stats;
  }, [completedProblems]);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    } else if (recordDsaProgress) {
      recordDsaProgress(overallProgressStats.completed);
    }
  }, [overallProgressStats.completed, recordDsaProgress, isInitialLoad]);

  const handleToggleComplete = useCallback(
    (problemId) => {
      setCompletedProblems((prev) => {
        const newCompleted = { ...prev };
        const isCurrentlyCompleted = !!newCompleted[problemId];
        if (isCurrentlyCompleted) {
          // Save the completion date before deleting
          const completionDate = newCompleted[problemId];
          delete newCompleted[problemId];
          updatePoints(-10, completionDate);
        } else {
          const completionDate = new Date().toISOString();
          newCompleted[problemId] = completionDate;
          updatePoints(10, completionDate);
        }
        return newCompleted;
      });
    },
    [setCompletedProblems, updatePoints]
  );

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value.toLowerCase() }));
  }, []);

  const handleViewChange = useCallback(
    (viewKey) => {
      if (viewKey !== "dashboard") {
        const todayStr = dateToDDMMYYYY(new Date());
        if (lastVisitedViewDates[viewKey] !== todayStr) {
          setLastVisitedViewDates((prev) => ({ ...prev, [viewKey]: todayStr }));
        }
      }
      setActiveView(viewKey);
    },
    [setActiveView, setLastVisitedViewDates, lastVisitedViewDates]
  );

  const uniqueTopics = useMemo(() => {
    const topics = getUniqueTopics(dsaData);
    return topics;
  }, []);

  const baseProblemsForActiveView = useMemo(() => {
    let problems;
    if (activeView === "dashboard") problems = [];
    else if (activeView === "neetcode150")
      problems = dsaData.filter((p) => p.isNeetCode150);
    else if (activeView === "striverSdeSheet")
      problems = dsaData.filter((p) => p.isStriverSDESheet);
    else if (activeView === "lastMoment")
      problems = dsaData.filter((p) => p.isLastMoment);
    else problems = dsaData;
    return problems;
  }, [activeView]);

  const problemsInView = useMemo(() => {
    const problemMap = new Map(
      baseProblemsForActiveView.map((p) => [p.id, p])
    );
    const viewOrder = customProblemOrder[activeView];

    if (!viewOrder) {
      return baseProblemsForActiveView;
    }

    // Backward compatibility: if viewOrder is an array, it's the old format
    if (Array.isArray(viewOrder)) {
      const orderedProblems = viewOrder
        .map((id) => problemMap.get(id))
        .filter(Boolean);
      const seenIds = new Set(viewOrder);
      baseProblemsForActiveView.forEach((p) => {
        if (!seenIds.has(p.id)) {
          orderedProblems.push(p);
        }
      });
      return orderedProblems;
    }

    const orderedProblems = [];
    const seenIds = new Set();

    // New format: viewOrder is an object of topics
    for (const topic in viewOrder) {
      if (Object.prototype.hasOwnProperty.call(viewOrder, topic)) {
        if (Array.isArray(viewOrder[topic])) {
          viewOrder[topic].forEach((problemId) => {
            if (problemMap.has(problemId) && !seenIds.has(problemId)) {
              orderedProblems.push(problemMap.get(problemId));
              seenIds.add(problemId);
            }
          });
        }
      }
    }

    // Add any remaining problems that weren't in the custom order
    baseProblemsForActiveView.forEach((p) => {
      if (!seenIds.has(p.id)) {
        orderedProblems.push(p);
      }
    });

    return orderedProblems;
  }, [baseProblemsForActiveView, customProblemOrder, activeView]);

  const viewProblems = useMemo(() => {
    const { difficulty, topic, status, searchTerm } = filters;
    const filtered = problemsInView.filter((p) => {
      return (
        (difficulty === "all" ||
          p.normalizedDifficulty.toLowerCase() === difficulty) &&
        (topic === "all" || p.normalizedTopic.toLowerCase() === topic) &&
        (searchTerm === "" ||
          p.title.toLowerCase().includes(searchTerm) ||
          (p.subTopic && p.subTopic.toLowerCase().includes(searchTerm))) &&
        (status === "all" ||
          (status === "completed" && completedProblems[p.id]) ||
          (status === "pending" && !completedProblems[p.id]))
      );
    });
    return filtered;
  }, [problemsInView, filters, completedProblems]);

  const groupedProblems = useMemo(() => {
    const grouped = groupAndSortProblemsByTopic(
      viewProblems,
      completedProblems,
      customProblemOrder[activeView]
    );
    return grouped;
  }, [viewProblems, completedProblems, customProblemOrder, activeView]);

  const calculateDifficultyStats = useCallback((problems, completed) => {
    const stats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };
    if (problems?.length) {
      problems.forEach((problem) => {
        const difficultyKey = problem.normalizedDifficulty.toLowerCase();
        if (stats[difficultyKey]) {
          stats[difficultyKey].total++;
          if (completed[problem.id]) stats[difficultyKey].completed++;
        } else if (difficultyKey) {
          console.warn(
            `[DsaPage] Difficulty key "${difficultyKey}" for problem "${problem.title}" is not a recognized key in stats object (easy, medium, hard).`
          );
        }
      });
    }
    return stats;
  }, []);

  const currentViewDifficultyStats = useMemo(
    () => calculateDifficultyStats(problemsInView, completedProblems),
    [problemsInView, completedProblems, calculateDifficultyStats]
  );

  const filteredDifficultyStats = useMemo(
    () => calculateDifficultyStats(viewProblems, completedProblems),
    [viewProblems, completedProblems, calculateDifficultyStats]
  );

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source } = result;

      if (!destination) {
        return;
      }

      // Prevent dragging between different topics
      if (source.droppableId !== destination.droppableId) {
        return;
      }

      const topic = source.droppableId;
      const problemsInTopic = groupedProblems.get(topic);

      if (!problemsInTopic) {
        return;
      }

      const newProblemsInTopic = Array.from(problemsInTopic);
      const [movedProblem] = newProblemsInTopic.splice(source.index, 1);
      newProblemsInTopic.splice(destination.index, 0, movedProblem);

      const newProblemIdsInTopic = newProblemsInTopic.map((p) => p.id);

      setCustomProblemOrder((prev) => {
        const newOrder = { ...prev };
        if (!newOrder[activeView]) {
          newOrder[activeView] = {};
        }
        newOrder[activeView][topic] = newProblemIdsInTopic;
        return newOrder;
      });
    },
    [activeView, groupedProblems, setCustomProblemOrder]
  );

  return (
    <div className="dsa-page-outer">
      <header className="dsa-hero">
        <div className="dsa-hero-content">
          <h1>
            <span role="img" aria-label="brain">
              🧠
            </span>{" "}
            DSA & CP Pathway
          </h1>
          <p className="dsa-hero-subtitle">
            Track your progress, conquer challenges, and master data structures
            and algorithms.
          </p>
          <div className="dsa-hero-progress">
            <div className="dsa-progress-label">
              <span>Overall Progress</span>
              <span>
                {overallProgressStats.completed} / {overallProgressStats.total}{" "}
                ({overallProgressStats.percent.toFixed(1)}%)
              </span>
            </div>
            <progress
              className="dsa-progress-bar"
              value={overallProgressStats.completed}
              max={overallProgressStats.total}
              aria-label="Overall DSA progress"
            ></progress>
          </div>
          <nav className="dsa-nav-tabs" aria-label="DSA Views">
            {viewOptions.map((opt) => (
              <button
                key={opt.key}
                className={`dsa-nav-tab-btn ${
                  activeView === opt.key ? "active" : ""
                }`}
                onClick={() => handleViewChange(opt.key)}
                aria-pressed={activeView === opt.key}
              >
                <span role="img" aria-label={opt.label} className="view-icon">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {activeView !== "dashboard" && (
        <div className="dsa-filters-bar">
          <div className="filter-item">
            <label htmlFor="difficulty-filter" className="dsa-filter-label">
              Difficulty:
            </label>
            <select
              id="difficulty-filter"
              className="dsa-filter-select"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="topic-filter" className="dsa-filter-label">
              Topic:
            </label>
            <select
              id="topic-filter"
              className="dsa-filter-select"
              value={filters.topic}
              onChange={(e) => handleFilterChange("topic", e.target.value)}
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic.toLowerCase()}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="status-filter" className="dsa-filter-label">
              Status:
            </label>
            <select
              id="status-filter"
              className="dsa-filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="search-filter" className="dsa-filter-label">
              Search:
            </label>
            <input
              type="search"
              id="search-filter"
              className="dsa-filter-input"
              placeholder="Title or sub-topic..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>
        </div>
      )}

      <main id="dsa-content" className="dsa-main-content-wrapper">
        <section
          className={`dsa-main-section ${
            activeView === "dashboard" ? "full-width" : ""
          }`}
        >
          {activeView === "dashboard" ? (
            <DashboardView
              data-testid="dashboard-view"
              overallProgress={overallProgressStats}
              totalProblems={dsaData.length}
              streakData={userProfile}
            />
          ) : (
            <ProblemListView
              data-testid="problem-list-view"
              groupedProblems={groupedProblems}
              onToggleProblemComplete={handleToggleComplete}
              showPatternFilter={filters.pattern !== "all"}
              currentViewDifficultyStats={currentViewDifficultyStats}
              filteredDifficultyStats={filteredDifficultyStats}
              lastVisitedDate={lastVisitedViewDates[activeView] || "Never"}
              onDragEnd={onDragEnd}
            />
          )}
        </section>
      </main>

      <RewardModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={closeRewardModal}
      />
    </div>
  );
};

export default DsaPage;
