// ActivityCalendar.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import "./EngagementPage.css";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper to generate the days grid for the current month
function getGridDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// Robust local date string (DD-MM-YYYY)
function getDateStr(year, month, day) {
  if (!day) return "";
  const d = new Date(year, month, day);
  return [
    String(d.getDate()).padStart(2, "0"),
    String(d.getMonth() + 1).padStart(2, "0"), // Month
    d.getFullYear(),
  ].join("-"); // Output: DD-MM-YYYY
}

// Helper to get props for each day cell
function getDayProps(
  day,
  selectedDay,
  onDayClick,
  year,
  month,
  activity,
  isCopyModeActive,
  currentTodayStr // Added parameter for today's date string
) {
  let className = "calendar-day";
  if (!day) className += " empty";
  let cellStyle = !day ? { pointerEvents: "none" } : {};
  const dateStr = getDateStr(year, month, day);

  // Highlight selected day
  if (selectedDay === dateStr) className += " selected";

  // Add activity coloring
  if (day) {
    const act = activity && activity[dateStr]; // Ensure activity itself is not null/undefined
    if (act) {
      if (act.tasksCompleted >= 6) className += " activity-max"; // For 6+ tasks
      else if (act.tasksCompleted === 5) className += " activity-five";
      else if (act.tasksCompleted === 4) className += " activity-four";
      else if (act.tasksCompleted === 3)
        className += " activity-high"; // 3 tasks
      else if (act.tasksCompleted === 2) className += " activity-medium";
      else if (act.tasksCompleted === 1) className += " activity-low";
      else if (act.worked)
        className += " activity-worked"; // 0 completed, but tasks exist
      else className += " no-activity";
    } else {
      className += " no-activity";
    }
    // Use passed-in today string
    if (dateStr === currentTodayStr) className += " today";
  }

  if (day && isCopyModeActive) {
    cellStyle.cursor = "copy"; // Change cursor in copy mode
  }

  return {
    className,
    onClick: day ? () => onDayClick && onDayClick(dateStr) : undefined,
    tabIndex: day ? 0 : -1,
    role: day ? "button" : undefined,
    "aria-selected":
      day && !isCopyModeActive ? selectedDay === dateStr : undefined,
    "aria-label": day ? dateStr : undefined,
    title: day ? dateStr : undefined,
    style: cellStyle,
  };
}

// Legend item component
function LegendItem({ colorClass, label }) {
  return (
    <span className="legend-item">
      <span className={`legend-color-box ${colorClass}`} />
      {label}
    </span>
  );
}

const ActivityCalendar = ({
  activity = {},
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  onDayClick,
  selectedDay,
  isCopyModeActive = false,
  showLegend = true,
  showFooter = true,
}) => {
  const monthLabel = useMemo(
    () =>
      new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    [year, month]
  );

  const gridDays = useMemo(() => getGridDays(year, month), [year, month]);

  // Calculate today's date string once per render of ActivityCalendar
  const todayDate = new Date();
  const todayStr = getDateStr(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate()
  );
  return (
    <section
      className="activity-calendar calendar-widget-container"
      aria-label="Activity calendar"
    >
      <header className="activity-calendar-header">
        <span role="img" aria-label="Calendar" className="calendar-header-icon">
          📆
        </span>
        <h3>{monthLabel}</h3>
      </header>
      <div className="activity-calendar-content">
        <div className="calendar-grid-controls-group">
          <div
            className="calendar-grid-container"
            tabIndex={0}
            aria-label={`Monthly activity, ${monthLabel}`}
          >
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="calendar-header-day">
                {d}
              </div>
            ))}
            {gridDays.map((day, i) => {
              const cellProps = getDayProps(
                day,
                selectedDay,
                onDayClick,
                year,
                month,
                activity,
                isCopyModeActive,
                todayStr // Pass down the calculated today string
              );
              return (
                <div key={i + DAYS_OF_WEEK.length} {...cellProps}>
                  {day || ""}
                </div>
              );
            })}
          </div>
          <nav className="calendar-controls" aria-label="Calendar navigation">
            <button
              onClick={onPrevMonth}
              className="calendar-nav-btn"
              aria-label="Previous month"
              type="button"
            >
              &lt; Previous
            </button>
            <button
              onClick={onToday}
              className="calendar-nav-btn"
              aria-label="Go to this month"
              type="button"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="calendar-nav-btn"
              aria-label="Next month"
              type="button"
            >
              Next &gt;
            </button>
          </nav>
        </div>
        {showLegend && (
          <div className="activity-legend">
            <div className="activity-legend-title">Legend:</div>
            <LegendItem colorClass="activity-low" label="1 task completed" />
            <LegendItem
              colorClass="activity-medium"
              label="2 tasks completed"
            />
            <LegendItem colorClass="activity-high" label="3 tasks completed" />
            <LegendItem colorClass="activity-four" label="4 tasks completed" />
            <LegendItem colorClass="activity-five" label="5 tasks completed" />
            <LegendItem colorClass="activity-max" label="6+ tasks completed" />
            <LegendItem colorClass="activity-worked" label="Tasks (0 done)" />
            <LegendItem colorClass="no-activity" label="No activity" />
            <LegendItem colorClass="today" label="Today" />
          </div>
        )}
      </div>
      {showFooter && (
        <footer>
          <p className="calendar-note">
            View shows tasks or activity for this month.
            <br />
            <strong>Tip:</strong> Click or focus days for details. Complete more
            to boost your streak and calendar colors!
          </p>
        </footer>
      )}
    </section>
  );
};

ActivityCalendar.propTypes = {
  activity: PropTypes.objectOf(
    PropTypes.shape({
      tasksCompleted: PropTypes.number.isRequired,
      worked: PropTypes.bool.isRequired,
    })
  ),
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  onPrevMonth: PropTypes.func,
  onNextMonth: PropTypes.func,
  onToday: PropTypes.func,
  onDayClick: PropTypes.func.isRequired,
  selectedDay: PropTypes.string,
  isCopyModeActive: PropTypes.bool,
  showLegend: PropTypes.bool,
  showFooter: PropTypes.bool,
};

export default React.memo(ActivityCalendar);
