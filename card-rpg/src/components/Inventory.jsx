export default function Inventory({ items }) {
  return (
    <div style={{ background: '#12121e', border: '1px solid #333', borderRadius: 8, padding: 10 }}>
      <div style={{ color: '#aaa', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🎒 Équipement ({items.length})</div>
      {items.length === 0 ? (
        <div style={{ color: '#444', fontSize: 11 }}>Rien d&apos;équipé</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#bbb' }}>
              <span>{item.icon ?? '?'}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              {item.effect?.bonus > 0 && (
                <span style={{ color: item.catColor ?? '#88ff88', flexShrink: 0 }}>+{item.effect.bonus}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
