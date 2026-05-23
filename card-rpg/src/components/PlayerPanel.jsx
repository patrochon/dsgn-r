const STAT_META = [
  { key: 'force',       icon: '⚔️',  label: 'Force',       color: '#ff7755', desc: 'Dégâts physiques & résistance' },
  { key: 'magie',       icon: '✨',  label: 'Magie',       color: '#aa77ff', desc: 'Sorts & amplification des soins' },
  { key: 'vie',         icon: '❤️',  label: 'Vie',         color: '#ff4466', desc: 'Points de vie maximum' },
  { key: 'deplacement', icon: '👢',  label: 'Déplacement', color: '#55ccff', desc: 'Cases parcourues par tour' },
  { key: 'chance',      icon: '🍀',  label: 'Chance',      color: '#88ff44', desc: 'Bonus aux jets de dé' },
  { key: 'destin',      icon: '🌟',  label: 'Destin',      color: '#ffcc22', desc: 'Effets critiques & bonus de destin' },
];

export default function PlayerPanel({ player }) {
  const hpPct = Math.max(0, player.hp / player.maxHp);
  const level = player.level ?? null;
  const xp = player.xp ?? null;
  const xpPct = level ? Math.min(1, xp / (level * 30)) : 0;

  return (
    <div style={{ background: '#12121e', border: '1px solid #333', borderRadius: 10, padding: 14, minWidth: 200 }}>
      <div style={{ color: '#eee', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
        🧙 {player.name ?? 'Aventurier'}{level ? ` — Niv. ${level}` : ''}
      </div>
      {player.race && (
        <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
          {player.race.icon} {player.race.name} · {player.cls?.icon} {player.cls?.name}
        </div>
      )}

      {/* HP bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 2 }}>
          <span>❤️ HP</span><span style={{ color: hpPct > 0.5 ? '#4a9' : hpPct > 0.25 ? '#a94' : '#f44' }}>{player.hp}/{player.maxHp}</span>
        </div>
        <div style={{ background: '#2a1a1a', borderRadius: 4, height: 7 }}>
          <div style={{
            background: hpPct > 0.5 ? '#4a9' : hpPct > 0.25 ? '#c84' : '#c44',
            width: `${hpPct * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* XP bar — only shown in single-player mode */}
      {level !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginBottom: 2 }}>
            <span>⭐ XP</span><span>{xp}/{level * 30}</span>
          </div>
          <div style={{ background: '#1a1a2a', borderRadius: 4, height: 5 }}>
            <div style={{ background: '#7766ff', width: `${xpPct * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* 6 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {STAT_META.map(({ key, icon, label, color, desc }) => {
          const val = player.stats[key] ?? 0;
          return (
            <div
              key={key}
              title={desc}
              style={{
                background: '#0e0e1e',
                border: `1px solid ${color}22`,
                borderRadius: 7,
                padding: '5px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#555', lineHeight: 1 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1.2 }}>{val}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
