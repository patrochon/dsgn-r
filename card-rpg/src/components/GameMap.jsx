import { T } from '../data/map';

const TILE_SIZE = 44;

const TILE_BG = {
  [T.FLOOR]: '#1e1e30', [T.WALL]: '#0a0a15',
  [T.ENEMY]: '#2a1a1a', [T.ITEM]: '#1a2a1a',
  [T.CHEST]: '#2a2010', [T.EXIT]: '#1a1a3a',
};
const TILE_BORDER = {
  [T.FLOOR]: '#2a2a42', [T.WALL]: '#050510',
  [T.ENEMY]: '#5a2a2a', [T.ITEM]: '#2a5a2a',
  [T.CHEST]: '#6a5020', [T.EXIT]: '#4a4aaa',
};

export default function GameMap({ grid, players, currentIdx, enemies, highlightTiles, phase, onTileClick }) {
  const rows = grid.length;
  const cols = grid[0].length;

  // Build tile → player lookup
  const playerAtTile = {};
  (players ?? []).forEach((p, i) => {
    if (!p.isAlive) return;
    const key = `${p.x},${p.y}`;
    if (!playerAtTile[key]) playerAtTile[key] = { player: p, idx: i };
  });

  const canClick = phase === 'choosing_move' || phase === 'choosing_attack';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
      gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
      gap: 1, border: '2px solid #333', borderRadius: 4,
      overflow: 'hidden', userSelect: 'none',
    }}>
      {grid.map((row, y) => row.map((cell, x) => {
        const key = `${x},${y}`;
        const isWall = cell === T.WALL;
        const isHighlight = highlightTiles.includes(key);
        const playerHere = playerAtTile[key];
        const enemy = enemies?.[key];
        const isCurrent = playerHere?.idx === currentIdx;
        const isAttackTarget = isHighlight && phase === 'choosing_attack';
        const isMoveTarget = isHighlight && phase === 'choosing_move';

        const bg = isWall ? TILE_BG[T.WALL]
          : isAttackTarget ? 'rgba(255,80,60,0.22)'
          : isMoveTarget ? 'rgba(80,180,255,0.18)'
          : TILE_BG[cell] ?? TILE_BG[T.FLOOR];

        const bdr = isWall ? TILE_BORDER[T.WALL]
          : isAttackTarget ? '#ff5040'
          : isMoveTarget ? '#5ab4ff'
          : TILE_BORDER[cell] ?? TILE_BORDER[T.FLOOR];

        return (
          <div key={key}
            onClick={() => canClick && isHighlight && onTileClick(x, y)}
            style={{
              width: TILE_SIZE, height: TILE_SIZE,
              background: bg, border: `1px solid ${bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canClick && isHighlight ? 'pointer' : 'default',
              transition: 'background 0.12s', boxSizing: 'border-box', position: 'relative',
            }}
          >
            {isWall && (
              <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg,#0d0d1a 0,#0d0d1a 5px,#080812 5px,#080812 10px)' }} />
            )}
            {!isWall && cell === T.EXIT && !playerHere && <span style={{ fontSize: 18 }}>🚪</span>}
            {!isWall && !playerHere && enemy && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{enemy.icon}</span>
                <div style={{ width: 28, height: 3, background: '#2a0a0a', borderRadius: 2, marginTop: 1 }}>
                  <div style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: '100%', background: '#c44', borderRadius: 2 }} />
                </div>
              </div>
            )}
            {playerHere && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: playerHere.player.color,
                border: isCurrent ? '2px solid #fff' : `2px solid ${playerHere.player.color}88`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900, color: '#000',
                boxShadow: isCurrent ? `0 0 10px ${playerHere.player.color}` : 'none',
                zIndex: 2,
              }}>
                P{playerHere.idx + 1}
              </div>
            )}
            {isMoveTarget && !playerHere && !enemy && !isWall && (
              <span style={{ fontSize: 8, color: '#5ab4ff', opacity: 0.6 }}>●</span>
            )}
            {playerHere && (
              <div style={{ position: 'absolute', bottom: 2, left: 4, right: 4, height: 3, background: '#1a1a2a', borderRadius: 2 }}>
                <div style={{
                  height: '100%',
                  width: `${(playerHere.player.hp / playerHere.player.maxHp) * 100}%`,
                  background: playerHere.player.hp / playerHere.player.maxHp > 0.5 ? '#4a9' : playerHere.player.hp / playerHere.player.maxHp > 0.25 ? '#c84' : '#c44',
                  borderRadius: 2, transition: 'width 0.3s',
                }} />
              </div>
            )}
          </div>
        );
      }))}
    </div>
  );
}
