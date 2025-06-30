import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "../constants/localStorageKeys";
import {
  groupAndSortProblemsByTopic, // Use this for the primary view
  // groupProblemsByTopicAndPattern, // Keep if needed for other views/features
  getUniqueTopics,
  getNormalizedDifficulty,
  getNormalizedTopic,
  calculateOverallProgress,
} from "../utils/dsaUtils";
import "../styles/DsaStyles.css";
import ProblemListView from "../components/dsa/ProblemListView";

// Define viewOptions outside the component as it's constant
const viewOptions = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "all", label: "All Problems", icon: "📚" },
  { key: "neetcode150", label: "NeetCode 150", icon: "🔥" },
  { key: "striverSdeSheet", label: "Striver SDE", icon: "⚙️" },
  { key: "lastMoment", label: "Last-Moment", icon: "⏰" },
];

const DsaPage = () => {
  const {
    isModalVisible,
    modalMessage,
    recordDsaProgress, // Updated to use specific progress recorder
    closeRewardModal,
  } = useReward();

  const [completedProblems, setCompletedProblems] = useIndexedDb(
    DSA_COMPLETED_PROBLEMS_KEY,
    {}
  );
  const [activeView, setActiveView] = useIndexedDb(
    DSA_LAST_ACTIVE_VIEW_KEY,
    "dashboard"
  );
  const [filters, setFilters] = useState({
    difficulty: "all",
    topic: "all",
    pattern: "all",
    status: "all",
    searchTerm: "",
  });

  const [userProfile, addPoints, updateStreak, earnBadge, loadingProfile, errorProfile] = useUserProfile();

  const [lastVisitedViewDates, setLastVisitedViewDates] = useIndexedDb(
    DSA_LAST_VISITED_VIEW_DATES_KEY,
    {} // { viewKey: dateString }
  );

  const overallProgressStats = useMemo(
    () => calculateOverallProgress(dsaData, completedProblems),
    [completedProblems]
  );

  useEffect(() => {
    // When DSA progress changes, record it for reward checking.
    // The RewardContext will handle the combined logic.
    if (recordDsaProgress) {
      recordDsaProgress(overallProgressStats.completed);
    }
  }, [overallProgressStats.completed, recordDsaProgress]);

  const handleToggleComplete = useCallback(
    (problemId) => {
      setCompletedProblems((prev) => {
        const newCompleted = { ...prev };
        const isCurrentlyCompleted = !!newCompleted[problemId];

        if (isCurrentlyCompleted) {
          delete newCompleted[problemId];
        } else {
          newCompleted[problemId] = true;
          // Award points and update streak only when a problem is newly completed
          addPoints(10); // Example: 10 points per DSA problem
          updateStreak(new Date());
        }
        return newCompleted;
      });
    },
    [setCompletedProblems, addPoints, updateStreak]
  );

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value.toLowerCase() }));
  }, []);

  const handleViewChange = useCallback(
    (viewKey) => {
      if (viewKey !== "dashboard") { // Only track for non-dashboard views
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = today.getFullYear();
        setLastVisitedViewDates(prev => ({
          ...prev,
          [viewKey]: `${day}/${month}/${year}`, // Store in dd/MM/YYYY format
        }));
      }
      setActiveView(viewKey);
    },
    [setActiveView, setLastVisitedViewDates]
  );

  const uniqueTopics = useMemo(() => getUniqueTopics(dsaData), []);

  const baseProblemsForActiveView = useMemo(() => {
    if (activeView === "dashboard") {
      return []; // Dashboard doesn't list problems this way
    }
    if (activeView === "neetcode150") {
      return dsaData.filter(
        (p) => String(p.isNeetCode150).toLowerCase() === "true"
      );
    }
    if (activeView === "striverSdeSheet") {
      return dsaData.filter(
        (p) => String(p.isStriverSDESheet).toLowerCase() === "true"
      );
    }
    if (activeView === "lastMoment") {
      return dsaData.filter(
        (p) => String(p.isLastMoment).toLowerCase() === "true"
      );
    }
    // Default to "all" problems for other list views
    return dsaData;
  }, [activeView]); // dsaData is stable and from module scope

  const viewProblems = useMemo(() => {
    return baseProblemsForActiveView.filter((p) => {
      const normalizedDifficulty = getNormalizedDifficulty(p.difficulty);
      const normalizedTopic = getNormalizedTopic(p.topic);
      const patternMatch =
        filters.pattern === "all" ||
        (p.pattern && p.pattern.toLowerCase().includes(filters.pattern));
      const searchTermMatch =
        filters.searchTerm === "" ||
        p.title.toLowerCase().includes(filters.searchTerm) ||
        (p.subTopic && p.subTopic.toLowerCase().includes(filters.searchTerm));
      return (
        (filters.difficulty === "all" ||
          normalizedDifficulty.toLowerCase() === filters.difficulty) &&
        (filters.topic === "all" ||
          normalizedTopic.toLowerCase() === filters.topic) &&
        patternMatch &&
        searchTermMatch &&
        (filters.status === "all" ||
          (filters.status === "completed" && completedProblems[p.id]) ||
          (filters.status === "pending" && !completedProblems[p.id]))
      );
    });
  }, [baseProblemsForActiveView, filters, completedProblems]);

  const groupedProblems = useMemo(
    () => groupAndSortProblemsByTopic(viewProblems, completedProblems),
    [viewProblems, completedProblems]
  );

  const currentViewDifficultyStats = useMemo(() => {
    const stats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };

    // baseProblemsForActiveView will be an empty array if activeView is 'dashboard'
    // or if the view itself has no problems (e.g., no core problems in dsaData).
    // The subsequent check for length handles this.

    // The console.log uses activeView from the outer scope for clarity.
    if (import.meta.env.DEV) {
      // console.log(`[DsaPage] Calculating stats for activeView: ${activeView}, baseProblemsForActiveView count: ${baseProblemsForActiveView ? baseProblemsForActiveView.length : 0}`);
    }

    if (!baseProblemsForActiveView || baseProblemsForActiveView.length === 0) {
      if (import.meta.env.DEV) {
        // console.log("[DsaPage] No base problems for this view (or view is dashboard), returning zero stats.");
      }
      return stats; // No problems in this base view
    }

    baseProblemsForActiveView.forEach(problem => {
      const normalizedDifficultyFromUtil = getNormalizedDifficulty(problem.difficulty);
      const difficultyKey = normalizedDifficultyFromUtil ? normalizedDifficultyFromUtil.toLowerCase() : null; // Ensure lowercase
      if (difficultyKey && stats[difficultyKey]) {
        stats[difficultyKey].total++;
        if (completedProblems[problem.id]) {
          stats[difficultyKey].completed++;
        }
      } else if (difficultyKey) { // Log if normalized difficulty is truthy but not a key in stats
        console.warn(`[DsaPage] Difficulty key "${difficultyKey}" for problem "${problem.title}" is not a recognized key in stats object (easy, medium, hard).`);
      } // Keep the warning, it's useful even in dev
    });
    return stats;
  }, [baseProblemsForActiveView, completedProblems]);

  const filteredDifficultyStats = useMemo(() => {
    const stats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };
    if (!viewProblems || viewProblems.length === 0) {
      return stats;
    }
    viewProblems.forEach(problem => {
      const normalizedDifficultyFromUtil = getNormalizedDifficulty(problem.difficulty);
      const difficultyKey = normalizedDifficultyFromUtil ? normalizedDifficultyFromUtil.toLowerCase() : null;
      if (difficultyKey && stats[difficultyKey]) {
        stats[difficultyKey].total++;
        if (completedProblems[problem.id]) {
          stats[difficultyKey].completed++;
        }
      }
    });
    return stats;
  }, [viewProblems, completedProblems]);

  return (
    <div className="dsa-page-outer">
      <header className="dsa-hero">
        {/* Hero content remains the same */}
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
              overallProgress={overallProgressStats}
              totalProblems={dsaData.length}
              streakData={userProfile.currentStreak} // Pass currentStreak from userProfile
            />
          ) : (
            <ProblemListView
              groupedProblems={groupedProblems}
              onToggleProblemComplete={handleToggleComplete}
              showPatternFilter={filters.pattern !== "all"}
              currentViewDifficultyStats={currentViewDifficultyStats}
              filteredDifficultyStats={filteredDifficultyStats}
              lastVisitedDate={lastVisitedViewDates[activeView] || "Never"}
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

export default React.memo(DsaPage);
