// Streak calculator for PactTrack
import { parseISO, subDays, format } from 'date-fns';

export function calculateStreak(taskLogs, tasks, userId, currentDate) {
  if (!userId || !currentDate) return 0;

  // Check if user has any tasks at all — if not, no streak possible
  const userTasks = tasks.filter(t => t.userId === userId);
  if (userTasks.length === 0) return 0;

  let streak = 0;
  let date = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  let daysChecked = 0;
  const maxLookback = 365;

  while (daysChecked < maxLookback) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = taskLogs.filter(l => l.userId === userId && l.date === dateStr);
    const dayTasks = userTasks.filter(t => t.daysOfWeek && t.daysOfWeek.includes(format(date, 'EEEE')));

    if (dayTasks.length === 0) { date = subDays(date, 1); daysChecked++; continue; }

    const nonSkipped = dayLogs.filter(l => l.status !== 'skipped');
    const allDone = nonSkipped.length > 0 && nonSkipped.every(l => l.status === 'done');
    const hasLogs = dayLogs.length >= dayTasks.length;

    if (allDone && hasLogs) { streak++; date = subDays(date, 1); daysChecked++; }
    else if (dayLogs.length === 0 && daysChecked === 0) {
      // Today has no logs yet — skip to yesterday
      date = subDays(date, 1);
      daysChecked++;
    }
    else break;
  }
  return streak;
}

export function getLongestStreak(taskLogs, tasks, userId) {
  if (taskLogs.length === 0) return 0;
  const dates = [...new Set(taskLogs.filter(l => l.userId === userId).map(l => l.date))].sort();
  if (dates.length === 0) return 0;

  let longest = 0, current = 0;
  for (const dateStr of dates) {
    const date = parseISO(dateStr);
    const dayLogs = taskLogs.filter(l => l.userId === userId && l.date === dateStr);
    const nonSkipped = dayLogs.filter(l => l.status !== 'skipped');
    const allDone = nonSkipped.length > 0 && nonSkipped.every(l => l.status === 'done');
    if (allDone) { current++; longest = Math.max(longest, current); }
    else { current = 0; }
  }
  return longest;
}

export function getStreakMilestone(streak) {
  if (streak >= 100) return { icon: '🏆', label: 'Legend', level: 4 };
  if (streak >= 60) return { icon: '💎', label: 'Diamond', level: 3 };
  if (streak >= 30) return { icon: '⭐', label: 'Gold', level: 2 };
  if (streak >= 7) return { icon: '🔥', label: 'On Fire', level: 1 };
  return null;
}

export function getCompletionPercentage(taskLogs, tasks, userId, date) {
  const dayLogs = taskLogs.filter(l => l.userId === userId && l.date === date);
  const dayName = format(parseISO(date), 'EEEE');
  const dayTasks = tasks.filter(t => t.userId === userId && t.daysOfWeek.includes(dayName));
  if (dayTasks.length === 0) return 100;
  const done = dayLogs.filter(l => l.status === 'done').length;
  return Math.round((done / dayTasks.length) * 100);
}
