// CopyTaskModal.jsx
import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useReducer,
} from "react";
import PropTypes from "prop-types";
import Modal from "../shared/Modal";
import ActivityCalendar from "./ActivityCalendar";
import { differenceInDays, addDays } from "date-fns";
import {
  isWithinInterval,
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
} from "../../utils/dateHelpers";
import { v4 as uuidv4 } from "uuid";
import "./CopyTaskModal.css";

/**
 * Calculates the end date for a copied task based on the original task's duration
 * or an explicitly provided end date.
 */
const calculateCopiedTaskEndDate = (
  originalTask,
  newStartDate_DDMMYYYY,
  explicitEndDate_DDMMYYYY
) => {
  if (explicitEndDate_DDMMYYYY) {
    return explicitEndDate_DDMMYYYY;
  }
  if (originalTask.endDate) {
    const originalStartDateObj = parseDDMMYYYYToDateObj(originalTask.date);
    const originalEndDateObj = parseDDMMYYYYToDateObj(originalTask.endDate);
    const durationInDays = differenceInDays(
      originalEndDateObj,
      originalStartDateObj
    );
    const newStartDateObj = parseDDMMYYYYToDateObj(newStartDate_DDMMYYYY);
    const newEndDateObj = addDays(newStartDateObj, durationInDays);
    return dateToDDMMYYYY(newEndDateObj);
  }
  return null;
};

// Centralized state management with useReducer
const initialState = {
  sourceDate: dateToDDMMYYYY(new Date()),
  selectedTaskIds: new Set(),
  displayDate: new Date(),
  showEndDateInput: false,
  copiedTaskEndDate: "",
};

function copyTaskReducer(state, action) {
  switch (action.type) {
    case "SET_SOURCE_DATE":
      return {
        ...state,
        sourceDate: action.payload,
        displayDate: parseDDMMYYYYToDateObj(action.payload),
        selectedTaskIds: new Set(), // Reset selection on date change
      };
    case "SET_DISPLAY_DATE":
      return { ...state, displayDate: action.payload };
    case "TOGGLE_TASK_SELECTION": {
      const newSelected = new Set(state.selectedTaskIds);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedTaskIds: newSelected };
    }
    case "SET_SELECTED_TASKS":
      return { ...state, selectedTaskIds: action.payload };
    case "SET_END_DATE_VISIBILITY":
      return {
        ...state,
        showEndDateInput: action.payload,
        // Clear date value when hiding the input
        copiedTaskEndDate: action.payload ? state.copiedTaskEndDate : "",
      };
    case "SET_COPIED_END_DATE":
      return { ...state, copiedTaskEndDate: action.payload };
    case "RESET":
      // When resetting, set display date and source date to today
      return {
        ...initialState,
        displayDate: new Date(),
        sourceDate: dateToDDMMYYYY(new Date()),
      };
    default:
      return state;
  }
}

const CopyTaskModal = ({
  isOpen,
  onClose,
  allTasksByDate,
  targetDate,
  onCopyTasks,
  activityData,
}) => {
  const [state, dispatch] = useReducer(copyTaskReducer, initialState);
  const {
    sourceDate,
    selectedTaskIds,
    displayDate,
    showEndDateInput,
    copiedTaskEndDate,
  } = state;
  const modalContentRef = useRef(null);

  // Memoized calculations for performance
  const allTasks = useMemo(
    () => Object.values(allTasksByDate).flat(),
    [allTasksByDate]
  );

  const isTaskActiveOnDate = useCallback((task, dateObj) => {
    const taskStart = parseDDMMYYYYToDateObj(task.date);
    const taskEnd = task.endDate
      ? parseDDMMYYYYToDateObj(task.endDate)
      : taskStart;
    return (
      taskStart instanceof Date &&
      !isNaN(taskStart) &&
      taskEnd instanceof Date &&
      !isNaN(taskEnd) &&
      isWithinInterval(dateObj, { start: taskStart, end: taskEnd })
    );
  }, []);

  const existingTaskTextsOnTargetDate = useMemo(() => {
    const targetDateObj = parseDDMMYYYYToDateObj(targetDate);
    return new Set(
      allTasks
        .filter((task) => isTaskActiveOnDate(task, targetDateObj))
        .map((task) =>
          typeof task.text === "string" ? task.text.trim().toLowerCase() : ""
        )
    );
  }, [allTasks, targetDate, isTaskActiveOnDate]);

  const selectableTasks = useMemo(() => {
    const sourceDateObj = parseDDMMYYYYToDateObj(sourceDate);
    const tasksOnSourceDate = allTasks.filter((task) =>
      isTaskActiveOnDate(task, sourceDateObj)
    );
    const filteredTasks = tasksOnSourceDate.filter(
      (task) =>
        typeof task.text === "string" &&
        !existingTaskTextsOnTargetDate.has(task.text.trim().toLowerCase())
    );
    // Sort tasks for better readability in the UI
    return filteredTasks.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return a.text.localeCompare(b.text);
    });
  }, [allTasks, sourceDate, existingTaskTextsOnTargetDate, isTaskActiveOnDate]);

  const copyableDaysSet = useMemo(() => {
    const days = new Set();
    allTasks.forEach((task) => {
      const isCopyable =
        typeof task.text === "string" &&
        !existingTaskTextsOnTargetDate.has(task.text.trim().toLowerCase());
      if (isCopyable) {
        const taskStart = parseDDMMYYYYToDateObj(task.date);
        const taskEnd = task.endDate
          ? parseDDMMYYYYToDateObj(task.endDate)
          : taskStart;
        if (
          taskStart instanceof Date &&
          !isNaN(taskStart) &&
          taskEnd instanceof Date &&
          !isNaN(taskEnd)
        ) {
          let currentDate = taskStart;
          while (currentDate <= taskEnd) {
            days.add(dateToDDMMYYYY(currentDate));
            currentDate = addDays(currentDate, 1);
          }
        }
      }
    });
    return days;
  }, [allTasks, existingTaskTextsOnTargetDate]);

  // Event Handlers
  const handleToggleTaskSelection = useCallback((taskId) => {
    dispatch({ type: "TOGGLE_TASK_SELECTION", payload: taskId });
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
      dispatch({ type: "SET_SELECTED_TASKS", payload: new Set() });
    } else {
      dispatch({ type: "SET_SELECTED_TASKS", payload: allSelectableIds });
    }
  }, [selectableTasks, areAllTasksSelected]);

  const handleCopyButtonClick = useCallback(() => {
    if (selectedTaskIds.size > 0) {
      const tasksToCopyDetails = allTasks
        .filter((task) => selectedTaskIds.has(task.id))
        .map((task) => {
          const copiedTask = structuredClone(task);
          const newEndDate = calculateCopiedTaskEndDate(
            task,
            targetDate,
            showEndDateInput ? copiedTaskEndDate : null
          );
          copiedTask.id = uuidv4();
          copiedTask.date = targetDate;
          copiedTask.endDate = newEndDate;
          copiedTask.completions = {};
          copiedTask.subtasks = (copiedTask.subtasks || []).map((subtask) => ({
            ...subtask,
            id: uuidv4(),
            date: targetDate,
            completed: false,
          }));
          return copiedTask;
        });
      onCopyTasks(tasksToCopyDetails);
      dispatch({ type: "RESET" });
      onClose();
    }
  }, [
    selectedTaskIds,
    allTasks,
    onCopyTasks,
    onClose,
    showEndDateInput,
    copiedTaskEndDate,
    targetDate,
  ]);

  const handleCancel = useCallback(() => {
    dispatch({ type: "RESET" });
    onClose();
  }, [onClose]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET" });
      setTimeout(() => modalContentRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handlePreviousMonth = useCallback(() => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    dispatch({ type: "SET_DISPLAY_DATE", payload: newDate });
  }, [displayDate]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    dispatch({ type: "SET_DISPLAY_DATE", payload: newDate });
  }, [displayDate]);

  const handleGoToToday = useCallback(() => {
    dispatch({ type: "SET_SOURCE_DATE", payload: dateToDDMMYYYY(new Date()) });
  }, []);

  const handleModalCalendarDayClick = useCallback((dateStr_DD_MM_YYYY) => {
    dispatch({ type: "SET_SOURCE_DATE", payload: dateStr_DD_MM_YYYY });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen && event.key === "Enter" && selectedTaskIds.size > 0) {
        event.preventDefault();
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
    return targetDate;
  }, [targetDate]);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} customClass="copy-task-modal">
      <div
        className="copy-task-modal-content"
        ref={modalContentRef}
        tabIndex={-1}
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
              copyableDays={copyableDaysSet}
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
                  {selectableTasks.map((task, index) => {
                    const isFirstUntimed =
                      index > 0 &&
                      !task.time &&
                      selectableTasks[index - 1].time;
                    return (
                      <React.Fragment key={task.id}>
                        {isFirstUntimed && (
                          <li
                            className="copy-task-separator"
                            aria-hidden="true"
                          >
                            <hr />
                            <span>All-day Tasks</span>
                            <hr />
                          </li>
                        )}
                        <li>
                          <label
                            className={`copy-task-item ${
                              selectedTaskIds.has(task.id) ? "selected" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`copy-task-${task.id}`}
                              checked={selectedTaskIds.has(task.id)}
                              onChange={() =>
                                handleToggleTaskSelection(task.id)
                              }
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
                            </span>
                          </label>
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="copy-task-options">
          {!showEndDateInput && (
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_END_DATE_VISIBILITY", payload: true })
              }
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
                onChange={(e) =>
                  dispatch({
                    type: "SET_COPIED_END_DATE",
                    payload: e.target.value,
                  })
                }
                min={minEndDateForCopiedTask}
                className="copy-task-end-date-input"
              />
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_END_DATE_VISIBILITY", payload: false })
                }
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
  allTasksByDate: PropTypes.object.isRequired,
  targetDate: PropTypes.string.isRequired,
  onCopyTasks: PropTypes.func.isRequired,
  activityData: PropTypes.object.isRequired,
};

export default CopyTaskModal;
