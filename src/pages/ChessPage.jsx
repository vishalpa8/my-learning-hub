import React, { useState, useMemo, useCallback, useEffect } from "react";
import { calculateProgress } from "../utils/progressUtils";
import { getStructuredChessData } from "../utils/chessUtils";
import { useChessUserData } from "../hooks/useChessUserData"; // Import the custom hook
import { useReward } from "../contexts/useReward"; // Updated import path
import DailyNugget from "../components/chess/DailyNugget";
import UserBadges from "../components/chess/UserBadges";
import ProgressBarDisplay from "../components/shared/ProgressBarDisplay";
import VideoListModal from "../components/chess/VideoListModal";
import RewardModal from "../components/shared/RewardModal";
import "../styles/ChessPage.css";

/**
 * Renders the main page for the Chess learning section.
 * Displays user stats, progress, playlists grouped by ELO, daily nuggets, and badges.
 * Integrates with user data management for video completion and reward system.
 */
const ChessPage = () => {
  const structuredChessData = useMemo(() => getStructuredChessData(), []);
  const { completedVideos, userProfile, handleToggleVideoComplete } =
    useChessUserData(structuredChessData);

  const {
    isModalVisible: isRewardModalVisible,
    modalMessage: rewardModalMessage,
    closeRewardModal,
    recordChessProgress, // Updated to use specific progress recorder
  } = useReward();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const allVideos = useMemo(
    () =>
      structuredChessData.flatMap((stage) =>
        stage.playlists.flatMap((p) => p.videos)
      ),
    [structuredChessData]
  );

  const overallProgress = useMemo(
    () =>
      calculateProgress(allVideos, completedVideos, (video) => video.globalId),
    [allVideos, completedVideos]
  );

  // Track previous completed count to avoid unnecessary updates
  const prevCompletedRef = React.useRef(0);

  useEffect(() => {
    if (overallProgress.completed !== prevCompletedRef.current) {
      recordChessProgress(overallProgress.completed);
      prevCompletedRef.current = overallProgress.completed;
    }
  }, [overallProgress.completed, recordChessProgress]);

  const nextPlaylist = useMemo(
    () =>
      structuredChessData
        .flatMap((stage) => stage.playlists)
        .find((pl) => pl.videos.some((v) => !completedVideos[v.globalId])),
    [structuredChessData, completedVideos]
  );

  const openPlaylistModal = useCallback((playlist) => {
    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  }, []);

  const closePlaylistModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div
      className="chess-page-container"
      role="main"
      aria-label="Chess Learning Hub"
    >
      {/* Hero Section */}
      <section className="chess-hero card-style">
        <div className="chess-hero-info">
          <h1>
            <span role="img" aria-label="Chess">
              ♟️
            </span>{" "}
            Chess Mastery Journey
          </h1>
          <div className="chess-hero-stats">
            <div>
              <span className="stat-label">ELO</span>
              <span className="stat-value">{userProfile.elo ?? "N/A"}</span>
            </div>
            <div>
              <span className="stat-label">Points</span>
              <span className="stat-value">{userProfile.points}</span>
            </div>
            <div>
              <span className="stat-label">Streak</span>
              <span className="stat-value">{userProfile.currentStreak}🔥</span>
            </div>
          </div>
          <div className="chess-hero-actions">
            <button
              className="btn-primary"
              onClick={() => nextPlaylist && openPlaylistModal(nextPlaylist)}
              disabled={!nextPlaylist}
            >
              {nextPlaylist ? "Continue Learning" : "All Playlists Complete!"}
            </button>
            <a href="#elo-sections" className="btn-secondary">
              View All ELO Stages
            </a>
          </div>
          <div className="chess-hero-nugget">
            <DailyNugget />
          </div>
        </div>
        <div className="chess-hero-progress">
          {overallProgress.total > 0 && (
            <ProgressBarDisplay
              completed={overallProgress.completed}
              total={overallProgress.total}
              label={`Overall Progress: ${overallProgress.completed} / ${
                overallProgress.total
              } videos (${overallProgress.percent.toFixed(1)}%)`}
            />
          )}
        </div>
      </section>

      {/* Badges Showcase */}
      <section className="card chess-badges-showcase">
        {" "}
        {/* Use global .card style */}
        <h2>My Badges</h2>
        <div className="badges-scroll">
          <UserBadges earnedBadges={userProfile.earnedBadges} />
        </div>
      </section>

      {/* ELO Stages and Playlists */}
      <section id="elo-sections" className="chess-elo-sections">
        {structuredChessData.map((stage) => {
          const stageVideos = stage.playlists.flatMap((p) => p.videos);
          const stageProgress = calculateProgress(
            stageVideos,
            completedVideos,
            (video) => video.globalId
          );
          return (
            <div
              key={stage.id}
              className="card card--flex-column elo-stage-section"
            >
              {" "}
              {/* Use global .card and .card--flex-column for internal layout */}
              <div className="elo-stage-header">
                <h2>
                  {stage.name}
                  <span className="elo-range-label">
                    ({stage.id.replace("elo", "")} ELO)
                  </span>
                </h2>
                {stageProgress.total > 0 && (
                  <ProgressBarDisplay
                    completed={stageProgress.completed}
                    total={stageProgress.total}
                    label={`Stage Progress: ${stageProgress.completed} / ${stageProgress.total} videos`}
                  />
                )}
              </div>
              <div className="playlists-grid">
                {stage.playlists.map((playlist) => {
                  const playlistCompletedCount = playlist.videos.filter(
                    (v) => completedVideos[v.globalId]
                  ).length;
                  return (
                    <div key={playlist.id} className="card playlist-card">
                      <h3>
                        {playlist.playlistUrl &&
                        playlist.playlistUrl !== "#" ? (
                          <a
                            href={playlist.playlistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {playlist.name}
                          </a>
                        ) : (
                          playlist.name
                        )}
                      </h3>
                      <p className="playlist-meta">{playlist.focusArea}</p>
                      <ProgressBarDisplay
                        completed={playlistCompletedCount}
                        total={playlist.videos.length}
                        label={`Watched: ${playlistCompletedCount} / ${playlist.videos.length}`}
                      />
                      <button
                        className="btn-primary"
                        onClick={() => openPlaylistModal(playlist)}
                      >
                        View Videos
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Video Modal */}
      <VideoListModal
        isVisible={isModalOpen}
        onClose={closePlaylistModal}
        playlist={selectedPlaylist}
        completedVideos={completedVideos}
        onToggleVideoComplete={handleToggleVideoComplete}
      />

      {/* Reward Modal */}
      <RewardModal
        isVisible={isRewardModalVisible}
        message={rewardModalMessage}
        onClose={closeRewardModal}
        // title and buttonText will use defaults from RewardModal
      />
    </div>
  );
};

export default ChessPage;
