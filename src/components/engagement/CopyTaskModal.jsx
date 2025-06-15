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

// Returns DD-MM-YYYY for internal use
const getTodayStrInternal = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const CopyTaskModal = ({
  isOpen,
  onClose,
  allTasksByDate, // Renamed from 'tasks' to reflect new structure, keys are DD-MM-YYYY
  targetDate, // DD-MM-YYYY
  onCopyTasks,
  activityData, // Keys are DD-MM-YYYY
}) => {
  const [sourceDate, setSourceDate] = useState(getTodayStrInternal()); // DD-MM-YYYY
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [displayDate, setDisplayDate] = useState(() => new Date()); // For the modal's calendar
  const modalContentRef = useRef(null);

  // Filter tasks from the source date that are NOT already on the target date
  const selectableTasks = useMemo(() => {
    if (!sourceDate || !targetDate || !allTasksByDate) return [];

    const tasksOnSourceDate = allTasksByDate[sourceDate] || []; // sourceDate is DD-MM-YYYY
    const existingTaskTextsOnTargetDate = new Set( // Ensure task.text is a string before processing
      (allTasksByDate[targetDate] || []) // targetDate is DD-MM-YYYY
        .map((task) =>
          typeof task.text === "string" ? task.text.trim().toLowerCase() : ""
        )
    );

    return tasksOnSourceDate.filter(
      (
        task // Ensure task.text is a string before processing
      ) =>
        typeof task.text === "string" &&
        !existingTaskTextsOnTargetDate.has(task.text.trim().toLowerCase())
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

  const handleCopyButtonClick = useCallback(() => {
    if (selectedTaskIds.size > 0) {
      const tasksToCopyDetails = Array.from(selectedTaskIds)
        .map((id) =>
          (allTasksByDate[sourceDate] || []).find((task) => task.id === id)
        ) // Get from sourceDate's tasks
        .filter(Boolean);

      onCopyTasks(tasksToCopyDetails); // targetDate is already known by EngagementPage
      setSelectedTaskIds(new Set());
      onClose();
    }
  }, [selectedTaskIds, allTasksByDate, sourceDate, onCopyTasks, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedTaskIds(new Set());
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const todayDateObj = new Date();
      setDisplayDate(todayDateObj); // Set calendar view to current month/year
      setSourceDate(getTodayStrInternal()); // Set selected source day to today (DD-MM-YYYY)

      setSelectedTaskIds(new Set());
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
    setSourceDate(getTodayStrInternal()); // DD-MM-YYYY
  }, []);

  const handleModalCalendarDayClick = useCallback((dateStr_DD_MM_YYYY) => {
    setSourceDate(dateStr_DD_MM_YYYY);
    // Update displayDate to reflect the month/year of the clicked date
    const [day, month, year] = dateStr_DD_MM_YYYY.split("-").map(Number);
    setDisplayDate(new Date(year, month - 1, day));
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Copy Tasks from Another Day"
    >
      <div
        className="copy-task-modal-content"
        ref={modalContentRef}
        tabIndex={-1} /* Make it focusable */
      >
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
                  <li key={task.id} className="copy-task-item">
                    <input
                      type="checkbox"
                      id={`copy-task-${task.id}`}
                      checked={selectedTaskIds.has(task.id)}
                      onChange={() => handleToggleTaskSelection(task.id)}
                      aria-labelledby={`copy-task-label-${task.id}`}
                    />
                    <label
                      id={`copy-task-label-${task.id}`}
                      htmlFor={`copy-task-${task.id}`}
                    >
                      {task.time && <span>{task.time} - </span>}
                      {task.text}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
