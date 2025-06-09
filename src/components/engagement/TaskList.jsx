// TaskList.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
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
  currentTime,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [userManuallySetNewTaskTime, setUserManuallySetNewTaskTime] =
    useState(false);

  // State for combined text and time editing
  const [editingDetailsForTaskId, setEditingDetailsForTaskId] = useState(null);
  const [currentEditText, setCurrentEditText] = useState("");
  const [currentEditTime, setCurrentEditTime] = useState("");

  const inputRef = useRef(null);
  const editInputRef = useRef(null); // For the task text edit input

  const handleInputChange = useCallback(
    (e) => setNewTaskText(e.target.value),
    []
  );
  const handleTimeChange = useCallback((e) => {
    setNewTaskTime(e.target.value);
    setUserManuallySetNewTaskTime(true);
  }, []);

  // Helper to reset combined editing state
  const resetEditDetailsState = useCallback(() => {
    setEditingDetailsForTaskId(null);
    setCurrentEditText("");
    setCurrentEditTime("");
  }, []);

  const handleAddTaskSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;
      onAddTask({ text: newTaskText.trim(), time: newTaskTime });
      setNewTaskText("");
      setNewTaskTime("");
      setUserManuallySetNewTaskTime(false);
      inputRef.current?.focus();
    },
    [newTaskText, newTaskTime, onAddTask]
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

  const handleStartEditDetails = useCallback((task) => {
    setEditingDetailsForTaskId(task.id);
    setCurrentEditText(task.text);
    setCurrentEditTime(task.time || ""); // Ensure time is a string
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
        // Normalize currentEditTime to null if empty string for comparison and saving
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

  // Effect to add/remove global keydown listener for Enter/Escape during edit
  useEffect(() => {
    if (editingDetailsForTaskId) {
      document.addEventListener("keydown", handleEditFormKeyDown);
    } else {
      document.removeEventListener("keydown", handleEditFormKeyDown);
    }
    // Cleanup listener on component unmount or when editingDetailsForTaskId changes
    return () => document.removeEventListener("keydown", handleEditFormKeyDown);
  }, [editingDetailsForTaskId, handleEditFormKeyDown]);

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
              }${isEditingThisTask(task.id) ? " editing" : ""}`} // Add editing class for potential styling
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
                      className="task-time-select-inline task-edit-time-select" // You might want to rename this class or adjust its styles
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
                    onDeleteTask(task.id);
                  }}
                  className="delete-task-btn"
                  aria-label={`Delete "${task.text}"`}
                  title="Delete task"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onDeleteTask(task.id);
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
    })
  ).isRequired,
  onAddTask: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  onUpdateTime: PropTypes.func.isRequired,
  onUpdateTaskText: PropTypes.func.isRequired,
  currentTime: PropTypes.string,
};

export default React.memo(TaskList);
