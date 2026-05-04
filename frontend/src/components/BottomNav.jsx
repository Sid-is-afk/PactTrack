import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '📊', label: 'Home' },
  { path: '/schedule', icon: '📅', label: 'Schedule' },
  { path: '/friends', icon: '👥', label: 'Friends' },
  { path: '/shared', icon: '🤝', label: 'Shared' },
  { path: '/analytics', icon: '📈', label: 'Stats' },
  { path: '/goals', icon: '🎯', label: 'Goals' },
  { path: '/timer', icon: '⏱️', label: 'Timer' },
  { path: '/profile', icon: '👤', label: 'Me' },
];

export default function BottomNav() {
  return (
    <nav className="app-bottom-nav" aria-label="Main navigation">
      {navItems.map(item => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', fontSize: 10, fontWeight: 600, padding: '6px 4px', borderRadius: 12, transition: 'all 0.2s',
            color: isActive ? '#14b8a6' : 'var(--text-tertiary)',
          })} aria-label={item.label}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
