// EngagementPage.jsx
import { useState, useEffect, useCallback, useMemo} from "react";
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

/* formatDateForDisplay can be removed if selectedDay is always in the desired DD-MM-YYYY format for display
const formatDateForDisplay = (dateStr_DD_MM_YYYY) => dateStr_DD_MM_YYYY;
*/

// Helper to get activity level based on completion percentage - keep this if you use it
const getActivityLevel = (completed, total) => {
  if (total === 0) return "none";
  const percentage = (completed / total) * 100;
  if (percentage === 100) return "high";
  if (percentage >= 50) return "medium";
  if (percentage > 0) return "low";
  return "none";
};

const calculateActivityForDate = (tasksForDateArray) => {
  const validTasksArray = Array.isArray(tasksForDateArray) ? tasksForDateArray : [];
  const totalOnDate = validTasksArray.length;
  const completedOnDate = validTasksArray.filter((task) => task.completed).length;

  return {
    tasksCompleted: completedOnDate,
    worked: totalOnDate > 0, // Worked if there are any tasks for the day
    totalTasks: totalOnDate,
    activityLevel: getActivityLevel(completedOnDate, totalOnDate), // Use the consistent helper
  };
};

const EngagementPage = () => {
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [taskToViewDetails, setTaskToViewDetails] = useState(null);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);

  // ENGAGEMENT_TASKS_KEY now stores an object: { "DD-MM-YYYY": [tasks], ... }
  const [tasksByDate, setTasksByDate] = useIndexedDb(ENGAGEMENT_TASKS_KEY, {}); // Keys will be DD-MM-YYYY
  const [activityData, setActivityData] = useIndexedDb(
    ENGAGEMENT_ACTIVITY_KEY,
    {} // Keys will be DD-MM-YYYY
  );

  const location = useLocation(); // Get location object
  const initialDate = location.state?.date || dateToDDMMYYYY(new Date()); // Check for date in state, default to today

  // Helper to parse DD-MM-YYYY string into a Date object
  const parseDDMMYYYY = (dateStr) => {
    if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return new Date(); // Return today if format is wrong or string is empty
    }
    const [day, month, year] = dateStr.split('-').map(Number);
    // Note: Month is 0-indexed in Date constructor
    return new Date(year, month - 1, day);
  };

  // Initialize displayDate and selectedDay based on navigation state or today
  const [displayDate, setDisplayDate] = useState(() => parseDDMMYYYY(initialDate));
  const [selectedDay, setSelectedDay] = useState(initialDate); // DD-MM-YYYY

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );

 useEffect(() => {
    // Derive activityData from tasksByDate whenever tasksByDate changes
    const newActivityData = {};
    for (const [date, tasksOnDate] of Object.entries(tasksByDate)) {
      if (Array.isArray(tasksOnDate)) {
        newActivityData[date] = calculateActivityForDate(tasksOnDate);
      }
    }
    // handle if an update to the DB is needed based on value changes.
    setActivityData(newActivityData);
  }, [tasksByDate, setActivityData]); // setActivityData is stable from useIndexedDb
 
  // Define modal handlers before effects that might use them
  const handleViewTaskDetails = useCallback(
    (taskId) => {
      const task = (tasksByDate[selectedDay] || []).find(
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
  }, []); // No dependencies, safe to define early

  useEffect(() => {
    if (isTaskDetailsModalOpen && taskToViewDetails) {
      const updatedTaskInList = (
        tasksByDate[taskToViewDetails.date] || []
      ).find(
        (t) => t.id === taskToViewDetails.id // Assuming taskToViewDetails has a .date property
      );
      if (!updatedTaskInList) {
        // Task was deleted
        handleCloseTaskDetailsModal();
      } else if (updatedTaskInList !== taskToViewDetails) {
        // Task data changed (e.g., subtask added/deleted)
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
    ({ text, time, description, subtasks }) => {
      const newTask = {
        id: Date.now(),
        text,
        completed: false,
        date: selectedDay, // This is correct, task object itself stores its date (DD-MM-YYYY)
        time: time || null,
        description: description || null,
        subtasks: subtasks || [],
        completedAt: null,
      };
      setTasksByDate((prevTasksByDate) => {
        const currentTasksForDay = prevTasksByDate[selectedDay] || [];
        const updatedTasksForDay = [...currentTasksForDay, newTask];
        return {
          ...prevTasksByDate,
          [selectedDay]: updatedTasksForDay,
        };
      });
      // Activity data will be updated by the useEffect watching tasksByDate
    },
    [selectedDay, setTasksByDate]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || []; // selectedDay is DD-MM-YYYY
        const taskToToggle = tasksForCurrentDay.find((task) => task.id === id);
        if (!taskToToggle) return prevTasksByDate;

        const newCompletedStatus = !taskToToggle.completed;
        let updatedSubtasks = taskToToggle.subtasks || [];

        // If marking main task as complete, also mark all subtasks as complete
        if (newCompletedStatus && updatedSubtasks.length > 0) {
          updatedSubtasks = updatedSubtasks.map((st) => ({
            ...st,
            completed: true,
          }));
        }

        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: newCompletedStatus,
                completedAt: newCompletedStatus ? dateToDDMMYYYY(new Date()) : null,
                subtasks: updatedSubtasks, // Update subtasks
              }
            : task
        );
        return {
          ...prevTasksByDate,
          [selectedDay]: updatedTasksForDay,
        };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleOpenCopyModal = useCallback(() => {
    setIsCopyModalOpen(true);
  }, []);

  const handleCloseCopyModal = useCallback(() => {
    setIsCopyModalOpen(false);
  }, []);

  const handleCalendarDayClick = useCallback(
    (dateStr_DD_MM_YYYY) => {
      // ActivityCalendar now passes DD-MM-YYYY
      setSelectedDay(dateStr_DD_MM_YYYY);
    },
    [setSelectedDay]
  );

  const handleCopyTasksToCurrentDay = useCallback(
    (tasksToCopyDetails) => {
      const targetDate_DD_MM_YYYY = selectedDay; // selectedDay is DD-MM-YYYY

      if (
        !tasksToCopyDetails ||
        tasksToCopyDetails.length === 0 ||
        !targetDate_DD_MM_YYYY
      ) {
        return;
      }

      const newTasksToAdd = tasksToCopyDetails.map((task, index) => ({
        ...task,
        id: Date.now() + Math.random() + index,
        date: targetDate_DD_MM_YYYY, // Assign to target date (DD-MM-YYYY)
        completed: false,
        completedAt: null,
        description: task.description || null,
        subtasks: task.subtasks
          ? [
              ...task.subtasks.map((st) => ({
                ...st,
                id: Date.now() + Math.random(), // Ensure new IDs for copied subtasks
              })),
            ]
          : [],
      }));

      if (newTasksToAdd.length > 0) {
        setTasksByDate((prevTasksByDate) => {
          const currentTasksForTargetDay =
            prevTasksByDate[targetDate_DD_MM_YYYY] || [];
          const updatedTasksForTargetDay = [
            ...currentTasksForTargetDay,
            ...newTasksToAdd,
          ];
          return {
            ...prevTasksByDate,
            [targetDate_DD_MM_YYYY]: updatedTasksForTargetDay,
          };
        });
      }
    },
    [setTasksByDate, selectedDay]
  );

  const handleDeleteAllTasksForDay = useCallback(() => {
    if (!selectedDay) return;
    const tasksOnSelectedDay = tasksByDate[selectedDay] || [];
    if (tasksOnSelectedDay.length === 0) {
      return;
    }
    setIsConfirmDeleteAllOpen(true);
  }, [selectedDay, tasksByDate]);

  const confirmDeleteAllTasks = useCallback(() => {
    if (selectedDay) {
      setTasksByDate((prevTasksByDate) => {
        const newTasksByDate = { ...prevTasksByDate };
        delete newTasksByDate[selectedDay]; // Remove all tasks for that day
        return newTasksByDate;
      });
    }
    setIsConfirmDeleteAllOpen(false);
  }, [selectedDay, setTasksByDate]);

  const handleUpdateTaskDescription = useCallback(
    (taskId, newDescription) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === taskId
            ? { ...task, description: newDescription.trim() || null }
            : task
        );
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleAddSubtask = useCallback(
    (taskId, subtaskText) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        // let mainTaskWasModifiedForCompletion = false; // Not strictly needed if activityData updates via useEffect

        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId) {
            const newSubtask = {
              id: Date.now() + Math.random(),
              text: subtaskText,
              completed: false, // New subtasks are initially incomplete
            };
            const modifiedTask = {
              ...task,
              subtasks: [...(task.subtasks || []), newSubtask],
            };
            // If the parent task was completed, mark it as incomplete
            // because a new subtask (work item) has been added.
            if (modifiedTask.completed) {
              // mainTaskWasModifiedForCompletion = true;
              return { ...modifiedTask, completed: false, completedAt: null };
            }
            return modifiedTask;
          }
          return task;
        });
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleUpdateSubtask = useCallback(
    (taskId, subtaskId, updates) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) => {
          if (task.id === taskId) {
            const updatedSubtasks = (task.subtasks || []).map((st) =>
              st.id === subtaskId ? { ...st, ...updates } : st
            );
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const handleDeleteSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
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
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const updateTaskTime = useCallback(
    (id, time) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id ? { ...task, time: time || null } : task
        );
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const updateTaskText = useCallback(
    (id, newText) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        const updatedTasksForDay = tasksForCurrentDay.map((task) =>
          task.id === id ? { ...task, text: newText.trim() } : task
        );
        return { ...prevTasksByDate, [selectedDay]: updatedTasksForDay };
      });
    },
    [selectedDay, setTasksByDate]
  );

  const deleteTask = useCallback(
    (id) => {
      setTasksByDate((prevTasksByDate) => {
        const tasksForCurrentDay = prevTasksByDate[selectedDay] || [];
        const taskToDelete = tasksForCurrentDay.find((task) => task.id === id);
        if (!taskToDelete) return prevTasksByDate;

        const updatedTasksForDay = tasksForCurrentDay.filter(
          (task) => task.id !== id
        );
        return {
          ...prevTasksByDate,
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
      // Adjust selectedDay if it falls out of the new month's range
      const [sDay, sMonth, sYear] = selectedDay.split("-").map(Number);
      const currentSelectedDateObj = new Date(sYear, sMonth - 1, sDay);

      let newSelectedDateObj = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      // If the day rolled over to the next month (e.g., trying to set Feb 31st),
      // clamp to the last day of the target month.
      if (newSelectedDateObj.getMonth() !== d.getMonth()) {
        newSelectedDateObj = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      }
      setSelectedDay(dateToDDMMYYYY(newSelectedDateObj));
      return d;
    });

  const handleNextMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      // Logic to adjust selectedDay to be within the new month
      const [sDay, sMonth, sYear] = selectedDay.split("-").map(Number);
      const currentSelectedDateObj = new Date(sYear, sMonth - 1, sDay);
      let newSelectedDateObj = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      if (newSelectedDateObj.getMonth() !== d.getMonth()) {
        newSelectedDateObj = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      }
      setSelectedDay(dateToDDMMYYYY(newSelectedDateObj));
      return d;
    });

  const handleGoToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDay(dateToDDMMYYYY(today));
  };

  const tasksForSelectedDay = useMemo(
    () => tasksByDate[selectedDay] || [], // selectedDay is DD-MM-YYYY
    [tasksByDate, selectedDay]
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
              activity={activityData}
              year={displayDate.getFullYear()}
              month={displayDate.getMonth()}
              onPrevMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onToday={handleGoToToday}
              selectedDay={selectedDay} // selectedDay is DD-MM-YYYY
              onDayClick={handleCalendarDayClick} // Expects DD-MM-YYYY
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
              onViewTaskDetails={handleViewTaskDetails}
              currentTime={currentTime}
              selectedDateForDisplay={selectedDay} // selectedDay is already DD-MM-YYYY
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
        allTasksByDate={tasksByDate} // Keys are DD-MM-YYYY
        targetDate={selectedDay} // DD-MM-YYYY
        onCopyTasks={handleCopyTasksToCurrentDay}
        activityData={activityData} // Keys are DD-MM-YYYY
      />
      <Modal /* Used as Confirmation Modal for Delete All */
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
          // formatDateForDisplay prop removed, assuming TaskDetailsModal uses task.date directly
        />
      )}
    </main>
  );
};

export default EngagementPage;
