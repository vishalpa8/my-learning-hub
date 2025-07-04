import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ProgressBarDisplay from "./ProgressBarDisplay";

const ProgressCard = ({
  icon,
  title,
  completed,
  total,
  percent,
  link,
  label,
  linkText,
}) => (
  <div className="progress-card">
    <div className="progress-card-header">
      <span className="progress-card-icon">{icon}</span>
      <h3>{title}</h3>
      <span className="progress-card-percent">{percent}%</span>
    </div>
    {total > 0 || (title === "Daily Routine" && completed >= 0) ? (
      <ProgressBarDisplay completed={completed} total={total} label={label} />
    ) : null}
    <Link to={link} className="home-btn-primary">
      {linkText}
    </Link>
  </div>
);

ProgressCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  completed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
};

export default React.memo(ProgressCard);
