// EngagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import TaskList from "../components/engagement/TaskList";
import ActivityCalendar from "../components/engagement/ActivityCalendar";
import {
  ENGAGEMENT_TASKS_KEY,
  ENGAGEMENT_ACTIVITY_KEY,
} from "../constants/localStorageKeys";
import { useIndexedDb } from "../hooks/useIndexedDb";
import "../components/engagement/EngagementPage.css";

// Utility to get today's date as "YYYY-MM-DD"
const getTodayStr = () => new Date().toISOString().split("T")[0];

// --- Helper functions (no changes needed) ---
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

const calculateActivityForDate = (dateStr, allTasks) => {
  const tasksOnDate = allTasks.filter((task) => task.date === dateStr);
  const completedOnDate = tasksOnDate.filter((task) => task.completed).length;
  const workedOnDate = tasksOnDate.length > 0;
  return { tasksCompleted: completedOnDate, worked: workedOnDate };
};

const EngagementPage = () => {
  // VVVV 2. USE THE HOOK DIRECTLY FOR STATE MANAGEMENT VVVV
  const [tasks, setTasks] = useIndexedDb(ENGAGEMENT_TASKS_KEY, []);
  const [activityData, setActivityData] = useIndexedDb(
    ENGAGEMENT_ACTIVITY_KEY,
    {}
  );

  // Derive activity data if it's not present in the DB
  useEffect(() => {
    if (tasks && tasks.length > 0 && Object.keys(activityData).length === 0) {
      setActivityData(deriveActivityDataFromTasks(tasks));
    }
  }, [tasks, activityData, setActivityData]);


  // --- All other state and logic remains the same ---
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const todayStr = getTodayStr();
  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
    }, 1000);
    return () => clearInterval(interval);
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
    [selectedDay, setTasks, setActivityData]
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
  }, [setTasks, setActivityData]);

  const updateTaskTime = useCallback((id, time) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, time: time || null } : task
      )
    );
  }, [setTasks]);

  const updateTaskText = useCallback((id, newText) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, text: newText.trim() } : task
      )
    );
    // Note: Activity data is not directly affected by text changes.
  }, [setTasks]);

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
  }, [setTasks, setActivityData]);

  // VVVV 3. NO MORE MANUAL SAVING/LOADING LOGIC NEEDED! VVVV

  // --- Calendar navigation and derived state (no changes required) ---
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

  // --- Render logic ---
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
              onUpdateTaskText={updateTaskText} // Pass the new handler
              currentTime={currentTime}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default EngagementPage;
