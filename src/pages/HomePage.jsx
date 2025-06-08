import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ProgressBarDisplay from "../components/shared/ProgressBarDisplay";
// VVVV 1. CORRECT THE IMPORT HERE VVVV
import { useIndexedDb, db } from "../hooks/useIndexedDb";
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_LEARNING_PROGRESS_KEY,
} from "../constants/localStorageKeys";
import { dsaData } from "../data/dsaData";
import { playlistVideoData } from "../data/chessData";
import "../styles/HomePage.css";

const HomePage = () => {
  const [completedDsaProblems] = useIndexedDb(DSA_COMPLETED_PROBLEMS_KEY, {});
  const [completedChessVideos] = useIndexedDb(CHESS_LEARNING_PROGRESS_KEY, {});

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

  const handleResetAllProgress = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset ALL progress? This will clear all application data from the database and is irreversible."
      )
    ) {
      try {
        console.log("[Reset] Attempting to delete the IndexedDB database...");
        
        // VVVV 2. CORRECT THE FUNCTION CALL HERE VVVV
        await db.delete();

        console.log(
          "[Reset] IndexedDB database deleted successfully. Reloading page..."
        );
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete IndexedDB:", error);
        alert(
          "Could not clear the database. Please check the console for the specific error."
        );
      }
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