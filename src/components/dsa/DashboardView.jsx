import React from "react";
import ProgressBarDisplay from "../shared/ProgressBarDisplay"; // Import the reusable component

/**
 * Renders the dashboard view for the DSA section.
 * Displays an overview, overall progress, and placeholder engagement elements.
 *
 * @param {object} props - The component props.
 * @param {object} props.overallProgress - An object containing progress data.
 * @param {number} props.overallProgress.completed - The number of completed DSA problems.
 * @param {number} props.totalProblems - The total number of DSA problems available.
 * @param {object} props.streakData - An object containing streak information.
 * @param {number} props.streakData.currentStreak - The current streak count.
 * @param {string|null} props.streakData.lastCompletionDate - The date of the last completion.
 */
const DashboardView = ({ overallProgress, totalProblems, streakData }) => {
  const { completed: completedProblems } = overallProgress;

  const { currentStreak } = streakData || { currentStreak: 0 }; // Default to 0 if streakData is not available

  return (
    // Added className="dashboard-view" to apply the main flex layout from DsaStyles.css
    <div id="dashboard-view" className="dashboard-view">
      {/* Made "overview" a dashboard-card for consistent styling */}
      <section id="overview" className="dashboard-card">
        <h2>Welcome to Your DSA Pathway!</h2>
        <p>
          Track your progress, discover new problems, and level up your skills.
        </p>
      </section>

      <section
        id="dashboard-overall-progress"
        className="dashboard-card" // Aligned with DsaStyles.css for card styling
      >
        <h3>Overall Progress</h3>
        <ProgressBarDisplay
          completed={completedProblems}
          total={totalProblems}
        />
      </section>

      {/* New section for Streak Data */}
      <section id="dashboard-streak" className="dashboard-card">
        <h3>Current Streak 🔥</h3>
        <p>{currentStreak} Day{currentStreak !== 1 ? 's' : ''}</p>
        {/* You could add lastCompletionDate here if desired */}
      </section>

      {/* Placeholder for other dashboard elements */}
      <section id="engagement-elements" className="dashboard-engagement-grid">
        {/* Changed div to section for semantics and h4 to h3 for styling */}
        <section className="dashboard-card" id="weekly-challenge">
          <h3>Weekly Challenge Suggestion</h3>
          <p>
            <em>(Feature coming soon)</em> Try tackling a Medium level Graph
            problem this week!
          </p>
        </section>
        {/* Changed div to section for semantics and h4 to h3 for styling */}
        <section className="dashboard-card" id="milestones">
          <h3>Milestones</h3>
          <ul>
            <li>
              Complete 50 problems - <em>(Feature coming soon)</em>
            </li>
            <li>
              Master 5 patterns - <em>(Feature coming soon)</em>
            </li>
            <li>
              Solve your first Hard problem - <em>(Feature coming soon)</em>
            </li>
          </ul>
        </section>
      </section>
    </div>
  );
};

export default React.memo(DashboardView);
