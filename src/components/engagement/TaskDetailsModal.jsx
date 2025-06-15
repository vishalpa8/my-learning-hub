// TaskDetailsModal.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "../shared/Modal";
import "./TaskDetailsModal.css";
import validator from "validator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ENGAGEMENT_ALREADY_PROMPTED_FOR_COMPLETE_KEY } from "../../constants/localStorageKeys";
import { useIndexedDb } from "../../hooks/useIndexedDb";

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
  onUpdateTaskLink,
  userChoseToKeepParentOpen,
  onSetUserChoseToKeepParentOpen,
  onReorderSubtasks,
}) => {
  // State
  const [editingDescription, setEditingDescription] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(
    task?.description || ""
  );
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [currentLink, setCurrentLink] = useState(task?.link || "");
  const [linkError, setLinkError] = useState("");
  const [editingSubtask, setEditingSubtask] = useState({ id: null, text: "" });
  const [isConfirmDeleteSubtaskOpen, setIsConfirmDeleteSubtaskOpen] =
    useState(false);
  const [subtaskToDeleteId, setSubtaskToDeleteId] = useState(null);
  const [subtaskToDeleteText, setSubtaskToDeleteText] = useState("");
  const [isConfirmCompleteParentOpen, setIsConfirmCompleteParentOpen] =
    useState(false);
  const [subtaskError, setSubtaskError] = useState("");
  const [subtaskLoading, setSubtaskLoading] = useState(false);

  const [alreadyPromptedForComplete, setAlreadyPromptedForComplete] =
    useIndexedDb(ENGAGEMENT_ALREADY_PROMPTED_FOR_COMPLETE_KEY, {});

  const [hasPromptedThisStreak, setHasPromptedThisStreak] = useState(false);

  const descriptionTextareaRef = useRef(null);

  // Reset state when task changes
  useEffect(() => {
    setCurrentDescription(task?.description || "");
    setEditingDescription(false);
    setNewSubtaskText("");
    setCurrentLink(task?.link || "");
    setEditingLink(false);
    setLinkError("");
    setEditingSubtask({ id: null, text: "" });
  }, [task]);

  // Focus textarea when editing description
  useEffect(() => {
    if (editingDescription && descriptionTextareaRef.current) {
      setTimeout(() => {
        descriptionTextareaRef.current?.focus();
        if (descriptionTextareaRef.current?.value) {
          descriptionTextareaRef.current.select();
        }
      }, 0);
    }
  }, [editingDescription]);

  // Handlers: Description
  const handleDescriptionChange = (e) => setCurrentDescription(e.target.value);
  const handleSaveDescription = () => {
    if (task) {
      onUpdateDescription(task.id, currentDescription.trim());
      setEditingDescription(false);
    }
  };
  const handleCancelDescriptionEdit = () => {
    setCurrentDescription(task?.description || "");
    setEditingDescription(false);
  };
  const handleClearDescription = () => {
    setCurrentDescription("");
    if (task) onUpdateDescription(task.id, "");
  };
  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Escape") handleCancelDescriptionEdit();
  };

  // Handlers: Link
  const handleLinkChange = (e) => setCurrentLink(e.target.value);
  const isValidUrl = (string) =>
    validator.isURL(string, { require_protocol: true });
  const handleSaveLink = () => {
    const trimmedLink = (currentLink || "").trim();
    if (trimmedLink && !isValidUrl(trimmedLink)) {
      setLinkError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }
    setLinkError("");
    if (task && onUpdateTaskLink) {
      onUpdateTaskLink(task.id, trimmedLink || null);
      setEditingLink(false);
    }
  };
  const handleCancelLinkEdit = () => {
    setCurrentLink(task?.link || "");
    setLinkError("");
    setEditingLink(false);
  };
  const handleLinkKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveLink();
    } else if (e.key === "Escape") {
      handleCancelLinkEdit();
    }
  };

  // Handlers: Subtasks
  const handleSubtaskTextChange = (e) => {
    setNewSubtaskText(e.target.value);
    setSubtaskError("");
  };
  const handleSubtaskInputBlur = () => {
    setNewSubtaskText((prev) => prev.trim());
  };
  const handleAddSubtaskClick = async () => {
    const trimmedText = newSubtaskText.trim();
    if (!trimmedText) return;
    // Prevent duplicate subtasks (case-insensitive)
    if (
      task.subtasks.some(
        (st) => st.text.trim().toLowerCase() === trimmedText.toLowerCase()
      )
    ) {
      setSubtaskError("Subtask already exists.");
      return;
    }
    setSubtaskLoading(true);
    setSubtaskError("");
    try {
      await onAddSubtask(task.id, trimmedText);
      setNewSubtaskText("");
    } catch (err) {
      setSubtaskError("Failed to add subtask. Please try again.");
    } finally {
      setSubtaskLoading(false);
    }
  };
  const handleSubtaskKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtaskClick();
    }
  };
  const handleToggleSubtaskCompletion = (subtaskId, completed) => {
    if (task) onUpdateSubtask(task.id, subtaskId, { completed });
  };

  // Subtask Edit
  const handleEditSubtaskClick = (subtask) => {
    setEditingSubtask({ id: subtask.id, text: subtask.text });
    setSubtaskError("");
  };
  const handleEditSubtaskChange = (e) => {
    setEditingSubtask((prev) => ({ ...prev, text: e.target.value }));
    setSubtaskError("");
  };
  const handleEditSubtaskBlur = () => {
    setEditingSubtask((prev) => ({ ...prev, text: prev.text.trim() }));
  };
  const handleEditSubtaskSave = async () => {
    const trimmedText = editingSubtask.text.trim();
    if (!trimmedText) return;
    // Prevent duplicate subtasks (case-insensitive, except for itself)
    if (
      task.subtasks.some(
        (st) =>
          st.id !== editingSubtask.id &&
          st.text.trim().toLowerCase() === trimmedText.toLowerCase()
      )
    ) {
      setSubtaskError("Subtask already exists.");
      return;
    }
    setSubtaskLoading(true);
    setSubtaskError("");
    try {
      await onUpdateSubtask(task.id, editingSubtask.id, { text: trimmedText });
      setEditingSubtask({ id: null, text: "" });
    } catch (err) {
      setSubtaskError("Failed to update subtask. Please try again.");
    } finally {
      setSubtaskLoading(false);
    }
  };
  const handleEditSubtaskCancel = () => {
    setEditingSubtask({ id: null, text: "" });
    setSubtaskError("");
  };

  // Subtask Delete
  const handleDeleteSubtaskClick = (subtaskId) => {
    const subtask = task?.subtasks?.find((st) => st.id === subtaskId);
    if (subtask) {
      setSubtaskToDeleteId(subtaskId);
      setSubtaskToDeleteText(subtask.text);
      setIsConfirmDeleteSubtaskOpen(true);
    }
  };
  const confirmDeleteSubtask = () => {
    if (task && subtaskToDeleteId) {
      onDeleteSubtask(task.id, subtaskToDeleteId);
    }
    setIsConfirmDeleteSubtaskOpen(false);
    setSubtaskToDeleteId(null);
    setSubtaskToDeleteText("");
  };
  const cancelDeleteSubtask = () => {
    setIsConfirmDeleteSubtaskOpen(false);
    setSubtaskToDeleteId(null);
    setSubtaskToDeleteText("");
  };

  // Complete Parent Task
  const handleMarkAllSubtasksCompleteClick = () => {
    if (task && onMarkAllSubtasksComplete) onMarkAllSubtasksComplete(task.id);
  };
  const handleMarkParentTaskCompleteClick = () => {
    if (task && onToggleTask) {
      onToggleTask(task.id);
      if (onSetUserChoseToKeepParentOpen)
        onSetUserChoseToKeepParentOpen(task.id, false);
    }
  };
  const confirmCompleteParentTask = () => {
    if (task && onToggleTask) onToggleTask(task.id);
    setIsConfirmCompleteParentOpen(false);
    // Do NOT reset hasPromptedThisStreak here!
  };
  const cancelCompleteParentTask = () => {
    setIsConfirmCompleteParentOpen(false);
    // Do NOT reset hasPromptedThisStreak here!
    if (task && onSetUserChoseToKeepParentOpen)
      onSetUserChoseToKeepParentOpen(task.id, true);
  };

  // Effect: Prompt to complete parent if all subtasks are done
  useEffect(() => {
    if (
      isOpen &&
      task &&
      task.subtasks &&
      task.subtasks.length > 0 &&
      !task.completed
    ) {
      const allSubtasksNowComplete = task.subtasks.every((st) => st.completed);

      if (allSubtasksNowComplete && !hasPromptedThisStreak) {
        setIsConfirmCompleteParentOpen(true);
        setHasPromptedThisStreak(true);
      } else if (!allSubtasksNowComplete && hasPromptedThisStreak) {
        // Reset streak if any subtask is unmarked
        setHasPromptedThisStreak(false);
      }
    }
  }, [isOpen, task, hasPromptedThisStreak]);

  // Do not render if not open or no task
  if (!isOpen || !task) return null;

  // Format date/time
  const formattedDate = task.date;
  const formattedTime = task.time
    ? new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--";

  const handleSubtaskDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = Array.from(task.subtasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    onReorderSubtasks(task.id, reordered); // Persist new order
  };

  return (
    <>
      <Modal
        isOpen={
          isOpen && !isConfirmDeleteSubtaskOpen && !isConfirmCompleteParentOpen
        }
        onClose={onClose} // Do NOT reset hasPromptedThisStreak here!
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

          {/* Description Section */}
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
                {task?.description ? (
                  <>
                    <p className="description-text">{currentDescription}</p>
                    <div className="description-view-actions">
                      <button
                        onClick={() => setEditingDescription(true)}
                        className="btn-link edit-description-btn"
                      >
                        Edit Description
                      </button>
                      <button
                        onClick={handleClearDescription}
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

          {/* Link Section */}
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
                  className="task-details-input"
                  autoFocus
                />
                {linkError && (
                  <p className="error-message input-error-message">
                    {linkError}
                  </p>
                )}
                <div className="link-actions">
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
                {currentLink ? (
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

          {/* Subtasks Section */}
          <div className="task-details-section">
            <h4>Subtasks</h4>
            {(() => {
              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
              const allSubtasksComplete =
                hasSubtasks && task.subtasks.every((st) => st.completed);
              if (
                userChoseToKeepParentOpen &&
                allSubtasksComplete &&
                !task.completed
              ) {
                return (
                  <div className="subtasks-batch-actions">
                    <button
                      onClick={handleMarkParentTaskCompleteClick}
                      className="btn-success btn-small"
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
              return null;
            })()}

            {editingSubtask.id ? null : (
              <div className="subtask-add-form">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={handleSubtaskTextChange}
                  onBlur={handleSubtaskInputBlur}
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Add a new subtask..."
                  className="subtask-input"
                  disabled={subtaskLoading}
                  tabIndex={0}
                />
                <button
                  onClick={handleAddSubtaskClick}
                  disabled={!newSubtaskText.trim() || subtaskLoading}
                  className="btn-primary btn-small add-subtask-btn task-details-btn"
                  tabIndex={0}
                >
                  {subtaskLoading ? "Adding..." : "Add"}
                </button>
              </div>
            )}
            {subtaskError && (
              <p className="input-error-message" aria-live="polite">
                {subtaskError}
              </p>
            )}

            {task.subtasks && task.subtasks.length > 0 ? (
              <DragDropContext onDragEnd={handleSubtaskDragEnd}>
                <Droppable droppableId="subtask-list-droppable">
                  {(provided) => (
                    <ul
                      className="subtask-list"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {task.subtasks.map((subtask, index) => (
                        <Draggable
                          key={subtask.id}
                          draggableId={String(subtask.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`subtask-item${
                                subtask.completed ? " completed" : ""
                              } ${snapshot.isDragging ? "dragging" : ""}`}
                            >
                              <span
                                className="drag-handle"
                                {...provided.dragHandleProps}
                                aria-label="Drag to reorder"
                                tabIndex={0}
                                role="button"
                              >
                                ⋮⋮
                              </span>
                              {editingSubtask.id === subtask.id ? (
                                <div className="subtask-edit-area">
                                  <input
                                    className="task-details-input"
                                    value={editingSubtask.text}
                                    onChange={handleEditSubtaskChange}
                                    onBlur={handleEditSubtaskBlur}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleEditSubtaskSave();
                                      if (e.key === "Escape")
                                        handleEditSubtaskCancel();
                                    }}
                                    placeholder="Edit subtask..."
                                    disabled={subtaskLoading}
                                    tabIndex={0}
                                  />
                                  <div className="link-actions">
                                    <button
                                      className="add-link-btn"
                                      type="button"
                                      onClick={handleEditSubtaskSave}
                                      disabled={subtaskLoading}
                                      tabIndex={0}
                                    >
                                      {subtaskLoading ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      type="button"
                                      onClick={handleEditSubtaskCancel}
                                      disabled={subtaskLoading}
                                      tabIndex={0}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  {subtaskError && (
                                    <p
                                      className="input-error-message"
                                      aria-live="polite"
                                    >
                                      {subtaskError}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <label className="subtask-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={subtask.completed}
                                      onChange={() =>
                                        onUpdateSubtask(task.id, subtask.id, {
                                          completed: !subtask.completed,
                                        })
                                      }
                                      tabIndex={0}
                                    />
                                    <span className="custom-checkbox"></span>
                                    <span className="subtask-text">
                                      {subtask.text}
                                    </span>
                                  </label>
                                  <button
                                    className="task-action-icon-btn edit-pencil-btn"
                                    title="Edit subtask"
                                    onClick={() =>
                                      handleEditSubtaskClick(subtask)
                                    }
                                    tabIndex={0}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="task-action-icon-btn delete-task-btn"
                                    title="Delete subtask"
                                    onClick={() =>
                                      handleDeleteSubtaskClick(subtask.id)
                                    }
                                    tabIndex={0}
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
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

      {/* Confirmation Modal for Subtask Deletion */}
      <Modal
        isOpen={isConfirmDeleteSubtaskOpen}
        onClose={cancelDeleteSubtask}
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
  onToggleTask: PropTypes.func.isRequired,
  onMarkAllSubtasksComplete: PropTypes.func.isRequired,
  onUpdateTaskLink: PropTypes.func.isRequired,
  userChoseToKeepParentOpen: PropTypes.bool,
  onSetUserChoseToKeepParentOpen: PropTypes.func.isRequired,
  onReorderSubtasks: PropTypes.func.isRequired,
};

export default TaskDetailsModal;
