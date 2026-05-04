import { useState } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { DAY_NAMES, formatTime, formatCurrency } from '../utils/dateHelpers';

export default function Schedule() {
  const { user } = useAuth();
  const activeUserId = user?.uid;
  const tasks = useStore(s => s.tasks);
  const goals = useStore(s => s.goals);
  const addTask = useStore(s => s.addTask);
  const updateTask = useStore(s => s.updateTask);
  const deleteTask = useStore(s => s.deleteTask);
  const copyDayTasks = useStore(s => s.copyDayTasks);

  const [selectedDay, setSelectedDay] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCopy, setShowCopy] = useState(false);

  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', fineAmount: 10, goalId: '', isPrivate: false });

  const dayName = DAY_NAMES[selectedDay];
  const dayTasks = tasks.filter(t => t.userId === activeUserId && t.daysOfWeek.includes(dayName));

  const openCreate = () => {
    setForm({ name: '', startTime: '', endTime: '', fineAmount: 10, goalId: '', isPrivate: false });
    setEditingTask(null);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setForm({ name: task.name, startTime: task.startTime || '', endTime: task.endTime || '', fineAmount: task.fineAmount, goalId: task.goalId || '', isPrivate: task.isPrivate });
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingTask) {
      updateTask(editingTask.id, { name: form.name.trim(), startTime: form.startTime || null, endTime: form.endTime || null, fineAmount: Number(form.fineAmount) || 10, goalId: form.goalId || null, isPrivate: form.isPrivate });
    } else {
      addTask({ userId: activeUserId, name: form.name.trim(), startTime: form.startTime || null, endTime: form.endTime || null, fineAmount: Number(form.fineAmount) || 10, goalId: form.goalId || null, isPrivate: form.isPrivate, daysOfWeek: [dayName] });
    }
    setShowForm(false);
  };

  const handleCopyDay = (targetDays) => {
    copyDayTasks(activeUserId, dayName, targetDays);
    setShowCopy(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>📅 Weekly Schedule</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Set up your recurring weekly habits</p>
      </div>

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap', paddingBottom: 4 }}>
        {DAY_NAMES.map((day, i) => (
          <button key={day} onClick={() => setSelectedDay(i)}
            style={{
              padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
              background: selectedDay === i ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'var(--bg-input)',
              color: selectedDay === i ? 'white' : 'var(--text-secondary)',
              boxShadow: selectedDay === i ? '0 2px 8px rgba(20,184,166,0.3)' : 'none',
            }}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={openCreate}>+ Add Task</button>
        {dayTasks.length > 0 && (
          <button className="btn-secondary" onClick={() => setShowCopy(true)}>📋 Copy Day</button>
        )}
      </div>

      {/* Task list */}
      {dayTasks.length === 0 ? (
        <EmptyState icon="📝" title={`No tasks for ${dayName}`} message="Add tasks to build your habit schedule" action={openCreate} actionLabel="Add First Task" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dayTasks.map(task => (
            <div key={task.id} className="card-flat" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fade-in 0.3s ease-out' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{task.name}</span>
                  {task.isPrivate && <span className="badge badge-grey" style={{ fontSize: 10 }}>🔒</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(task.startTime && task.endTime) && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>🕐 {formatTime(task.startTime)} - {formatTime(task.endTime)}</span>}
                  {task.timeSlot && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>🕐 {formatTime(task.timeSlot)}</span>}
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>💰 {formatCurrency(task.fineAmount)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {task.daysOfWeek.length === 7 ? 'Every day' : task.daysOfWeek.map(d => d.slice(0, 3)).join(', ')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" onClick={() => openEdit(task)} aria-label="Edit task">✏️</button>
                <button className="btn-icon" onClick={() => deleteTask(task.id)} aria-label="Delete task" style={{ color: '#ef4444' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Task Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Run" autoFocus required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Start Time</label>
              <input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>End Time</label>
              <input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Fine (₹)</label>
              <input className="input" type="number" min="0" value={form.fineAmount} onChange={e => setForm({ ...form, fineAmount: e.target.value })} />
            </div>
          </div>
          {goals.filter(g => g.userId === activeUserId).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Link to Goal</label>
              <select className="input" value={form.goalId} onChange={e => setForm({ ...form, goalId: e.target.value })}>
                <option value="">None</option>
                {goals.filter(g => g.userId === activeUserId).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isPrivate} onChange={e => setForm({ ...form, isPrivate: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#14b8a6' }} />
            <span>🔒 Private (hidden from partner)</span>
          </label>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {editingTask ? 'Save Changes' : 'Add Task'}
          </button>
        </form>
      </Modal>

      {/* Copy Day Modal */}
      <Modal isOpen={showCopy} onClose={() => setShowCopy(false)} title={`Copy ${dayName}'s Tasks`}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Copy all tasks from {dayName} to:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-primary" onClick={() => handleCopyDay(DAY_NAMES.filter(d => d !== dayName))} style={{ justifyContent: 'center' }}>
            All Other Days
          </button>
          {DAY_NAMES.filter(d => d !== dayName).map(d => (
            <button key={d} className="btn-secondary" onClick={() => handleCopyDay([d])} style={{ justifyContent: 'center' }}>
              {d}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
