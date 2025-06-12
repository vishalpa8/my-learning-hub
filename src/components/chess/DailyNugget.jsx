import React, { useState, useEffect } from "react";
import { nuggets } from "../../data/chessData";
import "./DailyNugget.css";

/**
 * Calculates the day of the year (1-366) for a given date.
 *
 * @param {Date} date - The date for which to calculate the day of the year.
 * @returns {number} The day of the year (e.g., 1 for Jan 1st, 366 for Dec 31st in a leap year).
 */
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start; // Direct subtraction of Date objects gives milliseconds
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Displays a "Daily Chess Nugget" selected based on the current day of the year.
 * The nugget includes a quote, a focus area, and an optional description.
 * It is memoized for performance optimization.
 */
const DailyNugget = () => {
  const [currentNugget, setCurrentNugget] = useState(null);

  useEffect(() => {
    // Ensure nuggets is a non-empty array before attempting to select one.
    if (nuggets && nuggets.length > 0) {
      const today = new Date();
      const dayOfYear = getDayOfYear(today);
      // Ensure index is always within bounds, dayOfYear is 1-based.
      const nuggetIndex = (dayOfYear - 1 + nuggets.length) % nuggets.length;
      setCurrentNugget(nuggets[nuggetIndex]);
    }
    // This effect runs once on mount. 'nuggets' is a static import,
    // so it doesn't strictly need to be a dependency, but adding it is harmless.
  }, []); // Empty dependency array ensures this runs only once on component mount.

  if (!currentNugget) {
    // Return null if no nugget can be determined (e.g., empty nuggets data).
    // This prevents rendering an empty or broken section.
    return null;
  }

  const { quote, focus, description } = currentNugget;

  return (
    <section className="daily-nugget-section card-style" aria-labelledby="daily-nugget-title">
      <h3 id="daily-nugget-title">💡 Daily Chess Nugget</h3>
      {/* SECURITY NOTE: 'quote' and 'description' use dangerouslySetInnerHTML.
          This is acceptable if the HTML in 'chessData.js' is static, trusted, and sanitized.
          Avoid this pattern if the content can be influenced by untrusted sources or contains complex HTML/scripts. */}
      <blockquote dangerouslySetInnerHTML={{ __html: `"${quote}"` }} />
      <p>
        <strong>Focus:</strong> {focus}
      </p>
      {description && (
        <p
          className="nugget-description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </section>
  );
};

export default React.memo(DailyNugget);
