// EngagementPage.jsx
// EngagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Modal from "../components/shared/Modal"; // Import the generic Modal for confirmation

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

const deriveActivityDataFromTasks = (tasksArray) => {
  const activity = {};
  tasksArray.forEach((task) => {
    if (task.date) {
      if (!activity[task.date]) {
        activity[task.date] = { tasksCompleted: 0, worked: false };
      }
      activity[task.date].worked = true;
      if (task.completed) {
        activity[task.date].tasksCompleted += 1;
      }
    }
  });
  return activity;
};

const calculateActivityForDate = (dateStr_YYYY_MM_DD, allTasks) => {
  const tasksOnDate = allTasks.filter(
    (task) => task.date === dateStr_YYYY_MM_DD
  );
  const completedOnDate = tasksOnDate.filter((task) => task.completed).length;
  const workedOnDate = tasksOnDate.length > 0;
  return { tasksCompleted: completedOnDate, worked: workedOnDate };
};

const EngagementPage = () => {
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [taskToViewDetails, setTaskToViewDetails] = useState(null);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);

  const [tasks, setTasks] = useIndexedDb(ENGAGEMENT_TASKS_KEY, []);
  const [activityData, setActivityData] = useIndexedDb(
    ENGAGEMENT_ACTIVITY_KEY,
    {}
  );

  useEffect(() => {
    if (tasks && tasks.length > 0 && Object.keys(activityData).length === 0) {
      setActivityData(deriveActivityDataFromTasks(tasks));
    }
  }, [tasks, activityData, setActivityData]);

  // Define modal handlers before effects that might use them
  const handleViewTaskDetails = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTaskToViewDetails(task);
        setIsTaskDetailsModalOpen(true);
      }
    },
    [tasks] // tasks is a dependency
  );

  const handleCloseTaskDetailsModal = useCallback(() => {
    setIsTaskDetailsModalOpen(false);
    setTaskToViewDetails(null);
  }, []); // No dependencies, safe to define early

  useEffect(() => {
    if (isTaskDetailsModalOpen && taskToViewDetails) {
      const updatedTaskInList = tasks.find(
        (t) => t.id === taskToViewDetails.id
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
    tasks,
    isTaskDetailsModalOpen,
    taskToViewDetails,
    handleCloseTaskDetailsModal,
  ]);

  const [displayDate, setDisplayDate] = useState(() => new Date());
  const todayStrInternal = getTodayStrInternal();
  const [selectedDay, setSelectedDay] = useState(todayStrInternal);
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );

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
        date: selectedDay,
        time: time || null,
        description: description || null,
        subtasks: subtasks || [],
        completedAt: null,
      };
      setTasks((prev) => [...prev, newTask]);
      setActivityData((prev) => ({
        ...prev,
        [selectedDay]: {
          tasksCompleted: prev[selectedDay]?.tasksCompleted || 0,
          worked: true,
        },
      }));
    },
    [selectedDay, setTasks, setActivityData]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasks((prevTasks) => {
        const taskToToggle = prevTasks.find((task) => task.id === id);
        if (!taskToToggle) return prevTasks;

        const newCompletedStatus = !taskToToggle.completed;
        let updatedSubtasks = taskToToggle.subtasks || [];

        // If marking main task as complete, also mark all subtasks as complete
        if (newCompletedStatus && updatedSubtasks.length > 0) {
          updatedSubtasks = updatedSubtasks.map((st) => ({
            ...st,
            completed: true,
          }));
        }

        const updatedTasks = prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: newCompletedStatus,
                completedAt: newCompletedStatus ? getTodayStrInternal() : null,
                subtasks: updatedSubtasks, // Update subtasks
              }
            : task
        );
        const taskDate = taskToToggle.date || getTodayStrInternal();
        const newActivityForDate = calculateActivityForDate(
          taskDate,
          updatedTasks
        );
        setActivityData((prevActivityData) => ({
          ...prevActivityData,
          [taskDate]: newActivityForDate,
        }));
        return updatedTasks;
      });
    },
    [setTasks, setActivityData]
  );

  const handleOpenCopyModal = useCallback(() => {
    setIsCopyModalOpen(true);
  }, []);

  const handleCloseCopyModal = useCallback(() => {
    setIsCopyModalOpen(false);
  }, []);

  const handleCalendarDayClick = useCallback(
    (dateStr_YYYY_MM_DD) => {
      setSelectedDay(dateStr_YYYY_MM_DD);
    },
    [setSelectedDay]
  );

  const handleCopyTasksToCurrentDay = useCallback(
    (tasksToCopyDetails) => {
      const targetDate_YYYY_MM_DD = selectedDay;

      if (
        !tasksToCopyDetails ||
        tasksToCopyDetails.length === 0 ||
        !targetDate_YYYY_MM_DD
      ) {
        return;
      }

      let newTasksToAdd = [];
      newTasksToAdd = tasksToCopyDetails.map((task, index) => ({
        ...task,
        id: Date.now() + Math.random() + index,
        date: targetDate_YYYY_MM_DD,
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
        const allTasksAfterCopy = [...tasks, ...newTasksToAdd];
        setTasks((prevTasks) => [...prevTasks, ...newTasksToAdd]);
        setActivityData((prevActivity) => {
          const newActivityForDate = calculateActivityForDate(
            targetDate_YYYY_MM_DD,
            allTasksAfterCopy
          );
          return {
            ...prevActivity,
            [targetDate_YYYY_MM_DD]: newActivityForDate,
          };
        });
      }
    },
    [tasks, setTasks, setActivityData, selectedDay]
  );

  const handleDeleteAllTasksForDay = useCallback(() => {
    if (!selectedDay) return;
    const tasksOnSelectedDay = tasks.filter(
      (task) => task.date === selectedDay
    );
    if (tasksOnSelectedDay.length === 0) {
      return;
    }
    setIsConfirmDeleteAllOpen(true);
  }, [selectedDay, tasks]);

  const confirmDeleteAllTasks = useCallback(() => {
    if (selectedDay) {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.date !== selectedDay)
      );
      setActivityData((prevActivity) => {
        const newActivity = { ...prevActivity };
        delete newActivity[selectedDay];
        return newActivity;
      });
    }
    setIsConfirmDeleteAllOpen(false);
  }, [selectedDay, setTasks, setActivityData]);

  const handleUpdateTaskDescription = useCallback(
    (taskId, newDescription) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, description: newDescription.trim() || null }
            : task
        )
      );
    },
    [setTasks]
  );

  const handleAddSubtask = useCallback(
    (taskId, subtaskText) => {
      setTasks((prevTasks) => {
        let taskDateForActivityUpdate;
        const updatedTasks = prevTasks.map((task) => {
          if (task.id === taskId) {
            const newSubtask = {
              id: Date.now() + Math.random(),
              text: subtaskText,
              completed: false, // New subtasks are initially incomplete
            };
            let modifiedTask = {
              ...task,
              subtasks: [...(task.subtasks || []), newSubtask],
            };

            // If the parent task was completed, mark it as incomplete
            // because a new subtask (work item) has been added.
            if (modifiedTask.completed) {
              modifiedTask = {
                ...modifiedTask,
                completed: false,
                completedAt: null,
              };
              taskDateForActivityUpdate = modifiedTask.date || getTodayStrInternal();
            }
            return modifiedTask;
          }
          return task;
        });

        if (taskDateForActivityUpdate) {
          const newActivityForDate = calculateActivityForDate(taskDateForActivityUpdate, updatedTasks);
          setActivityData((prevActivityData) => ({
            ...prevActivityData,
            [taskDateForActivityUpdate]: newActivityForDate,
          }));
        }
        return updatedTasks;
      });
    },
    [setTasks, setActivityData]
  );

  const handleUpdateSubtask = useCallback(
    (taskId, subtaskId, updates) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            const updatedSubtasks = (task.subtasks || []).map((st) =>
              st.id === subtaskId ? { ...st, ...updates } : st
            );
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        })
      );
    },
    [setTasks]
  );

  const handleDeleteSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (st) => st.id !== subtaskId
              ),
            };
          }
          return task;
        })
      );
    },
    [setTasks]
  );

  const updateTaskTime = useCallback(
    (id, time) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, time: time || null } : task
        )
      );
    },
    [setTasks]
  );

  const updateTaskText = useCallback(
    (id, newText) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, text: newText.trim() } : task
        )
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id) => {
      setTasks((prevTasks) => {
        const taskToDelete = prevTasks.find((task) => task.id === id);
        if (!taskToDelete) return prevTasks;
        const updatedTasks = prevTasks.filter((task) => task.id !== id);
        const taskDate = taskToDelete.date || getTodayStrInternal();
        const newActivityForDate = calculateActivityForDate(
          taskDate,
          updatedTasks
        );
        setActivityData((prevActivityData) => ({
          ...prevActivityData,
          [taskDate]: newActivityForDate,
        }));
        return updatedTasks;
      });
    },
    [setTasks, setActivityData]
  );

  const handlePreviousMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - 1);
      const currentSelectedDateObj = new Date(selectedDay);
      const newPotentialSelectedDate = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      if (newPotentialSelectedDate.getMonth() !== d.getMonth()) {
        const lastDayOfNewMonth = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0
        ).getDate();
        setSelectedDay(
          new Date(d.getFullYear(), d.getMonth(), lastDayOfNewMonth).toISOString().split('T')[0]
        );
      } else {
        setSelectedDay(newPotentialSelectedDate.toISOString().split('T')[0]);
      }
      return d;
    });

  const handleNextMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      const currentSelectedDateObj = new Date(selectedDay);
      const newPotentialSelectedDate = new Date(
        d.getFullYear(),
        d.getMonth(),
        currentSelectedDateObj.getDate()
      );
      if (newPotentialSelectedDate.getMonth() !== d.getMonth()) {
        const lastDayOfNewMonth = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0
        ).getDate();
        setSelectedDay(
          new Date(d.getFullYear(), d.getMonth(), lastDayOfNewMonth).toISOString().split('T')[0]
        );
      } else {
        setSelectedDay(newPotentialSelectedDate.toISOString().split('T')[0]);
      }
      return d;
    });

  const handleGoToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDay(getTodayStrInternal());
  };

  const tasksForSelectedDay = useMemo(
    () => tasks.filter((t) => t.date === selectedDay),
    [tasks, selectedDay]
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
              onViewTaskDetails={handleViewTaskDetails}
              currentTime={currentTime}
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
                  Delete All Tasks for {formatDateForDisplay(selectedDay)}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <CopyTaskModal
        isOpen={isCopyModalOpen}
        onClose={handleCloseCopyModal}
        tasks={tasks}
        targetDate={selectedDay}
        onCopyTasks={handleCopyTasksToCurrentDay}
        activityData={activityData}
      />
      <Modal /* Used as Confirmation Modal for Delete All */
        isOpen={isConfirmDeleteAllOpen}
        onClose={() => setIsConfirmDeleteAllOpen(false)}
        title="Delete All Tasks"
        isConfirmation={true}
        confirmationMessage={`Are you sure you want to delete all ${
          tasksForSelectedDay.length
        } tasks for ${formatDateForDisplay(
          selectedDay
        )}? This action cannot be undone.`}
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
          formatDateForDisplay={formatDateForDisplay}
        />
      )}
    </main>
  );
};

export default EngagementPage;
