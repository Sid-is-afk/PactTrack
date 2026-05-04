import { useState, useEffect, useRef } from 'react';

const playAlarm = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  
  const beep = (time, freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);
  };
  
  const playSequence = () => {
    beep(ctx.currentTime, 880);      // A5
    beep(ctx.currentTime + 0.2, 1046.50); // C6
    beep(ctx.currentTime + 0.4, 1318.51); // E6
  };

  // Play immediately and repeat every 1 second
  playSequence();
  const intervalId = setInterval(playSequence, 1000);

  // Stop after 10 seconds
  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    if (ctx.state !== 'closed') ctx.close();
  }, 10000);

  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    if (ctx.state !== 'closed') ctx.close();
  };
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus'); // 'focus', 'short', 'long'
  const [durations, setDurations] = useState({
    focus: 25,
    short: 5,
    long: 15,
  });
  
  const [timeLeft, setTimeLeft] = useState(durations.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempDurations, setTempDurations] = useState(durations);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const timerRef = useRef(null);
  const stopAlarmRef = useRef(null);

  const handleStopAlarm = () => {
    if (stopAlarmRef.current) {
      stopAlarmRef.current();
      stopAlarmRef.current = null;
    }
    setIsAlarmPlaying(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(timerRef.current);
      stopAlarmRef.current = playAlarm();
      setIsAlarmPlaying(true);
      setTimeout(() => setIsAlarmPlaying(false), 10000);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  useEffect(() => {
    return () => {
      if (stopAlarmRef.current) stopAlarmRef.current();
    };
  }, []);

  const switchMode = (newMode) => {
    handleStopAlarm();
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(durations[newMode] * 60);
  };

  const toggleTimer = () => {
    handleStopAlarm();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    handleStopAlarm();
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
  };

  const saveSettings = () => {
    setDurations(tempDurations);
    setShowSettings(false);
    if (!isActive) {
      setTimeLeft(tempDurations[mode] * 60);
    }
  };

  const totalTime = durations[mode] * 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // SVG Circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColors = {
    focus: '#ef4444', // Red
    short: '#14b8a6', // Teal
    long: '#3b82f6',  // Blue
  };
  const currentColor = modeColors[mode];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 40 }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: 24, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>⏱️ Timer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Focus and take breaks with Pomodoro</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="btn-icon" 
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 12, width: 44, height: 44, fontSize: 18 }}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings ? (
        <div className="card" style={{ padding: 24, width: '100%', marginBottom: 32, animation: 'fade-in 0.3s ease-out' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Timer Settings (Minutes)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Focus</label>
              <input type="number" className="input" value={tempDurations.focus} min="1" max="120" onChange={e => setTempDurations(d => ({...d, focus: Number(e.target.value)}))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Short Break</label>
              <input type="number" className="input" value={tempDurations.short} min="1" max="60" onChange={e => setTempDurations(d => ({...d, short: Number(e.target.value)}))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Long Break</label>
              <input type="number" className="input" value={tempDurations.long} min="1" max="60" onChange={e => setTempDurations(d => ({...d, long: Number(e.target.value)}))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn-secondary" onClick={() => { setShowSettings(false); setTempDurations(durations); }}>Cancel</button>
            <button className="btn-primary" onClick={saveSettings}>Save Settings</button>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: '8px', display: 'flex', gap: 8, background: 'var(--bg-input)', borderRadius: 16, marginBottom: 40 }}>
        <button 
          onClick={() => switchMode('focus')} 
          style={{ padding: '8px 20px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: mode === 'focus' ? currentColor : 'transparent', color: mode === 'focus' ? 'white' : 'var(--text-secondary)' }}
        >
          Focus
        </button>
        <button 
          onClick={() => switchMode('short')} 
          style={{ padding: '8px 20px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: mode === 'short' ? currentColor : 'transparent', color: mode === 'short' ? 'white' : 'var(--text-secondary)' }}
        >
          Short Break
        </button>
        <button 
          onClick={() => switchMode('long')} 
          style={{ padding: '8px 20px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: mode === 'long' ? currentColor : 'transparent', color: mode === 'long' ? 'white' : 'var(--text-secondary)' }}
        >
          Long Break
        </button>
      </div>

      <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
        <svg width="280" height="280" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          {/* Background Track */}
          <circle 
            cx="140" cy="140" r={radius} 
            stroke="var(--bg-input)" 
            strokeWidth="12" 
            fill="transparent" 
          />
          {/* Progress Indicator */}
          <circle 
            cx="140" cy="140" r={radius} 
            stroke={currentColor} 
            strokeWidth="12" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600, marginTop: -4 }}>
            {mode === 'focus' ? 'Time to Focus' : 'Take a Break'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <button 
          onClick={toggleTimer}
          className="btn-primary"
          style={{ 
            width: 140, height: 56, fontSize: 18, borderRadius: 28,
            background: isActive ? 'var(--bg-input)' : currentColor,
            color: isActive ? 'var(--text-primary)' : 'white',
          }}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="btn-secondary"
          style={{ width: 80, height: 56, fontSize: 16, borderRadius: 28, background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          Reset
        </button>
      </div>

      {isAlarmPlaying && (
        <button 
          onClick={handleStopAlarm}
          style={{ marginTop: 24, padding: '12px 24px', borderRadius: 24, border: 'none', background: '#ef4444', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', animation: 'pulse 2s infinite' }}
        >
          🔇 Stop Alarm
        </button>
      )}
    </div>
  );
}
