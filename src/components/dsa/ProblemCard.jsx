import React from "react";
import { getNormalizedDifficulty } from "../../utils/dsaUtils";

/**
 * Displays a card for a single DSA problem.
 *
 * @param {object} props - The component props.
 * @param {object} props.problem - The problem object.
 * @param {string} props.problem.id - Unique identifier for the problem.
 * @param {string} props.problem.title - Title of the problem.
 * @param {string} [props.problem.difficulty] - Raw difficulty string (e.g., "Easy", "Medium", "Hard").
 * @param {string} [props.problem.pattern] - Associated pattern(s) for the problem.
 * @param {string} [props.problem.subTopic] - Specific sub-topic of the problem.
 * @param {string} [props.problem.problemLink] - URL to the problem statement.
 * @param {string} [props.problem.explanationLink] - URL to an explanation or solution.
 * @param {boolean} [props.problem.isCompleted] - Whether the problem is marked as completed.
 * @param {function(string): void} props.onToggleComplete - Callback function to toggle the completion status.
 * @param {boolean} [props.showPatternTruncated=false] - If true, truncates the pattern display (e.g., removes " - Covered in ...").
 */
const ProblemCard = ({ problem, onToggleComplete, showPatternTruncated, dragHandleProps }) => {
  const normalizedDifficulty = getNormalizedDifficulty(problem.difficulty);
  const difficultyClass = `difficulty-${normalizedDifficulty.toLowerCase()}`;
  const cardClasses = `problem-item ${difficultyClass} ${
    problem.isCompleted ? "completed-problem-card" : "" // Use isCompleted
  }`;

  const displayedPattern =
    problem.pattern && showPatternTruncated
      ? problem.pattern.split(" - Covered in ")[0]
      : problem.pattern;

  return (
    <div
      className={cardClasses}
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => {
        // "Enter" or "Space" key press on card toggles completion
        if (e.key === "Enter" || e.key === " ") {
          if (e.target === e.currentTarget) {
            // Ensure event is directly on this div
            e.preventDefault();
            onToggleComplete(problem.id); // Toggle completion on Enter/Space
          }
        }
      }}
    >
      <div className="problem-main-content">
        <div className="problem-card-header">
          <div className="drag-handle" {...dragHandleProps}>
            <span className="drag-icon">☰</span>
          </div>
          <h3 className="problem-title">
            {problem.problemLink ? (
              <a
                href={problem.problemLink}
                target="_blank"
                rel="noopener noreferrer"
                className="problem-title-link"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card's main navigation onClick
                  // Link will navigate on its own
                }}
              >
                {problem.title}
              </a>
            ) : (
              problem.title
            )}
          </h3>
        </div>
        <div className="problem-meta-tags">
          <span className={`problem-difficulty ${difficultyClass}`}>
            {normalizedDifficulty}
          </span>
          {displayedPattern && (
            <span className="problem-pattern">{displayedPattern}</span>
          )}
        </div>
        {problem.subTopic && problem.subTopic.trim() !== "" && (
          <p className="problem-subtopic">SubTopic: {problem.subTopic}</p>
        )}
      </div>
      <div className="problem-meta" onClick={(e) => e.stopPropagation()}>
        <label
          htmlFor={`complete-${problem.id}`}
          className={`problem-complete-toggle ${
            problem.isCompleted ? "completed" : "" // Use isCompleted
          }`}
        >
          <input
            type="checkbox"
            id={`complete-${problem.id}`}
            checked={!!problem.isCompleted} // Use isCompleted
            onChange={() => onToggleComplete(problem.id)} // Checkbox change directly toggles
          />
          {problem.isCompleted ? "✓ Completed" : "Mark as Complete"}{" "}
          {/* Use isCompleted */}
        </label>
        {problem.explanationLink && (
          <a
            href={problem.explanationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-outline" // Ensure 'btn-secondary-outline' class is styled
            onClick={(e) => e.stopPropagation()} // Prevent card's main navigation onClick
          >
            Explanation
          </a>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProblemCard);
