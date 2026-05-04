import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import WeeklyReviewModal from './components/WeeklyReviewModal';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import SharedDashboard from './pages/SharedDashboard';
import Friends from './pages/Friends';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import PomodoroTimer from './pages/PomodoroTimer';
import { isTodayMonday } from './utils/dateHelpers';

export default function App() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const theme = useStore(s => s.theme);
  const performDailyReset = useStore(s => s.performDailyReset);
  const weeklyReviewDismissed = useStore(s => s.weeklyReviewDismissed);
  const taskLogs = useStore(s => s.taskLogs);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchInitialData = useStore(s => s.fetchInitialData);

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      fetchInitialData(user.uid);
      performDailyReset();
    }
  }, [isAuthenticated, user?.uid, fetchInitialData]);

  const storeLoading = useStore(s => s.isLoading);

  if (loading || (isAuthenticated && storeLoading)) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🤝</div>
          <div style={{ fontWeight: 600 }}>Loading PactTrack...</div>
        </div>
      </div>
    );
  }

  const showWeeklyReview = isAuthenticated && isTodayMonday() && !weeklyReviewDismissed && taskLogs.length > 0;

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Auth />
      ) : (
        <>
          {showWeeklyReview && <WeeklyReviewModal />}
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/shared" element={<SharedDashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/timer" element={<PomodoroTimer />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}
