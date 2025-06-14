// EngagementPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import TaskList from "../components/engagement/TaskList";
import ActivityCalendar from "../components/engagement/ActivityCalendar";
import {
  ENGAGEMENT_TASKS_KEY,
  ENGAGEMENT_ACTIVITY_KEY,
} from "../constants/localStorageKeys"; // Assuming these constants exist
import { useIndexedDb } from "../hooks/useIndexedDb";
import "../components/engagement/EngagementPage.css";
import CopyTaskModal from "../components/engagement/CopyTaskModal";
import TaskDetailsModal from "../components/engagement/TaskDetailsModal";
import { useLocation } from "react-router-dom"; // Import useLocation
import Modal from "../components/shared/Modal"; // Import the generic Modal for confirmation

// Helper to format a Date object to "DD-MM-YYYY" string
const dateToDDMMYYYY = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    dateObj = new Date(); // Default to today if invalid date is passed
  }
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to get activity level based on completion percentage
const getActivityLevel = (completed, total) => {
  if (total === 0) return "none";
  const percentage = (completed / total) * 100;
  if (percentage === 100) return "high";
  if (percentage >= 50) return "medium";
  if (percentage > 0) return "low";
  return "none"; // Should be 'worked' if total > 0 and completed = 0, handled by calculateActivityForDate
};

const calculateActivityForDate = (tasksForDateArray) => {
  const validTasksArray = Array.isArray(tasksForDateArray)
    ? tasksForDateArray
    : [];
  const totalOnDate = validTasksArray.length;
  const completedOnDate = validTasksArray.filter(
    (task) => task.completed
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

  const [tasksByDate, setTasksByDate] = useIndexedDb(ENGAGEMENT_TASKS_KEY, {});
  const [activityData, setActivityData] = useIndexedDb(
    ENGAGEMENT_ACTIVITY_KEY,
    {}
  );

  const location = useLocation();
  const initialDate = location.state?.date || dateToDDMMYYYY(new Date());

  const parseDDMMYYYY = (dateStr) => {
    if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return new Date(); // Default to today if parsing fails
    }
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const [displayDate, setDisplayDate] = useState(() =>
    parseDDMMYYYY(initialDate)
  );
  const [selectedDay, setSelectedDay] = useState(initialDate);

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );

  useEffect(() => {
    const newActivityData = {};
    // Safeguard: Ensure tasksByDate is an object before calling Object.entries
    for (const [date, tasksOnDate] of Object.entries(tasksByDate || {})) {
      if (Array.isArray(tasksOnDate)) {
        newActivityData[date] = calculateActivityForDate(tasksOnDate);
      }
    }
    setActivityData(newActivityData);
  }, [tasksByDate, setActivityData]);

  const handleViewTaskDetails = useCallback(
    (taskId) => {
      // Safeguard tasksByDate before accessing
      const task = ((tasksByDate || {})[selectedDay] || []).find(
        (t) => t.id === taskId
      );
      if (task) {
        setTaskToViewDetails(task);
        setIsTaskDetailsModalOpen(true);
      }
    },
    [tasksByDate, selectedDay]
  );

  const handleCloseTaskDetailsModal = useCallback(() => {
    setIsTaskDetailsModalOpen(false);
    setTaskToViewDetails(null);
  }, []);

  useEffect(() => {
    if (isTaskDetailsModalOpen && taskToViewDetails) {
      // Safeguard tasksByDate before accessing
      const updatedTaskInList = (
        (tasksByDate || {})[taskToViewDetails.date] || []
      ).find((t) => t.id === taskToViewDetails.id);
      if (!updatedTaskInList) {
        handleCloseTaskDetailsModal();
      } else if (updatedTaskInList !== taskToViewDetails) {
        setTaskToViewDetails(updatedTaskInList);
      }
    }
  }, [
    tasksByDate,
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

  const addTaskWithDetails = useCallback(
    ({ text, time, description, subtasks, link }) => {
      const newTask = {
        id: Date.now(),
        text,
        completed: false,
        date: selectedDay,
        time: time || null,
        description: description || null,
        subtasks: subtasks || [],
        completedAt: null,
        link: link || null,
      };
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const currentTasksForDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = [...currentTasksForDay, newTask];
        return {
          ...currentTasksByDate,
          [selectedDay]: updatedTasksForDay,
        };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const taskToToggle = tasksForCurrentDay.find((task) => task.id === id);
        if (!taskToToggle) return currentTasksByDate;

        const newCompletedStatus = !taskToToggle.completed;
        let updatedSubtasks = taskToToggle.subtasks || [];

        if (newCompletedStatus && updatedSubtasks.length > 0) {
          updatedSubtasks = updatedSubtasks.map((st) => ({
            ...st,
            completed: true,
          }));
        } else if (!newCompletedStatus && updatedSubtasks.length > 0) {
          updatedSubtasks = updatedSubtasks.map((st) => ({
            ...st,
            completed: false,
          }));
        }

        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: newCompletedStatus,
                completedAt: newCompletedStatus
                  ? dateToDDMMYYYY(new Date())
                  : null,
                subtasks: updatedSubtasks,
              }
            : task
        );
        return {
          ...currentTasksByDate,
          [selectedDay]: updatedTasksForDay,
        };
      });
      setTasksUserChoseToKeepOpen((prev) => {
        const newFlags = { ...prev };
        if (newFlags[id]) {
          delete newFlags[id];
        }
        return newFlags;
      });
    },
    [selectedDay, setTasksByDate, tasksUserChoseToKeepOpen] // tasksUserChoseToKeepOpen is a dependency here
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
    },
    [] // setSelectedDay is stable
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
        id: Date.now() + Math.random() + index, // Ensure unique ID
        date: targetDate_DD_MM_YYYY,
        completed: false,
        completedAt: null,
        description: task.description || null,
        subtasks: (task.subtasks || []).map((st) => ({
          ...st,
          id: Date.now() + Math.random(), // Ensure unique ID for subtasks
          completed: false,
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
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === taskId
            ? { ...task, description: newDescription.trim() || null }
            : task
        );
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleAddSubtask = useCallback(
    (taskId, subtaskText) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId) {
            const newSubtask = {
              id: Date.now() + Math.random(), // Ensure unique ID
              text: subtaskText,
              completed: false,
            };
            const modifiedTask = {
              ...task,
              subtasks: [...(task.subtasks || []), newSubtask],
            };
            // If adding a subtask to a completed parent, un-complete the parent
            if (modifiedTask.completed) {
              return { ...modifiedTask, completed: false, completedAt: null };
            }
            return modifiedTask;
          }
          return task;
        });
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleUpdateSubtask = useCallback(
    (taskId, subtaskId, updates) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId) {
            const updatedSubtasks = (task.subtasks || []).map((st) =>
              st.id === subtaskId ? { ...st, ...updates } : st
            );
            let potentiallyUpdatedParentTask = {
              ...task,
              subtasks: updatedSubtasks,
            };
            const subtaskJustUnmarked =
              updates.hasOwnProperty("completed") && !updates.completed;

            // If a subtask was unmarked and parent was previously kept open, reset that choice
            if (subtaskJustUnmarked && tasksUserChoseToKeepOpen[task.id]) {
              setTasksUserChoseToKeepOpen((prev) => {
                const newFlags = { ...prev };
                delete newFlags[task.id];
                return newFlags;
              });
            }

            // If a subtask was unmarked and parent was completed, un-complete parent
            if (subtaskJustUnmarked && potentiallyUpdatedParentTask.completed) {
              potentiallyUpdatedParentTask.completed = false;
              potentiallyUpdatedParentTask.completedAt = null;
            }
            return potentiallyUpdatedParentTask;
          }
          return task;
        });
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate, tasksUserChoseToKeepOpen]
  );

  const handleUpdateTaskLink = useCallback(
    (taskId, newLink) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === taskId ? { ...task, link: newLink || null } : task
        );
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleMarkAllSubtasksComplete = useCallback(
    (taskId) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId && task.subtasks && task.subtasks.length > 0) {
            const allSubtasksNowComplete = task.subtasks.map((st) => ({
              ...st,
              completed: true,
            }));
            return { ...task, subtasks: allSubtasksNowComplete };
          }
          return task;
        });
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleDeleteSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (st) => st.id !== subtaskId
              ),
            };
          }
          return task;
        });
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const updateTaskTime = useCallback(
    (id, time) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id ? { ...task, time: time || null } : task
        );
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const updateTaskText = useCallback(
    (id, newText) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id ? { ...task, text: newText.trim() } : task
        );
        return { ...currentTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const deleteTask = useCallback(
    (id) => {
      setTasksByDate((prevTasksByDate) => {
        const currentTasksByDate = prevTasksByDate || {};
        const tasksForCurrentDay = currentTasksByDate[selectedDay] || [];
        const taskToDelete = tasksForCurrentDay.find((task) => task.id === id);
        if (!taskToDelete) return currentTasksByDate;

        const updatedTasksForDay = (tasksForCurrentDay || []).filter(
          (task) => task.id !== id
        );
        return {
          ...currentTasksByDate,
          [selectedDay]: updatedTasksForDay,
        };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handlePreviousMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - 1);
      const [sDay, sMonth, sYear] = selectedDay.split("-").map(Number);
      const currentSelectedDateObj = new Date(sYear, sMonth - 1, sDay);
      let newSelectedDateObj = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      if (newSelectedDateObj.getMonth() !== d.getMonth()) {
        newSelectedDateObj = new Date(d.getFullYear(), d.getMonth() + 1, 0); // Last day of the new display month
      }
      setSelectedDay(dateToDDMMYYYY(newSelectedDateObj));
      return d;
    });

  const handleNextMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      const [sDay, sMonth, sYear] = selectedDay.split("-").map(Number);
      const currentSelectedDateObj = new Date(sYear, sMonth - 1, sDay);
      let newSelectedDateObj = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      if (newSelectedDateObj.getMonth() !== d.getMonth()) {
        newSelectedDateObj = new Date(d.getFullYear(), d.getMonth() + 1, 0); // Last day of the new display month
      }
      setSelectedDay(dateToDDMMYYYY(newSelectedDateObj));
      return d;
    });

  const handleGoToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDay(dateToDDMMYYYY(today));
  };

  const tasksForSelectedDay = useMemo(() => {
    // Ensure tasksByDate is a valid object before trying to access properties.
    if (
      !tasksByDate ||
      typeof tasksByDate !== "object" ||
      tasksByDate === null
    ) {
      return [];
    }
    // Ensure selectedDay is a valid key.
    if (typeof selectedDay !== "string" || !selectedDay) {
      return [];
    }
    return tasksByDate[selectedDay] || [];
  }, [tasksByDate, selectedDay]);

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
              activity={activityData || {}} // Safeguard activityData
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
              tasks={tasksForSelectedDay}
              onAddTask={addTaskWithDetails}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTime={updateTaskTime}
              onUpdateTaskText={updateTaskText}
              onUpdateTaskLink={handleUpdateTaskLink}
              onViewTaskDetails={handleViewTaskDetails}
              currentTime={currentTime}
              selectedDateForDisplay={selectedDay}
            />
            <div className="task-list-actions">
              <button onClick={handleOpenCopyModal} className="btn-secondary">
                Copy Tasks from Another Day
              </button>
              {tasksForSelectedDay.length > 0 && (
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
        allTasksByDate={tasksByDate || {}} // Safeguard
        targetDate={selectedDay}
        onCopyTasks={handleCopyTasksToCurrentDay}
        activityData={activityData || {}} // Safeguard
      />
      <Modal
        isOpen={isConfirmDeleteAllOpen}
        onClose={() => setIsConfirmDeleteAllOpen(false)}
        title="Delete All Tasks"
        isConfirmation={true}
        confirmationMessage={`Are you sure you want to delete all ${
          tasksForSelectedDay.length
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
          onUpdateDescription={handleUpdateTaskDescription}
          onAddSubtask={handleAddSubtask}
          onUpdateSubtask={handleUpdateSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onToggleTask={toggleTask}
          onMarkAllSubtasksComplete={handleMarkAllSubtasksComplete}
          onUpdateTaskLink={handleUpdateTaskLink}
          userChoseToKeepParentOpen={
            !!tasksUserChoseToKeepOpen[taskToViewDetails?.id]
          }
          onSetUserChoseToKeepParentOpen={(taskId, value) => {
            setTasksUserChoseToKeepOpen((prev) => ({
              ...prev,
              [taskId]: value,
            }));
          }}
        />
      )}
    </main>
  );
};

export default EngagementPage;
