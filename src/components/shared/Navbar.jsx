import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

/**
 * Renders the main navigation bar for the application.
 * Uses NavLink for active state styling and accessibility.
 * It is memoized for performance optimization.
 */
const Navbar = () => (
  <nav className="navbar" role="navigation" aria-label="Main Navigation">
    <div className="navbar-container">
      <Link to="/" className="navbar-logo">
        {/* Consider replacing text with an SVG or <img> tag for a visual logo */}
        MyLearningHub
      </Link>
      {/* Placeholder for mobile menu toggle button (hamburger icon)
          - Would typically involve state to manage open/close
          - And conditional class names on nav-menu for display */}
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-links active" : "nav-links"
            }
            end
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            Home
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/dsa"
            className={({ isActive }) =>
              isActive ? "nav-links active" : "nav-links"
            }
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            DSA
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/chess"
            className={({ isActive }) =>
              isActive ? "nav-links active" : "nav-links"
            }
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            Chess
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/progress"
            className={({ isActive }) =>
              isActive ? "nav-links active" : "nav-links"
            }
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
            Progress
          </NavLink>
        </li>
        {/* Add more navigation items here as needed */}
      </ul>
      {/* You could add a search bar or user profile icon here */}
    </div>
  </nav>
);

export default React.memo(Navbar);
