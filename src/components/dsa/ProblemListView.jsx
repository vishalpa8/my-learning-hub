import React from "react";
import ProblemCard from "./ProblemCard";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

/**
 * Renders a list of DSA problems, grouped by topic.
 * Problems within each topic are sorted by difficulty.
 *
 * @param {object} props - The component props. // viewTitle prop removed
 * @param {Map<string, Array<Object>>} props.groupedProblems - A Map where keys are topics,
 *   and values are arrays of problem objects (sorted by difficulty, then title).
 *   Each problem object is expected to have an `isCompleted` property.
 * @param {function(string): void} props.onToggleProblemComplete - Callback function to toggle the completion status of a problem.
 * @param {boolean} [props.showPatternFilter=false] - Passed to ProblemCard to indicate if the pattern should be shown truncated.
 * @param {object} [props.currentViewDifficultyStats] - Stats for easy, medium, hard problems in the current view.
 * @param {object} [props.filteredDifficultyStats] - Stats for easy, medium, hard problems for the *currently filtered* list.
 * @param {string} [props.lastVisitedDate] - The date string when this view was last visited.
 */

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ProblemListView = ({
  groupedProblems, // Expected: Map<string, ProblemData[]>
  onToggleProblemComplete,
  showPatternFilter = false,
  currentViewDifficultyStats,
  filteredDifficultyStats,
  lastVisitedDate,
}) => {
  // Determine if there are any problems to display.
  // groupedProblems is a Map, so check its size.
  const hasProblems = groupedProblems && groupedProblems.size > 0;

  const pieChartData =
    filteredDifficultyStats && // Use filteredDifficultyStats for the pie chart
    (filteredDifficultyStats.easy.total > 0 ||
      filteredDifficultyStats.medium.total > 0 ||
      filteredDifficultyStats.hard.total > 0)
      ? {
          labels: ["Easy", "Medium", "Hard"],
          datasets: [
            {
              label: "Filtered Problems", // Update label
              data: [
                filteredDifficultyStats.easy.total,
                filteredDifficultyStats.medium.total,
                filteredDifficultyStats.hard.total,
              ],
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)", // Easy - Teal
                "rgba(255, 206, 86, 0.7)", // Medium - Yellow
                "rgba(255, 99, 132, 0.7)", // Hard - Red
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        }
      : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Filtered Problem Distribution", // Update title
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              const totalDatasetSum = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = totalDatasetSum > 0 ? ((context.parsed / totalDatasetSum) * 100).toFixed(1) : 0;
              label += `${context.parsed} problems (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
  };

  const shouldShowStatsTile =
    currentViewDifficultyStats &&
    (currentViewDifficultyStats.easy.total > 0 ||
      currentViewDifficultyStats.medium.total > 0 ||
      currentViewDifficultyStats.hard.total > 0);

  // Calculate the count of currently displayed problems - MOVED OUTSIDE JSX
  const currentlyDisplayedCount = filteredDifficultyStats
    ? filteredDifficultyStats.easy.total + filteredDifficultyStats.medium.total + filteredDifficultyStats.hard.total
    : 0;
  const totalProblemsInThisView = currentViewDifficultyStats
    ? currentViewDifficultyStats.easy.total + currentViewDifficultyStats.medium.total + currentViewDifficultyStats.hard.total
    : 0; // Summing totals from the stats object

  return (
    <div> {/* Removed id="problem-list-view" */}
      {/* The h2 viewTitle element has been removed */}
      {shouldShowStatsTile && (
        <section className="view-stats-tile dashboard-card"> {/* Reusing dashboard-card style for consistency */}
          <div className="difficulty-stats-breakdown">
            <p><strong>Last Visited:</strong> {lastVisitedDate || "Never"}</p>

            <h4 className="stats-subheader">
              {currentlyDisplayedCount === totalProblemsInThisView
                ? `Total Problems: ${totalProblemsInThisView}` // Show only total if no filtering
                : `Currently Displayed: ${currentlyDisplayedCount} of ${totalProblemsInThisView} problems`} {/* Show filtered count if filtering */}
            </h4>
            <p>
              <strong>Easy:</strong> {filteredDifficultyStats.easy.completed} / {filteredDifficultyStats.easy.total}
            </p>
            <p>
              <strong>Medium:</strong> {filteredDifficultyStats.medium.completed} / {filteredDifficultyStats.medium.total}
            </p>
            <p>
              <strong>Hard:</strong> {filteredDifficultyStats.hard.completed} / {filteredDifficultyStats.hard.total}
            </p>

          </div>
          {pieChartData && (
            <div className="view-pie-chart-container">
              <div className="chart-wrapper"> {/* Use CSS class for styling */}
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          )}
        </section>
      )}

      <section id="problems-section">
        <div id="problems-container">
          {hasProblems ? (
            Array.from(groupedProblems.entries()).map(([topic, problemsInTopic]) =>
              // Only render topic group if it has problems
              problemsInTopic.length > 0 ? (
                <div key={topic} className="topic-group">
                  <h3 className="topic-header">{topic}</h3>
                  {/* Removed pattern iteration - problems are now directly under topics */}
                  <ul className="problem-list">
                    {problemsInTopic.map((problem) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem} // This problem object now has `isCompleted`
                        onToggleComplete={onToggleProblemComplete}
                        showPatternTruncated={showPatternFilter} // Still useful for ProblemCard
                      />
                    ))}
                  </ul>
                </div>
              ) : null
            )
          ) : (
            <p className="no-problems-message">
              No problems match your filters, or no problems available for this
              view.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default React.memo(ProblemListView);
