import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Modal from "../components/shared/Modal"; // Import the Modal component
import ProgressBarDisplay from "../components/shared/ProgressBarDisplay";
import { useIndexedDb, clearEntireDatabase } from "../hooks/useIndexedDb"; // Assumes clearEntireDatabase is exported
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_LEARNING_PROGRESS_KEY,
  ENGAGEMENT_TASKS_KEY, // Import the key
} from "../constants/localStorageKeys";
import { dsaData } from "../data/dsaData";
import { playlistVideoData } from "../data/chessData";
import "../styles/HomePage.css";

// Define getDateString at a higher scope
const getDateString = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Output: DD-MM-YYYY
};

const HomePage = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [completedDsaProblems] = useIndexedDb(DSA_COMPLETED_PROBLEMS_KEY, {});
  const [completedChessVideos] = useIndexedDb(CHESS_LEARNING_PROGRESS_KEY, {});

  // Fetch engagement tasks data - initial value is an empty object
  const [engagementTasksData] = useIndexedDb(ENGAGEMENT_TASKS_KEY, {});

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const dsaProgress = useMemo(() => {
    const completed = Object.keys(completedDsaProblems || {}).length;
    const total = dsaData.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [completedDsaProblems]);

  const chessProgress = useMemo(() => {
    const completed = Object.keys(completedChessVideos || {}).length;
    const total = Object.values(playlistVideoData || {}).reduce(
      (acc, playlist) => acc + (playlist?.videos?.length || 0),
      0
    );
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [completedChessVideos]);

  const engagementProgress = useMemo(() => {
    const todayStr = getDateString(new Date());

    const allTasksData = engagementTasksData || {};

    const todaysTasks = allTasksData[todayStr] || []; // todayStr is DD-MM-YYYY
    const todaysCompleted = todaysTasks.filter((task) => task.completed).length;
    const todaysTotal = todaysTasks.length;
    const todaysPercent =
      todaysTotal > 0 ? Math.round((todaysCompleted / todaysTotal) * 100) : 0;

    return {
      todaysCompleted,
      todaysTotal,
      todaysPercent,
    };
  }, [engagementTasksData]);

  const handleResetAllProgress = async () => {
    setShowResetConfirmModal(true);
  };

  const confirmResetAllProgress = async () => {
    try {
      await clearEntireDatabase();
      setShowResetConfirmModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete IndexedDB:", error);
      setShowResetConfirmModal(false);
      // Optionally, show an error modal here instead of alert
      alert(
        "Could not clear the database. Please check the console for the specific error."
      );
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
            <strong>Competitive Programming</strong>, <strong>Chess</strong>,
            and daily <strong>Learning Routine</strong> progress in one place.
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
            <Link to="/Progress" className="home-btn-secondary">
              {" "}
              {/* Link to Engagement/Progress Page */}
              Daily Routine
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
          <ProgressCard
            icon="📅"
            title="Daily Routine"
            todaysCompleted={engagementProgress.todaysCompleted}
            todaysTotal={engagementProgress.todaysTotal}
            todaysPercent={engagementProgress.todaysPercent}
            link="/Progress" // Link to Engagement/Progress Page
            // yesterdaysPending prop is no longer needed here
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
          icon="♟️"
          cta="Go to Chess"
        />
        <QuickLinkCard
          title="Daily Learning Routine"
          description="Manage daily tasks, track your activity on the calendar, and build consistent learning habits."
          href="/Progress" // Link to Engagement/Progress Page
          icon="📅"
          cta="View Routine"
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
          <li>
            🗓️ <strong>Activity Calendar:</strong> Visualize your daily
            engagement.
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
          Reset all your learning progress across DSA, Chess, Daily Routine, and
          rewards. This action is irreversible.
        </p>
        <button onClick={handleResetAllProgress} className="btn-danger">
          Reset All Progress
        </button>
      </section>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        title="Confirm Reset"
        isConfirmation={true}
        confirmationMessage="Are you sure you want to reset ALL progress? This will clear all application data from the database and is irreversible."
        onConfirm={confirmResetAllProgress}
        confirmText="Yes, Reset All"
        cancelText="Cancel"
      />
    </main>
  );
};

const ProgressCard = ({
  icon,
  title,
  completed,
  total,
  percent,
  link,
  todaysCompleted,
  todaysTotal,
  todaysPercent,
}) => (
  <div className="progress-card">
    <div className="progress-card-header">
      <span className="progress-card-icon">{icon}</span>
      <h3>{title}</h3>
      {/* Display specific to Daily Routine or generic */}
      {title === "Daily Routine" ? (
        <span className="progress-card-info daily-routine-info">
          <span className="progress-card-percent">{todaysPercent}%</span>
        </span>
      ) : (
        <span className="progress-card-percent">{percent}%</span>
      )}
    </div>
    {/* Show progress bar if total is greater than 0 */}
    {total > 0 &&
      title !== "Daily Routine" && ( // DSA & Chess
        <ProgressBarDisplay
          completed={completed}
          total={total}
          label={`${completed} / ${total} (${percent}%)`}
        />
      )}
    {todaysTotal > 0 &&
      title === "Daily Routine" && ( // Daily Routine
        <ProgressBarDisplay
          completed={todaysCompleted}
          total={todaysTotal}
          label={`Today: ${todaysCompleted} / ${todaysTotal}`}
        />
      )}
    <Link to={link} className="home-btn-primary">
      {title === "Daily Routine" ? "Manage Tasks" : "View Details"}
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
