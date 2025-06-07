import React, { useState, useEffect, useMemo, useCallback } from "react";
import TaskList from "../components/engagement/TaskList";
import ActivityCalendar from "../components/engagement/ActivityCalendar";
import {
  ENGAGEMENT_TASKS_KEY,
  ENGAGEMENT_ACTIVITY_KEY,
} from "../constants/localStorageKeys";
import "../components/engagement/EngagementPage.css";

// Utility to get today's date as "YYYY-MM-DD"
const getTodayStr = () => new Date().toISOString().split("T")[0];

// Load persisted state from localStorage
const loadState = () => {
  try {
    const savedTasks = localStorage.getItem(ENGAGEMENT_TASKS_KEY);
    const savedActivity = localStorage.getItem(ENGAGEMENT_ACTIVITY_KEY);
    return {
      tasks: savedTasks ? JSON.parse(savedTasks) : [],
      activityData: savedActivity ? JSON.parse(savedActivity) : {},
    };
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return { tasks: [], activityData: {} };
  }
};

// Derive summary of activity from tasks (used for initial state)
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

// Helper to calculate activity for a specific date based on a tasks array
const calculateActivityForDate = (dateStr, allTasks) => {
  const tasksOnDate = allTasks.filter((task) => task.date === dateStr);
  const completedOnDate = tasksOnDate.filter((task) => task.completed).length;
  const workedOnDate = tasksOnDate.length > 0;
  return { tasksCompleted: completedOnDate, worked: workedOnDate };
};

const EngagementPage = () => {
  const initialState = useMemo(loadState, []);
  const initialTasksToUse = initialState.tasks || [];
  const [tasks, setTasks] = useState(initialTasksToUse);
  const [activityData, setActivityData] = useState(
    initialState.activityData &&
      Object.keys(initialState.activityData).length > 0
      ? initialState.activityData
      : deriveActivityDataFromTasks(initialTasksToUse)
  );
  const [displayDate, setDisplayDate] = useState(() => new Date());

  const todayStr = getTodayStr();
  const [selectedDay, setSelectedDay] = useState(todayStr);

  // Add this state and effect at the top of EngagementPage
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:MM"
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 5));
    }, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // --- Task operations ---
  const addTask = useCallback(
    ({ text, time }) => {
      const newTask = {
        id: Date.now(),
        text,
        completed: false,
        date: selectedDay,
        time: time || null,
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
    [selectedDay]
  );

  const toggleTask = useCallback((id) => {
    setTasks((prevTasks) => {
      const taskToToggle = prevTasks.find((task) => task.id === id);
      if (!taskToToggle) return prevTasks;

      const updatedTasks = prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? getTodayStr() : null,
            }
          : task
      );

      const taskDate = taskToToggle.date || getTodayStr();
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
  }, []);

  const updateTaskTime = useCallback((id, time) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, time: time || null } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prevTasks) => {
      const taskToDelete = prevTasks.find((task) => task.id === id);
      if (!taskToDelete) return prevTasks;

      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      const taskDate = taskToDelete.date || getTodayStr();
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
  }, []);

  // --- Persist state ---
  useEffect(() => {
    try {
      localStorage.setItem(ENGAGEMENT_TASKS_KEY, JSON.stringify(tasks));
      localStorage.setItem(
        ENGAGEMENT_ACTIVITY_KEY,
        JSON.stringify(activityData)
      );
    } catch (err) {
      console.error("Failed to save state to localStorage:", err);
    }
  }, [tasks, activityData]);

  // --- Calendar navigation handlers ---
  const handlePreviousMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const [, , day] = selectedDay.split("-");
      const dayNum = parseInt(day, 10) || 1;
      const newDay = dayNum > lastDay ? lastDay : dayNum;
      const newSelectedDay = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(newDay).padStart(2, "0"),
      ].join("-");
      if (selectedDay !== newSelectedDay) setSelectedDay(newSelectedDay);
      return d;
    });

  const handleNextMonth = () =>
    setDisplayDate((date) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const [, , day] = selectedDay.split("-");
      const dayNum = parseInt(day, 10) || 1;
      const newDay = dayNum > lastDay ? lastDay : dayNum;
      const newSelectedDay = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(newDay).padStart(2, "0"),
      ].join("-");
      if (selectedDay !== newSelectedDay) setSelectedDay(newSelectedDay);
      return d;
    });

  const handleGoToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDay(getTodayStr());
  };

  const todaysTasks = useMemo(
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
              onDayClick={setSelectedDay}
            />
          </div>
          <div className="improved-task-list">
            <TaskList
              tasks={todaysTasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTime={updateTaskTime}
              currentTime={currentTime} // Ensure currentTime is passed
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default EngagementPage;
