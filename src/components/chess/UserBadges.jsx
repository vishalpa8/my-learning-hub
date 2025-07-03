import React from "react";
import { chess_badges_definitions } from "../../data/chessData";
import "./UserBadges.css";

/**
 * Displays a list of badges earned by the user.
 *
 * @param {object} props - The component props.
 * @param {Object.<string, any>} props.earnedBadges - An object where keys are badge IDs
 *   and values are truthy (e.g., `true` or an object like `{ earnedAt: "date" }`)
 *   if the badge has been earned by the user.
 *   Example: `{"beginner_learner": true, "consistent_student": { "earnedAt": "2023-01-01T00:00:00.000Z" }}`
 */
const UserBadges = ({ earnedBadges = {} }) => {
  const earnedBadgeDetails = chess_badges_definitions.filter(
    (badgeDef) => earnedBadges[badgeDef.id]
  );

  return (
    <div className="user-badges-section card-style">
      <h4>My Badges</h4>
      {earnedBadgeDetails.length === 0 ? (
        <p>No badges earned yet. Keep learning!</p>
      ) : (
        <div className="badges-grid">
          {earnedBadgeDetails.map((badge) => (
            <div
              key={badge.id}
              className="badge-item"
              title={`${badge.name}: ${badge.description}`}
              tabIndex={0}
              aria-label={`${badge.name}: ${badge.description}`}
            >
              {/* If badge.icon is purely decorative and its meaning is conveyed by aria-label on parent */}
              <span className="badge-icon" aria-hidden="true">
                {badge.icon}
              </span>
              {/* Note: If badge.icon were an SVG with its own accessible <title> or <desc>, aria-hidden might not be needed here. */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(UserBadges);
