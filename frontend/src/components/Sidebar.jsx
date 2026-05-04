import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import StreakBadge from './StreakBadge';
import { calculateStreak } from '../utils/streakCalculator';
import { todayIST } from '../utils/dateHelpers';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/schedule', icon: '📅', label: 'Schedule' },
  { path: '/friends', icon: '👥', label: 'Friends' },
  { path: '/shared', icon: '🤝', label: 'Shared' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/goals', icon: '🎯', label: 'Goals' },
  { path: '/timer', icon: '⏱️', label: 'Timer' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const currentUser = user;
  const level = useStore(s => s.level);
  const xp = useStore(s => s.xp);
  const tasks = useStore(s => s.tasks);
  const taskLogs = useStore(s => s.taskLogs);
  
  const streak = calculateStreak(taskLogs, tasks, currentUser?.uid, todayIST());

  return (
    <aside className="app-sidebar">
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🤝</span>
          <h1 className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>PactTrack</h1>
        </div>
      </div>

      {currentUser && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
            {currentUser.name[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              {currentUser.name}
              <span style={{ fontSize: 10, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>Lvl {level}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <StreakBadge streak={streak} compact />
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{xp} XP</div>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 4, transition: 'all 0.2s',
              background: isActive ? 'rgba(20,184,166,0.1)' : 'transparent',
              color: isActive ? '#14b8a6' : 'var(--text-secondary)',
            })} aria-label={item.label}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={logout} 
          style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8 }}
          aria-label="Logout"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <span>🚪</span> Logout
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
}
