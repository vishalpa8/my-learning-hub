// ActivityCalendar.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import "./EngagementPage.css";
import { dateToDDMMYYYY } from "../../utils/dateHelpers";

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



// Helper to get props for each day cell
function getDayProps(
  day,
  selectedDay,
  onDayClick,
  year,
  month,
  activity,
  isCopyModeActive,
  currentTodayStr,
  copyableDays // <-- new param
) {
  if (!day) {
    return {
      className: "calendar-day empty",
      style: { pointerEvents: "none" },
      tabIndex: -1,
      "aria-disabled": true,
    };
  }

  const dateStr = dateToDDMMYYYY(new Date(year, month, day));
  let className = "calendar-day";
  const cellStyle = {};

  // In copy mode, only allow days in copyableDays
  let isCopyable = true;
  if (isCopyModeActive && copyableDays) {
    isCopyable = copyableDays.has
      ? copyableDays.has(dateStr)
      : Array.isArray(copyableDays)
      ? copyableDays.includes(dateStr)
      : false;
    if (!isCopyable) {
      className += " not-copyable";
      cellStyle.pointerEvents = "none";
      cellStyle.opacity = 0.5;
      return {
        className,
        style: cellStyle,
        tabIndex: -1,
        "aria-disabled": true,
        title: "No copyable tasks on this day",
      };
    }
  }

  // Activity coloring
  const act = activity?.[dateStr];
  if (act) {
    if (act.tasksCompleted >= 6) className += " activity-max";
    else if (act.tasksCompleted === 5) className += " activity-five";
    else if (act.tasksCompleted === 4) className += " activity-four";
    else if (act.tasksCompleted === 3) className += " activity-high";
    else if (act.tasksCompleted === 2) className += " activity-medium";
    else if (act.tasksCompleted === 1) className += " activity-low";
    else if (act.worked) className += " activity-worked";
    else className += " no-activity";
  } else {
    className += " no-activity";
  }

  if (dateStr === currentTodayStr) className += " today";
  if (isCopyModeActive) cellStyle.cursor = isCopyable ? "copy" : "not-allowed";
  if (selectedDay === dateStr) className += " selected";

  return {
    className,
    onClick: () => isCopyable && onDayClick?.(dateStr),
    tabIndex: 0,
    role: "button",
    "aria-selected": !isCopyModeActive ? selectedDay === dateStr : undefined,
    "aria-label": dateStr,
    title: dateStr,
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

const LEGEND_ITEMS = [
  { colorClass: "activity-low", label: "1 task completed" },
  { colorClass: "activity-medium", label: "2 tasks completed" },
  { colorClass: "activity-high", label: "3 tasks completed" },
  { colorClass: "activity-four", label: "4 tasks completed" },
  { colorClass: "activity-five", label: "5 tasks completed" },
  { colorClass: "activity-max", label: "6+ tasks completed" },
  { colorClass: "activity-worked", label: "Tasks (0 done)" },
  { colorClass: "no-activity", label: "No activity" },
  { colorClass: "today", label: "Today" },
];

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
  copyableDays, // <-- new prop
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

  const todayStr = useMemo(() => dateToDDMMYYYY(new Date()), []);

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
                todayStr,
                copyableDays // <-- pass down
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
            {LEGEND_ITEMS.map((item) => (
              <LegendItem key={item.colorClass} {...item} />
            ))}
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
  copyableDays: PropTypes.oneOfType([
    PropTypes.instanceOf(Set),
    PropTypes.arrayOf(PropTypes.string),
  ]), // Accept Set or array
};
export default ActivityCalendar;
