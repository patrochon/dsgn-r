import { T } from '../data/map';

const TILE_SIZE = 48;

const tileStyle = {
  [T.FLOOR]:  { bg: '#2a2a3a', border: '#333350' },
  [T.WALL]:   { bg: '#111120', border: '#0a0a15' },
  [T.ENEMY]:  { bg: '#2a1a1a', border: '#5a2a2a' },
  [T.ITEM]:   { bg: '#1a2a1a', border: '#2a5a2a' },
  [T.CHEST]:  { bg: '#2a2010', border: '#6a5020' },
  [T.EXIT]:   { bg: '#1a1a3a', border: '#4a4aaa' },
};

export default function GameMap({ grid, player, enemies, itemMap, highlightTiles, phase, onTileClick }) {
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
      gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
      gap: 1,
      border: '2px solid #444',
      borderRadius: 4,
      overflow: 'hidden',
      userSelect: 'none',
    }}>
      {grid.map((row, y) => row.map((cell, x) => {
        const key = `${x},${y}`;
        const isPlayer = player.x === x && player.y === y;
        const enemy = enemies[key];
        const item = itemMap[key];
        const isHighlight = highlightTiles.includes(key);
        const isExit = cell === T.EXIT;
        const isWall = cell === T.WALL;
        const style = tileStyle[isWall ? T.WALL : T.FLOOR] ?? tileStyle[T.FLOOR];
        const canClick = isHighlight && phase === 'move';

        return (
          <div
            key={key}
            onClick={() => canClick && onTileClick(x, y)}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              background: isHighlight
                ? 'rgba(100,180,255,0.18)'
                : isWall ? tileStyle[T.WALL].bg : style.bg,
              border: `1px solid ${isHighlight ? '#5ab4ff' : isWall ? tileStyle[T.WALL].border : style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              cursor: canClick ? 'pointer' : 'default',
              position: 'relative',
              transition: 'background 0.15s',
              boxSizing: 'border-box',
            }}
          >
            {isWall && (
              <span style={{ fontSize: 18, opacity: 0.4 }}>▪</span>
            )}
            {!isWall && isExit && !isPlayer && (
              <span title="Sortie" style={{ fontSize: 20 }}>🚪</span>
            )}
            {!isWall && !isPlayer && enemy && (
              <span title={enemy.name} style={{ fontSize: 22 }}>{enemy.icon}</span>
            )}
            {!isWall && !isPlayer && !enemy && item && (
              <span title={item.name} style={{ fontSize: 20 }}>{item.isChest ? '📦' : item.icon}</span>
            )}
            {isPlayer && (
              <span style={{ fontSize: 24, zIndex: 2 }}>🧙</span>
            )}
            {isHighlight && !isPlayer && !enemy && !item && !isWall && !isExit && (
              <span style={{ fontSize: 10, color: '#5ab4ff', opacity: 0.7 }}>●</span>
            )}
          </div>
        );
      }))}
    </div>
  );
}
