import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

export default function Heatmap({ dates = [], title = "Consistency Heatmap" }) {
  const last365Days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 364);
    return eachDayOfInterval({ start, end });
  }, []);

  const getIntensity = (date) => {
    const count = dates.filter(d => isSameDay(new Date(d), date)).length;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3;
  };

  const colors = [
    'rgba(255, 255, 255, 0.05)', // 0
    '#0e7490', // 1
    '#0891b2', // 2
    '#22d3ee'  // 3
  ];

  return (
    <div className="card heatmap-container" style={{ padding: 20, overflowX: 'auto' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(52, 1fr)', 
        gap: 3,
        minWidth: 600
      }}>
        {last365Days.map((day, i) => (
          <div 
            key={i}
            title={format(day, 'MMM d, yyyy')}
            style={{ 
              width: 10, 
              height: 10, 
              borderRadius: 2, 
              background: colors[getIntensity(day)],
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
        <span>{format(last365Days[0], 'MMM yyyy')}</span>
        <span>{format(last365Days[last365Days.length - 1], 'MMM yyyy')}</span>
      </div>
    </div>
  );
}
