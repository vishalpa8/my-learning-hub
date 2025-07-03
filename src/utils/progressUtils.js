import {
  dateToDDMMYYYY,
  parseDDMMYYYYToDateObj,
  isWithinInterval,
} from "./dateHelpers";

/**
 * Calculates progress for a list of items.
 * @param {Array<Object>} items - The list of items to calculate progress for.
 * @param {Object.<string, boolean>} completedItems - An object mapping item IDs to their completion status (true if completed).
 * @param {function(Object): string} [getItemId=(item) => item.id] - A function to extract the ID from an item.
 * @param {function(Object): Array<Object>} [getSubItems=null] - Optional function to get sub-items if items are nested (e.g., playlists containing videos).
 * @returns {{completed: number, total: number, percent: number}} An object with the count of completed items, total items, and completion percentage.
 */
export const calculateProgress = (
  items,
  completedItems,
  getItemId = (item) => item.id,
  getSubItems = null
) => {
  let total = 0;
  let completed = 0;

  const safeCompletedItems = completedItems || {}; // Ensure it's an object

  items.forEach((item) => {
    if (getSubItems) {
      const subItems = getSubItems(item) || [];
      total += subItems.length;
      subItems.forEach((subItem) => {
        if (safeCompletedItems[getItemId(subItem)]) completed++;
      });
    } else {
      total++;
      if (safeCompletedItems[getItemId(item)]) completed++;
    }
  });

  // Ensure completed and total are numbers before calculation
  const numericCompleted = Number(completed);
  const numericTotal = Number(total);

  return {
    completed: numericCompleted,
    total: numericTotal,
    percent: numericTotal > 0 ? (numericCompleted / numericTotal) * 100 : 0,
  };
};

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
