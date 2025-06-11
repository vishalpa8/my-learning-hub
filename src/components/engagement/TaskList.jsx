// TaskList.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import Modal from "../shared/Modal"; // Import the generic Modal
import PropTypes from "prop-types";
import "./EngagementPage.css";

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
  showDescriptionInput: false,
  showSubtasksArea: false,
  currentSubtaskText: "",
  subtasks: [], // Holds subtasks for the task being created
};

const initialEditState = {
  id: null,
  text: "",
  time: "",
};

// Helper to generate a simple unique ID for client-side temporary items
const generateTempId = () => Date.now() + Math.random();

// Helper to get today's date in DD-MM-YYYY format
const getTodayDateString = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
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
  selectedDateForDisplay, // Added this prop for dynamic header
}) => {
  const [newTaskForm, setNewTaskForm] = useState(initialNewTaskFormState);
  const [userManuallySetNewTaskTime, setUserManuallySetNewTaskTime] =
    useState(false);

  const [editState, setEditState] = useState(initialEditState);

  // State for main task deletion confirmation
  const [isConfirmDeleteTaskOpen, setIsConfirmDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

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
            { id: generateTempId(), text: trimmedText, completed: false },
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
    setNewTaskForm(prev => ({ ...prev, [field]: !prev[field] }));
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
    setNewTaskForm(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== subtaskId)
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
        subtasks: newTaskForm.subtasks,
      });
      clearNewTaskForm();
    },
    [newTaskForm, onAddTask, clearNewTaskForm]
  );


  useEffect(() => {
    // Repopulate if:
    // 1. We have a currentTime.
    // 2. The user hasn't manually set a time OR the task text is now empty (meaning form was just cleared).
    if (currentTime && (!userManuallySetNewTaskTime || newTaskForm.text === "")) {
      // If not manually set, always try to update to the current live time.
      // After clearNewTaskForm, prev.time is "", so this will set it to currentTime.
      setNewTaskForm(prev => ({ ...prev, time: currentTime }));
    }
  }, [currentTime, userManuallySetNewTaskTime, newTaskForm.text]); // Added newTaskForm.text

  useEffect(() => {
    if (editState.id && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editState.id]);

  // Handle Escape key for the main new task input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        clearNewTaskForm();
      }
    };
    const inputElement = inputRef.current; // Capture the current ref value
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
    });
  }, []);

  const handleCurrentEditTextChange = useCallback((e) => {
    setEditState(prev => ({ ...prev, text: e.target.value }));
  }, []);

  const handleCurrentEditTimeChange = useCallback((e) => {
    setEditState(prev => ({ ...prev, time: e.target.value }));
  }, []);

  const handleSaveEditDetails = useCallback(
    () => {
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
    },
    [editState, tasks, onUpdateTaskText, onUpdateTime, resetEditDetailsState]
  );

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
    [
      editState.id,
      handleSaveEditDetails,
      handleCancelEditDetails,
    ]
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

  const todayDateStr = getTodayDateString();
  const headerText =
    selectedDateForDisplay === todayDateStr
      ? "Today's Tasks"
      : `Tasks for ${selectedDateForDisplay}`;
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
      <form
        onSubmit={handleAddTaskSubmit}
        className="task-list-form"
        autoComplete="off"
      >
        <div className="task-input-group">
          <input
            ref={inputRef}
            type="text"
            value={newTaskForm.text}
            onChange={(e) => handleNewTaskFormChange("text", e.target.value)}
            placeholder="Add a new task for today"
            aria-label="Add a new task"
            className="task-input"
            maxLength={100}
            autoFocus
          />
          <input
            type="time"
            value={newTaskForm.time}
            onChange={handleTimeChange}
            className="task-time-input"
            aria-label="Set time for new task"
          />
        </div>

        {/* Optional Fields Toggles - only show if there's main task text */}
        {newTaskForm.text.trim() &&
          (!newTaskForm.showDescriptionInput || !newTaskForm.showSubtasksArea) && (
            <div className="new-task-optional-actions">
              {!newTaskForm.showDescriptionInput && (
                <button
                  type="button"
                  onClick={() => handleToggleNewTaskOptionalField("showDescriptionInput")}
                  className="btn-outline btn-small add-optional-field-btn"
                >
                  + Description
                </button>
              )}
              {!newTaskForm.showSubtasksArea && (
                <button
                  type="button"
                  onClick={() => handleToggleNewTaskOptionalField("showSubtasksArea")}
                  className="btn-outline btn-small add-optional-field-btn"
                >
                  + Subtasks
                </button>
              )}
            </div>
          )}

        {/* Description Input Area - appears when toggled */}
        {newTaskForm.showDescriptionInput && newTaskForm.text.trim() && (
          <textarea
            value={newTaskForm.description}
            onChange={(e) => handleNewTaskFormChange("description", e.target.value)}
            placeholder="Optional: Add a description..."
            aria-label="Add a description for the new task"
            className="task-description-input"
            rows="3"
          />
        )}

        {/* Subtask Input Area - appears when toggled */}
        {newTaskForm.showSubtasksArea && newTaskForm.text.trim() && (
          <div className="new-task-subtasks-section">
            <div className="new-task-subtask-input-group">
              <input
                type="text"
                value={newTaskForm.currentSubtaskText}
                onChange={(e) => handleNewTaskFormChange("currentSubtaskText", e.target.value)}
                onKeyDown={handleNewSubtaskInputKeyDown}
                placeholder="Enter subtask text and press Enter or click Add"
                className="new-task-subtask-input"
              />
              <button
                type="button"
                onClick={handleAddNewTaskSubtask}
                className="btn-secondary btn-small add-new-subtask-btn"
                disabled={!newTaskForm.currentSubtaskText.trim()}
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
        {newTaskForm.text.trim() && (
          <button
            type="submit"
            className="add-task-btn"
            aria-label="Add Task"
            title="Add Task"
          >
            <span className="add-btn-icon" aria-hidden="true">
              ＋
            </span>
            <span>Add Task</span>
          </button>
        )}
      </form>
      {tasks.length === 0 ? (
        <div className="task-list-empty">
          <span
            role="img"
            aria-label="Seedling"
            className="task-list-empty-icon"
          >
            🌱
          </span>
          No tasks for today yet. Add one to get started!
        </div>
      ) : (
        <ul className="improved-task-list-ul">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`improved-task-list-li${
                task.completed ? " completed" : ""
              }${isEditingThisTask(task.id) ? " editing" : ""}`}
            >
              {!isEditingThisTask(task.id) && (
                <label className="check-container">
                  <input
                    className="task-checkbox-input"
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    aria-label={
                      task.completed
                        ? `Mark task "${task.text}" as incomplete`
                        : `Mark "${task.text}" as complete`
                    }
                  />
                  <span className="custom-checkbox" aria-hidden="true"></span>
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
                        onClick={handleSaveEditDetails} // No longer needs task.id
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
                    onClick={() => onToggleTask(task.id)}
                    title="Click to toggle complete/incomplete"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleTask(task.id);
                      }
                    }}
                  >
                    <span className="task-text">{task.text}</span>
                    <div className="task-indicators">
                      {task.description && (
                        <span
                          className="task-indicator-icon"
                          title="Has description"
                        >
                          📝
                        </span>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span
                          className="task-indicator-icon"
                          title={`${
                            task.subtasks.filter((st) => st.completed).length
                          }/${task.subtasks.length} subtasks completed`}
                        >
                          📋
                          <span className="subtask-progress-indicator">
                            {`${
                              task.subtasks.filter((st) => st.completed).length
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
                    {/* Description and subtasks will be shown in a details modal */}
                  </div>
                )}
              </div>

              {!isEditingThisTask(task.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditDetails(task);
                  }}
                  className="edit-pencil-btn"
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
                    onViewTaskDetails(task.id);
                  }}
                  className="view-details-btn"
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
                    requestDeleteTask(task); // Changed to request confirmation
                  }}
                  className="delete-task-btn"
                  aria-label={`Delete "${task.text}"`}
                  title="Delete task"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      requestDeleteTask(task); // Changed to request confirmation
                    }
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <footer className="task-list-tip">
        <span role="img" aria-label="Pointer">
          👉
        </span>{" "}
        Click the checkbox to mark tasks as complete!
      </footer>

      {/* Confirmation Modal for Deleting a Main Task */}
      <Modal
        isOpen={isConfirmDeleteTaskOpen}
        onClose={cancelDeleteTask}
        title="Delete Task"
        isConfirmation={true}
        confirmationMessage={`Are you sure you want to delete the task "${taskToDelete?.text}"? This action cannot be undone.`}
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
      completed: PropTypes.bool.isRequired,
      time: PropTypes.string,
      description: PropTypes.string,
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
  selectedDateForDisplay: PropTypes.string.isRequired, // Added prop type
};

export default React.memo(TaskList);
