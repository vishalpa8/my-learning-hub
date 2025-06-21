// CopyTaskModal.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import Modal from "../shared/Modal";
import ActivityCalendar from "./ActivityCalendar";
import { differenceInDays, addDays, format } from "date-fns";
import {
  isWithinInterval,
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
  parseYYYYMMDDToDateObj,
  convertDDMMYYYYtoYYYYMMDD,
} from "../../utils/dateHelpers"; // Centralized date helpers
import { v4 as uuidv4 } from "uuid";
import "./CopyTaskModal.css"; // Import the dedicated CSS file

const CopyTaskModal = ({
  isOpen,
  onClose,
  allTasksByDate, // Renamed from 'tasks' to reflect new structure, keys are DD-MM-YYYY
  targetDate, // DD-MM-YYYY
  onCopyTasks,
  activityData, // Keys are DD-MM-YYYY
}) => {
  const [sourceDate, setSourceDate] = useState(dateToDDMMYYYY(new Date())); // DD-MM-YYYY
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [displayDate, setDisplayDate] = useState(() => new Date()); // For the modal's calendar
  const modalContentRef = useRef(null);

  // New states for End Date
  const [showEndDateInput, setShowEndDateInput] = useState(false);
  const [copiedTaskEndDate, setCopiedTaskEndDate] = useState(""); // YYYY-MM-DD

  // Filter tasks from the source date that are NOT already on the target date
  const selectableTasks = useMemo(() => {
    const sourceDateObj = parseDDMMYYYYToDateObj(sourceDate);

    const tasksOnSourceDate = Object.values(allTasksByDate)
      .flat()
      .filter((task) => {
        const taskStart = parseDDMMYYYYToDateObj(task.date);
        const taskEnd = task.endDate
          ? parseYYYYMMDDToDateObj(task.endDate)
          : taskStart;
        return (
          taskStart instanceof Date &&
          !isNaN(taskStart) &&
          taskEnd instanceof Date &&
          !isNaN(taskEnd) &&
          isWithinInterval(sourceDateObj, { start: taskStart, end: taskEnd })
        );
      });
    // Get all tasks that are *active* on the targetDate, regardless of their start date
    const targetDateObj = parseDDMMYYYYToDateObj(targetDate);
    const tasksActiveOnTargetDate = Object.values(allTasksByDate)
      .flat()
      .filter((task) => {
        const taskStart = parseDDMMYYYYToDateObj(task.date);
        const taskEnd = task.endDate
          ? parseYYYYMMDDToDateObj(task.endDate)
          : taskStart;
        // Ensure taskStart and taskEnd are valid Date objects before using isWithinInterval
        return (
          taskStart instanceof Date &&
          !isNaN(taskStart) &&
          taskEnd instanceof Date &&
          !isNaN(taskEnd) &&
          isWithinInterval(targetDateObj, { start: taskStart, end: taskEnd })
        );
      });

    // Create a set of texts for tasks already active on the target date
    const existingActiveTaskTextsOnTargetDate = new Set(
      tasksActiveOnTargetDate.map((task) =>
        typeof task.text === "string" ? task.text.trim().toLowerCase() : ""
      )
    );

    return tasksOnSourceDate.filter(
      (task) =>
        typeof task.text === "string" &&
        !existingActiveTaskTextsOnTargetDate.has(task.text.trim().toLowerCase())
    );
  }, [allTasksByDate, sourceDate, targetDate]);

  const handleToggleTaskSelection = useCallback((taskId) => {
    setSelectedTaskIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  }, []);

  const areAllTasksSelected = useMemo(
    () =>
      selectableTasks.length > 0 &&
      selectedTaskIds.size === selectableTasks.length,
    [selectableTasks, selectedTaskIds]
  );

  const handleSelectAllToggle = useCallback(() => {
    if (selectableTasks.length === 0) return;

    const allSelectableIds = new Set(selectableTasks.map((task) => task.id));
    if (areAllTasksSelected) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(allSelectableIds);
    }
  }, [selectableTasks, areAllTasksSelected]);

  const copyableDaysSet = useMemo(() => {
    // For each date in allTasksByDate, check if at least one task is copyable to targetDate
    const days = new Set();
    Object.entries(allTasksByDate).forEach(([dateKey, tasks]) => {
      const dateObj = parseDDMMYYYYToDateObj(dateKey);

      // For each task on this date, check if it's not already active on the target date
      const hasCopyable = tasks.some((task) => {
        // Check if this task is active on the source date (multi-day support)
        const taskStart = parseDDMMYYYYToDateObj(task.date);
        const taskEnd = task.endDate
          ? parseYYYYMMDDToDateObj(task.endDate)
          : taskStart;
        if (
          !(taskStart instanceof Date) ||
          isNaN(taskStart) ||
          !(taskEnd instanceof Date) ||
          isNaN(taskEnd) ||
          !isWithinInterval(dateObj, { start: taskStart, end: taskEnd })
        ) {
          return false;
        }

        // Now check if a task with the same text is already active on the target date
        const targetDateObj = parseDDMMYYYYToDateObj(targetDate);
        const isAlreadyOnTarget = Object.values(allTasksByDate)
          .flat()
          .some((t) => {
            const tStart = parseDDMMYYYYToDateObj(t.date);
            const tEnd = t.endDate ? parseYYYYMMDDToDateObj(t.endDate) : tStart;
            return (
              typeof t.text === "string" &&
              t.text.trim().toLowerCase() === task.text.trim().toLowerCase() &&
              tStart instanceof Date &&
              !isNaN(tStart) &&
              tEnd instanceof Date &&
              !isNaN(tEnd) &&
              isWithinInterval(targetDateObj, { start: tStart, end: tEnd })
            );
          });

        return !isAlreadyOnTarget;
      });

      if (hasCopyable) {
        days.add(dateKey);
      }
    });
    return days;
  }, [allTasksByDate, targetDate]);

  const handleCopyButtonClick = useCallback(() => {
    if (selectedTaskIds.size > 0) {
      const tasksToCopyDetails = Array.from(selectedTaskIds)
        .map((id) =>
          (allTasksByDate[sourceDate] || []).find((task) => task.id === id)
        ) // Get from sourceDate's tasks
        .filter(Boolean)
        .map((task) => ({
          ...task,
          id: uuidv4(), // Generate a new unique ID for the copied task
          completions: {}, // Reset completions for the copied task
          subtasks: (task.subtasks || []).map((st) => ({
            ...st,
            id: uuidv4(), // New unique ID for each copied subtask
            completed: false, // Subtasks are always copied as incomplete
          })),
          endDate: (() => {
            // If user explicitly sets an end date, use it.
            if (showEndDateInput && copiedTaskEndDate) {
              return copiedTaskEndDate;
            }
            // If the original task was multi-day, calculate the new end date based on duration.
            if (task.endDate) {
              const startDateObj = parseDDMMYYYYToDateObj(task.date);
              const endDateObj = parseYYYYMMDDToDateObj(task.endDate);
              const durationInDays = differenceInDays(endDateObj, startDateObj);
              const newStartDateObj = parseDDMMYYYYToDateObj(targetDate);
              const newEndDateObj = addDays(newStartDateObj, durationInDays);
              return format(newEndDateObj, "yyyy-MM-dd");
            }
            // Otherwise, it's a single-day task with no end date.
            return null;
          })(),
        }));
      onCopyTasks(tasksToCopyDetails); // targetDate is already known by EngagementPage
      setSelectedTaskIds(new Set());
      onClose();
    }
  }, [
    selectedTaskIds,
    allTasksByDate,
    sourceDate,
    onCopyTasks,
    onClose,
    showEndDateInput,
    copiedTaskEndDate,
  ]);

  const handleCancel = useCallback(() => {
    setSelectedTaskIds(new Set());
    setShowEndDateInput(false); // Reset end date visibility
    setCopiedTaskEndDate(""); // Reset end date value
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const todayDateObj = new Date();
      setDisplayDate(todayDateObj); // Set calendar view to current month/year
      setSourceDate(dateToDDMMYYYY(new Date())); // Set selected source day to today (DD-MM-YYYY)

      setSelectedTaskIds(new Set());
      setShowEndDateInput(false); // Reset end date visibility
      setCopiedTaskEndDate(""); // Reset end date value
      setTimeout(() => modalContentRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handlePreviousMonth = useCallback(() => {
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setDisplayDate(today);
    setSourceDate(dateToDDMMYYYY(new Date())); // DD-MM-YYYY
  }, []);

  const handleModalCalendarDayClick = useCallback((dateStr_DD_MM_YYYY) => {
    setSourceDate(dateStr_DD_MM_YYYY);
    // Update displayDate to reflect the month/year of the clicked date
    setDisplayDate(parseDDMMYYYYToDateObj(dateStr_DD_MM_YYYY));
    setSelectedTaskIds(new Set());
  }, []); // State setters from useState are stable

  // Handle Enter key to copy if tasks are selected
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen && event.key === "Enter" && selectedTaskIds.size > 0) {
        event.preventDefault(); // Prevent any default action if inside a form
        handleCopyButtonClick();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedTaskIds, handleCopyButtonClick]);

  const minEndDateForCopiedTask = useMemo(() => {
    // End date for copied task should not be before the target date it's copied to
    return convertDDMMYYYYtoYYYYMMDD(targetDate);
  }, [targetDate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      customClass="copy-task-modal" // Custom class for sizing
    >
      <div
        className="copy-task-modal-content"
        ref={modalContentRef}
        tabIndex={-1} /* Make it focusable */
      >
        <div className="copy-task-modal-main-area">
          <div className="copy-task-modal-calendar">
            <h4 id="source-date-calendar-label">Select Source Date</h4>
            <ActivityCalendar
              activity={activityData}
              year={displayDate.getFullYear()}
              month={displayDate.getMonth()}
              onPrevMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onToday={handleGoToToday}
              selectedDay={sourceDate}
              onDayClick={handleModalCalendarDayClick}
              showLegend={false}
              showFooter={false}
              isCopyModeActive={true}
              aria-labelledby="source-date-calendar-label"
              copyableDays={copyableDaysSet} // <-- pass this prop
            />
          </div>

          <div className="copy-task-modal-list">
            <h4>
              Tasks on {sourceDate} (Select to Copy to {targetDate})
            </h4>
            {selectableTasks.length > 0 && (
              <div className="copy-task-select-all-action">
                <button
                  onClick={handleSelectAllToggle}
                  className="btn-link"
                  disabled={selectableTasks.length === 0}
                >
                  {areAllTasksSelected ? "Deselect All" : "Select All"} (
                  {selectableTasks.length})
                </button>
              </div>
            )}
            <div aria-live="polite">
              {selectableTasks.length === 0 ? (
                <p>
                  No tasks available on {sourceDate} to copy to {targetDate}.
                </p>
              ) : (
                <ul>
                  {selectableTasks.map((task) => (
                    <li key={task.id}>
                      <label
                        className={`copy-task-item ${
                          selectedTaskIds.has(task.id) ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`copy-task-${task.id}`}
                          checked={selectedTaskIds.has(task.id)}
                          onChange={() => handleToggleTaskSelection(task.id)}
                          aria-labelledby={`copy-task-label-${task.id}`}
                        />
                        <span
                          className="copy-task-label-text"
                          id={`copy-task-label-${task.id}`}
                        >
                          {task.time && (
                            <span className="copy-task-time">
                              {task.time} -{" "}
                            </span>
                          )}
                          {task.text}
                        </span>{" "}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* New End Date Section */}
        <div className="copy-task-options">
          {!showEndDateInput && (
            <button
              type="button"
              onClick={() => setShowEndDateInput(true)}
              className="btn-outline btn-small"
            >
              + Add End Date for Copied Tasks
            </button>
          )}
          {showEndDateInput && (
            <div className="copy-task-end-date-section">
              <label htmlFor="copy-task-end-date">End Date:</label>
              <input
                id="copy-task-end-date"
                type="date"
                value={copiedTaskEndDate}
                onChange={(e) => setCopiedTaskEndDate(e.target.value)}
                min={minEndDateForCopiedTask}
                className="copy-task-end-date-input"
              />
              <button
                type="button"
                onClick={() => {
                  setShowEndDateInput(false);
                  setCopiedTaskEndDate("");
                }} // Clear date when hiding
                className="btn-link btn-small"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button
            onClick={handleCopyButtonClick}
            disabled={selectedTaskIds.size === 0}
            className="btn-primary"
            aria-disabled={selectedTaskIds.size === 0}
          >
            Copy Selected ({selectedTaskIds.size})
          </button>
          <button onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

CopyTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  allTasksByDate: PropTypes.object.isRequired, // Changed from tasks: PropTypes.array
  targetDate: PropTypes.string.isRequired,
  onCopyTasks: PropTypes.func.isRequired,
  activityData: PropTypes.object.isRequired,
};

export default CopyTaskModal;
