export default function DailySummaryCard({ totalTasks, doneTasks, fineToday }) {
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#ef4444' : 'var(--text-tertiary)';

  return (
    <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
      <div className="completion-ring">
        <svg width="100" height="100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-input)" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <span className="ring-text" style={{ color }}>{pct}%</span>
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Today's Progress</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 }}>
          {doneTasks}/{totalTasks} tasks completed
        </p>
        {fineToday > 0 && (
          <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
            💸 ₹{fineToday} in fines today
          </p>
        )}
        {pct === 100 && totalTasks > 0 && (
          <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>✨ Perfect day!</p>
        )}
      </div>
    </div>
  );
}
