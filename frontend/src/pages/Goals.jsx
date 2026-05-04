import { useState } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { todayIST, addDays, parseISO, differenceInDays, isSameDay, isBefore, isAfter, formatDateDisplay, SHORT_DAY_NAMES } from '../utils/dateHelpers';
import { format, subDays } from 'date-fns';

export default function Goals() {
  const { user } = useAuth();
  const activeUserId = user?.uid;
  const goals = useStore(s => s.goals);
  const tasks = useStore(s => s.tasks);
  const taskLogs = useStore(s => s.taskLogs);
  const goalLogs = useStore(s => s.goalLogs);
  const addGoal = useStore(s => s.addGoal);
  const updateGoal = useStore(s => s.updateGoal);
  const deleteGoal = useStore(s => s.deleteGoal);
  const toggleGoalLog = useStore(s => s.toggleGoalLog);

  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '',
    startDate: todayIST(),
    endDate: format(addDays(parseISO(todayIST()), 30), 'yyyy-MM-dd')
  });

  const today = todayIST();
  const userGoals = goals.filter(g => g.userId === activeUserId);

  const openCreate = () => { 
    setForm({ 
      title: '', 
      description: '', 
      startDate: todayIST(), 
      endDate: format(addDays(parseISO(todayIST()), 30), 'yyyy-MM-dd') 
    }); 
    setEditGoal(null); 
    setShowForm(true); 
  };

  const openEdit = (g) => { 
    setForm({ 
      title: g.title, 
      description: g.description || '',
      startDate: g.startDate || todayIST(),
      endDate: g.endDate || format(addDays(parseISO(todayIST()), 30), 'yyyy-MM-dd')
    }); 
    setEditGoal(g); 
    setShowForm(true); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { 
      title: form.title.trim(), 
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate
    };
    if (editGoal) updateGoal(editGoal.id, data);
    else addGoal({ ...data, userId: activeUserId });
    setShowForm(false);
  };

  const getGoalProgress = (goal) => {
    const linked = tasks.filter(t => t.goalId === goal.id);
    let taskCompletion = 0;
    if (linked.length > 0) {
      let done = 0, total = 0;
      linked.forEach(t => {
        const logs = taskLogs.filter(l => l.taskId === t.id);
        done += logs.filter(l => l.status === 'done').length;
        total += logs.length || 0;
      });
      taskCompletion = total > 0 ? (done / total) : 0;
    }

    let logCompletion = 0;
    let daysDiff = 0;
    if (goal.startDate && goal.endDate) {
      daysDiff = differenceInDays(parseISO(goal.endDate), parseISO(goal.startDate)) + 1;
      const completedCount = goalLogs.filter(l => l.goalId === goal.id).length;
      logCompletion = daysDiff > 0 ? (completedCount / daysDiff) : 0;
    }

    let finalCompletion = 0;
    if (linked.length > 0 && goal.startDate && goal.endDate) {
      finalCompletion = Math.round(((taskCompletion + logCompletion) / 2) * 100);
    } else if (linked.length > 0) {
      finalCompletion = Math.round(taskCompletion * 100);
    } else if (goal.startDate && goal.endDate) {
      finalCompletion = Math.round(logCompletion * 100);
    }

    return { 
      linked: linked.length, 
      completion: finalCompletion, 
      logCount: goalLogs.filter(l => l.goalId === goal.id).length, 
      totalDays: daysDiff > 0 ? daysDiff : 0 
    };
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(parseISO(today), 6 - i);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🎯 Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track your long-term objectives & daily consistency</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ New Goal</button>
      </div>

      {userGoals.length === 0 ? (
        <EmptyState icon="🎯" title="No goals yet" message="Create goals with date ranges and track your daily progress" action={openCreate} actionLabel="Create First Goal" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {userGoals.map(goal => {
            const { linked, completion, logCount, totalDays } = getGoalProgress(goal);
            const isTodayLogged = goalLogs.some(l => l.goalId === goal.id && l.date === today);
            const isTodayInRange = goal.startDate && goal.endDate && 
                                  !isBefore(parseISO(today), parseISO(goal.startDate)) && 
                                  !isAfter(parseISO(today), parseISO(goal.endDate));

            return (
              <div key={goal.id} className="card" style={{ padding: 24, animation: 'fade-in 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{goal.title}</h3>
                    {goal.startDate && goal.endDate && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📅 {formatDateDisplay(goal.startDate)} - {formatDateDisplay(goal.endDate)}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={() => openEdit(goal)} aria-label="Edit goal">✏️</button>
                    <button className="btn-icon" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal" style={{ color: '#ef4444' }}>🗑️</button>
                  </div>
                </div>

                {goal.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{goal.description}</p>}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                    <span>{completion}%</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--bg-input)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${completion}%`, background: completion >= 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #14b8a6, #2dd4bf)', borderRadius: 5, transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Daily Check-ins</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{logCount} / {totalDays} days</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                    {last7Days.map(date => {
                      const isLogged = goalLogs.some(l => l.goalId === goal.id && l.date === date);
                      const isDateInRange = goal.startDate && goal.endDate && 
                                           !isBefore(parseISO(date), parseISO(goal.startDate)) && 
                                           !isAfter(parseISO(date), parseISO(goal.endDate));
                      const isToday = date === today;

                      return (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                          <div 
                            onClick={() => isDateInRange && toggleGoalLog(goal.id, date)}
                            style={{ 
                              width: '100%', 
                              height: 32, 
                              borderRadius: 6, 
                              background: isLogged ? 'var(--accent-teal)' : isToday ? 'var(--bg-input)' : 'transparent',
                              border: `1.5px dashed ${isDateInRange ? 'var(--accent-teal)' : 'var(--bg-input)'}`,
                              opacity: isDateInRange ? 1 : 0.3,
                              cursor: isDateInRange ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              color: isLogged ? 'white' : 'inherit',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isLogged ? '✓' : ''}
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: isToday ? 800 : 400 }}>
                            {format(parseISO(date), 'EEE')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  className={isTodayLogged ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => toggleGoalLog(goal.id, today)}
                  disabled={!isTodayInRange}
                  style={{ width: '100%', justifyContent: 'center', opacity: isTodayInRange ? 1 : 0.5 }}
                >
                  {isTodayLogged ? 'Marked as Done Today' : 'Mark Today as Done'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editGoal ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Goal Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Run a 5K" autoFocus required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
            <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What do you want to achieve?" rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>End Date</label>
              <input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {editGoal ? 'Save' : 'Create Goal'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
