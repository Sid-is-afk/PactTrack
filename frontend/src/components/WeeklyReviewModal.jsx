import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { todayIST, currentMonthIST, formatCurrency, getWeekStart } from '../utils/dateHelpers';
import { calculateStreak } from '../utils/streakCalculator';
import { calculateWeeklyCompletion } from '../utils/competitionHelper';
import { subWeeks, format, parseISO } from 'date-fns';

export default function WeeklyReviewModal() {
  const { user } = useAuth();
  const activeUserId = user?.uid;
  const tasks = useStore(s => s.tasks);
  const taskLogs = useStore(s => s.taskLogs);
  const fines = useStore(s => s.fines);
  const setWeeklyReviewDismissed = useStore(s => s.setWeeklyReviewDismissed);

  const activeUser = user;
  const today = todayIST();
  const lastWeekStart = format(subWeeks(parseISO(getWeekStart(today)), 1), 'yyyy-MM-dd');

  const completion = calculateWeeklyCompletion(taskLogs, tasks, activeUserId, lastWeekStart);
  const streak = calculateStreak(taskLogs, tasks, activeUserId, today);
  const month = currentMonthIST();
  const weekFines = fines.filter(f => f.userId === activeUserId && f.date >= lastWeekStart).reduce((s, f) => s + f.amount, 0);

  // Find most missed task
  const missCount = {};
  taskLogs.filter(l => l.userId === activeUserId && l.status === 'not-done' && l.date >= lastWeekStart).forEach(l => {
    const task = tasks.find(t => t.id === l.taskId);
    const name = task?.name || 'Unknown';
    missCount[name] = (missCount[name] || 0) + 1;
  });
  const topMissed = Object.entries(missCount).sort((a, b) => b[1] - a[1])[0];

  // Auto tip
  let tip = '🌟 Keep up the great work!';
  if (topMissed && topMissed[1] >= 3) {
    tip = `💡 You missed "${topMissed[0]}" ${topMissed[1]} times — try moving it to a different time slot.`;
  } else if (completion < 50) {
    tip = '💡 Try starting with fewer tasks and building up gradually.';
  } else if (completion < 80) {
    tip = '💡 You\'re almost there! Focus on consistency over perfection.';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: 32, animation: 'scale-in 0.3s ease-out', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Last Week in Review</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Here's how you did, {activeUser?.name}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: completion >= 80 ? '#22c55e' : completion >= 50 ? '#f59e0b' : '#ef4444' }}>{completion}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Completion</div>
          </div>
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(weekFines)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Fines</div>
          </div>
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{streak}🔥</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Current Streak</div>
          </div>
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{topMissed ? topMissed[0] : '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Top Missed</div>
          </div>
        </div>

        <div className="card-flat" style={{ padding: 14, marginBottom: 20, textAlign: 'left' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{tip}</p>
        </div>

        <button className="btn-primary" onClick={() => setWeeklyReviewDismissed(true)} style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}>
          Got it! Let's crush this week 💪
        </button>
      </div>
    </div>
  );
}
