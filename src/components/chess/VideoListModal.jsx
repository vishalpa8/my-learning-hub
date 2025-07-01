import React, { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "./VideoListModal.css";
import ProgressBarDisplay from "../shared/ProgressBarDisplay";
import { calculateProgress } from "../../utils/chessUtils";

/**
 * @typedef {object} Video
 * @property {string} globalId - A unique identifier for the video across all playlists.
 * @property {string} title - The title of the video.
 */

/**
 * @typedef {object} Playlist
 * @property {string} id - Unique identifier for the playlist.
 * @property {string} name - The name of the playlist.
 * @property {string} [playlistUrl] - Optional URL to the full playlist (e.g., on YouTube).
 * @property {Video[]} videos - An array of video objects in this playlist.
 */

/**
 * Modal component to display a list of videos within a chess playlist.
 * Allows users to toggle the completion status of each video.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isVisible - Whether the modal should be visible.
 * @param {function(): void} props.onClose - Callback function to close the modal.
 * @param {Playlist | null} props.playlist - The playlist object to display. If null, the modal won't render.
 * @param {Object.<string, boolean>} props.completedVideos - An object mapping video global IDs to their completion status.
 * @param {function(string): void} props.onToggleVideoComplete - Callback function to toggle a video's completion status.
 */
const VideoListModal = ({
  isVisible,
  onClose,
  /** @type {Playlist | null} */
  playlist,
  completedVideos,
  onToggleVideoComplete,
}) => {
  // Hooks must be called at the top level, before any conditional returns.
  const modalContentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstVideoItemRef = useRef(null);

  useFocusTrap(modalContentRef, isVisible, onClose, firstVideoItemRef, closeButtonRef);

  // Early return if the modal should not be visible or if there's no playlist data.
  if (!isVisible || !playlist) {
    return null;
  }

  const playlistProgress = calculateProgress(
    playlist.videos,
    completedVideos,
    (video) => video.globalId
  );

  const modalTitleId = `video-list-modal-title-${playlist.id}`;

  const { completed: completedCount, total: totalVideos } = playlistProgress;

  return (
    <div
      className="video-list-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={isVisible ? -1 : undefined} // Consistent with RewardModal, though current is fine as it's not rendered when !isVisible
      aria-labelledby={modalTitleId}
    >
      <div
        className="video-list-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
        ref={modalContentRef}
      >
        <div className="modal-header">
          {playlist.playlistUrl && playlist.playlistUrl !== "#" ? (
            <a
              href={playlist.playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-playlist-title-link"
            >
              <h2 id={modalTitleId}>{playlist.name} ↗</h2>
            </a>
          ) : (
            <h2 id={modalTitleId}>{playlist.name}</h2>
          )}
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
            ref={closeButtonRef}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {playlist.videos &&
            playlist.videos.length > 0 && ( // Ensure videos array exists and is not empty
              <div className="modal-playlist-progress">
                <ProgressBarDisplay // This component already handles label generation
                  completed={completedCount}
                  total={totalVideos}
                />
              </div>
            )}
          <ul className="chess-video-list-modal">
            {playlist.videos.map((video, index) => (
              <li // Made interactive like a button
                key={video.globalId}
                className={`chess-video-item-modal${
                  completedVideos[video.globalId] ? " completed" : ""
                }`}
                onClick={() => onToggleVideoComplete(video.globalId)}
                ref={index === 0 ? firstVideoItemRef : null} // Ref for the first item
                tabIndex={0}
                role="button"
                aria-pressed={!!completedVideos[video.globalId]}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleVideoComplete(video.globalId);
                  }
                }}
              >
                <span className="video-title-modal">{video.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoListModal);
