export default function PlayerPanel({ player }) {
  const hpPct = Math.max(0, player.hp / player.maxHp);
  const xpPct = Math.min(1, player.xp / (player.level * 30));

  return (
    <div style={{ background: '#12121e', border: '1px solid #333', borderRadius: 8, padding: 12, minWidth: 180 }}>
      <div style={{ color: '#eee', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🧙 Aventurier</div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 2 }}>
          <span>❤️ HP</span><span>{player.hp}/{player.maxHp}</span>
        </div>
        <div style={{ background: '#2a1a1a', borderRadius: 4, height: 8 }}>
          <div style={{ background: hpPct > 0.5 ? '#4a9' : hpPct > 0.25 ? '#a94' : '#a44', width: `${hpPct * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 2 }}>
          <span>⭐ XP Niv.{player.level}</span><span>{player.xp}/{player.level * 30}</span>
        </div>
        <div style={{ background: '#1a1a2a', borderRadius: 4, height: 6 }}>
          <div style={{ background: '#88f', width: `${xpPct * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[
          ['⚔️', 'ATK', player.stats.attack],
          ['🛡️', 'DEF', player.stats.defense],
          ['👢', 'MV', player.stats.move],
        ].map(([icon, label, val]) => (
          <div key={label} style={{ background: '#1a1a2e', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
            <span style={{ color: '#777' }}>{icon} {label}</span>
            <span style={{ color: '#eee', float: 'right', fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
