// Competition helper for PactTrack
import { getCompletionPercentage } from './streakCalculator';
import { getDatesBetween, getWeekStart, getWeekEnd } from './dateHelpers';

export function calculateWeeklyCompletion(taskLogs, tasks, userId, weekStartDate) {
  const weekEnd = getWeekEnd(weekStartDate);
  const dates = getDatesBetween(weekStartDate, weekEnd);
  let totalTasks = 0, doneTasks = 0;
  for (const date of dates) {
    const logs = taskLogs.filter(l => l.userId === userId && l.date === date);
    const done = logs.filter(l => l.status === 'done').length;
    const total = logs.length;
    totalTasks += total;
    doneTasks += done;
  }
  return totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
}

export function determineWeeklyWinner(taskLogs, tasks, userAId, userBId, weekStartDate) {
  const compA = calculateWeeklyCompletion(taskLogs, tasks, userAId, weekStartDate);
  const compB = calculateWeeklyCompletion(taskLogs, tasks, userBId, weekStartDate);
  let winnerId = null;
  if (compA > compB) winnerId = userAId;
  else if (compB > compA) winnerId = userBId;
  return { winnerId, userACompletion: compA, userBCompletion: compB, week: weekStartDate };
}

export function getLeaderboard(weeklyResults, n = 8) {
  return weeklyResults.slice(-n);
}

export function getWinCounts(weeklyResults, userAId, userBId) {
  let winsA = 0, winsB = 0, ties = 0;
  weeklyResults.forEach(r => {
    if (r.winnerId === userAId) winsA++;
    else if (r.winnerId === userBId) winsB++;
    else ties++;
  });
  return { winsA, winsB, ties };
}
