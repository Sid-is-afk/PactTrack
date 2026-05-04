import { useEffect } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const achievements = useStore(s => s.achievements);
  const xp = useStore(s => s.xp);
  const level = useStore(s => s.level);
  const fetchGamificationData = useStore(s => s.fetchGamificationData);

  useEffect(() => {
    if (user?.uid) {
      fetchGamificationData();
    }
  }, [user, fetchGamificationData]);

  const progress = (xp / 100) * 100;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ 
          width: 100, 
          height: 100, 
          borderRadius: 30, 
          background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          color: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{user?.displayName || 'Adventurer'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Level {level} Master</p>
      </div>

      {/* XP Progress Bar */}
      <div className="card" style={{ padding: 24, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-end' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Points</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{xp} <span style={{ fontSize: 16, color: 'var(--text-tertiary)', fontWeight: 500 }}>/ 100 XP</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Rank</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7' }}>Level {level}</div>
          </div>
        </div>
        <div style={{ height: 12, background: 'var(--bg-input)', borderRadius: 6, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 6 }} 
          />
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          {100 - xp} XP until Level {level + 1}
        </p>
      </div>

      {/* Trophy Room */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🏆</span> Trophy Room
        <span className="badge badge-teal" style={{ fontSize: 12 }}>{achievements.length}</span>
      </h2>

      {achievements.length === 0 ? (
        <div className="card-flat" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏜️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your trophy room is empty</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Complete tasks and hit milestones to earn achievements!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {achievements.map((achievement, i) => (
            <motion.div 
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card achievement-card" 
              style={{ 
                padding: 20, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                cursor: 'default'
              }}
            >
              <div style={{ fontSize: 42 }}>{achievement.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{achievement.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{achievement.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
