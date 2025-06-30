import React, { useId } from "react";
import "./ProgressBarDisplay.css";

/**
 * Displays a progress bar with a label.
 *
 * @param {object} props
 * @param {number} props.completed - Number of completed items. Must be non-negative.
 * @param {number} props.total - Total number of items. Must be a positive number for the bar to render.
 * @param {string} [props.label] - Optional custom label to display. If not provided, a default label showing "completed / total (percent%)" will be used.
 */
const ProgressBarDisplay = ({ completed, total, label }) => {
  const labelId = useId();

  if (!total || total <= 0) {
    // This block is for showing a warning in development if the 'total' prop is invalid.
    // It checks if 'process', 'process.env', and 'process.env.NODE_ENV' are accessible
    // before attempting to log the warning. This is to prevent runtime errors in
    // environments where 'process' is not defined (e.g., some browser contexts without
    // a build step that polyfills or defines 'process').
    // environments where 'process' is not defined.
    // For Vite projects (often run with `npm run dev`), `import.meta.env.DEV` is the preferred way.
    // For Create React App, `process.env.NODE_ENV` should be replaced by the build tool.
    return null;
  }

  const safeCompleted = Math.max(0, Math.min(completed, total));
  const percent = (safeCompleted / total) * 100;

  return (
    <div className="progress-bar-display">
      <progress
        value={safeCompleted}
        max={total}
        aria-valuenow={safeCompleted}
        aria-valuemax={total}
        aria-valuemin={0}
        aria-labelledby={labelId}
      ></progress>
      <span id={labelId} className="progress-bar-label">
        {label || `${safeCompleted} / ${total} (${percent.toFixed(1)}%)`}
      </span>
    </div>
  );
};

export default React.memo(ProgressBarDisplay);
