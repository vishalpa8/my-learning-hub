import React, { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import "./EngagementPage.css";

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      options.push(`${hour}:${min}`);
    }
  }
  return options;
};
const TIME_OPTIONS = generateTimeOptions();

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
  currentTime,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [userManuallySetNewTaskTime, setUserManuallySetNewTaskTime] = useState(false);
  const [editingTimeTaskId, setEditingTimeTaskId] = useState(null);
  const inputRef = useRef(null);

  const handleInputChange = useCallback(
    (e) => setNewTaskText(e.target.value),
    []
  );
  const handleTimeChange = useCallback(
    (e) => {
      setNewTaskTime(e.target.value);
      setUserManuallySetNewTaskTime(true); // Mark that user has interacted
    },
    []
  );

  const handleAddTaskSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;
      onAddTask({ text: newTaskText.trim(), time: newTaskTime });
      setNewTaskText("");
      setNewTaskTime(""); // Clear current new task time
      setUserManuallySetNewTaskTime(false); // Reset flag for the next new task
      inputRef.current && inputRef.current.focus();
    },
    [newTaskText, newTaskTime, onAddTask]
  );

  // Keep new task time synced with live time until the user manually sets it
  useEffect(() => {
    if (currentTime && !userManuallySetNewTaskTime) {
      // Only update if it's different, to avoid potential re-renders
      if (newTaskTime !== currentTime) {
        setNewTaskTime(currentTime);
      }
    }
  }, [currentTime, userManuallySetNewTaskTime, newTaskTime]);

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
            type="time" // Changed back to input type="time"
            value={newTaskTime}
            onChange={handleTimeChange}
            className="task-time-input"
            aria-label="Set time for new task"
            style={{ minWidth: 90, marginLeft: 8 }}
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
              }`}
            >
              <label className="check-container">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  aria-label={
                    task.completed
                      ? `Mark "${task.text}" as incomplete`
                      : `Mark "${task.text}" as complete`
                  }
                />
                <span className="custom-checkbox" aria-hidden="true"></span>
              </label>
              <div className="task-clickable-area">
                <span className="task-text">{task.text}</span>
                {editingTimeTaskId === task.id ? (
                  <select
                    value={task.time || ""}
                    onChange={e => {
                      onUpdateTime(task.id, e.target.value);
                      setEditingTimeTaskId(null);
                    }}
                    onBlur={() => setEditingTimeTaskId(null)}
                    className="task-time-select-inline"
                    aria-label={`Set time for "${task.text}"`}
                    style={{ marginTop: 2, marginLeft: 8, minWidth: 90 }}
                    autoFocus
                  >
                    <option value="" disabled>
                      --:--
                    </option>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime12Hour(t)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="task-time-display"
                    tabIndex={0}
                    style={{
                      marginTop: 2,
                      marginLeft: 8,
                      minWidth: 90,
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                    onClick={() => setEditingTimeTaskId(task.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ")
                        setEditingTimeTaskId(task.id);
                    }}
                    aria-label={`Edit time for "${task.text}", current time ${formatTime12Hour(task.time)}`}
                    role="button"
                  >
                    {formatTime12Hour(task.time)}
                  </span>
                )}
              </div>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="delete-task-btn"
                aria-label={`Delete "${task.text}"`}
                title="Delete task"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    onDeleteTask(task.id);
                  }
                }}
              >
                ×
              </button>
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
  currentTime: PropTypes.string,
};

export default React.memo(TaskList);