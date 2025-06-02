import React, { useEffect, useRef } from "react";
import "./RewardModal.css"; // Assuming CSS is co-located or in a shared styles folder

/**
 * A generic modal component to display reward messages or other notifications.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isVisible - Whether the modal should be visible.
 * @param {string} [props.title="Reward Unlocked!"] - The modal title.
 * @param {string} props.message - The message to display inside the modal.
 * @param {string} [props.buttonText="Awesome!"] - The text for the main action/close button in the footer.
 * @param {function} props.onClose - Function to call when the modal is closed.
 */
const RewardModal = ({
  isVisible,
  title = "Reward Unlocked!",
  message,
  buttonText = "Awesome!", // Main button in the footer
  onClose,
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null); // Ref for the 'x' close button
  const mainButtonRef = useRef(null); // Ref for the footer button

  useEffect(() => {
    if (isVisible) {
      // Focus the main action button or the 'x' close button when modal opens
      const focusTarget = mainButtonRef.current || closeButtonRef.current;
      focusTarget?.focus();

      const handleEscapeKey = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`reward-modal-overlay ${isVisible ? "visible" : ""}`} // Dynamically add 'visible' class
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-labelledby="reward-modal-title"
    >
      {/* Prevent clicks inside the modal content from closing the modal */}
      <div
        className="reward-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="reward-modal-title">{title}</h2>
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
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            ref={mainButtonRef}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardModal);
