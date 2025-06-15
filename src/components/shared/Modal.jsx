// Modal.jsx
import { useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title = "Modal Title",
  children,
  isConfirmation = false,
  confirmationMessage = "Are you sure?",
  onConfirm = () => {},
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn-danger",
  focusRef,
}) => {
  const internalModalRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    const elementToFocus = focusRef?.current || internalModalRef.current;
    const timerId = setTimeout(() => elementToFocus?.focus(), 0);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, focusRef]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-content"
        ref={internalModalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={
          isConfirmation ? "confirmation-message-id" : undefined
        }
        tabIndex={-1}
      >
        <div className="modal-header">
          {title && <h3 id="modal-title">{title}</h3>}
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
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
        {isConfirmation && (
          <div className="modal-actions confirmation-actions">
            <button onClick={onClose} className="btn-secondary" type="button">
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={confirmButtonClass}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
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
