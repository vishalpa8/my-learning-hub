import React from "react";
import ProblemCard from "./ProblemCard";
import { Doughnut } from "react-chartjs-2"; // Changed from Pie to Doughnut
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
 * @param {function} props.onDragEnd - Callback function for when a drag ends.
 */

// Custom plugin to draw text in the center of the doughnut chart
const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw: (chart) => {
    if (
      chart.config.type === "doughnut" &&
      chart.options.plugins.centerText &&
      chart.options.plugins.centerText.display
    ) {
      const { ctx } = chart;
      const {
        text,
        color,
        font,
        yAdjust = 0,
        subText,
        subTextColor,
        subTextFont,
        subTextYAdjust = 20,
      } = chart.options.plugins.centerText;
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      ctx.save();

      // Main text (e.g., the number)
      ctx.font = font || "bold 16px sans-serif";
      ctx.fillStyle = color || "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, centerX, centerY + yAdjust);

      // Sub text (e.g., "Solved")
      if (subText) {
        ctx.font = subTextFont || "12px sans-serif";
        ctx.fillStyle = subTextColor || "#666";
        ctx.fillText(subText, centerX, centerY + subTextYAdjust);
      }

      ctx.restore();
    }
  },
};
ChartJS.register(ArcElement, Tooltip, Legend, Title, centerTextPlugin); // Register the custom plugin

const ProblemListView = ({
  groupedProblems, // Expected: Map<string, ProblemData[]>
  onToggleProblemComplete,
  showPatternFilter = false,
  currentViewDifficultyStats,
  filteredDifficultyStats,
  lastVisitedDate,
  onDragEnd,
}) => {
  // Determine if there are any problems to display.
  // groupedProblems is a Map, so check its size.
  const hasProblems = groupedProblems && groupedProblems.size > 0;

  // Calculate counts directly from filteredDifficultyStats first
  let totalSolvedForCenterText = 0;
  if (filteredDifficultyStats) {
    totalSolvedForCenterText =
      filteredDifficultyStats.easy.completed +
      filteredDifficultyStats.medium.completed +
      filteredDifficultyStats.hard.completed;
  }

  const currentlyDisplayedCount = filteredDifficultyStats
    ? filteredDifficultyStats.easy.total +
      filteredDifficultyStats.medium.total +
      filteredDifficultyStats.hard.total
    : 0;

  // Define standard and faded colors for chart segments
  // Corresponds to CSS variables like --chart-color-easy, --chart-color-easy-faded, etc.
  // Consider centralizing these if used across multiple chart components,
  // or eventually deriving from CSS variables if feasible.
  const chartColors = {
    easy: {
      main: "rgba(75, 192, 192, 0.7)",
      faded: "rgba(75, 192, 192, 0.2)",
      border: "rgba(75, 192, 192, 1)",
    },
    medium: {
      main: "rgba(255, 206, 86, 0.7)",
      faded: "rgba(255, 206, 86, 0.2)",
      border: "rgba(255, 206, 86, 1)",
    },
    hard: {
      main: "rgba(255, 99, 132, 0.7)",
      faded: "rgba(255, 99, 132, 0.2)",
      border: "rgba(255, 99, 132, 1)",
    },
  };

  // Use a font family consistent with the application's theme.
  // This should ideally match the font specified by `var(--font-family-sans-serif)` in your CSS.
  const chartFontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  const pieChartData = filteredDifficultyStats // Generate chart data if filteredDifficultyStats exists
    ? {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [
          {
            label: "Solved Problems Distribution", // Updated label for solved problems
            data: [
              filteredDifficultyStats.easy.completed, // Use completed count
              filteredDifficultyStats.medium.completed, // These can be 0
              filteredDifficultyStats.hard.completed, // These can be 0
            ],
            backgroundColor: [
              filteredDifficultyStats.easy.completed > 0
                ? chartColors.easy.main
                : chartColors.easy.faded,
              filteredDifficultyStats.medium.completed > 0
                ? chartColors.medium.main
                : chartColors.medium.faded,
              filteredDifficultyStats.hard.completed > 0
                ? chartColors.hard.main
                : chartColors.hard.faded,
            ],
            borderColor: [
              chartColors.easy.border,
              chartColors.medium.border,
              chartColors.hard.border,
            ],
            borderWidth: 1, // Ensures segment outline is visible even if faded
          },
        ],
      }
    : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%", // This makes it a doughnut chart. Adjust percentage for hole size.
    plugins: {
      centerText: {
        // Configuration for our custom centerTextPlugin
        display: !!filteredDifficultyStats, // Display center text if stats are available
        text: `${totalSolvedForCenterText} / ${currentlyDisplayedCount}`, // Display as "completed / total"
        color: "#212529", // Main text color, should align with var(--text-color) or similar
        font: `bold 20px ${chartFontFamily}`, // Font for the number
        yAdjust: -10, // Fine-tune vertical position of the number
        subText: "Solved", // Text below the number
        subTextColor: "#5a6268", // Muted text color, should align with var(--text-muted-color) or similar
        subTextFont: `14px ${chartFontFamily}`, // Font for "Solved"
        subTextYAdjust: 10, // Fine-tune vertical position of "Solved"
      },
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: chartFontFamily,
          },
        },
      },
      title: {
        display: true,
        text: "Solved Problem Distribution by Difficulty", // Updated title
        font: { size: 16, family: chartFontFamily },
      },
      tooltip: {
        titleFont: { family: chartFontFamily },
        bodyFont: { family: chartFontFamily },
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              const totalDatasetSum = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage =
                totalDatasetSum > 0
                  ? ((context.parsed / totalDatasetSum) * 100).toFixed(1)
                  : 0;
              label += `${context.parsed} solved problems (${percentage}%)`; // Clarified tooltip
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

  const totalProblemsInThisView = currentViewDifficultyStats
    ? currentViewDifficultyStats.easy.total +
      currentViewDifficultyStats.medium.total +
      currentViewDifficultyStats.hard.total
    : 0; // Summing totals from the stats object

  return (
    <div data-testid="problem-list-view">
      {" "}
      {/* Removed id="problem-list-view" */}
      {/* The h2 viewTitle element has been removed */}
      {shouldShowStatsTile && (
        <section className="view-stats-tile dashboard-card">
          {" "}
          {/* Reusing dashboard-card style for consistency */}
          <div className="difficulty-stats-breakdown">
            <p>
              <strong>Last Visited:</strong> {lastVisitedDate || "Never"}
            </p>

            <h4 className="stats-subheader">
              {currentlyDisplayedCount === totalProblemsInThisView
                ? `Total Problems: ${totalProblemsInThisView}` // Show only total if no filtering
                : `Currently Displayed: ${currentlyDisplayedCount} of ${totalProblemsInThisView} problems`}{" "}
              {/* Show filtered count if filtering */}
            </h4>
            <p>
              <strong>Easy:</strong> {filteredDifficultyStats.easy.completed} /{" "}
              {filteredDifficultyStats.easy.total}
            </p>
            <p>
              <strong>Medium:</strong>{" "}
              {filteredDifficultyStats.medium.completed} /{" "}
              {filteredDifficultyStats.medium.total}
            </p>
            <p>
              <strong>Hard:</strong> {filteredDifficultyStats.hard.completed} /{" "}
              {filteredDifficultyStats.hard.total}
            </p>
            <p>
              <strong>Total Solved:</strong> {totalSolvedForCenterText} /{" "}
              {currentlyDisplayedCount}
            </p>
          </div>
          {pieChartData && (
            <div className="view-pie-chart-container">
              <div className="chart-wrapper">
                {" "}
                {/* Use CSS class for styling */}
                <Doughnut data={pieChartData} options={pieChartOptions} />{" "}
                {/* Changed to Doughnut */}
              </div>
            </div>
          )}
        </section>
      )}
      <section id="problems-section">
        <DragDropContext onDragEnd={onDragEnd}>
          <div id="problems-container">
            {hasProblems ? (
              Array.from(groupedProblems.entries()).map(
                ([topic, problemsInTopic]) =>
                  // Only render topic group if it has problems
                  problemsInTopic.length > 0 ? (
                    <div key={topic} className="topic-group">
                      <h3 className="topic-header">{topic}</h3>
                      <Droppable droppableId={topic}>
                        {(provided) => (
                          <ul
                            className="problem-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {problemsInTopic.map((problem, index) => (
                              <Draggable
                                key={problem.id}
                                draggableId={problem.id}
                                index={index}
                              >
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <ProblemCard
                                      problem={problem} // This problem object now has `isCompleted`
                                      onToggleComplete={onToggleProblemComplete}
                                      showPatternTruncated={showPatternFilter} // Still useful for ProblemCard
                                      dragHandleProps={provided.dragHandleProps}
                                    />
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </div>
                  ) : null
              )
            )
           : (
            <p className="no-problems-message">
              No problems match your filters, or no problems available for this
              view.
            </p>
          )}
          </div>
        </DragDropContext>
      </section>
    </div>
  );
};

export default React.memo(ProblemListView);
