// Date helpers for PactTrack — IST (Asia/Kolkata) timezone
import { format, startOfWeek, endOfWeek, addDays, subDays, differenceInDays, isSameDay, isMonday, startOfMonth, endOfMonth, parseISO, addWeeks, subWeeks, isBefore, isAfter } from 'date-fns';

const IST_OFFSET = 5.5 * 60; // +5:30 in minutes

/** Get current time in IST */
export function nowIST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + IST_OFFSET * 60000);
}

/** Format date as YYYY-MM-DD in IST */
export function todayIST() {
  return format(nowIST(), 'yyyy-MM-dd');
}

/** Get the day name (Monday, Tuesday, etc.) for a date string */
export function getDayName(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'EEEE');
}

/** Get short day name (Mon, Tue, etc.) */
export function getShortDayName(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'EEE');
}

/** Format date for display: "Mon, Apr 26" */
export function formatDateDisplay(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'EEE, MMM d');
}

/** Format date long: "Monday, April 26, 2026" */
export function formatDateLong(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'EEEE, MMMM d, yyyy');
}

/** Format time: "07:00 AM" */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** Get current month string: "2026-04" */
export function currentMonthIST() {
  return format(nowIST(), 'yyyy-MM');
}

/** Get array of dates for the current week (Mon-Sun) */
export function getCurrentWeekDates() {
  const today = nowIST();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
}

/** Get the week start date (Monday) for a given date */
export function getWeekStart(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/** Get week end date (Sunday) */
export function getWeekEnd(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(endOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/** Check if we need a daily reset (after 11:59 PM IST) */
export function needsDailyReset(lastResetDate) {
  if (!lastResetDate) return true;
  const today = todayIST();
  return today !== lastResetDate;
}

/** Check if today is Monday (for weekly review) */
export function isTodayMonday() {
  return isMonday(nowIST());
}

/** Get dates for the past N weeks (for analytics) */
export function getPastWeekStarts(n) {
  const today = nowIST();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: n }, (_, i) =>
    format(subWeeks(currentWeekStart, i), 'yyyy-MM-dd')
  ).reverse();
}

/** Get month boundaries */
export function getMonthStart(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(startOfMonth(d), 'yyyy-MM-dd');
}

export function getMonthEnd(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(endOfMonth(d), 'yyyy-MM-dd');
}

/** Get array of dates between two dates */
export function getDatesBetween(startStr, endStr) {
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  const dates = [];
  let current = start;
  while (!isAfter(current, end)) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }
  return dates;
}

/** Get tomorrow's date */
export function tomorrowIST() {
  return format(addDays(nowIST(), 1), 'yyyy-MM-dd');
}

/** Day name to index mapping (Monday = 0) */
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Get the day index (0=Monday) for today */
export function todayDayIndex() {
  const dayName = getDayName(nowIST());
  return DAY_NAMES.indexOf(dayName);
}

/** Format currency */
export function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export { differenceInDays, isSameDay, parseISO, addDays, subDays, isBefore, isAfter };
