import { useMemo } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import DailySummaryCard from '../components/DailySummaryCard';
import StreakBadge from '../components/StreakBadge';
import EmptyState from '../components/EmptyState';
import { todayIST, getDayName, formatDateLong, currentMonthIST, formatCurrency } from '../utils/dateHelpers';
import { calculateStreak, getLongestStreak } from '../utils/streakCalculator';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;
  const activeUserId = currentUser?.uid;
  const tasks = useStore(s => s.tasks);
  const rawTaskLogs = useStore(s => s.taskLogs);
  const taskLogs = useMemo(() => rawTaskLogs.filter(l => tasks.some(t => t.id === l.taskId)), [rawTaskLogs, tasks]);
  const rawFines = useStore(s => s.fines);
  const fines = useMemo(() => rawFines.filter(f => taskLogs.some(l => l.id === f.taskLogId)), [rawFines, taskLogs]);
  const weeklyResults = useStore(s => s.weeklyResults);

  const today = todayIST();
  const dayName = getDayName(today);
  const activeUser = currentUser;

  const todayTasks = tasks.filter(t => t.userId === activeUserId && t.daysOfWeek.includes(dayName));
  const todayLogs = taskLogs.filter(l => l.userId === activeUserId && l.date === today && todayTasks.some(t => t.id === l.taskId));
  const doneTasks = todayLogs.filter(l => l.status === 'done').length;
  const fineToday = fines.filter(f => f.userId === activeUserId && f.date === today).reduce((s, f) => s + f.amount, 0);

  const streak = calculateStreak(taskLogs, tasks, activeUserId, today);
  const longestStreak = getLongestStreak(taskLogs, tasks, activeUserId);

  const month = currentMonthIST();
  const monthlyFine = fines.filter(f => f.userId === activeUserId && f.month === month).reduce((s, f) => s + f.amount, 0);

  const latestResult = weeklyResults[weeklyResults.length - 1];
  const isWinner = latestResult?.winnerId === activeUserId;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            {isWinner && <span style={{ marginRight: 8 }}>🏆</span>}
            Hey, {activeUser?.name || 'there'}!
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{formatDateLong(today)}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <DailySummaryCard totalTasks={todayTasks.length} doneTasks={doneTasks} fineToday={fineToday} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StreakBadge streak={streak} longestStreak={longestStreak} />
          <div className="card-flat" style={{ padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🐷</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(monthlyFine)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>This month</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Today's Tasks</h2>
        <span className="badge badge-teal">{dayName}</span>
      </div>

      {todayTasks.length === 0 ? (
        <EmptyState icon="📅" title="No tasks for today" message="Set up your weekly schedule to start tracking habits!" action={() => navigate('/schedule')} actionLabel="Create Schedule" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayTasks.map(task => {
            const log = todayLogs.find(l => l.taskId === task.id);
            return <TaskCard key={task.id} task={task} log={log} date={today} />;
          })}
        </div>
      )}
    </div>
  );
}
