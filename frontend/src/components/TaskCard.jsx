import { useState } from 'react';
import useStore from '../store/useStore';
import { formatCurrency, formatTime } from '../utils/dateHelpers';

export default function TaskCard({ task, log, date, showActions = true, showReactions = false, viewingUserId }) {
  const setTaskStatus = useStore(s => s.setTaskStatus);
  const carryForward = useStore(s => s.carryForward);
  const toggleReaction = useStore(s => s.toggleReaction);
  const addComment = useStore(s => s.addComment);
  const reactions = useStore(s => s.reactions);
  const comments = useStore(s => s.comments);
  const [commentText, setCommentText] = useState('');
  const [showComment, setShowComment] = useState(false);

  const status = log?.status || 'pending';
  const statusClass = status === 'done' ? 'status-done' : status === 'not-done' ? 'status-not-done' : status === 'skipped' ? 'status-skipped' : '';

  const taskReactions = log ? reactions.filter(r => r.taskLogId === log.id) : [];
  const taskComments = log ? comments.filter(c => c.taskLogId === log.id) : [];
  const emojis = ['👍', '💪', '😬', '🔥'];

  const handleStatus = (newStatus) => {
    if (status === newStatus) {
      setTaskStatus(task.id, task.userId, date, 'pending');
    } else {
      setTaskStatus(task.id, task.userId, date, newStatus);
    }
  };

  const handleCarryForward = () => {
    if (log) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      carryForward(log.id, tomorrowStr);
    }
  };

  return (
    <div className={`card-flat ${statusClass}`} style={{ padding: 16, transition: 'all 0.3s ease', animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{task.name}</span>
            {task.isPrivate && <span className="badge badge-grey" style={{ fontSize: 10 }}>🔒 Private</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(task.startTime && task.endTime) && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>🕐 {formatTime(task.startTime)} - {formatTime(task.endTime)}</span>}
            {task.timeSlot && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>🕐 {formatTime(task.timeSlot)}</span>}
            <span style={{ fontSize: 12, color: status === 'not-done' ? '#ef4444' : 'var(--text-tertiary)' }}>
              {status === 'not-done' ? `💸 ${formatCurrency(task.fineAmount || 10)} fine` : `₹${task.fineAmount || 10}`}
            </span>
          </div>
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => handleStatus('done')} className="btn-icon" aria-label="Mark done" title="Done"
              style={{ background: status === 'done' ? 'rgba(34,197,94,0.2)' : undefined, color: status === 'done' ? '#22c55e' : undefined, borderRadius: 10, width: 36, height: 36, fontSize: 16 }}>
              ✓
            </button>
            <button onClick={() => handleStatus('not-done')} className="btn-icon" aria-label="Mark not done" title="Not Done"
              style={{ background: status === 'not-done' ? 'rgba(239,68,68,0.2)' : undefined, color: status === 'not-done' ? '#ef4444' : undefined, borderRadius: 10, width: 36, height: 36, fontSize: 16 }}>
              ✗
            </button>
            <button onClick={() => handleStatus('skipped')} className="btn-icon" aria-label="Skip" title="Skip"
              style={{ background: status === 'skipped' ? 'rgba(148,163,184,0.2)' : undefined, color: status === 'skipped' ? '#94a3b8' : undefined, borderRadius: 10, width: 36, height: 36, fontSize: 14 }}>
              ⊘
            </button>
          </div>
        )}
      </div>

      {status === 'skipped' && showActions && (
        <button onClick={handleCarryForward} className="btn-secondary" style={{ marginTop: 8, fontSize: 12, padding: '6px 12px' }}>
          📅 Carry Forward to Tomorrow
        </button>
      )}

      {showReactions && log && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border-primary)', paddingTop: 10 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {emojis.map(emoji => {
              const active = taskReactions.some(r => r.fromUserId === viewingUserId && r.emoji === emoji);
              return (
                <button key={emoji} onClick={() => toggleReaction(viewingUserId, log.id, emoji)}
                  style={{ fontSize: 18, padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? 'rgba(20,184,166,0.15)' : 'var(--bg-input)', transition: 'all 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                  {emoji}
                </button>
              );
            })}
            <button onClick={() => setShowComment(!showComment)} style={{ fontSize: 14, padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
              💬
            </button>
          </div>
          {taskComments.map(c => (
            <div key={c.id} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0' }}>
              💬 {c.text}
            </div>
          ))}
          {showComment && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input className="input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Nice work!" maxLength={100} style={{ fontSize: 12, padding: '6px 10px' }} />
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { if (commentText.trim()) { addComment(viewingUserId, log.id, commentText); setCommentText(''); setShowComment(false); } }}>
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
