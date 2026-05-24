import { T } from '../data/map';

const TILE_SIZE = 40;

const TILE_BG = {
  [T.FLOOR]: '#1e1e30', [T.WALL]: '#0a0a15',
  [T.ENEMY]: '#2a1a1a', [T.ITEM]: '#1a2a1a',
  [T.CHEST]: '#2a2010', [T.EXIT]: '#1a1a3a',
  [T.TELEPORT]: '#1a0a2e', [T.SHOP]: '#1a1a10',
};
const TILE_BORDER = {
  [T.FLOOR]: '#2a2a42', [T.WALL]: '#050510',
  [T.ENEMY]: '#5a2a2a', [T.ITEM]: '#2a5a2a',
  [T.CHEST]: '#6a5020', [T.EXIT]: '#4a4aaa',
  [T.TELEPORT]: '#9944ff', [T.SHOP]: '#aaaa22',
};

// Height visual overlays: h1 = slightly lighter, h2 = noticeably brighter stone
const HEIGHT_BG_OVERLAY = ['', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.14)'];
const HEIGHT_BORDER_BOOST = ['', '44', '88']; // appended to border hex for opacity boost

export default function GameMap({ grid, players, currentIdx, enemies, traps, chests, heights, highlightTiles, phase, onTileClick }) {
  const rows = grid.length;
  const cols = grid[0].length;

  const playerAtTile = {};
  (players ?? []).forEach((p, i) => {
    if (!p.isAlive) return;
    const key = `${p.x},${p.y}`;
    if (!playerAtTile[key]) playerAtTile[key] = { player: p, idx: i };
  });

  // base tile → player index
  const baseAtTile = {};
  (players ?? []).forEach((p, i) => {
    baseAtTile[`${p.baseX},${p.baseY}`] = { player: p, idx: i };
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
        const isTeleport = cell === T.TELEPORT;
        const isShop = cell === T.SHOP;
        const isHighlight = highlightTiles.includes(key);
        const playerHere = playerAtTile[key];
        const baseHere = baseAtTile[key];
        const enemy = enemies?.[key];
        const trap = traps?.[key];
        const chest = chests?.[key];
        const isCurrent = playerHere?.idx === currentIdx;
        const isAttackTarget = isHighlight && phase === 'choosing_attack';
        const isMoveTarget = isHighlight && phase === 'choosing_move';
        const isOwnBase = playerHere && playerHere.player.baseX === x && playerHere.player.baseY === y;
        const tileH = (!isWall && heights?.[y]?.[x]) ? Math.min(heights[y][x], 2) : 0;

        const baseBg = isWall ? TILE_BG[T.WALL]
          : isAttackTarget ? 'rgba(255,80,60,0.22)'
          : isMoveTarget ? 'rgba(80,180,255,0.18)'
          : trap ? '#1e1208'
          : chest ? '#181408'
          : baseHere ? `${baseHere.player.color}18`
          : TILE_BG[cell] ?? TILE_BG[T.FLOOR];
        const bg = tileH > 0 && !isAttackTarget && !isMoveTarget
          ? `linear-gradient(${HEIGHT_BG_OVERLAY[tileH]}, ${HEIGHT_BG_OVERLAY[tileH]}), ${baseBg}`
          : baseBg;

        const bdr = isWall ? TILE_BORDER[T.WALL]
          : isAttackTarget ? '#ff5040'
          : isMoveTarget ? '#5ab4ff'
          : trap ? `${trap.color}99`
          : chest ? '#aa8822'
          : baseHere ? `${baseHere.player.color}66`
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
            {tileH > 0 && !isWall && (
              <div style={{
                position: 'absolute', top: 2, left: 2,
                fontSize: 7, color: tileH === 2 ? '#ffdd88' : '#aabbcc',
                fontWeight: 900, lineHeight: 1, opacity: 0.75, pointerEvents: 'none',
                textShadow: '0 0 3px #000',
              }}>{tileH === 2 ? '▲▲' : '▲'}</div>
            )}
            {isTeleport && !playerHere && (
              <span style={{ fontSize: 16, filter: 'drop-shadow(0 0 4px #9944ff)' }}>🌀</span>
            )}
            {isShop && !playerHere && (
              <span style={{ fontSize: 16, filter: 'drop-shadow(0 0 4px #dddd00)' }}>🏪</span>
            )}
            {trap && !playerHere && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 14, filter: `drop-shadow(0 0 3px ${trap.color})` }}>{trap.icon}</span>
                <div style={{ fontSize: 6, color: trap.color, fontWeight: 700, letterSpacing: 0.5, opacity: 0.8, marginTop: 1 }}>PIÈGE</div>
              </div>
            )}
            {chest && !playerHere && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 14, filter: 'drop-shadow(0 0 3px #ffcc44)' }}>💰</span>
                <div style={{ fontSize: 6, color: '#ffcc44', fontWeight: 700, opacity: 0.8, marginTop: 1 }}>×{chest.loot}</div>
              </div>
            )}
            {baseHere && !playerHere && !enemy && !isTeleport && !isWall && (
              <div style={{
                width: 20, height: 20, borderRadius: 4,
                border: `2px solid ${baseHere.player.color}99`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: baseHere.player.color, fontWeight: 900, opacity: 0.7,
              }}>
                {baseHere.idx + 1}
              </div>
            )}
            {isOwnBase && playerHere && (
              <div style={{
                position: 'absolute', inset: 0,
                border: `2px solid ${playerHere.player.color}`,
                borderRadius: 2, pointerEvents: 'none',
                boxShadow: `inset 0 0 6px ${playerHere.player.color}44`,
              }} />
            )}
            {!isWall && !isTeleport && cell === T.EXIT && !playerHere && <span style={{ fontSize: 16 }}>🚪</span>}
            {!isWall && !playerHere && enemy && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <span style={{ fontSize: 14 }}>{enemy.icon}</span>
                <div style={{ width: 24, height: 3, background: '#1a1a1a', borderRadius: 2, marginTop: 1 }}>
                  <div style={{
                    width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: '100%', borderRadius: 2,
                    background: enemy.pile === 1 ? '#44cc44' : enemy.pile === 2 ? '#ccaa00' : '#cc3333',
                  }} />
                </div>
                <div style={{
                  position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%',
                  background: enemy.pile === 1 ? '#44cc44' : enemy.pile === 2 ? '#ccaa00' : '#cc3333',
                  fontSize: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', fontWeight: 900,
                }}>{enemy.pile}</div>
              </div>
            )}
            {playerHere && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: playerHere.player.color,
                border: isCurrent ? '2px solid #fff' : `2px solid ${playerHere.player.color}88`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: '#000',
                boxShadow: isCurrent ? `0 0 10px ${playerHere.player.color}` : 'none',
                zIndex: 2,
              }}>
                P{playerHere.idx + 1}
              </div>
            )}
            {isMoveTarget && !playerHere && !enemy && !isWall && (
              <span style={{ fontSize: 7, color: '#5ab4ff', opacity: 0.6 }}>●</span>
            )}
            {playerHere && (
              <div style={{ position: 'absolute', bottom: 2, left: 3, right: 3, height: 3, background: '#1a1a2a', borderRadius: 2 }}>
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
