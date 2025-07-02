// TaskList.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import Modal from "../shared/Modal";
import PropTypes from "prop-types";
import "./EngagementPage.css";
import { v4 as uuidv4 } from "uuid";
import { dateToDDMMYYYY, isPastDate, parseDDMMYYYYToDateObj, ddmmyyyyToYYYYMMDD, yyyymmddToDDMMYYYY } from "../../utils/dateHelpers";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function formatTime12Hour(timeStr) {
  if (!timeStr) return "--:--";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

const initialNewTaskFormState = {
  text: "",
  time: "",
  description: "",
  endDate: "",
  showDescriptionInput: false,
  showLinkInput: false,
  showEndDateInput: false,
  showSubtasksArea: false,
  currentSubtaskText: "",
  subtasks: [],
};

const initialEditState = {
  id: null,
  text: "",
  time: "",
};

const TaskList = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTime,
  onUpdateTaskText,
  onViewTaskDetails,
  currentTime,
  selectedDateForDisplay,
  onReorderTasks,
  viewMode,
  onSetViewMode,
}) => {
  const [newTaskForm, setNewTaskForm] = useState(initialNewTaskFormState);
  const [userManuallySetNewTaskTime, setUserManuallySetNewTaskTime] =
    useState(false);

  const [editState, setEditState] = useState(initialEditState);

  // State for main task deletion confirmation
  const [isConfirmDeleteTaskOpen, setIsConfirmDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  const handleNewTaskFormChange = useCallback((field, value) => {
    setNewTaskForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTimeChange = useCallback((e) => {
    setNewTaskForm((prev) => ({ ...prev, time: e.target.value }));
    setUserManuallySetNewTaskTime(true);
  }, []);

  const resetEditDetailsState = useCallback(() => {
    setEditState(initialEditState);
  }, []);

  const handleAddNewTaskSubtask = useCallback(() => {
    setNewTaskForm((prevForm) => {
      const trimmedText = prevForm.currentSubtaskText.trim();
      if (trimmedText) {
        return {
          ...prevForm,
          subtasks: [
            ...prevForm.subtasks,
            {
              id: uuidv4(),
              text: trimmedText,
              completed: false,
            },
          ],
          currentSubtaskText: "",
        };
      }
      return prevForm;
    });
  }, []);

  const clearNewTaskForm = useCallback(() => {
    setNewTaskForm(initialNewTaskFormState);
    setUserManuallySetNewTaskTime(false);
    inputRef.current?.focus();
  }, []);

  const handleToggleNewTaskOptionalField = useCallback((field) => {
    setNewTaskForm((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleNewSubtaskInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddNewTaskSubtask();
      }
    },
    [handleAddNewTaskSubtask]
  );

  const handleRemoveNewTaskSubtask = useCallback((subtaskId) => {
    setNewTaskForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== subtaskId),
    }));
  }, []);

  const handleAddTaskSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTaskForm.text.trim()) return;
      onAddTask({
        text: newTaskForm.text.trim(),
        time: newTaskForm.time,
        description: newTaskForm.showDescriptionInput
          ? newTaskForm.description.trim()
          : "",
        link: newTaskForm.showLinkInput ? newTaskForm.link.trim() : "",
        endDate: newTaskForm.showEndDateInput ? newTaskForm.endDate : "",
        subtasks: newTaskForm.subtasks,
      });
      clearNewTaskForm();
    },
    [newTaskForm, onAddTask, clearNewTaskForm]
  );

  useEffect(() => {
    if (
      currentTime &&
      (!userManuallySetNewTaskTime || newTaskForm.text === "")
    ) {
      setNewTaskForm((prev) => ({ ...prev, time: currentTime }));
    }
  }, [currentTime, userManuallySetNewTaskTime, newTaskForm.text]);

  useEffect(() => {
    if (editState.id && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editState.id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        clearNewTaskForm();
      }
    };
    const inputElement = inputRef.current;
    inputElement?.addEventListener("keydown", handleKeyDown);
    return () => {
      inputElement?.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearNewTaskForm]);

  const handleStartEditDetails = useCallback((task) => {
    setEditState({
      id: task.id,
      text: task.text,
      time: task.time || "",
      startDate: task.startDate || "", // Assumes YYYY-MM-DD format from parent
    });
  }, []);

  const handleCurrentEditTextChange = useCallback((e) => {
    setEditState((prev) => ({ ...prev, text: e.target.value }));
  }, []);

  const handleCurrentEditTimeChange = useCallback((e) => {
    setEditState((prev) => ({ ...prev, time: e.target.value }));
  }, []);

  const handleSaveEditDetails = useCallback(() => {
    const { id, text, time } = editState;
    if (!id) return;

    const trimmedText = text.trim();
    const taskToUpdate = tasks.find((t) => t.id === id);

    if (taskToUpdate && trimmedText) {
      if (taskToUpdate.text !== trimmedText) {
        onUpdateTaskText(id, trimmedText);
      }
      const timeToSave = time || null;
      if (taskToUpdate.time !== timeToSave) {
        onUpdateTime(id, timeToSave);
      }
    }
    resetEditDetailsState();
  }, [editState, tasks, onUpdateTaskText, onUpdateTime, resetEditDetailsState]);

  const handleCancelEditDetails = useCallback(() => {
    resetEditDetailsState();
  }, [resetEditDetailsState]);

  const isEditingThisTask = (taskId) => editState.id === taskId;

  const handleEditFormKeyDown = useCallback(
    (event) => {
      if (!editState.id) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        handleSaveEditDetails();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancelEditDetails();
      }
    },
    [editState.id, handleSaveEditDetails, handleCancelEditDetails]
  );

  useEffect(() => {
    if (editState.id) {
      document.addEventListener("keydown", handleEditFormKeyDown);
    } else {
      document.removeEventListener("keydown", handleEditFormKeyDown);
    }
    return () => document.removeEventListener("keydown", handleEditFormKeyDown);
  }, [editState.id, handleEditFormKeyDown]);

  const requestDeleteTask = useCallback((task) => {
    setTaskToDelete(task);
    setIsConfirmDeleteTaskOpen(true);
  }, []);

  const confirmDeleteTask = useCallback(() => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
    }
    setIsConfirmDeleteTaskOpen(false);
    setTaskToDelete(null);
  }, [taskToDelete, onDeleteTask]);

  const cancelDeleteTask = useCallback(() => {
    setIsConfirmDeleteTaskOpen(false);
    setTaskToDelete(null);
  }, []);

  // Generate a more informative delete confirmation message
  const getDeleteConfirmationMessage = (task) => {
    if (!task) return "";
    // Robustly detect multi-day task: endDate exists and is different from start date
    if (task.endDate && task.endDate !== task.date) {
      const formattedStartDate = task.date;
      const formattedEndDate = task.endDate;
      return `This is a multi-day task active from ${formattedStartDate} to ${formattedEndDate}. Deleting it will remove it permanently from all days. Are you sure you want to delete "${task.text}"?`;
    }
    // Standard message for single-day tasks
    return `Are you sure you want to delete the task "${task.text}"? This action cannot be undone.`;
  };
  // ...existing code...
  const todayDateStr = dateToDDMMYYYY(new Date());
  const isTodayView =
    viewMode === "date" && selectedDateForDisplay === todayDateStr;

  const headerText = (() => {
    if (viewMode === "week") return "This Week's Tasks";
    if (viewMode === "month") return "This Month's Tasks";
    return isTodayView
      ? "Today's Tasks"
      : `Tasks for ${selectedDateForDisplay}`;
  })();

  const getEmptyMessage = () => {
    switch (viewMode) {
      case "week":
        return "No tasks for this week. Add one to get started!";
      case "month":
        return "No tasks for this month. Add one to get started!";
      default: // Covers 'date' view
        return "No tasks for today yet. Add one to get started!";
    }
  };
  const allowTaskCreation = !isPastDate(selectedDateForDisplay);
  const minEndDateForNewTask = selectedDateForDisplay;

  const isReorderingEnabled = viewMode === "date";

  // Effect to handle transitions when selectedDateForDisplay changes
  useEffect(() => {
    // Start fade-out transition
    setIsTransitioningOut(true);

    // After a short delay (enough for fade-out to start), allow new content to render
    // and trigger fade-in (by removing the fade-out class)
    const timer = setTimeout(() => {
      setIsTransitioningOut(false);
    }, 50); // Adjust delay if needed, should be less than transition duration

    return () => clearTimeout(timer);
  }, [selectedDateForDisplay]);

  // Memoized drag end handler
  const handleTaskDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;

      const reordered = Array.from(tasks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);

      onReorderTasks(reordered); // Persist new order
    },
    [tasks, onReorderTasks]
  );

  return (
    <section className="improved-task-list card" aria-label="Today's Tasks">
      <header className="task-list-header">
        <span
          role="img"
          aria-label="Clipboard"
          className="task-list-header-icon"
        >
          📋
        </span>
        <h3>{headerText}</h3>
      </header>
      <div className="task-view-controls">
        <button
          type="button"
          className={`btn-view-mode ${isTodayView ? "active" : ""}`}
          onClick={() => onSetViewMode("date")}
        >
          Today
        </button>
        <button
          type="button"
          className={`btn-view-mode ${viewMode === "week" ? "active" : ""}`}
          onClick={() => onSetViewMode("week")}
        >
          This Week
        </button>
        <button
          type="button"
          className={`btn-view-mode ${viewMode === "month" ? "active" : ""}`}
          onClick={() => onSetViewMode("month")}
        >
          This Month
        </button>
      </div>
      <div
        className={`task-list-content-wrapper ${
          isTransitioningOut ? "fade-out-active" : ""
        }`}
      >
        <form
          aria-disabled={!allowTaskCreation}
          onSubmit={handleAddTaskSubmit}
          autoComplete="off"
          className="task-list-form"
        >
          <div className="task-input-group">
            <input
              ref={inputRef}
              type="text"
              value={newTaskForm.text}
              onChange={(e) => handleNewTaskFormChange("text", e.target.value)}
              placeholder="Add a new task..."
              aria-label="Add a new task"
              className="task-input"
              maxLength={100}
              autoFocus
              disabled={!allowTaskCreation}
            />
            <input
              type="time"
              value={newTaskForm.time}
              onChange={handleTimeChange}
              className="task-time-input"
              aria-label="Set time for new task"
              disabled={!allowTaskCreation}
            />
          </div>

          {/* Optional Fields Toggles - only show if there's main task text */}
          {newTaskForm.text.trim() &&
            allowTaskCreation &&
            (!newTaskForm.showDescriptionInput ||
              !newTaskForm.showLinkInput ||
              !newTaskForm.showEndDateInput ||
              !newTaskForm.showSubtasksArea) && (
              <div className="new-task-optional-actions">
                {!newTaskForm.showDescriptionInput && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleNewTaskOptionalField("showDescriptionInput")
                    }
                    className="btn-outline btn-small add-optional-field-btn"
                    disabled={!allowTaskCreation}
                  >
                    + Description
                  </button>
                )}
                {!newTaskForm.showLinkInput && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleNewTaskOptionalField("showLinkInput")
                    }
                    className="btn-outline btn-small add-optional-field-btn"
                    disabled={!allowTaskCreation}
                  >
                    + Link
                  </button>
                )}
                {!newTaskForm.showEndDateInput && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleNewTaskOptionalField("showEndDateInput")
                    }
                    className="btn-outline btn-small add-optional-field-btn"
                    disabled={!allowTaskCreation}
                  >
                    + End Date
                  </button>
                )}
                {!newTaskForm.showSubtasksArea && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleNewTaskOptionalField("showSubtasksArea")
                    }
                    className="btn-outline btn-small add-optional-field-btn"
                    disabled={!allowTaskCreation}
                  >
                    + Subtasks
                  </button>
                )}
              </div>
            )}

          {/* Description Input Area - appears when toggled */}
          {newTaskForm.showDescriptionInput &&
            newTaskForm.text.trim() &&
            allowTaskCreation && (
              <textarea
                value={newTaskForm.description}
                onChange={(e) =>
                  handleNewTaskFormChange("description", e.target.value)
                }
                placeholder="Optional: Add a description..."
                aria-label="Add a description for the new task"
                className="task-description-input"
                rows="3"
                disabled={!allowTaskCreation}
              />
            )}

          {/* Link Input Area - appears when toggled */}
          {newTaskForm.showLinkInput &&
            newTaskForm.text.trim() &&
            allowTaskCreation && (
              <input
                type="url"
                value={newTaskForm.link}
                onChange={(e) =>
                  handleNewTaskFormChange("link", e.target.value)
                }
                placeholder="Optional: Add a URL (e.g., https://example.com)"
                className="task-link-input"
                disabled={!allowTaskCreation}
              />
            )}

          {/* End Date Input Area - appears when toggled */}
          {newTaskForm.showEndDateInput &&
            newTaskForm.text.trim() &&
            allowTaskCreation && (
              <div className="new-task-end-date-section">
                <label htmlFor="new-task-end-date">End Date (optional)</label>
                <input
                  id="new-task-end-date"
                  type="date"
                  value={ddmmyyyyToYYYYMMDD(newTaskForm.endDate)}
                  onChange={(e) =>
                    handleNewTaskFormChange("endDate", yyyymmddToDDMMYYYY(e.target.value))
                  }
                  min={dateToDDMMYYYY(parseDDMMYYYYToDateObj(minEndDateForNewTask))}
                  className="task-end-date-input"
                  disabled={!allowTaskCreation}
                />
              </div>
            )}

          {/* Subtask Input Area - appears when toggled */}
          {newTaskForm.showSubtasksArea &&
            newTaskForm.text.trim() &&
            allowTaskCreation && (
              <div className="new-task-subtasks-section">
                <div className="new-task-subtask-input-group">
                  <input
                    type="text"
                    value={newTaskForm.currentSubtaskText}
                    onChange={(e) =>
                      handleNewTaskFormChange(
                        "currentSubtaskText",
                        e.target.value
                      )
                    }
                    onKeyDown={handleNewSubtaskInputKeyDown}
                    placeholder="Enter subtask text and press Enter or click Add"
                    className="new-task-subtask-input"
                    disabled={!allowTaskCreation}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTaskSubtask}
                    className="btn-secondary btn-small add-new-subtask-btn"
                    disabled={
                      !allowTaskCreation ||
                      !newTaskForm.currentSubtaskText.trim()
                    }
                  >
                    Add
                  </button>
                </div>
                {newTaskForm.subtasks.length > 0 && (
                  <div className="new-task-subtasks-list-container">
                    <ul className="new-task-subtasks-list">
                      {newTaskForm.subtasks.map((st) => (
                        <li key={st.id}>
                          <span>{st.text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewTaskSubtask(st.id)}
                            className="remove-new-subtask-btn"
                            disabled={!allowTaskCreation}
                            aria-label="Remove subtask"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          {/* Conditionally render Add Task button only if there's text */}
          {newTaskForm.text.trim() && allowTaskCreation && (
            <button
              type="submit"
              className="add-task-btn"
              aria-label="Add Task"
              disabled={!allowTaskCreation}
              title="Add Task"
            >
              <span className="add-btn-icon" aria-hidden="true">
                ＋
              </span>
              <span>Add Task</span>
            </button>
          )}
        </form>
        {!allowTaskCreation && (
          <p className="task-list-tip past-date-restriction">
            Task creation is not allowed for past dates.
          </p>
        )}
        {tasks.length === 0 ? (
          <div className="task-list-empty">
            <span
              role="img"
              aria-label="Seedling"
              className="task-list-empty-icon"
            >
              🌱
            </span>
            {getEmptyMessage()}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleTaskDragEnd}>
            <Droppable droppableId="task-list-droppable">
              {(provided) => (
                <ul
                  className="improved-task-list-ul"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={String(task.id)}
                      index={index}
                      isDragDisabled={!isReorderingEnabled}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`improved-task-list-li${
                            task.isCompletedOnThisDay ? " completed" : ""
                          }${isEditingThisTask(task.id) ? " editing" : ""} ${
                            snapshot.isDragging ? "dragging" : ""
                          }`}
                        >
                          {isReorderingEnabled && (
                            /* Drag handle icon for reordering */
                            <span
                              className="drag-handle"
                              {...provided.dragHandleProps}
                              aria-label="Drag to reorder"
                              tabIndex={0}
                              role="button"
                            >
                              ⋮⋮
                            </span>
                          )}

                          {!isEditingThisTask(task.id) && (
                            <label className="check-container">
                              <input
                                className="task-checkbox-input"
                                type="checkbox"
                                checked={task.isCompletedOnThisDay}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onToggleTask(task.id, task.displayDate); // Pass instance-specific date
                                }}
                                aria-label={
                                  task.isCompletedOnThisDay
                                    ? `Mark task "${task.text}" as incomplete`
                                    : `Mark "${task.text}" as complete`
                                }
                              />
                              <span
                                className="custom-checkbox"
                                aria-hidden="true"
                              ></span>
                            </label>
                          )}

                          <div className="task-content-area">
                            {isEditingThisTask(task.id) ? (
                              <div
                                className="task-edit-form"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editState.text}
                                  onChange={handleCurrentEditTextChange}
                                  className="task-edit-input"
                                  aria-label={`Editing task text: ${task.text}`}
                                  maxLength={100}
                                />
                                <input
                                  type="time"
                                  value={editState.time}
                                  onChange={handleCurrentEditTimeChange}
                                  className="task-time-select-inline task-edit-time-select"
                                  aria-label={`Editing time for task: ${task.text}`}
                                />
                                <div className="task-edit-actions">
                                  <button
                                    onClick={handleSaveEditDetails}
                                    className="task-edit-save-btn"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEditDetails}
                                    className="task-edit-cancel-btn"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="task-view-content"
                                onClick={() =>
                                  onToggleTask(task.id, task.displayDate)
                                }
                                title="Click to toggle complete/incomplete"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onToggleTask(task.id, task.displayDate);
                                  }
                                }}
                              >
                                <span className="task-text">
                                  {task.text}
                                  {task.link && (
                                    <>
                                      {" "}
                                      <a
                                        href={task.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="task-link-inline-indicator"
                                        title={`Link: ${task.link}`}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                      >
                                        🔗
                                      </a>
                                    </>
                                  )}
                                </span>

                                <div className="task-indicators">
                                  {task.description && (
                                    <span
                                      className="task-indicator-icon"
                                      title="Has description"
                                    >
                                      📝
                                    </span>
                                  )}
                                  {task.subtasks &&
                                    task.subtasks.length > 0 && (
                                      <span
                                        className="task-indicator-icon"
                                        title={`${
                                          task.subtasks.filter(
                                            (st) => st.completed
                                          ).length
                                        }/${
                                          task.subtasks.length
                                        } subtasks completed`}
                                      >
                                        📋
                                        <span className="subtask-progress-indicator">
                                          {`${
                                            task.subtasks.filter(
                                              (st) => st.completed
                                            ).length
                                          }/${task.subtasks.length}`}
                                        </span>
                                      </span>
                                    )}
                                </div>

                                <span
                                  className="task-time-display"
                                  aria-label={`Scheduled time: ${formatTime12Hour(
                                    task.time
                                  )}`}
                                >
                                  {formatTime12Hour(task.time)}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isEditingThisTask(task.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditDetails(task);
                              }}
                              className="edit-pencil-btn task-action-icon-btn"
                              aria-label={`Edit task "${task.text}"`}
                              title="Edit task"
                            >
                              ✏️
                            </button>
                          )}
                          {!isEditingThisTask(task.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewTaskDetails(task);
                              }}
                              className="view-details-btn task-action-icon-btn"
                              aria-label={`View details for task "${task.text}"`}
                              title="View task details"
                            >
                              ℹ️
                            </button>
                          )}
                          {!isEditingThisTask(task.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteTask(task);
                              }}
                              className="delete-task-btn task-action-icon-btn"
                              aria-label={`Delete "${task.text}"`}
                              title="Delete task"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  requestDeleteTask(task);
                                }
                              }}
                            >
                              ×
                            </button>
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
        )}
        <footer className="task-list-tip">
          <span role="img" aria-label="Pointer">
            👉
          </span>{" "}
          Click the checkbox to mark tasks as complete!
        </footer>
      </div>{" "}
      {/* End of task-list-content-wrapper */}
      <Modal
        isOpen={isConfirmDeleteTaskOpen}
        onClose={cancelDeleteTask}
        title="Delete Task"
        isConfirmation={true}
        confirmationMessage={getDeleteConfirmationMessage(taskToDelete)}
        onConfirm={confirmDeleteTask}
        confirmText="Delete"
      />
    </section>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      isCompletedOnThisDay: PropTypes.bool.isRequired,
      displayDate: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired, // Original start date of the task
      endDate: PropTypes.string, // Expects YYYY-MM-DD
      time: PropTypes.string,
      description: PropTypes.string,
      link: PropTypes.string,
      subtasks: PropTypes.array,
    })
  ).isRequired,
  onAddTask: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  onUpdateTime: PropTypes.func.isRequired,
  onUpdateTaskText: PropTypes.func.isRequired,
  onViewTaskDetails: PropTypes.func.isRequired,
  currentTime: PropTypes.string,
  selectedDateForDisplay: PropTypes.string.isRequired,
  onReorderTasks: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["date", "week", "month"]).isRequired,
  onSetViewMode: PropTypes.func.isRequired,
};

export default TaskList;
