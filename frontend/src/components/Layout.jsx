import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const currentUser = user;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {/* Mobile header */}
        <div style={{ display: 'none', marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🤝</span>
            <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>PactTrack</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <ThemeToggle />
            {currentUser && (
               <button 
                 onClick={logout}
                 style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                 aria-label="Logout"
               >
                 🚪 Logout
               </button>
            )}
          </div>
        </div>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <style>{`
        @media (max-width: 1024px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
