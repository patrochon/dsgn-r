export default function AllPlayersStatus({ players, currentIdx }) {
  return (
    <div style={{
      background: '#12121e',
      border: '1px solid #2a2a3a',
      borderRadius: 10,
      padding: 10,
    }}>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 1 }}>JOUEURS</div>
      {players.map((player, i) => {
        const hpPct = Math.max(0, player.hp / player.maxHp);
        const isCurrent = i === currentIdx;
        const hpColor = hpPct > 0.5 ? '#44cc88' : hpPct > 0.25 ? '#cc8844' : '#cc4444';
        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              padding: '4px 6px',
              borderRadius: 6,
              background: isCurrent ? '#1a1a2e' : 'transparent',
              border: isCurrent ? `1px solid ${player.color}44` : '1px solid transparent',
              opacity: player.isAlive ? 1 : 0.4,
            }}
          >
            {/* Color indicator */}
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: player.color,
              flexShrink: 0,
              boxShadow: isCurrent ? `0 0 6px ${player.color}` : 'none',
            }} />

            {/* Player number + name */}
            <div style={{
              fontSize: 11,
              fontWeight: isCurrent ? 700 : 400,
              color: isCurrent ? '#eee' : '#888',
              width: 90,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              J{i + 1} {player.name}
            </div>

            {/* HP bar */}
            {player.isAlive ? (
              <div style={{ flex: 1, background: '#1a1a2a', borderRadius: 3, height: 6 }}>
                <div style={{
                  background: hpColor,
                  width: `${hpPct * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  transition: 'width 0.3s',
                }} />
              </div>
            ) : (
              <div style={{ flex: 1, fontSize: 10, color: '#555' }}>Éliminé</div>
            )}

            {/* HP numbers */}
            {player.isAlive && (
              <div style={{ fontSize: 10, color: hpColor, width: 52, textAlign: 'right', flexShrink: 0 }}>
                {player.hp}/{player.maxHp}
              </div>
            )}

            {/* Dead indicator */}
            {!player.isAlive && (
              <div style={{ fontSize: 12 }}>💀</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
