import { useMemo } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPastWeekStarts, getWeekEnd, getDatesBetween, getShortDayName } from '../utils/dateHelpers';
import { format, subMonths, parseISO, startOfDay } from 'date-fns';
import EmptyState from '../components/EmptyState';
import Heatmap from '../components/Heatmap';

const COLORS = ['#14b8a6', '#f59e0b', '#5c7cfa', '#ef4444'];

export default function Analytics() {
  const { user } = useAuth();
  const activeUserId = user?.uid;
  const partner = null; // Phase 2: Fetch from backend
  const tasks = useStore(s => s.tasks);
  const rawTaskLogs = useStore(s => s.taskLogs);
  const rawGoalLogs = useStore(s => s.goalLogs);
  const taskLogs = useMemo(() => rawTaskLogs.filter(l => tasks.some(t => t.id === l.taskId)), [rawTaskLogs, tasks]);
  const rawFines = useStore(s => s.fines);
  const fines = useMemo(() => rawFines.filter(f => taskLogs.some(l => l.id === f.taskLogId)), [rawFines, taskLogs]);

  const activeUser = user;
  const otherUser = partner;

  // Aggregate all 'done' dates for heatmap
  const allDoneDates = useMemo(() => {
    const taskDone = taskLogs.filter(l => l.userId === activeUserId && l.status === 'done').map(l => l.date);
    const goalDone = rawGoalLogs.filter(l => l.userId === activeUserId).map(l => l.date);
    return [...new Set([...taskDone, ...goalDone])];
  }, [taskLogs, rawGoalLogs, activeUserId]);

  // Weekly completion data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weekStarts = getPastWeekStarts(4);
    return weekStarts.map(ws => {
      const we = getWeekEnd(ws);
      const dates = getDatesBetween(ws, we);
      let done = 0, total = 0;
      dates.forEach(d => {
        const logs = taskLogs.filter(l => l.userId === activeUserId && l.date === d);
        done += logs.filter(l => l.status === 'done').length;
        total += logs.length || 0;
      });
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { week: getShortDayName(ws) + ' ' + ws.slice(5), pct, done, total };
    });
  }, [taskLogs, activeUserId]);

  // Most missed tasks
  const missedTasks = useMemo(() => {
    const missCount = {};
    taskLogs.filter(l => l.userId === activeUserId && l.status === 'not-done').forEach(l => {
      const task = tasks.find(t => t.id === l.taskId);
      const name = task?.name || 'Unknown';
      missCount[name] = (missCount[name] || 0) + 1;
    });
    return Object.entries(missCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [taskLogs, tasks, activeUserId]);

  // Fine trend (last 3 months)
  const fineTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 3 }, (_, i) => {
      const d = subMonths(now, 2 - i);
      const month = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const amtA = fines.filter(f => f.userId === activeUserId && f.month === month).reduce((s, f) => s + f.amount, 0);
      const amtB = otherUser ? fines.filter(f => f.userId === otherUser.id && f.month === month).reduce((s, f) => s + f.amount, 0) : 0;
      return { month: label, [activeUser?.name || 'You']: amtA, [otherUser?.name || 'Partner']: amtB };
    });
  }, [fines, activeUserId, activeUser, otherUser]);

  const hasData = taskLogs.some(l => l.userId === activeUserId);

  if (!hasData) {
    return (
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>📈 Analytics</h1>
        <EmptyState icon="📊" title="No data yet" message="Complete some tasks to see your analytics!" />
      </div>
    );
  }

  const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 10, fontSize: 12 };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>📈 Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track your progress and habits</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Heatmap dates={allDoneDates} title="Annual Consistency" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
        {/* Weekly Completion */}
        <div className="card" style={{ padding: '20px 12px 20px 4px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Weekly Completion %</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }} />
              <Bar dataKey="pct" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Completion %" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="card" style={{ padding: '20px 12px 20px 4px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingLeft: 16 }}>Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pct" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} name="Completion %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Most Missed Tasks */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Most Missed Tasks</h3>
          {missedTasks.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 20 }}>🎉 No missed tasks!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {missedTasks.map((t, i) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)', width: 20 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((t.count / (missedTasks[0]?.count || 1)) * 100, 100)}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <span className="badge badge-danger">{t.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fine Trend */}
        <div className="card" style={{ padding: '20px 12px 20px 4px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingLeft: 16 }}>Fine Trend (3 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fineTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `₹${v}`} />
              <Bar dataKey={activeUser?.name || 'You'} fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey={otherUser?.name || 'Partner'} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
