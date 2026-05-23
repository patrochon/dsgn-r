import { MULTIPLAYER_MAPS } from './data/multiplayerMaps';

const PLAYER_COLORS = ['#ff4444','#44aaff','#44ff88','#ffcc00','#ff88ff','#ff8844'];
const TILE_SIZE = 36;

const TILE_BG = {
  0: '#1e1e30',
  1: '#0a0a15',
  3: '#1a2a1a',
  4: '#2a1a3a',
  6: '#2a2010',
};
const TILE_BORDER = {
  0: '#2a2a42',
  1: '#050510',
  3: '#2a5a2a',
  4: '#7a44aa',
  6: '#6a5020',
};
const TILE_ICON = { 3: '✦', 4: '★', 6: '□' };
const TILE_ICON_COLOR = { 3: '#4a8a4a', 4: '#aa66ff', 6: '#aa8833' };

function MapGrid({ map }) {
  const playerSet = {};
  map.playerStarts.forEach((p, i) => {
    playerSet[`${p.x},${p.y}`] = { label: p.label, color: PLAYER_COLORS[i] };
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${map.grid[0].length}, ${TILE_SIZE}px)`,
      gap: 1,
      border: '2px solid #333',
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 4px 24px #0008',
    }}>
      {map.grid.map((row, y) => row.map((cell, x) => {
        const key = `${x},${y}`;
        const player = playerSet[key];
        const isWall = cell === 1;
        const bg = TILE_BG[cell] ?? TILE_BG[0];
        const border = TILE_BORDER[cell] ?? TILE_BORDER[0];
        const icon = TILE_ICON[cell];
        const iconColor = TILE_ICON_COLOR[cell];

        return (
          <div
            key={key}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              background: player ? player.color + '28' : bg,
              border: `1px solid ${player ? player.color + '88' : border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isWall ? 0 : 13,
              fontWeight: 700,
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {player && (
              <div style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: player.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900, color: '#000',
                boxShadow: `0 0 8px ${player.color}`,
              }}>
                {player.label}
              </div>
            )}
            {!player && icon && (
              <span style={{ color: iconColor, fontSize: cell === 4 ? 16 : 12 }}>{icon}</span>
            )}
            {isWall && (
              <div style={{
                width: '100%', height: '100%',
                background: 'repeating-linear-gradient(45deg, #0d0d1a 0px, #0d0d1a 4px, #080812 4px, #080812 8px)',
              }} />
            )}
          </div>
        );
      }))}
    </div>
  );
}

export default function MapPreview() {
  return (
    <div style={{
      background: '#08080f',
      minHeight: '100vh',
      padding: 32,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#eee',
    }}>
      <h1 style={{ textAlign: 'center', color: '#88aaff', letterSpacing: 3, fontSize: 22, marginBottom: 8 }}>
        ⚔️ CARD DUNGEON RPG — Propositions de Cartes Multi-Joueurs
      </h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: 40, fontSize: 13 }}>
        6 joueurs simultanés — cartes symétriques — confrontation directe
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
        {[
          { color: '#4a8a4a', icon: '✦', label: 'Item' },
          { color: '#aa66ff', icon: '★', label: 'Objectif' },
          { color: '#aa8833', icon: '□', label: 'Coffre' },
        ].map(({ color, icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
            <span style={{ color, fontSize: 14 }}>{icon}</span> {label}
          </div>
        ))}
        {PLAYER_COLORS.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
            <span style={{ color: '#888' }}>P{i+1}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, maxWidth: 1800, margin: '0 auto' }}>
        {MULTIPLAYER_MAPS.map((map, idx) => (
          <div key={map.id} style={{
            background: '#10101e',
            border: '1px solid #2a2a40',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ color: '#555', fontSize: 12 }}>#{idx + 1}</span>
              <h2 style={{ margin: 0, color: '#ccddff', fontSize: 17, fontWeight: 700 }}>{map.name}</h2>
            </div>
            <MapGrid map={map} />
            <p style={{ margin: 0, color: '#666', fontSize: 12, textAlign: 'center', lineHeight: 1.6, maxWidth: 360 }}>
              {map.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
