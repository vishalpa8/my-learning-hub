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
  formatDateForDisplay,
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

  useEffect(() => {
    // When the task prop changes (e.g., modal opens for a new task, or task data is updated from parent)
    // reset the internal state of the modal.
    setCurrentDescription(task?.description || "");
    setEditingDescription(false); // Always reset editing state when task changes
    setNewSubtaskText("");
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
  }, [task, onUpdateDescription]);

  const handleAddSubtaskClick = useCallback(() => {
    const trimmedText = newSubtaskText.trim();
    if (task && trimmedText) {
      onAddSubtask(task.id, trimmedText);
      setNewSubtaskText("");
    }
  }, [task, newSubtaskText, onAddSubtask]);

  const handleSubtaskTextChange = useCallback((e) => {
    setNewSubtaskText(e.target.value);
  }, []);

  const handleSubtaskKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
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

  const cancelDeleteSubtask = useCallback(() => {
    setIsConfirmDeleteSubtaskOpen(false);
    setSubtaskToDeleteId(null);
    setSubtaskToDeleteText(""); // Clear the text on cancel
  }, []);

  // Handle Escape key for description edit
  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        handleCancelDescriptionEdit();
      }
    },
    [handleCancelDescriptionEdit]
  );

  // Do not render if not open or no task is provided.
  // The parent component (EngagementPage) should ensure task is provided when isOpen is true.
  if (!isOpen || !task) return null;

  const formattedDate = formatDateForDisplay
    ? formatDateForDisplay(task.date)
    : task.date;
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
        isOpen={isOpen && !isConfirmDeleteSubtaskOpen} // Main details modal is open only if its own state and parent state allow, AND no sub-confirmation is active
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
                  {currentDescription && ( // Only show Clear if there's text
                    <button
                      onClick={handleClearDescription}
                      className="btn-outline btn-small btn-warning task-details-btn" // Use btn-warning or similar
                    >
                      Clear
                    </button>
                  )}
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
                {currentDescription ? ( // Display currentDescription to reflect unsaved changes if any
                  <p className="description-text">{currentDescription}</p>
                ) : (
                  <p className="text-muted">No description added yet.</p>
                )}
                <button
                  onClick={() => setEditingDescription(true)}
                  className="btn-link edit-description-btn"
                >
                  {currentDescription
                    ? "Edit Description"
                    : "+ Add Description"}
                </button>
              </div>
            )}
          </div>

          <div className="task-details-section">
            <h4>Subtasks</h4>
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
  formatDateForDisplay: PropTypes.func.isRequired,
};

export default TaskDetailsModal;
