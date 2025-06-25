// HomePage.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Modal from "../components/shared/Modal"; // Import the Modal component
import ProgressBarDisplay from "../components/shared/ProgressBarDisplay";
import { useIndexedDb, clearEntireDatabase } from "../hooks/useIndexedDb"; // Assumes clearEntireDatabase is exported
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_LEARNING_PROGRESS_KEY,
  ENGAGEMENT_TASKS_KEY, // Import the key
} from "../constants/localStorageKeys";
import {
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
  parseYYYYMMDDToDateObj,
  isWithinInterval,
} from "../utils/dateHelpers";

import { dsaData } from "../data/dsaData";
import { playlistVideoData } from "../data/chessData";
import "../styles/HomePage.css";

const HomePage = () => {
  const [completedDsaProblems] = useIndexedDb(DSA_COMPLETED_PROBLEMS_KEY, {});
  const [completedChessVideos] = useIndexedDb(CHESS_LEARNING_PROGRESS_KEY, {});
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
    const todayObj = new Date();
    const todayStr = dateToDDMMYYYY(todayObj);
    const allTasks = Object.values(engagementTasksData || {}).flat();

    // Correctly filter for tasks active today, including multi-day tasks
    const tasksActiveToday = allTasks.filter((task) => {
      const taskStart = parseDDMMYYYYToDateObj(task.date);
      const taskEnd = task.endDate
        ? parseYYYYMMDDToDateObj(task.endDate)
        : taskStart;
      return isWithinInterval(todayObj, { start: taskStart, end: taskEnd });
    });

    // Correctly count completed tasks by checking the completions object for today's date
    const todaysCompleted = tasksActiveToday.filter(
      (task) => task.completions && task.completions[todayStr]
    ).length;

    const todaysTotal = tasksActiveToday.length;
    const todaysPercent =
      todaysTotal > 0 ? Math.round((todaysCompleted / todaysTotal) * 100) : 0;
    return {
      todaysCompleted,
      todaysTotal,
      todaysPercent,
    };
  }, [engagementTasksData]);

  // Prepare data for ProgressCards to make the ProgressCard component more generic
  const dsaCardData = useMemo(
    () => ({
      completed: dsaProgress.completed,
      total: dsaProgress.total,
      percent: dsaProgress.percent,
      label: `${dsaProgress.completed} / ${dsaProgress.total} (${dsaProgress.percent}%)`,
      linkText: "View Details",
    }),
    [dsaProgress]
  );

  const chessCardData = useMemo(
    () => ({
      completed: chessProgress.completed,
      total: chessProgress.total,
      percent: chessProgress.percent,
      label: `${chessProgress.completed} / ${chessProgress.total} (${chessProgress.percent}%)`,
      linkText: "View Details",
    }),
    [chessProgress]
  );

  const engagementCardData = useMemo(
    () => ({
      completed: engagementProgress.todaysCompleted,
      total: engagementProgress.todaysTotal,
      percent: engagementProgress.todaysPercent,
      label: `Today: ${engagementProgress.todaysCompleted} / ${engagementProgress.todaysTotal}`,
      linkText: "Manage Tasks",
    }),
    [engagementProgress]
  );

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
            <Link to="/ai-assistant" className="home-btn-primary">
              <span role="img" aria-label="robot">
                🤖
              </span>{" "}
              Ask AI Assistant
            </Link>
            <Link to="/dsa" className="home-btn-secondary">
              Start DSA Journey
            </Link>
            <Link to="/chess" className="home-btn-secondary">
              Learn Chess
            </Link>
            <Link to="/progress" className="home-btn-secondary">
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
            completed={dsaCardData.completed}
            total={dsaCardData.total}
            percent={dsaCardData.percent}
            label={dsaCardData.label}
            link="/dsa"
            linkText={dsaCardData.linkText}
          />
          <ProgressCard
            icon="♟️"
            title="Chess"
            completed={chessCardData.completed}
            total={chessCardData.total}
            percent={chessCardData.percent}
            label={chessCardData.label}
            link="/chess"
            linkText={chessCardData.linkText}
          />
          <ProgressCard
            icon="📅"
            title="Daily Routine"
            {...engagementCardData} // Spread the prepared data
            link="/progress"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="home-quick-links">
        <QuickLinkCard
          title="AI Learning Assistant"
          description="Get hints, code explanations, or ask questions about any topic. Powered by OpenRouter."
          href="/ai-assistant"
          icon="🤖"
          cta="Go to AI Assistant"
        />

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
          href="/progress"
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
  label, // New prop for the progress bar label
  linkText, // New prop for the button text
}) => (
  <div className="progress-card">
    <div className="progress-card-header">
      <span className="progress-card-icon">{icon}</span>
      <h3>{title}</h3>
      <span className="progress-card-percent">{percent}%</span>{" "}
      {/* Always display percent */}
    </div>
    {total > 0 || (title === "Daily Routine" && completed >= 0) ? ( // Show progress bar if there's a total, or for daily routine even if total is 0 but completed is known
      <ProgressBarDisplay
        completed={completed}
        total={total}
        label={label} // Use the passed label
      />
    ) : // Optional: Show a message if there's no data to display for progress
    // <p className="no-progress-data">No activity yet.</p>
    // Or render nothing if total is 0 and it's not daily routine
    null}
    <Link to={link} className="home-btn-primary">
      {linkText} {/* Use the passed button text */}
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
