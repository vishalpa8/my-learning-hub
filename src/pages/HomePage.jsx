import React, { useMemo } from "react";
import { Link } from "react-router-dom"; // Import Link for client-side navigation
import ProgressBarDisplay from "../components/shared/ProgressBarDisplay";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_LEARNING_PROGRESS_KEY,
} from "../constants/localStorageKeys";
import { dsaData } from "../data/dsaData"; // To get total DSA problems
import { playlistVideoData } from "../data/chessData"; // To get total Chess videos
import "../styles/HomePage.css";

const HomePage = () => {
  const [completedDsaProblems] = useLocalStorage(
    DSA_COMPLETED_PROBLEMS_KEY,
    {}
  );
  const [completedChessVideos] = useLocalStorage(
    CHESS_LEARNING_PROGRESS_KEY,
    {}
  );

  const dsaProgress = useMemo(() => {
    const completed = Object.keys(completedDsaProblems || {}).length;
    const total = dsaData.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [completedDsaProblems]);

  const chessProgress = useMemo(() => {
    const completed = Object.keys(completedChessVideos || {}).length;
    let total = 0;
    if (playlistVideoData) {
      Object.values(playlistVideoData).forEach((playlist) => {
        if (playlist && Array.isArray(playlist.videos)) {
          total += playlist.videos.length;
        }
      });
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [completedChessVideos]);

  const handleResetAllProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset ALL progress and clear ALL application data from local storage? This action is irreversible and will affect all data for this site."
      )
    ) {
      console.log("[Reset] Clearing ALL localStorage for this origin.");
      localStorage.clear();
      console.log("[Reset] localStorage cleared. Reloading page...");
      window.location.reload(); // Reload the page to reflect changes
    }
  };

  return (
    <main
      className="home-modern-container"
      role="main"
      aria-label="Learning Hub Home"
      tabIndex={-1}
    >
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>
            <span role="img" aria-label="books">
              📚
            </span>{" "}
            My Learning Hub
          </h1>
          <p>
            Welcome! Track your <strong>DSA</strong>,{" "}
            <strong>Competitive Programming</strong>, and <strong>Chess</strong>{" "}
            progress in one place.
            <br />
            Visualize your journey, unlock achievements, and stay motivated!
          </p>
          <div className="home-hero-actions">
            <Link to="/dsa" className="home-btn-primary">
              Start DSA Journey
            </Link>
            <Link to="/chess" className="home-btn-secondary">
              Explore Chess
            </Link>
          </div>
        </div>
        <div className="home-hero-image" aria-hidden="true">
          {/* Consider using a local asset for the hero image.
            Place the image in your public/assets/images folder
            and update the src path accordingly, e.g., "/assets/images/hero-image.svg" */}
          <img
            src="https://img.icons8.com/color/96/000000/learning.png"
            alt="Illustration of learning and growth"
          />
        </div>
      </section>

      {/* Progress Overview */}
      <section className="home-progress-overview">
        <h2>📊 Your Progress</h2>
        <div className="home-progress-cards">
          <ProgressCard
            icon="🧩"
            title="DSA & CP"
            completed={dsaProgress.completed}
            total={dsaProgress.total}
            percent={dsaProgress.percent}
            link="/dsa"
          />
          <ProgressCard
            icon="♟️"
            title="Chess"
            completed={chessProgress.completed}
            total={chessProgress.total}
            percent={chessProgress.percent}
            link="/chess"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="home-quick-links">
        <QuickLinkCard
          title="DSA & CP Pathway"
          description="Practice curated DSA and CP problems, filter by topic/difficulty, and earn rewards as you progress."
          href="/dsa"
          icon="🧩"
          cta="Go to DSA & CP"
        />
        <QuickLinkCard
          title="Chess Learning Hub"
          description="Watch structured chess playlists, complete daily nuggets, and unlock achievement badges."
          href="/chess"
          cta="Go to Chess"
          icon="♟️"
        />
      </section>

      {/* Features & Tips */}
      <section className="home-features-section">
        <h3>✨ Features & Tips</h3>
        <ul className="home-features-list">
          <li>
            📈 <strong>Live Progress:</strong> Instantly see your latest stats
            above.
          </li>
          <li>
            🏆 <strong>Milestones & Rewards:</strong> Complete goals to unlock
            badges.
          </li>
          <li>
            🔍 <strong>Smart Filtering:</strong> Use advanced filters in DSA &
            CP.
          </li>
          <li>
            🎥 <strong>Chess Playlists:</strong> Track your chess journey
            visually.
          </li>
          <li>
            💡 <strong>Daily Nuggets:</strong> Get a new chess insight every
            day.
          </li>
        </ul>
      </section>

      {/* Reset Progress Section */}
      <section className="home-reset-section card-style">
        <h3>
          <span role="img" aria-label="warning">
            ⚠️
          </span>{" "}
          Advanced Settings
        </h3>
        <p>
          Reset all your learning progress across DSA, Chess, and rewards. This
          action is irreversible.
        </p>
        <button onClick={handleResetAllProgress} className="btn-danger">
          Reset All Progress
        </button>
      </section>
    </main>
  );
};

/**
 * Displays a progress card for a specific learning area.
 * @param {object} props
 * @param {string} props.icon - Emoji icon for the card.
 * @param {string} props.title - Title of the learning area.
 * @param {number} props.completed - Number of items completed.
 * @param {number} props.total - Total number of items.
 * @param {number} props.percent - Completion percentage.
 * @param {string} props.link - Path to navigate to for more details.
 */
const ProgressCard = ({ icon, title, completed, total, percent, link }) => (
  <div className="progress-card">
    <div className="progress-card-header">
      <span className="progress-card-icon">{icon}</span>
      <h3>{title}</h3>
      <span className="progress-card-percent">{percent}%</span>
    </div>
    <ProgressBarDisplay
      completed={completed}
      total={total}
      label={`${completed} / ${total} (${percent}%)`}
    />
    <Link to={link} className="home-btn-primary">
      View Details
    </Link>
  </div>
);

/**
 * Displays a quick link card to a specific section of the hub.
 * @param {object} props
 * @param {string} props.title - Title of the card.
 * @param {string} props.description - Description of the section.
 * @param {string} props.href - Path to navigate to.
 * @param {string} props.cta - Call to action text for the button.
 * @param {string} props.icon - Emoji icon for the card.
 */
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

export default React.memo(HomePage);
