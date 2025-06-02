import React from "react";
import "./Footer.css";

/**
 * Renders the application footer with copyright information.
 * It is memoized for performance optimization.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <p>&copy; {currentYear} MyLearningHub. All rights reserved.</p>
        {/* Uncomment and customize links below if needed */}
        {/* <nav className="footer-nav" aria-label="Footer Navigation"> */}
          {/* For internal links, use <Link to="/privacy">Privacy</Link> from react-router-dom */}
          {/* <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a>
        </nav> */}
      </div>
    </footer>
  );
};

export default React.memo(Footer);
