import {
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
  isWithinInterval,
} from "./dateHelpers";

export const calculateDsaProgress = (dsaData, completedDsaProblems) => {
  const completed = Object.keys(completedDsaProblems || {}).length;
  const total = dsaData.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
};

export const calculateChessProgress = (
  playlistVideoData,
  completedChessVideos
) => {
  const completed = Object.keys(completedChessVideos || {}).length;
  const total = Object.values(playlistVideoData || {}).reduce(
    (acc, playlist) => acc + (playlist?.videos?.length || 0),
    0
  );
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
};

export const calculateEngagementProgress = (engagementTasksData) => {
  const todayObj = new Date();
  const todayStr = dateToDDMMYYYY(todayObj);
  const allTasks = Object.values(engagementTasksData || {}).flat();

  const tasksActiveToday = allTasks.filter((task) => {
    const taskStart = parseDDMMYYYYToDateObj(task.date);
    const taskEnd = task.endDate
      ? parseDDMMYYYYToDateObj(task.endDate)
      : taskStart;
    return isWithinInterval(todayObj, { start: taskStart, end: taskEnd });
  });

  const todaysCompleted = tasksActiveToday.filter(
    (task) => task.completions && task.completions[todayStr]
  ).length;

  const todaysTotal = tasksActiveToday.length;
  const todaysPercent =
    todaysTotal > 0 ? Math.round((todaysCompleted / todaysTotal) * 100) : 0;
  return {
    todaysCompleted,
    todaysTotal,
    todaysPercent,
  };
};
