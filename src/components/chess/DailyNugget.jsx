import React, { useState, useEffect } from "react";
import { nuggets } from "../../data/chessData";
import { useSeenNuggets } from "../../hooks/useSeenNuggets";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CONSTANTS } from "../../components/ai/chatUtils"; // For POINTS_PER_NUGGET
import "./DailyNugget.css";



/**
 * Displays a "Daily Chess Nugget" selected based on the current day of the year.
 * The nugget includes a quote, a focus area, and an optional description.
 * It is memoized for performance optimization.
 */
const DailyNugget = () => {
  const [currentNugget, setCurrentNugget] = useState(null);
  const [seenNuggets, markNuggetAsSeen, loadingSeenNuggets, errorSeenNuggets] =
    useSeenNuggets();
  const [addPoints, updateStreak, loadingProfile, errorProfile] = useUserProfile();

  useEffect(() => {
    if (loadingSeenNuggets || errorSeenNuggets || loadingProfile || errorProfile || !nuggets || nuggets.length === 0) {
      return;
    }

    const today = new Date();

    // Filter out nuggets that have already been seen
    const unseenNuggets = nuggets.filter((nugget) => !seenNuggets[nugget.id]);

    if (unseenNuggets.length > 0) {
      // Select a random unseen nugget
      const nuggetIndex = Math.floor(Math.random() * unseenNuggets.length);
      const selectedNugget = unseenNuggets[nuggetIndex];
      setCurrentNugget(selectedNugget);

      // Mark nugget as seen and trigger point/streak update via callback
      markNuggetAsSeen(selectedNugget.id, () => {
        addPoints(CONSTANTS.POINTS_PER_NUGGET);
        updateStreak(today);
      });
    } else {
      // All nuggets have been seen, reset the seen nuggets for the next cycle
      
      // Only reset if seenNuggets is not already empty to prevent infinite loops
      if (Object.keys(seenNuggets).length > 0) {
        markNuggetAsSeen({}); // This will overwrite the existing seenNuggets with an empty object
      }
      setCurrentNugget(null); // Clear current nugget until next render cycle picks a new one
    }
  }, [loadingSeenNuggets, errorSeenNuggets, seenNuggets, markNuggetAsSeen, addPoints, updateStreak, loadingProfile, errorProfile]);

  if (!currentNugget) {
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
