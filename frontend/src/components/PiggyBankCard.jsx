import { formatCurrency } from '../utils/dateHelpers';

export default function PiggyBankCard({ userAName, userBName, finesA, finesB, month, purpose, onSetPurpose }) {
  const totalA = finesA.filter(f => f.month === month).reduce((s, f) => s + f.amount, 0);
  const totalB = finesB.filter(f => f.month === month).reduce((s, f) => s + f.amount, 0);
  const mutual = totalA + totalB;
  const pctA = mutual > 0 ? Math.round((totalA / mutual) * 100) : 50;
  const pctB = mutual > 0 ? Math.round((totalB / mutual) * 100) : 50;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🐷</span>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Piggy Bank</h3>
        </div>
        <span className="badge badge-amber">{month}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card-flat" style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{userAName}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#14b8a6' }}>{formatCurrency(totalA)}</div>
        </div>
        <div className="card-flat" style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{userBName}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalB)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
          <span>{userAName} ({pctA}%)</span>
          <span>{userBName} ({pctB}%)</span>
        </div>
        <div className="fine-bar-container">
          <div className="fine-bar-a" style={{ width: `${pctA}%` }} />
          <div className="fine-bar-b" style={{ width: `${pctB}%` }} />
        </div>
      </div>

      <div className="card-flat" style={{ padding: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Mutual Total</div>
        <div style={{ fontSize: 26, fontWeight: 800 }} className="gradient-text">{formatCurrency(mutual)}</div>
      </div>

      {purpose && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
          💡 <em>{purpose}</em>
        </div>
      )}
    </div>
  );
}
