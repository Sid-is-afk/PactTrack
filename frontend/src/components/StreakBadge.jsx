import { getStreakMilestone } from '../utils/streakCalculator';

export default function StreakBadge({ streak, longestStreak, compact = false }) {
  const milestone = getStreakMilestone(streak);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{milestone?.icon || '🔥'}</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: streak > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>{streak}</span>
      </div>
    );
  }

  return (
    <div className="card-flat" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 8, animation: streak > 0 ? 'bounce-in 0.5s ease' : 'none' }}>
        {milestone?.icon || (streak > 0 ? '🔥' : '💤')}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: streak > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>
        {streak}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
        {streak === 1 ? 'day streak' : 'day streak'}
      </div>
      {milestone && (
        <div className="badge badge-amber" style={{ marginTop: 8, justifyContent: 'center' }}>
          {milestone.label}
        </div>
      )}
      {longestStreak !== undefined && (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
          Best: {longestStreak} days
        </div>
      )}
    </div>
  );
}
