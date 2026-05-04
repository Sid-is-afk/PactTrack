export default function EmptyState({ icon = '📋', title = 'Nothing here yet', message = 'Get started by adding something!', action, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fade-in 0.4s ease-out' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 20px' }}>{message}</p>
      {action && (
        <button className="btn-primary" onClick={action}>{actionLabel || 'Get Started'}</button>
      )}
    </div>
  );
}
