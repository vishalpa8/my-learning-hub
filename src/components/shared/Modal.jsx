// Modal.jsx
import { useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM for createPortal
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
  focusRef, // Optional ref to focus on open
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

  const internalModalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus management
      const elementToFocus = focusRef?.current || internalModalRef.current;
      // Use setTimeout to ensure the element is focusable after render.
      const timerId = setTimeout(() => elementToFocus?.focus(), 0);
      return () => clearTimeout(timerId); // Cleanup timer on unmount or re-run
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, focusRef]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => { // Renamed for clarity
    // Only close if the overlay itself is clicked, not content within it
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Use ReactDOM.createPortal to render the modal into document.body
    ReactDOM.createPortal(<div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-content"
        ref={internalModalRef} // Ref for focusing the modal itself
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={
          isConfirmation ? "confirmation-message-id" : undefined
        }
        tabIndex="-1" // Make the modal content div focusable
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
      </div> {/* End of modal-content */}
    </div>, document.body) // End of modal-overlay, and specify portal target
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  isConfirmation: PropTypes.bool,
  confirmationMessage: PropTypes.string,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonClass: PropTypes.string,
  focusRef: PropTypes.object,
};

export default Modal;
