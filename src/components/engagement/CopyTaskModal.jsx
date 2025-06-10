// CopyTaskModal.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import Modal from "../shared/Modal"; // Assuming you have a shared Modal component
import ActivityCalendar from "./ActivityCalendar";

// Returns YYYY-MM-DD for internal use
const getTodayStrInternal = () => new Date().toISOString().split("T")[0];

// Formats YYYY-MM-DD to DD-MM-YYYY for display
const formatDateForDisplay = (dateStr_YYYY_MM_DD) => {
  if (!dateStr_YYYY_MM_DD || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr_YYYY_MM_DD)) {
    return dateStr_YYYY_MM_DD;
  }
  const [year, month, day] = dateStr_YYYY_MM_DD.split("-");
  return `${day}-${month}-${year}`;
};

const CopyTaskModal = ({
  isOpen,
  onClose,
  tasks,
  targetDate,
  onCopyTasks,
  activityData,
}) => {
  const [sourceDate, setSourceDate] = useState(getTodayStrInternal());
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [displayDate, setDisplayDate] = useState(() => new Date()); // For the modal's calendar
  const modalContentRef = useRef(null);

  // Filter tasks from the source date that are NOT already on the target date
  const selectableTasks = useMemo(() => {
    if (!sourceDate || !targetDate || !tasks) return [];

    const tasksOnSourceDate = tasks.filter((task) => task.date === sourceDate);
    const existingTaskTextsOnTargetDate = new Set(
      tasks
        .filter((task) => task.date === targetDate)
        .map((task) => task.text.trim().toLowerCase())
    );

    return tasksOnSourceDate.filter(
      (task) =>
        !existingTaskTextsOnTargetDate.has(task.text.trim().toLowerCase())
    );
  }, [tasks, sourceDate, targetDate]);

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
        .map((id) => tasks.find((task) => task.id === id))
        .filter(Boolean);

      onCopyTasks(tasksToCopyDetails); // targetDate is already known by EngagementPage
      setSelectedTaskIds(new Set());
      onClose();
    }
  }, [selectedTaskIds, tasks, onCopyTasks, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedTaskIds(new Set());
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const today = getTodayStrInternal();
      setSourceDate(today);
      setDisplayDate(
        new Date(
          today.split("-")[0],
          today.split("-")[1] - 1,
          today.split("-")[2]
        )
      );
      setSelectedTaskIds(new Set());
      // Focus the modal content for keyboard events after it's rendered.
      // Using setTimeout ensures the focus call happens after the current rendering cycle.
      // This is often necessary when an element's availability or focusability changes due to state updates.
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
    setSourceDate(getTodayStrInternal());
  }, []);

  const handleModalCalendarDayClick = useCallback((dateStr) => {
    setSourceDate(dateStr);
    setSelectedTaskIds(new Set());
  }, []);

  // Handle Enter key to copy if tasks are selected
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen && event.key === "Enter" && selectedTaskIds.size > 0) {
        event.preventDefault(); // Prevent any default action if inside a form
        handleCopyButtonClick();
      }
    };
    // Listen on the document when the modal is open
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
          <h4>Select Source Date</h4>
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
            isCopyModeActive={true} // Indicate that clicks are for selecting source
          />
        </div>

        <div className="copy-task-modal-list">
          <h4>
            Tasks on {formatDateForDisplay(sourceDate)} (Select to Copy to{" "}
            {formatDateForDisplay(targetDate)})
          </h4>
          {selectableTasks.length > 0 && (
            <div className="copy-task-select-all-action">
              <button onClick={handleSelectAllToggle} className="btn-link">
                {areAllTasksSelected ? "Deselect All" : "Select All"} (
                {selectableTasks.length})
              </button>
            </div>
          )}
          {selectableTasks.length === 0 ? (
            <p>
              No tasks available on {formatDateForDisplay(sourceDate)} to copy
              to {formatDateForDisplay(targetDate)}.
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
        >
          Copy Selected ({selectedTaskIds.size})
        </button>
        <button onClick={handleCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

CopyTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tasks: PropTypes.array.isRequired,
  targetDate: PropTypes.string.isRequired,
  onCopyTasks: PropTypes.func.isRequired,
  activityData: PropTypes.object.isRequired,
};

export default CopyTaskModal;
