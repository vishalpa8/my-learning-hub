// EngagementPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import TaskList from "../components/engagement/TaskList";
import ActivityCalendar from "../components/engagement/ActivityCalendar";
import {
  ENGAGEMENT_TASKS_KEY,
  ENGAGEMENT_ACTIVITY_KEY,
} from "../constants/localStorageKeys"; // Assuming these constants exist
import { useIndexedDb } from "../hooks/useIndexedDb";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval, // Added for multi-day task expansion
} from "date-fns";
import {
  isWithinInterval,
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
  parseYYYYMMDDToDateObj,
  convertDDMMYYYYtoYYYYMMDD,
} from "../utils/dateHelpers";
import { v4 as uuidv4 } from "uuid";
import isEqual from "fast-deep-equal";
import "../components/engagement/EngagementPage.css";
import CopyTaskModal from "../components/engagement/CopyTaskModal";
import TaskDetailsModal from "../components/engagement/TaskDetailsModal";
import { useLocation } from "react-router-dom"; // Import useLocation
import Modal from "../components/shared/Modal"; // Import the generic Modal for confirmation



const calculateActivityForDate = (tasksForDateArray) => {
  const validTasksArray = Array.isArray(tasksForDateArray)
    ? tasksForDateArray
    : [];
  const totalOnDate = validTasksArray.length; // This is now an array of task instances
  const completedOnDate = validTasksArray.filter(
    (taskInstance) => taskInstance.isCompletedOnThisDay
  ).length;

  // If there are tasks but none are completed, it's 'worked' not 'none'
  let activityLevel = "none";
  if (totalOnDate > 0) {
    if (completedOnDate === totalOnDate) {
      activityLevel = "high"; // Assuming 100% completion is high
    } else if (completedOnDate >= totalOnDate * 0.5) {
      activityLevel = "medium";
    } else if (completedOnDate > 0) {
      activityLevel = "low";
    } else {
      activityLevel = "worked"; // Tasks exist, but 0 completed
    }
  }

  return {
    tasksCompleted: completedOnDate,
    worked: totalOnDate > 0, // Worked if there are any tasks for the day
    totalTasks: totalOnDate,
    activityLevel: activityLevel, // Use the refined activityLevel
  };
};

const EngagementPage = () => {
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [taskToViewDetails, setTaskToViewDetails] = useState(null);
  const [tasksUserChoseToKeepOpen, setTasksUserChoseToKeepOpen] = useState({});
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [viewMode, setViewMode] = useState("date"); // 'date', 'week', 'month'

  const [tasksByDate, setTasksByDate] = useIndexedDb(ENGAGEMENT_TASKS_KEY, {});
  const [activityData, setActivityData] = useIndexedDb(
    ENGAGEMENT_ACTIVITY_KEY,
    {}
  );

  const location = useLocation();
  const initialDate = location.state?.date || dateToDDMMYYYY(new Date());

  const [displayDate, setDisplayDate] = useState(() =>
    parseDDMMYYYYToDateObj(initialDate)
  );
  const [selectedDay, setSelectedDay] = useState(initialDate);

  const today_DD_MM_YYYY = useMemo(() => dateToDDMMYYYY(new Date()), []);

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );

  const allTasks = useMemo(() => {
    if (!tasksByDate || typeof tasksByDate !== "object") return [];
    return Object.values(tasksByDate).flat();
  }, [tasksByDate]);

  useEffect(() => {
    const newActivityData = {};

    // Get all days in the visible month for the calendar
    const calendarStart = startOfMonth(displayDate);
    const calendarEnd = endOfMonth(displayDate);
    const allCalendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
    const uniqueDates = allCalendarDays.map(dateToDDMMYYYY);

    for (const dateKey of uniqueDates) {
      const dateObj = parseDDMMYYYYToDateObj(dateKey);
      const tasksOnThisDay = allTasks.filter((task) => {
        const taskStart = parseDDMMYYYYToDateObj(task.date);
        const taskEnd = task.endDate
          ? parseYYYYMMDDToDateObj(task.endDate)
          : taskStart;
        return isWithinInterval(dateObj, { start: taskStart, end: taskEnd });
      });
      const taskInstances = tasksOnThisDay.map((task) => ({
        ...task,
        isCompletedOnThisDay: !!(task.completions && task.completions[dateKey]),
      }));
      newActivityData[dateKey] = calculateActivityForDate(taskInstances);
    }
    // Deep compare to prevent unnecessary state updates and IndexedDB writes
    if (!isEqual(activityData, newActivityData)) {
      setActivityData(newActivityData);
    }
  }, [tasksByDate, setActivityData, allTasks, displayDate]);

  const handleViewTaskDetails = useCallback(
    (taskInstance) => {
      // The instance has day-specific info. We need the master task for editing.
      const masterTask = allTasks.find((t) => t.id === taskInstance.id);

      if (masterTask) {
        // Combine the master task's data with the instance's display-specific data
        // so the modal has all the context it needs.
        const taskForModal = {
          ...masterTask,
          displayDate: taskInstance.displayDate,
          isCompletedOnThisDay: taskInstance.isCompletedOnThisDay,
        };
        setTaskToViewDetails(taskForModal);
        setIsTaskDetailsModalOpen(true);
      }
    },
    [allTasks] // Depends on allTasks now
  );

  const handleCloseTaskDetailsModal = useCallback(() => {
    setIsTaskDetailsModalOpen(false);
    setTaskToViewDetails(null);
  }, []);

  useEffect(() => {
    if (isTaskDetailsModalOpen && taskToViewDetails) {
      const originalTask = allTasks.find((t) => t.id === taskToViewDetails.id);

      if (!originalTask) {
        handleCloseTaskDetailsModal();
        return;
      }

      const newTaskForModal = {
        ...originalTask,
        displayDate: taskToViewDetails.displayDate,
        isCompletedOnThisDay: !!(
          originalTask.completions &&
          originalTask.completions[taskToViewDetails.displayDate]
        ),
      };
      // Only update the state if the content has actually changed to prevent infinite loops.
      if (
        JSON.stringify(newTaskForModal) !== JSON.stringify(taskToViewDetails)
      ) {
        setTaskToViewDetails(newTaskForModal);
      }
    }
  }, [
    allTasks,
    isTaskDetailsModalOpen,
    taskToViewDetails,
    handleCloseTaskDetailsModal,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Centralized task update logic
  const updateTaskInState = useCallback(
    (taskId, updateFn) => {
      setTasksByDate((prevTasksByDate) => {
        const newTasksByDate = { ...prevTasksByDate };
        let taskFoundAndUpdated = false;

        // Iterate through all date keys to find the original task
        for (const dateKey in newTasksByDate) {
          const tasksOnDate = newTasksByDate[dateKey];
          const taskIndex = tasksOnDate.findIndex((t) => t.id === taskId);

          if (taskIndex !== -1) {
            const updatedTasksOnDate = [...tasksOnDate];
            const originalTask = updatedTasksOnDate[taskIndex];
            updatedTasksOnDate[taskIndex] = updateFn(originalTask); // Apply the update function
            newTasksByDate[dateKey] = updatedTasksOnDate;
            taskFoundAndUpdated = true;
            break; // Found and updated, exit loop
          }
        }
        // Perform a deep comparison before returning the new state
        // This prevents unnecessary updates to IndexedDB if the content hasn't truly changed.
        if (
          taskFoundAndUpdated &&
          JSON.stringify(newTasksByDate) !== JSON.stringify(prevTasksByDate)
        ) {
          return newTasksByDate;
        }
        return prevTasksByDate;
      });
    },
    [setTasksByDate]
  );

  const addTaskWithDetails = useCallback(
    ({ text, time, description, subtasks, link, endDate }) => {
      // In week/month view, new tasks should default to today's date
      const targetDate = viewMode === "date" ? selectedDay : today_DD_MM_YYYY;
      const newTask = {
        id: Date.now(),
        text,
        // Tasks are no longer "completed" globally, but per day.
        // `completions` will store { "DD-MM-YYYY": true/false }
        completions: {},
        date: targetDate, // This is the startDate, in DD-MM-YYYY
        time: time || null,
        description: description || null,
        subtasks: subtasks || [],
        link: link || null,
        // If no endDate is provided, default it to be the same as the start date.
        // This makes the data model more explicit for single-day tasks.
        endDate: endDate || convertDDMMYYYYtoYYYYMMDD(targetDate), // In YYYY-MM-DD
      };
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const currentTasksForDay = currentTasksByDate[targetDate] || [];
        const updatedTasksForDay = [...currentTasksForDay, newTask];
        return {
          ...currentTasksByDate,
          [targetDate]: updatedTasksForDay,
        };
      });
    },
    [selectedDay, setTasksByDate, viewMode, today_DD_MM_YYYY]
  );

  const toggleTask = useCallback(
    (id, dateKey) => {
      if (!dateKey) {
        console.error("toggleTask: dateKey is undefined!");
        return;
      }
      updateTaskInState(id, (task) => {
        const currentCompletions = task.completions || {};
        const newCompletionStatus = !currentCompletions[dateKey];

        return {
          ...task,
          completions: {
            ...currentCompletions,
            [dateKey]: newCompletionStatus,
          },
        };
      });
      // Reset "keep open" flag if user interacts with the main checkbox
      setTasksUserChoseToKeepOpen((prev) => {
        const newFlags = { ...prev };
        if (newFlags[id]) {
          delete newFlags[id];
        }
        return newFlags;
      });
    },
    [updateTaskInState] // `setTasksUserChoseToKeepOpen` is stable
  );

  const handleOpenCopyModal = useCallback(() => {
    setIsCopyModalOpen(true);
  }, []);

  const handleCloseCopyModal = useCallback(() => {
    setIsCopyModalOpen(false);
  }, []);

  const handleCalendarDayClick = useCallback(
    (dateStr_DD_MM_YYYY) => {
      setSelectedDay(dateStr_DD_MM_YYYY);
      setViewMode("date"); // Switch to date view when a day is clicked
    },
    [setViewMode] // Add setViewMode to dependencies
  );

  const handleCopyTasksToCurrentDay = useCallback(
    (tasksToCopyDetails) => {
      const targetDate_DD_MM_YYYY = selectedDay;

      if (
        !tasksToCopyDetails ||
        tasksToCopyDetails.length === 0 ||
        !targetDate_DD_MM_YYYY
      ) {
        return;
      }

      const newTasksToAdd = tasksToCopyDetails.map((task, index) => ({
        ...task,
        id: uuidv4(), // Ensure unique ID
        date: targetDate_DD_MM_YYYY, // New start date for the copied task
        completions: {}, // Copied tasks start with no completions
        description: task.description || null,
        link: task.link || null,
        endDate: task.endDate || null, // endDate is already calculated in CopyTaskModal
        subtasks: (task.subtasks || []).map((st) => ({
          ...st,
          id: Date.now() + Math.random(), // Ensure unique ID for subtasks
          completed: false, // Subtasks are copied as incomplete
        })),
      }));

      if (newTasksToAdd.length > 0) {
        setTasksByDate((prevTasksByDate) => {
          const currentTasksByDate = prevTasksByDate || {};
          const currentTasksForTargetDay =
            currentTasksByDate[targetDate_DD_MM_YYYY] || [];
          const updatedTasksForTargetDay = [
            ...currentTasksForTargetDay,
            ...newTasksToAdd,
          ];
          return {
            ...currentTasksByDate,
            [targetDate_DD_MM_YYYY]: updatedTasksForTargetDay,
          };
        });
      }
    },
    [setTasksByDate, selectedDay]
  );

  const handleDeleteAllTasksForDay = useCallback(() => {
    if (!selectedDay) return;
    const tasksOnSelectedDay = (tasksByDate || {})[selectedDay] || [];
    if (tasksOnSelectedDay.length === 0) {
      return;
    }
    setIsConfirmDeleteAllOpen(true);
  }, [selectedDay, tasksByDate]);

  const confirmDeleteAllTasks = useCallback(() => {
    if (selectedDay) {
      setTasksByDate((prevTasksByDate) => {
        const newTasksByDate = { ...(prevTasksByDate || {}) };
        delete newTasksByDate[selectedDay];
        return newTasksByDate;
      });
    }
    setIsConfirmDeleteAllOpen(false);
  }, [selectedDay, setTasksByDate]);

  const handleUpdateTaskDescription = useCallback(
    (taskId, newDescription) => {
      updateTaskInState(taskId, (task) => ({
        ...task,
        description: newDescription.trim() || null,
      }));
    },
    [updateTaskInState]
  );

  const handleAddSubtask = useCallback(
    (taskId, subtaskText) => {
      updateTaskInState(taskId, (task) => {
        const newSubtask = {
          id: Date.now() + Math.random(),
          text: subtaskText,
          completed: false,
        };
        const modifiedTask = {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask],
        };
        // If adding a subtask to a completed parent, un-complete the parent
        // Note: This now refers to the global 'completed' status of the task, not per-day
        if (
          task.completions &&
          Object.values(task.completions).some((c) => c)
        ) {
          // If task was completed on any day
          const newCompletions = { ...task.completions };
          for (const dateKey in newCompletions) {
            newCompletions[dateKey] = false; // Unmark all completions
          }
          return { ...modifiedTask, completions: newCompletions };
        }
        return modifiedTask;
      });
    },
    [updateTaskInState]
  );

  const handleUpdateSubtask = useCallback(
    (taskId, subtaskId, updates) => {
      updateTaskInState(taskId, (task) => {
        const updatedSubtasks = (task.subtasks || []).map((st) =>
          st.id === subtaskId ? { ...st, ...updates } : st
        );
        let potentiallyUpdatedParentTask = {
          ...task,
          subtasks: updatedSubtasks,
        };
        const subtaskJustUnmarked =
          updates.hasOwnProperty("completed") && !updates.completed;

        if (subtaskJustUnmarked && tasksUserChoseToKeepOpen[task.id]) {
          setTasksUserChoseToKeepOpen((prev) => {
            const newFlags = { ...prev };
            delete newFlags[task.id];
            return newFlags;
          });
        }

        // If a subtask is unmarked, and the parent task was marked complete on any day, unmark it
        if (
          subtaskJustUnmarked &&
          potentiallyUpdatedParentTask.completions &&
          Object.values(potentiallyUpdatedParentTask.completions).some((c) => c)
        ) {
          const newCompletions = {
            ...potentiallyUpdatedParentTask.completions,
          };
          for (const dateKey in newCompletions) {
            newCompletions[dateKey] = false; // Unmark all completions
          }
          potentiallyUpdatedParentTask.completions = newCompletions;
        }
        return potentiallyUpdatedParentTask;
      });
    },
    [updateTaskInState, tasksUserChoseToKeepOpen]
  );

  const handleUpdateTaskLink = useCallback(
    (taskId, newLink) => {
      updateTaskInState(taskId, (task) => ({
        ...task,
        link: newLink || null,
      }));
    },
    [updateTaskInState]
  );

  const handleUpdateTaskEndDate = useCallback(
    (taskId, newEndDate) => {
      updateTaskInState(taskId, (task) => ({
        ...task,
        endDate: newEndDate || null,
      }));
    },
    [updateTaskInState]
  );

  const handleMarkAllSubtasksComplete = useCallback(
    (taskId) => {
      updateTaskInState(taskId, (task) => {
        if (!task.subtasks || task.subtasks.length === 0) return task;
        const allSubtasksNowComplete = task.subtasks.map((st) => ({
          ...st,
          completed: true,
        }));
        return { ...task, subtasks: allSubtasksNowComplete };
      });
    },
    [updateTaskInState]
  );

  const handleDeleteSubtask = useCallback(
    (taskId, subtaskId) => {
      updateTaskInState(taskId, (task) => ({
        ...task,
        subtasks: (task.subtasks || []).filter((st) => st.id !== subtaskId),
      }));
    },
    [updateTaskInState]
  );

  const updateTaskTime = useCallback(
    (id, time) => {
      updateTaskInState(id, (task) => ({ ...task, time: time || null }));
    },
    [updateTaskInState]
  );

  const updateTaskText = useCallback(
    (id, newText) => {
      updateTaskInState(id, (task) => ({ ...task, text: newText.trim() }));
    },
    [updateTaskInState]
  );

  const deleteTask = useCallback(
    (id) => {
      // This one is different as it removes the task, not updates it.
      setTasksByDate((prevTasksByDate) => {
        const newTasksByDate = { ...prevTasksByDate };
        let taskFoundAndDeleted = false;
        for (const dateKey in newTasksByDate) {
          const originalTasks = newTasksByDate[dateKey];
          const newTasks = originalTasks.filter((task) => task.id !== id);
          if (newTasks.length < originalTasks.length) {
            if (newTasks.length > 0) {
              newTasksByDate[dateKey] = newTasks;
            } else {
              delete newTasksByDate[dateKey]; // Clean up empty date entries
            }
            taskFoundAndDeleted = true;
            break;
          }
        }
        return taskFoundAndDeleted ? newTasksByDate : prevTasksByDate;
      });
    },
    [setTasksByDate]
  );

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDay(dateToDDMMYYYY(today));
  }, []); // Relies on stable setters, so no dependencies needed.

  const handleSetViewMode = useCallback(
    (mode) => {
      setViewMode(mode);
      if (mode === "date") {
        handleGoToToday();
      }
    },
    [handleGoToToday]
  );

  const handlePreviousMonth = useCallback(
    () =>
      setDisplayDate((date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() - 1);
        return d;
      }),
    []
  );

  const handleNextMonth = useCallback(
    () =>
      setDisplayDate((date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        return d;
      }),
    []
  );

  const filteredTasks = useMemo(() => {
    // Use displayDate for week/month calculations to align with calendar view
    const currentViewDate = displayDate;
    let taskInstances = []; // This will hold task objects with an added 'displayDate' and 'isCompletedOnThisDay'

    switch (viewMode) {
      case "week": {
        const weekStart = startOfWeek(currentViewDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentViewDate, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({
          start: weekStart,
          end: weekEnd,
        });

        daysInWeek.forEach((day) => {
          const dayKey = dateToDDMMYYYY(day);
          const tasksOnThisDay = allTasks.filter((task) => {
            const taskStart = parseDDMMYYYYToDateObj(task.date);
            const taskEnd = task.endDate
              ? parseYYYYMMDDToDateObj(task.endDate)
              : taskStart;
            return isWithinInterval(day, { start: taskStart, end: taskEnd });
          });

          tasksOnThisDay.forEach((task) => {
            taskInstances.push({
              ...task,
              displayDate: dayKey, // The specific day this instance represents
              isCompletedOnThisDay: !!(
                task.completions && task.completions[dayKey]
              ),
            });
          });
        });
        break;
      }
      case "month": {
        const monthStart = startOfMonth(currentViewDate);
        const monthEnd = endOfMonth(currentViewDate);
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        });

        daysInMonth.forEach((day) => {
          const dayKey = dateToDDMMYYYY(day);
          const tasksOnThisDay = allTasks.filter((task) => {
            const taskStart = parseDDMMYYYYToDateObj(task.date);
            const taskEnd = task.endDate
              ? parseYYYYMMDDToDateObj(task.endDate)
              : taskStart;
            return isWithinInterval(day, { start: taskStart, end: taskEnd });
          });

          tasksOnThisDay.forEach((task) => {
            taskInstances.push({
              ...task,
              displayDate: dayKey,
              isCompletedOnThisDay: !!(
                task.completions && task.completions[dayKey]
              ),
            });
          });
        });
        break;
      }
      case "date":
      default: {
        const selectedDateObj = parseDDMMYYYYToDateObj(selectedDay);
        const tasksOnSelectedDay = allTasks.filter((task) => {
          const taskStart = parseDDMMYYYYToDateObj(task.date);
          const taskEnd = task.endDate
            ? parseYYYYMMDDToDateObj(task.endDate)
            : taskStart;
          return isWithinInterval(selectedDateObj, {
            start: taskStart,
            end: taskEnd,
          });
        });
        taskInstances = tasksOnSelectedDay.map((task) => ({
          ...task,
          displayDate: selectedDay,
          isCompletedOnThisDay: !!(
            task.completions && task.completions[selectedDay]
          ),
        }));
        break;
      }
    }

    // Sort the results by displayDate and then time
    const sortedInstances = taskInstances.sort((a, b) => {
      const dateA = parseDDMMYYYYToDateObj(a.displayDate);
      const dateB = parseDDMMYYYYToDateObj(b.displayDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;

      return 0;
    });

    return sortedInstances.map((task) => ({
      ...task,
      // The task's start date is its 'date' property, but we need it in YYYY-MM-DD for the input
      startDate: convertDDMMYYYYtoYYYYMMDD(task.date),
    }));
  }, [allTasks, viewMode, selectedDay, displayDate]);

  const handleReorderTasks = useCallback(
    (reorderedTasks) => {
      // Reordering only makes sense for the 'date' view and affects tasks starting on that day.
      // We need to filter out tasks that don't actually start on selectedDay.
      const tasksStartingOnSelectedDay = reorderedTasks.filter(
        (task) => task.date === selectedDay
      );

      setTasksByDate((prev) => ({
        ...prev,
        [selectedDay]: tasksStartingOnSelectedDay,
      }));
    },
    [setTasksByDate, selectedDay]
  );

  const handleReorderSubtasks = useCallback(
    (taskId, reorderedSubtasks) => {
      // Use the centralized updateTaskInState to ensure this works
      // across all views (Daily, Week, Month) regardless of the selectedDay.
      updateTaskInState(taskId, (task) => ({
        ...task,
        subtasks: reorderedSubtasks,
      }));
    },
    [updateTaskInState]
  );

  return (
    <main className="engagement-page-layout main-content">
      <section className="dashboard-hero">
        <h2>
          <span role="img" aria-label="Rocket" className="dashboard-hero-icon">
            🚀
          </span>
          My Progress Dashboard
        </h2>
        <p className="dashboard-description">
          Track your daily engagement and completed tasks.
          <br />
          Use the calendar to view your activity history and stay motivated!
        </p>
      </section>

      <section className="engagement-main-container">
        <div className="engagement-widgets-layout">
          <div className="calendar-widget-container">
            <ActivityCalendar
              activity={activityData || {} /* Safeguard activityData */}
              year={displayDate.getFullYear()}
              month={displayDate.getMonth()}
              onPrevMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onToday={handleGoToToday}
              selectedDay={selectedDay}
              onDayClick={handleCalendarDayClick}
            />
          </div>
          <div className="improved-task-list">
            <TaskList
              tasks={filteredTasks}
              onAddTask={addTaskWithDetails}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTime={updateTaskTime}
              onUpdateTaskText={updateTaskText}
              onUpdateTaskLink={handleUpdateTaskLink}
              onUpdateTaskEndDate={handleUpdateTaskEndDate}
              onViewTaskDetails={handleViewTaskDetails}
              currentTime={currentTime}
              selectedDateForDisplay={selectedDay}
              onReorderTasks={handleReorderTasks}
              onReorderSubtasks={handleReorderSubtasks}
              viewMode={viewMode}
              onSetViewMode={handleSetViewMode}
            />
            <div className="task-list-actions">
              <button onClick={handleOpenCopyModal} className="btn-secondary">
                Copy Tasks from Another Day
              </button>
              {/* The button to delete all tasks should only appear in daily view */}
              {viewMode === "date" &&
                (tasksByDate[selectedDay] || []).length > 0 && (
                  <button
                    onClick={handleDeleteAllTasksForDay}
                    className="btn-danger"
                    style={{ marginLeft: "var(--spacing-sm)" }}
                  >
                    Delete All Tasks for {selectedDay}
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>
      <CopyTaskModal
        isOpen={isCopyModalOpen}
        onClose={handleCloseCopyModal}
        allTasksByDate={tasksByDate || {} /* Safeguard */}
        targetDate={selectedDay}
        onCopyTasks={handleCopyTasksToCurrentDay}
        activityData={activityData || {} /* Safeguard */}
      />
      <Modal
        isOpen={isConfirmDeleteAllOpen}
        onClose={() => setIsConfirmDeleteAllOpen(false)}
        title="Delete All Tasks"
        isConfirmation={true}
        confirmationMessage={`Are you sure you want to delete all ${
          (tasksByDate[selectedDay] || []).length
        } tasks for ${selectedDay}? This action cannot be undone.`}
        onConfirm={confirmDeleteAllTasks}
        confirmText="Delete All"
        cancelText="Cancel"
      />

      {isTaskDetailsModalOpen && taskToViewDetails && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={handleCloseTaskDetailsModal}
          task={taskToViewDetails}
          taskActions={{
            onUpdateDescription: handleUpdateTaskDescription,
            onAddSubtask: handleAddSubtask,
            onUpdateSubtask: handleUpdateSubtask,
            onDeleteSubtask: handleDeleteSubtask,
            onToggleTask: toggleTask,
            onMarkAllSubtasksComplete: handleMarkAllSubtasksComplete,
            onUpdateTaskLink: handleUpdateTaskLink,
            onUpdateTaskEndDate: handleUpdateTaskEndDate,
            onSetUserChoseToKeepParentOpen: (taskId, value) => {
              setTasksUserChoseToKeepOpen((prev) => ({
                ...prev,
                [taskId]: value,
              }));
            },
            onReorderSubtasks: handleReorderSubtasks,
          }}
          userChoseToKeepParentOpen={
            !!tasksUserChoseToKeepOpen[taskToViewDetails?.id]
          }
        />
      )}
    </main>
  );
};

export default EngagementPage;
