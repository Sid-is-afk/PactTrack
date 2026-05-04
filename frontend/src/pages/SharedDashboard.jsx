import { useMemo } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import PiggyBankCard from '../components/PiggyBankCard';
import EmptyState from '../components/EmptyState';
import { todayIST, getDayName, formatDateLong, currentMonthIST } from '../utils/dateHelpers';

export default function SharedDashboard() {
  const { user } = useAuth();
  const currentUser = user;
  const partner = null; // Phase 2: Fetch from backend
  const tasks = useStore(s => s.tasks);
  const rawTaskLogs = useStore(s => s.taskLogs);
  const taskLogs = useMemo(() => rawTaskLogs.filter(l => tasks.some(t => t.id === l.taskId)), [rawTaskLogs, tasks]);
  const rawFines = useStore(s => s.fines);
  const fines = useMemo(() => rawFines.filter(f => taskLogs.some(l => l.id === f.taskLogId)), [rawFines, taskLogs]);

  const today = todayIST();
  const dayName = getDayName(today);
  const month = currentMonthIST();

  if (!currentUser || !partner) return null;

  const getTasksForUser = (userId) => {
    const userTasks = tasks.filter(t => t.userId === userId && t.daysOfWeek.includes(dayName));
    return userId === currentUser.uid
      ? userTasks
      : userTasks.filter(t => !t.isPrivate);
  };

  const getLogsForUser = (userId, userTasks) => taskLogs.filter(l => l.userId === userId && l.date === today && userTasks.some(t => t.id === l.taskId));

  const finesA = fines.filter(f => f.userId === currentUser.uid);
  const finesB = fines.filter(f => f.userId === partner?.id);

  const renderUserColumn = (user, isOwn) => {
    const userTasks = getTasksForUser(user.id || user.uid);
    const userLogs = getLogsForUser(user.id || user.uid, userTasks);
    const done = userLogs.filter(l => l.status === 'done').length;
    const total = userTasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: isOwn ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
            {user.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{user.name} {isOwn && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>(You)</span>}</h3>
            <div style={{ fontSize: 12, color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : 'var(--text-tertiary)' }}>{pct}% complete · {done}/{total}</div>
          </div>
        </div>

        {userTasks.length === 0 ? (
          <div className="card-flat" style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No tasks for today</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {userTasks.map(task => {
              const log = userLogs.find(l => l.taskId === task.id);
              return (
                <TaskCard key={task.id} task={task} log={log} date={today}
                  showActions={isOwn} showReactions={!isOwn}
                  viewingUserId={currentUser.uid} />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>👥 Shared Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{formatDateLong(today)}</p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        {renderUserColumn(currentUser, true)}
        {renderUserColumn(partner, false)}
      </div>

      <div style={{ maxWidth: 400, margin: '0 auto', paddingBottom: 24 }}>
        <PiggyBankCard userAName={currentUser.name} userBName={partner.name} finesA={finesA} finesB={finesB} month={month} />
      </div>
    </div>
  );
}
