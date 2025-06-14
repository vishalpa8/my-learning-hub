// TaskDetailsModal.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "../shared/Modal"; // Your existing Modal component
import "./TaskDetailsModal.css";

const TaskDetailsModal = ({
  isOpen,
  onClose,
  task,
  onUpdateDescription,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleTask,
  onMarkAllSubtasksComplete,
  onUpdateTaskLink, // Added prop for updating the link
  userChoseToKeepParentOpen: propUserChoseToKeepParentOpen, // Renamed to avoid conflict if local state was kept
  onSetUserChoseToKeepParentOpen,
}) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(
    task?.description || ""
  );
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const descriptionTextareaRef = useRef(null);
  const [isConfirmDeleteSubtaskOpen, setIsConfirmDeleteSubtaskOpen] =
    useState(false);
  const [subtaskToDeleteId, setSubtaskToDeleteId] = useState(null);
  const [subtaskToDeleteText, setSubtaskToDeleteText] = useState(""); // For confirmation message
  const [isConfirmCompleteParentOpen, setIsConfirmCompleteParentOpen] =
    useState(false);
  // const [userChoseToKeepParentOpen, setUserChoseToKeepParentOpen] = useState(false); // Replaced by prop
  const [editingLink, setEditingLink] = useState(false); // State for link editing
  const [currentLink, setCurrentLink] = useState(task?.link || ""); // State for current link value
  const [linkError, setLinkError] = useState(""); // State for link validation error

  useEffect(() => {
    // When the task prop changes (e.g., modal opens for a new task, or task data is updated from parent)
    // reset the internal state of the modal.
    setCurrentDescription(task?.description || "");
    setEditingDescription(false); // Always reset editing state when task changes
    setNewSubtaskText("");
    setCurrentLink(task?.link || ""); // Reset link state
    setEditingLink(false); // Reset link editing state
    setLinkError(""); // Reset link error

    // userChoseToKeepParentOpen is now managed by EngagementPage via props
  }, [task]);

  useEffect(() => {
    // Focus and select text in description textarea when editing mode is activated.
    if (editingDescription && descriptionTextareaRef.current) {
      // Use a timeout to ensure the element is fully rendered and focusable,
      // especially if there are conditional rendering changes.
      setTimeout(() => {
        descriptionTextareaRef.current?.focus();
        // Select only if there's text.
        if (descriptionTextareaRef.current?.value) {
          descriptionTextareaRef.current.select();
        }
      }, 0);
    }
  }, [editingDescription]);

  const handleDescriptionChange = useCallback((e) => {
    setCurrentDescription(e.target.value);
  }, []);

  const handleSaveDescription = useCallback(() => {
    if (task) {
      onUpdateDescription(task.id, currentDescription.trim());
      setEditingDescription(false);
    }
  }, [task, currentDescription, onUpdateDescription]);

  const handleCancelDescriptionEdit = useCallback(() => {
    setCurrentDescription(task?.description || "");
    setEditingDescription(false);
  }, [task]);

  const handleClearDescription = useCallback(() => {
    setCurrentDescription("");
    // Immediately save the cleared description for better UX
    if (task) {
      onUpdateDescription(task.id, "");
    }
    // If in editing mode, stay in editing mode but with cleared text
    // If not in editing mode, this button might not be visible or might have different behavior
  }, [task, onUpdateDescription]);

  const handleLinkChange = useCallback((e) => {
    setCurrentLink(e.target.value);
  }, []);

  const isValidUrl = (string) => {
    const urlPattern = new RegExp(
      "^(https?|ftp):\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$",
      "i"
    );
    return urlPattern.test(string);
  };

  const handleSaveLink = useCallback(() => {
    // Ensure currentLink is a string before trimming
    const linkToProcess = typeof currentLink === "string" ? currentLink : "";
    const trimmedLink = linkToProcess.trim();

    if (trimmedLink && !isValidUrl(trimmedLink)) {
      setLinkError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }
    setLinkError(""); // Clear error if valid or empty

    if (task && onUpdateTaskLink) {
      onUpdateTaskLink(task.id, trimmedLink || null); // Save null if empty
      setEditingLink(false);
    }
  }, [task, currentLink, onUpdateTaskLink]);

  const handleCancelLinkEdit = useCallback(() => {
    setCurrentLink(task?.link || "");
    setLinkError("");
    setEditingLink(false);
  }, [task]);

  const handleAddSubtaskClick = useCallback(() => {
    const trimmedText = newSubtaskText.trim();
    if (task && trimmedText) {
      onAddSubtask(task.id, trimmedText);
      setNewSubtaskText("");
    }
  }, [task, newSubtaskText, onAddSubtask]);

  // Handle Escape key for link edit
  const handleLinkKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission if any
        event.stopPropagation(); // Stop event from bubbling
        handleSaveLink();
      } else if (event.key === "Escape") {
        event.stopPropagation(); // Stop event from bubbling
        handleCancelLinkEdit();
      }
    },
    [handleSaveLink, handleCancelLinkEdit]
  );

  const handleSubtaskTextChange = useCallback((e) => {
    setNewSubtaskText(e.target.value);
  }, []);

  const handleSubtaskKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation(); // Stop event from bubbling to parent modal
        handleAddSubtaskClick();
      }
    },
    [handleAddSubtaskClick]
  );

  const handleToggleSubtaskCompletion = useCallback(
    (subtaskId, completed) => {
      if (task) {
        onUpdateSubtask(task.id, subtaskId, { completed });
      }
    },
    [task, onUpdateSubtask]
  );

  const handleDeleteSubtaskClick = useCallback(
    (subtaskId) => {
      const subtask = task?.subtasks?.find((st) => st.id === subtaskId);
      if (subtask) {
        setSubtaskToDeleteId(subtaskId);
        setSubtaskToDeleteText(subtask.text);
        setIsConfirmDeleteSubtaskOpen(true);
      }
    },
    [task]
  );

  const confirmDeleteSubtask = useCallback(() => {
    if (task && subtaskToDeleteId) {
      onDeleteSubtask(task.id, subtaskToDeleteId);
    }
    setIsConfirmDeleteSubtaskOpen(false);
    setSubtaskToDeleteId(null);
    setSubtaskToDeleteText(""); // Clear the text after deletion
  }, [task, subtaskToDeleteId, onDeleteSubtask]);

  const confirmCompleteParentTask = useCallback(() => {
    if (task && onToggleTask) {
      onToggleTask(task.id); // Mark parent as complete
    }
    setIsConfirmCompleteParentOpen(false);
  }, [task, onToggleTask]);

  const cancelCompleteParentTask = useCallback(() => {
    setIsConfirmCompleteParentOpen(false);
    if (task && onSetUserChoseToKeepParentOpen) {
      onSetUserChoseToKeepParentOpen(task.id, true); // User explicitly chose this
    }
  }, [task, onSetUserChoseToKeepParentOpen]);

  // Effect to check if all subtasks are complete and prompt if parent isn't
  useEffect(() => {
    if (
      isOpen &&
      task &&
      task.subtasks &&
      task.subtasks.length > 0 &&
      !task.completed &&
      !propUserChoseToKeepParentOpen // Use prop here
    ) {
      const allSubtasksNowComplete = task.subtasks.every((st) => st.completed);
      if (allSubtasksNowComplete) {
        // Only open if it's not already open to avoid loops if task prop changes rapidly
        if (!isConfirmCompleteParentOpen) {
          setIsConfirmCompleteParentOpen(true);
        }
      } else if (isConfirmCompleteParentOpen) {
        // If subtasks are no longer all complete (e.g., one was unchecked), close the prompt.
        setIsConfirmCompleteParentOpen(false);
      }
    } else if (isConfirmCompleteParentOpen) {
      // If other conditions (isOpen, task exists, !task.completed, propUserChoseToKeepParentOpen) are not met, close the prompt.
      setIsConfirmCompleteParentOpen(false);
    }
  }, [
    task,
    isOpen,
    propUserChoseToKeepParentOpen,
    isConfirmCompleteParentOpen,
  ]);

  const handleMarkAllSubtasksCompleteClick = useCallback(() => {
    if (task && onMarkAllSubtasksComplete) {
      onMarkAllSubtasksComplete(task.id);
      // The useEffect above will then check if it needs to prompt for parent completion
    }
  }, [task, onMarkAllSubtasksComplete]);

  const handleMarkParentTaskCompleteClick = useCallback(() => {
    if (task && onToggleTask) {
      onToggleTask(task.id);
      if (onSetUserChoseToKeepParentOpen) {
        onSetUserChoseToKeepParentOpen(task.id, false); // Reset the choice as parent is now being completed
      }
    }
  }, [task, onToggleTask, onSetUserChoseToKeepParentOpen]);

  const cancelDeleteSubtask = useCallback(() => {
    setIsConfirmDeleteSubtaskOpen(false);
    setSubtaskToDeleteId(null);
    setSubtaskToDeleteText(""); // Clear the text on cancel
  }, []);

  // Handle Escape key for description edit
  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation(); // Stop event from bubbling
        handleCancelDescriptionEdit();
      }
    },
    [handleCancelDescriptionEdit]
  );

  // Do not render if not open or no task is provided.
  // The parent component (EngagementPage) should ensure task is provided when isOpen is true.
  if (!isOpen || !task) return null;

  // Assuming task.date is already in the desired DD-MM-YYYY display format
  const formattedDate = task.date;
  const formattedTime = task.time
    ? new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--";

  // The main TaskDetailsModal and the confirmation modal for subtask deletion
  // are rendered as siblings using a React Fragment. This is important for
  // independent visibility control and "Escape" key handling.
  return (
    <>
      <Modal
        isOpen={
          isOpen && !isConfirmDeleteSubtaskOpen && !isConfirmCompleteParentOpen
        } // Main details modal is open only if its own state and parent state allow, AND no sub-confirmation is active
        onClose={onClose} // This onClose is for the main TaskDetailsModal itself, passed from EngagementPage
        title={`Details for Task: ${task.text}`}
      >
        <div className="task-details-modal-content">
          <p className="task-details-meta">
            <strong>Date:</strong> {formattedDate} | <strong>Time:</strong>{" "}
            {formattedTime}
            {task.completed && (
              <span className="task-details-completed-status">
                {" "}
                (Completed)
              </span>
            )}
          </p>

          <div className="task-details-section">
            <h4>Description</h4>
            {editingDescription ? (
              <div className="description-edit-area">
                <textarea
                  ref={descriptionTextareaRef}
                  value={currentDescription}
                  onChange={handleDescriptionChange}
                  onKeyDown={handleDescriptionKeyDown}
                  placeholder="Add or edit description..."
                  rows="4"
                  className="task-details-textarea"
                />
                <div className="description-actions">
                  <button
                    onClick={handleSaveDescription}
                    className="btn-primary btn-small task-details-btn"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelDescriptionEdit}
                    className="btn-secondary btn-small task-details-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="description-display-area">
                {task?.description ? ( // Check actual persisted task description
                  <>
                    <p className="description-text">{currentDescription}</p>{" "}
                    {/* Display current state, which mirrors task.description initially */}
                    <div className="description-view-actions">
                      <button
                        onClick={() => setEditingDescription(true)}
                        className="btn-link edit-description-btn"
                      >
                        Edit Description
                      </button>
                      <button
                        onClick={handleClearDescription} // This will clear and save immediately
                        className="btn-link clear-description-btn"
                      >
                        Clear Description
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted">No description added yet.</p>
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="btn-link edit-description-btn"
                    >
                      + Add Description
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="task-details-section">
            <h4>Link/URL</h4>
            {editingLink ? (
              <div className="link-edit-area">
                <input
                  type="url"
                  value={currentLink}
                  onChange={handleLinkChange}
                  onKeyDown={handleLinkKeyDown}
                  placeholder="Add or edit URL (e.g., https://example.com)"
                  className="task-details-input" // Use a generic input style or create specific
                  autoFocus
                />
                {linkError && (
                  <p className="error-message input-error-message">
                    {linkError}
                  </p>
                )}

                <div className="link-actions">
                  {" "}
                  {/* Similar to description-actions */}
                  <button
                    onClick={handleSaveLink}
                    className="btn-primary btn-small task-details-btn"
                  >
                    Save Link
                  </button>
                  <button
                    onClick={handleCancelLinkEdit}
                    className="btn-secondary btn-small task-details-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="link-display-area">
                {currentLink ? ( // Display currentLink to reflect unsaved changes if any
                  <>
                    <a
                      href={currentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="task-link-display"
                    >
                      {currentLink}
                    </a>
                    <button
                      onClick={() => setEditingLink(true)}
                      className="btn-link edit-link-btn"
                    >
                      Edit Link
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingLink(true)}
                    className="btn-link add-link-btn"
                  >
                    + Add Link
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="task-details-section">
            <h4>Subtasks</h4>
            {(() => {
              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
              const allSubtasksComplete =
                hasSubtasks && task.subtasks.every((st) => st.completed);

              if (
                // Use prop here
                propUserChoseToKeepParentOpen &&
                allSubtasksComplete &&
                !task.completed
              ) {
                return (
                  <div className="subtasks-batch-actions">
                    <button
                      onClick={handleMarkParentTaskCompleteClick}
                      className="btn-success btn-small" // Style as a primary/success action
                    >
                      Mark Main Task as Complete
                    </button>
                  </div>
                );
              } else if (hasSubtasks && !allSubtasksComplete) {
                return (
                  <div className="subtasks-batch-actions">
                    <button
                      onClick={handleMarkAllSubtasksCompleteClick}
                      className="btn-outline btn-small"
                    >
                      Mark All Subtasks as Complete
                    </button>
                  </div>
                );
              }
              return null; // No button to show
            })()}

            <div className="subtask-add-form">
              <input
                type="text"
                value={newSubtaskText}
                onChange={handleSubtaskTextChange}
                onKeyDown={handleSubtaskKeyDown}
                placeholder="Add a new subtask..."
                className="subtask-input"
              />
              <button
                onClick={handleAddSubtaskClick}
                disabled={!newSubtaskText.trim()}
                className="btn-primary btn-small add-subtask-btn task-details-btn"
              >
                Add
              </button>
            </div>

            {task.subtasks && task.subtasks.length > 0 ? (
              <ul className="subtask-list">
                {task.subtasks.map((subtask) => (
                  <li
                    key={subtask.id}
                    className={`subtask-item ${
                      subtask.completed ? "completed" : ""
                    }`}
                  >
                    <label className="subtask-checkbox-label">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={(e) =>
                          handleToggleSubtaskCompletion(
                            subtask.id,
                            e.target.checked
                          )
                        }
                        aria-label={`Mark subtask "${subtask.text}" as ${
                          subtask.completed ? "incomplete" : "complete"
                        }`}
                      />
                      <span
                        className="custom-checkbox"
                        aria-hidden="true"
                      ></span>
                      <span className="subtask-text">{subtask.text}</span>
                    </label>
                    <button
                      onClick={() => handleDeleteSubtaskClick(subtask.id)}
                      className="delete-subtask-btn"
                      aria-label={`Delete subtask "${subtask.text}"`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No subtasks added yet.</p>
            )}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </Modal>

      {/* Confirmation Modal for Subtask Deletion (uses the generic Modal component) */}
      <Modal
        isOpen={isConfirmDeleteSubtaskOpen}
        onClose={cancelDeleteSubtask} // This specifically closes/cancels the subtask deletion confirmation
        title="Delete Subtask"
        isConfirmation={true}
        confirmationMessage={`Are you sure you want to delete the subtask "${subtaskToDeleteText}"? This action cannot be undone.`}
        onConfirm={confirmDeleteSubtask}
        confirmText="Delete"
        cancelText="Cancel"
      />
      {/* Confirmation Modal for Completing Parent Task */}
      <Modal
        isOpen={isConfirmCompleteParentOpen}
        onClose={cancelCompleteParentTask}
        title="Complete Main Task?"
        isConfirmation={true}
        confirmationMessage="All subtasks are completed. Do you want to mark the main task as completed as well?"
        onConfirm={confirmCompleteParentTask}
        confirmText="Yes, Complete Task"
        cancelText="No, Keep Open"
        confirmButtonClass="btn-success"
      />
    </>
  );
};

TaskDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string,
    description: PropTypes.string,
    subtasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
      })
    ),
    completed: PropTypes.bool.isRequired,
  }),
  onUpdateDescription: PropTypes.func.isRequired,
  onAddSubtask: PropTypes.func.isRequired,
  onUpdateSubtask: PropTypes.func.isRequired,
  onDeleteSubtask: PropTypes.func.isRequired,
  // formatDateForDisplay: PropTypes.func, // Removed as it's not used
  onToggleTask: PropTypes.func.isRequired,
  onMarkAllSubtasksComplete: PropTypes.func.isRequired,
  onUpdateTaskLink: PropTypes.func.isRequired,
  userChoseToKeepParentOpen: PropTypes.bool.isRequired,
  onSetUserChoseToKeepParentOpen: PropTypes.func.isRequired,
};

export default TaskDetailsModal;
