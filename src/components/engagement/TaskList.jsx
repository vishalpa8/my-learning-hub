// TaskList.jsx
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

const TaskList = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTime,
  onUpdateTaskText,
  onViewTaskDetails,
  currentTime,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [userManuallySetNewTaskTime, setUserManuallySetNewTaskTime] =
    useState(false);
  const [showNewTaskDescriptionInput, setShowNewTaskDescriptionInput] =
    useState(false);

  // State for adding subtasks to a new task
  const [showNewTaskSubtasksArea, setShowNewTaskSubtasksArea] = useState(false);
  const [currentNewSubtaskText, setCurrentNewSubtaskText] = useState("");
  const [newTasksSubtasks, setNewTasksSubtasks] = useState([]); // Holds subtasks for the task being created

  const [editingDetailsForTaskId, setEditingDetailsForTaskId] = useState(null);
  const [currentEditText, setCurrentEditText] = useState("");
  const [currentEditTime, setCurrentEditTime] = useState("");

  // State for main task deletion confirmation
  const [isConfirmDeleteTaskOpen, setIsConfirmDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  const handleInputChange = useCallback(
    (e) => setNewTaskText(e.target.value),
    []
  );
  const handleTimeChange = useCallback((e) => {
    setNewTaskTime(e.target.value);
    setUserManuallySetNewTaskTime(true);
  }, []);
  const handleDescriptionChange = useCallback((e) => {
    setNewTaskDescription(e.target.value);
  }, []);

  const resetEditDetailsState = useCallback(() => {
    setEditingDetailsForTaskId(null);
    setCurrentEditText("");
    setCurrentEditTime("");
  }, []);

  const handleAddNewTaskSubtask = useCallback(() => {
    const trimmedText = currentNewSubtaskText.trim();
    if (trimmedText) {
      setNewTasksSubtasks((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text: trimmedText, completed: false },
      ]);
      setCurrentNewSubtaskText("");
    }
  }, [currentNewSubtaskText]);

  const clearNewTaskForm = useCallback(() => {
    setNewTaskText("");
    setNewTaskTime("");
    setNewTaskDescription("");
    setShowNewTaskDescriptionInput(false);
    setShowNewTaskSubtasksArea(false);
    setNewTasksSubtasks([]);
    setUserManuallySetNewTaskTime(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
    setNewTasksSubtasks((prev) => prev.filter((st) => st.id !== subtaskId));
  }, []);

  const handleAddTaskSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;
      onAddTask({
        text: newTaskText.trim(),
        time: newTaskTime,
        description: showNewTaskDescriptionInput
          ? newTaskDescription.trim()
          : "",
        subtasks: newTasksSubtasks,
      });
      clearNewTaskForm();
    },
    [
      newTaskText,
      newTaskTime,
      newTaskDescription,
      onAddTask,
      showNewTaskDescriptionInput,
      newTasksSubtasks,
      clearNewTaskForm,
    ]
  );

  useEffect(() => {
    if (currentTime && !userManuallySetNewTaskTime) {
      if (newTaskTime !== currentTime) {
        setNewTaskTime(currentTime);
      }
    }
  }, [currentTime, userManuallySetNewTaskTime, newTaskTime]);

  useEffect(() => {
    if (editingDetailsForTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingDetailsForTaskId]);

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
    setEditingDetailsForTaskId(task.id);
    setCurrentEditText(task.text);
    setCurrentEditTime(task.time || "");
  }, []);

  const handleCurrentEditTextChange = useCallback((e) => {
    setCurrentEditText(e.target.value);
  }, []);

  const handleCurrentEditTimeChange = useCallback((e) => {
    setCurrentEditTime(e.target.value);
  }, []);

  const handleSaveEditDetails = useCallback(
    (taskId) => {
      const trimmedText = currentEditText.trim();
      const task = tasks.find((t) => t.id === taskId);

      if (task && trimmedText) {
        if (task.text !== trimmedText) {
          onUpdateTaskText(taskId, trimmedText);
        }
        const timeToSave = currentEditTime || null;
        if (task.time !== timeToSave) {
          onUpdateTime(taskId, timeToSave);
        }
      }
      resetEditDetailsState();
    },
    [
      currentEditText,
      currentEditTime,
      onUpdateTaskText,
      onUpdateTime,
      tasks,
      resetEditDetailsState,
    ]
  );

  const handleCancelEditDetails = useCallback(() => {
    resetEditDetailsState();
  }, [resetEditDetailsState]);

  const isEditingThisTask = (taskId) => editingDetailsForTaskId === taskId;

  const handleEditFormKeyDown = useCallback(
    (event) => {
      if (!editingDetailsForTaskId) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        handleSaveEditDetails(editingDetailsForTaskId);
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancelEditDetails();
      }
    },
    [editingDetailsForTaskId, handleSaveEditDetails, handleCancelEditDetails]
  );

  useEffect(() => {
    if (editingDetailsForTaskId) {
      document.addEventListener("keydown", handleEditFormKeyDown);
    } else {
      document.removeEventListener("keydown", handleEditFormKeyDown);
    }
    return () => document.removeEventListener("keydown", handleEditFormKeyDown);
  }, [editingDetailsForTaskId, handleEditFormKeyDown]);

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
        <h3>Today's Tasks</h3>
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
            value={newTaskText}
            onChange={handleInputChange}
            placeholder="Add a new task for today"
            aria-label="Add a new task"
            className="task-input"
            maxLength={100}
            autoFocus
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={handleTimeChange}
            className="task-time-input"
            aria-label="Set time for new task"
          />
        </div>

        {/* Optional Fields Toggles - only show if there's main task text */}
        {newTaskText.trim() &&
          (!showNewTaskDescriptionInput || !showNewTaskSubtasksArea) && (
            <div className="new-task-optional-actions">
              {!showNewTaskDescriptionInput && (
                <button
                  type="button"
                  onClick={() => setShowNewTaskDescriptionInput(true)}
                  className="btn-outline btn-small add-optional-field-btn"
                >
                  + Description
                </button>
              )}
              {!showNewTaskSubtasksArea && (
                <button
                  type="button"
                  onClick={() => setShowNewTaskSubtasksArea(true)}
                  className="btn-outline btn-small add-optional-field-btn"
                >
                  + Subtasks
                </button>
              )}
            </div>
          )}

        {/* Description Input Area - appears when toggled */}
        {showNewTaskDescriptionInput && newTaskText.trim() && (
          <textarea
            value={newTaskDescription}
            onChange={handleDescriptionChange}
            placeholder="Optional: Add a description..."
            aria-label="Add a description for the new task"
            className="task-description-input"
            rows="3"
          />
        )}

        {/* Subtask Input Area - appears when toggled */}
        {showNewTaskSubtasksArea && newTaskText.trim() && (
          <div className="new-task-subtasks-section">
            <div className="new-task-subtask-input-group">
              <input
                type="text"
                value={currentNewSubtaskText}
                onChange={(e) => setCurrentNewSubtaskText(e.target.value)}
                onKeyDown={handleNewSubtaskInputKeyDown}
                placeholder="Enter subtask text and press Enter or click Add"
                className="new-task-subtask-input"
              />
              <button
                type="button"
                onClick={handleAddNewTaskSubtask}
                className="btn-secondary btn-small add-new-subtask-btn"
                disabled={!currentNewSubtaskText.trim()}
              >
                Add
              </button>
            </div>
            {newTasksSubtasks.length > 0 && (
              <div className="new-task-subtasks-list-container">
                <ul className="new-task-subtasks-list">
                  {newTasksSubtasks.map((st) => (
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
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="add-task-btn"
          aria-label="Add Task"
          title="Add Task"
        >
          <span className="add-btn-icon" aria-hidden="true">
            ＋
          </span>
          <span>Add</span>
        </button>
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
                      value={currentEditText}
                      onChange={handleCurrentEditTextChange}
                      className="task-edit-input"
                      aria-label={`Editing task text: ${task.text}`}
                      maxLength={100}
                    />
                    <input
                      type="time"
                      value={currentEditTime}
                      onChange={handleCurrentEditTimeChange}
                      className="task-time-select-inline task-edit-time-select"
                      aria-label={`Editing time for task: ${task.text}`}
                    />
                    <div className="task-edit-actions">
                      <button
                        onClick={() => handleSaveEditDetails(task.id)}
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
};

export default React.memo(TaskList);
