// Modal.jsx
// Modal.jsx
import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title = "Modal Title",
  children,
  isConfirmation = false,
  confirmationMessage = "Are you sure?",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn-danger", // Default to danger for confirm, can be overridden
}) => {
  // Add Escape key listener
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if the overlay itself is clicked, not content within it
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={
          isConfirmation ? "confirmation-message-id" : undefined
        }
      >
        <div className="modal-header">
          {title && <h3 id="modal-title">{title}</h3>}
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {isConfirmation ? (
            <div className="confirmation-modal-content">
              <p id="confirmation-message-id" className="confirmation-message">
                {confirmationMessage}
              </p>
            </div>
          ) : (
            children
          )}
        </div>
        {/* Render actions only if it's a confirmation or if children don't include their own actions */}
        {/* This example assumes confirmation modals always show these actions */}
        {isConfirmation && (
          <div className="modal-actions confirmation-actions">
            <button onClick={onClose} className="btn-secondary">
              {cancelText}
            </button>
            <button
              onClick={onConfirm ? onConfirm : () => {}} // Call onConfirm only if it exists
              className={confirmButtonClass}
            >
              {confirmText}
            </button>
          </div>
        )}
        {/* If children are provided and it's NOT a confirmation,
            and children don't have their own .modal-actions,
            you might want a generic close button here.
            For now, TaskDetailsModal adds its own "Close" button.
        */}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node, // Children are not strictly required if isConfirmation is true
  isConfirmation: PropTypes.bool,
  confirmationMessage: PropTypes.string,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonClass: PropTypes.string,
};

export default Modal;
