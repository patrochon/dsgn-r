const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceDisplay({ value, rolling }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 16px',
      background: '#1a1a2e',
      border: '2px solid #445',
      borderRadius: 10,
      minWidth: 70,
    }}>
      <div style={{
        fontSize: 42,
        lineHeight: 1,
        filter: rolling ? 'blur(2px)' : 'none',
        transition: rolling ? 'none' : 'filter 0.2s',
        animation: rolling ? 'spin 0.08s linear infinite' : 'none',
      }}>
        {FACES[value] ?? '🎲'}
      </div>
      <div style={{ color: '#88aaff', fontSize: 11, marginTop: 4 }}>
        {rolling ? 'Lancement…' : `= ${value}`}
      </div>
    </div>
  );
}
