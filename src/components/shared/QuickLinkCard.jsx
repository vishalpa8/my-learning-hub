import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const QuickLinkCard = ({ title, description, href, cta, icon }) => (
  <div className="quick-link-card">
    <span className="quick-link-icon">{icon}</span>
    <h4>{title}</h4>
    <p>{description}</p>
    <Link to={href} className="home-btn-primary">
      {cta}
    </Link>
  </div>
);

QuickLinkCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  cta: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

export default React.memo(QuickLinkCard);
