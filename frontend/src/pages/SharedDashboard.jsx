import { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import PiggyBankCard from '../components/PiggyBankCard';
import EmptyState from '../components/EmptyState';
import { todayIST, getDayName, formatDateLong, currentMonthIST } from '../utils/dateHelpers';
import { apiGet } from '../utils/api';

export default function SharedDashboard() {
  const { user } = useAuth();
  const currentUser = user;
  
  // Current user's local store
  const tasks = useStore(s => s.tasks);
  const rawTaskLogs = useStore(s => s.taskLogs);
  const taskLogs = useMemo(() => rawTaskLogs.filter(l => tasks.some(t => t.id === l.taskId)), [rawTaskLogs, tasks]);
  const rawFines = useStore(s => s.fines);
  const fines = useMemo(() => rawFines.filter(f => taskLogs.some(l => l.id === f.taskLogId)), [rawFines, taskLogs]);

  // Friend states
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [partnerData, setPartnerData] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [partnerError, setPartnerError] = useState('');

  const today = todayIST();
  const dayName = getDayName(today);
  const month = currentMonthIST();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendsData = await apiGet('/friendships');
        setFriends(friendsData);
        // Only consider friends where both have mutually agreed to share
        const sharedFriends = friendsData.filter(f => f.requesterSharesDashboard && f.addresseeSharesDashboard);
        if (sharedFriends.length > 0) {
          setSelectedFriendId(sharedFriends[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedFriendId) {
      setPartnerData(null);
      return;
    }
    const fetchPartnerData = async () => {
      setLoadingPartner(true);
      setPartnerError('');
      try {
        const data = await apiGet(`/users/${selectedFriendId}/shared-dashboard`);
        setPartnerData(data);
      } catch (err) {
        setPartnerError(err.message || 'Failed to fetch dashboard data');
        setPartnerData(null);
      } finally {
        setLoadingPartner(false);
      }
    };
    fetchPartnerData();
  }, [selectedFriendId]);

  if (!currentUser) return null;

  const sharedFriends = friends.filter(f => f.requesterSharesDashboard && f.addresseeSharesDashboard);
  
  const getTasksForUser = (isOwn) => {
    if (isOwn) {
      return tasks.filter(t => t.daysOfWeek.includes(dayName));
    } else {
      return partnerData?.tasks?.filter(t => t.daysOfWeek.includes(dayName)) || [];
    }
  };

  const getLogsForUser = (userTasks, isOwn) => {
    if (isOwn) {
      return taskLogs.filter(l => l.date === today && userTasks.some(t => t.id === l.taskId));
    } else {
      return partnerData?.taskLogs?.filter(l => l.date === today && userTasks.some(t => t.id === l.taskId)) || [];
    }
  };

  const finesA = fines.filter(f => f.month === month);
  const finesB = partnerData?.fines?.filter(f => f.month === month) || [];

  const renderUserColumn = (userData, isOwn) => {
    if (!userData && !isOwn) return null;
    
    const userTasks = getTasksForUser(isOwn);
    const userLogs = getLogsForUser(userTasks, isOwn);
    const done = userLogs.filter(l => l.status === 'done').length;
    const total = userTasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: isOwn ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
            {userData.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{userData.name} {isOwn && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>(You)</span>}</h3>
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

  if (loadingFriends) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>👥 Shared Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{formatDateLong(today)}</p>
        </div>
        
        {sharedFriends.length > 0 && (
          <select 
            className="input" 
            value={selectedFriendId} 
            onChange={e => setSelectedFriendId(e.target.value)}
            style={{ minWidth: 200 }}
          >
            {sharedFriends.map(f => (
              <option key={f.id} value={f.id}>{f.name}'s Dashboard</option>
            ))}
          </select>
        )}
      </div>

      {friends.length === 0 ? (
        <EmptyState icon="👥" title="No friends yet" message="Go to the Community page to add friends and share your dashboard!" />
      ) : sharedFriends.length === 0 ? (
        <EmptyState icon="🔒" title="No shared dashboards" message="You must mutually agree to share dashboards with a friend in the Community tab." />
      ) : partnerError ? (
        <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          ⚠️ {partnerError}
        </div>
      ) : loadingPartner ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading partner data...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            {renderUserColumn(currentUser, true)}
            {renderUserColumn(partnerData, false)}
          </div>

          <div style={{ maxWidth: 400, margin: '0 auto', paddingBottom: 24 }}>
            <PiggyBankCard 
              userAName={currentUser.name} 
              userBName={partnerData?.name || 'Partner'} 
              finesA={finesA} 
              finesB={finesB} 
              month={month} 
            />
          </div>
        </>
      )}
    </div>
  );
}
