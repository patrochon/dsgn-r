import { T } from '../data/map';

const TILE_SIZE = 40;

// ─── Tile visual data ─────────────────────────────────────────────────────────
const TILE_DEF = {
  [T.FLOOR]: {
    bg:     '#111120',
    border: '#1c1c30',
  },
  [T.WALL]: {
    bg: '#06060e', border: '#03030a',
  },
  [T.SHOP]: {
    bg: '#1c1400', border: '#cc9900', glow: '#cc990033',
    icon: '🏪', label: 'SHOP', labelColor: '#cc9900',
  },
  [T.TELEPORT]: {
    bg: '#0d0019', border: '#8833ee', glow: '#8833ee44',
    icon: '🌀',
  },
  [T.EXIT]: {
    bg: '#001810', border: '#00bb66', glow: '#00bb6633',
    icon: '⭐', label: 'OBJ', labelColor: '#00bb66',
  },
  [T.ITEM]: {
    bg: '#0d130d', border: '#2a4a2a',
    icon: '✦', iconColor: '#3a6a3a',
  },
  [T.PRISON]: {
    bg: '#1a0a0a', border: '#994422',
    icon: '⛓️',
  },
};

// Wall brick pattern (drawn as an inner element)
function WallCell() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          transparent, transparent 9px,
          rgba(0,0,0,0.55) 9px, rgba(0,0,0,0.55) 10px
        ),
        repeating-linear-gradient(
          90deg,
          transparent, transparent 14px,
          rgba(0,0,0,0.55) 14px, rgba(0,0,0,0.55) 15px
        )
      `,
      boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.04), inset -2px -2px 6px rgba(0,0,0,0.8)',
    }} />
  );
}

// Pulsing highlight ring for move/attack
function HighlightRing({ color }) {
  return (
    <div style={{
      position: 'absolute', inset: 1,
      border: `2px solid ${color}`,
      borderRadius: 2,
      boxShadow: `0 0 6px ${color}, inset 0 0 6px ${color}40`,
      pointerEvents: 'none', zIndex: 10,
    }} />
  );
}

// Special tile content (shop, teleport, exit)
function SpecialTileContent({ def }) {
  if (!def) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{
        fontSize: 16, lineHeight: 1,
        filter: `drop-shadow(0 0 5px ${def.border})`,
      }}>{def.icon}</span>
      {def.label && (
        <div style={{
          fontSize: 6, fontWeight: 800, color: def.labelColor,
          letterSpacing: 0.5, lineHeight: 1,
          textShadow: `0 0 4px ${def.border}`,
        }}>{def.label}</div>
      )}
    </div>
  );
}

// HP bar (for monsters and players)
function HpBar({ pct, color, width = 26 }) {
  return (
    <div style={{ width, height: 3, background: '#0d0d1a', borderRadius: 2, marginTop: 1 }}>
      <div style={{
        width: `${Math.max(0, pct * 100)}%`, height: '100%',
        background: color, borderRadius: 2,
        transition: 'width 0.3s',
      }} />
    </div>
  );
}

// ─── Legend strip ─────────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: 'Sol',      bg: '#111120', border: '#1c1c30', icon: null },
  { label: 'Mur',      bg: '#06060e', border: '#03030a', icon: null, pattern: true },
  { label: 'Magasin',  bg: '#1c1400', border: '#cc9900', icon: '🏪' },
  { label: 'Téléport', bg: '#0d0019', border: '#8833ee', icon: '🌀' },
  { label: 'Objectif', bg: '#001810', border: '#00bb66', icon: '⭐' },
  { label: 'Item',     bg: '#0d130d', border: '#2a4a2a', icon: '✦', iconColor: '#3a6a3a' },
  { label: 'Monstre①', bg: '#1a2a1a', border: '#44cc44', icon: '👾', pileDot: '#44cc44' },
  { label: 'Monstre②', bg: '#2a2a14', border: '#ccaa00', icon: '👹', pileDot: '#ccaa00' },
  { label: 'Monstre③', bg: '#2a1414', border: '#cc3333', icon: '🐉', pileDot: '#cc3333' },
  { label: 'Piège',    bg: '#1e1208', border: '#ff6633', icon: '🪤' },
  { label: 'Coffre',   bg: '#181408', border: '#aa8822', icon: '💰' },
  { label: 'Prison①',  bg: '#1a0a0a', border: '#994422', icon: '⛓️' },
  { label: 'Base',     bg: '#111120', border: '#5ab4ff', icon: '⬡', iconColor: '#5ab4ff' },
  { label: 'Déplacer', bg: 'rgba(80,180,255,0.18)', border: '#5ab4ff', icon: null },
  { label: 'Attaque',  bg: 'rgba(255,80,60,0.22)', border: '#ff5040', icon: null },
];

function MapLegend() {
  return (
    <div style={{
      marginTop: 6,
      display: 'flex', flexWrap: 'wrap', gap: 4,
    }}>
      {LEGEND_ITEMS.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 60 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 2,
            background: it.bg,
            border: `1px solid ${it.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: it.icon && it.icon.length > 1 ? 10 : 9,
            color: it.iconColor ?? undefined,
            flexShrink: 0,
            backgroundImage: it.pattern
              ? `repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,0.5) 4px,rgba(0,0,0,0.5) 5px),repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(0,0,0,0.5) 7px,rgba(0,0,0,0.5) 8px)`
              : undefined,
          }}>
            {it.icon ? (
              <span style={{ lineHeight: 1, filter: it.pileDot ? `drop-shadow(0 0 2px ${it.border})` : undefined }}>
                {it.icon}
              </span>
            ) : null}
          </div>
          <span style={{ fontSize: 9, color: '#555', lineHeight: 1, whiteSpace: 'nowrap' }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GameMap({ grid, players, currentIdx, enemies, traps, chests, prisons, highlightTiles, phase, onTileClick }) {
  const rows = grid.length;
  const cols = grid[0].length;

  const playerAtTile = {};
  (players ?? []).forEach((p, i) => {
    if (!p.isAlive) return;
    playerAtTile[`${p.x},${p.y}`] = { player: p, idx: i };
  });

  const baseAtTile = {};
  (players ?? []).forEach((p, i) => {
    baseAtTile[`${p.baseX},${p.baseY}`] = { player: p, idx: i };
  });

  // Fog of war: visible tiles set
  const visibleTiles = new Set();
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      if (cell === T.SHOP || cell === T.TELEPORT) visibleTiles.add(`${x},${y}`);
    }
  (players ?? []).forEach(p => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      visibleTiles.add(`${p.baseX + dx},${p.baseY + dy}`);
  });
  (players ?? []).forEach(p => {
    if (!p.isAlive) return;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      visibleTiles.add(`${p.x + dx},${p.y + dy}`);
  });

  const canClick = [
    'choosing_move', 'choosing_attack',
    'voyage_astral_select', 'voyage_astral_move',
    'longs_bras_passive', 'choosing_portal',
    'bum_throw', 'fou_attack', 'fou_portal',
    'choosing_prison_swap',
  ].includes(phase);

  return (
    <div>
      {/* Map grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
        gap: 1,
        border: '2px solid #1c1c30',
        borderRadius: 6,
        overflow: 'hidden',
        userSelect: 'none',
        boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.4)',
      }}>
        {grid.map((row, y) => row.map((cell, x) => {
          const key = `${x},${y}`;
          const isWall     = cell === T.WALL;
          const isTeleport = cell === T.TELEPORT;
          const isShop     = cell === T.SHOP;
          const isExit     = cell === T.EXIT;
          const isItem     = cell === T.ITEM;
          const isHighlight = highlightTiles.includes(key);
          const playerHere = playerAtTile[key];
          const baseHere   = baseAtTile[key];
          const enemy      = enemies?.[key];
          const trap       = traps?.[key];
          const chest      = chests?.[key];
          const prison     = prisons?.[key];
          const isPrison   = cell === T.PRISON;
          const isCurrent  = playerHere?.idx === currentIdx;
          const isAtk      = isHighlight && (phase === 'choosing_attack' || phase === 'bum_throw' || phase === 'fou_attack');
          const isMove     = isHighlight && !isAtk;
          const isOwnBase  = playerHere && playerHere.player.baseX === x && playerHere.player.baseY === y;
          const isVisible  = visibleTiles.has(key) || !!playerHere || isHighlight;

          // Background and border
          let bg, border, extraStyle = {};

          if (!isVisible) {
            bg = '#07070f'; border = '#0e0e1a';
          } else if (isWall) {
            bg = TILE_DEF[T.WALL].bg;
            border = TILE_DEF[T.WALL].border;
          } else if (isAtk) {
            bg = 'rgba(255,80,60,0.22)';
            border = '#ff5040';
          } else if (isMove) {
            bg = 'rgba(80,180,255,0.18)';
            border = '#5ab4ff';
          } else if (isTeleport) {
            const d = TILE_DEF[T.TELEPORT];
            bg = d.bg; border = d.border;
            extraStyle.boxShadow = `inset 0 0 10px ${d.glow}`;
          } else if (isShop) {
            const d = TILE_DEF[T.SHOP];
            bg = d.bg; border = d.border;
            extraStyle.boxShadow = `inset 0 0 10px ${d.glow}`;
          } else if (isExit) {
            const d = TILE_DEF[T.EXIT];
            bg = d.bg; border = d.border;
            extraStyle.boxShadow = `inset 0 0 12px ${d.glow}`;
          } else if (isItem) {
            const d = TILE_DEF[T.ITEM];
            bg = d.bg; border = d.border;
          } else if (isPrison) {
            const lvl = prison?.level ?? 1;
            const prisonColors = ['#994422','#bb3311','#dd1100'];
            bg = '#1a0a0a'; border = prisonColors[lvl - 1] ?? '#994422';
          } else if (trap) {
            bg = '#1a0e04'; border = `${trap.color}88`;
          } else if (chest) {
            bg = '#181408'; border = '#aa882266';
          } else if (baseHere && !playerHere) {
            bg = `${baseHere.player.color}12`; border = `${baseHere.player.color}44`;
          } else {
            const fd = TILE_DEF[T.FLOOR];
            bg = fd.bg; border = fd.border;
          }

          return (
            <div
              key={key}
              onClick={() => canClick && isHighlight && onTileClick(x, y)}
              style={{
                width: TILE_SIZE, height: TILE_SIZE,
                background: bg,
                border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canClick && isHighlight ? 'pointer' : 'default',
                transition: 'background 0.1s',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                ...extraStyle,
              }}
            >
              {isVisible && (<>
              {/* Wall brick texture */}
              {isWall && <WallCell />}

              {/* Highlight ring */}
              {isHighlight && !isWall && (
                <HighlightRing color={isAtk ? '#ff5040' : '#5ab4ff'} />
              )}

              {/* Special tiles (no player on top) */}
              {!isWall && !playerHere && isTeleport && (
                <SpecialTileContent def={TILE_DEF[T.TELEPORT]} />
              )}
              {!isWall && !playerHere && isShop && (
                <SpecialTileContent def={TILE_DEF[T.SHOP]} />
              )}
              {!isWall && !playerHere && isExit && (
                <SpecialTileContent def={TILE_DEF[T.EXIT]} />
              )}
              {!isWall && !playerHere && isItem && !enemy && !trap && (
                <span style={{ fontSize: 10, color: '#2a4a2a', opacity: 0.7 }}>✦</span>
              )}

              {/* Prison tile */}
              {isPrison && !playerHere && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span style={{ fontSize: 12, lineHeight: 1 }}>⛓️</span>
                  <div style={{ fontSize: 6, color: prison?.level === 3 ? '#dd1100' : prison?.level === 2 ? '#bb3311' : '#994422', fontWeight: 800, lineHeight: 1 }}>N{prison?.level ?? 1}</div>
                </div>
              )}

              {/* Trap */}
              {!isWall && !playerHere && trap && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span style={{ fontSize: 14, filter: `drop-shadow(0 0 3px ${trap.color})`, lineHeight: 1 }}>{trap.icon}</span>
                  <div style={{ fontSize: 5, color: trap.color, fontWeight: 800, letterSpacing: 0.3, opacity: 0.9, lineHeight: 1 }}>PIÈGE</div>
                </div>
              )}

              {/* Chest */}
              {!isWall && !playerHere && chest && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span style={{ fontSize: 14, filter: 'drop-shadow(0 0 4px #ffcc44)', lineHeight: 1 }}>💰</span>
                  <div style={{ fontSize: 6, color: '#cc9900', fontWeight: 800, lineHeight: 1 }}>×{chest.loot}</div>
                </div>
              )}

              {/* Base marker (when player not standing on it) */}
              {!isWall && baseHere && !playerHere && !enemy && !isTeleport && !isShop && !isExit && (
                <div style={{
                  width: 22, height: 22, borderRadius: 3,
                  border: `2px solid ${baseHere.player.color}88`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: baseHere.player.color, fontWeight: 900, opacity: 0.75,
                }}>
                  {baseHere.idx + 1}
                </div>
              )}

              {/* Own base ring (when player IS on their base) */}
              {isOwnBase && playerHere && (
                <div style={{
                  position: 'absolute', inset: 0,
                  border: `2px solid ${playerHere.player.color}`,
                  borderRadius: 2,
                  boxShadow: `inset 0 0 6px ${playerHere.player.color}44`,
                  pointerEvents: 'none', zIndex: 1,
                }} />
              )}

              {/* Enemy token */}
              {!isWall && !playerHere && enemy && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {/* Pile dot top-right */}
                  <div style={{
                    position: 'absolute', top: -1, right: -5,
                    width: 9, height: 9, borderRadius: '50%',
                    background: enemy.pile === 1 ? '#44cc44' : enemy.pile === 2 ? '#ccaa00' : '#cc3333',
                    fontSize: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 900,
                    boxShadow: `0 0 4px ${enemy.pile === 1 ? '#44cc44' : enemy.pile === 2 ? '#ccaa00' : '#cc3333'}`,
                  }}>{enemy.pile}</div>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{enemy.icon}</span>
                  <HpBar
                    pct={enemy.hp / enemy.maxHp}
                    color={enemy.pile === 1 ? '#44cc44' : enemy.pile === 2 ? '#ccaa00' : '#cc3333'}
                    width={28}
                  />
                </div>
              )}
              </>)}

              {/* Player token */}
              {!isWall && playerHere && (
                <>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${playerHere.player.color}cc, ${playerHere.player.color}66)`,
                    border: isCurrent ? '2px solid #fff' : `2px solid ${playerHere.player.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent
                      ? `0 0 12px ${playerHere.player.color}, 0 0 4px ${playerHere.player.color}88`
                      : `0 2px 6px #0008`,
                    zIndex: 2, position: 'relative',
                  }}>
                    {/* Race icon if available, else class icon, else player number */}
                    <span style={{ fontSize: playerHere.player.race?.icon ? 13 : 10, lineHeight: 1 }}>
                      {playerHere.player.race?.icon ?? playerHere.player.cls?.icon ?? `P${playerHere.idx + 1}`}
                    </span>
                    {/* Facing arrow overlay */}
                    {playerHere.player.facing && (
                      <div style={{
                        position: 'absolute',
                        top: playerHere.player.facing.dy < 0 ? -8 : playerHere.player.facing.dy > 0 ? 'auto' : '50%',
                        bottom: playerHere.player.facing.dy > 0 ? -8 : 'auto',
                        left: playerHere.player.facing.dx < 0 ? -8 : playerHere.player.facing.dx > 0 ? 'auto' : '50%',
                        right: playerHere.player.facing.dx > 0 ? -8 : 'auto',
                        transform: playerHere.player.facing.dx !== 0 ? 'translateY(-50%)' : 'translateX(-50%)',
                        fontSize: 7, color: playerHere.player.color,
                        lineHeight: 1, fontWeight: 900, pointerEvents: 'none',
                        textShadow: `0 0 3px ${playerHere.player.color}`,
                      }}>
                        {playerHere.player.facing.dy < 0 ? '▲'
                          : playerHere.player.facing.dy > 0 ? '▼'
                          : playerHere.player.facing.dx < 0 ? '◀' : '▶'}
                      </div>
                    )}
                  </div>
                  {/* HP bar */}
                  <div style={{ position: 'absolute', bottom: 2, left: 3, right: 3, height: 3, background: '#0d0d1a', borderRadius: 2 }}>
                    <div style={{
                      height: '100%',
                      width: `${(playerHere.player.hp / playerHere.player.maxHp) * 100}%`,
                      background: playerHere.player.hp / playerHere.player.maxHp > 0.5
                        ? '#44aa77' : playerHere.player.hp / playerHere.player.maxHp > 0.25
                        ? '#cc8822' : '#cc3333',
                      borderRadius: 2, transition: 'width 0.3s',
                    }} />
                  </div>
                </>
              )}

              {/* Move dot (when tile is empty move target) */}
              {isMove && !playerHere && !enemy && !isWall && (
                <span style={{ fontSize: 8, color: '#5ab4ff', opacity: 0.5, zIndex: 5 }}>●</span>
              )}
            </div>
          );
        }))}
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  );
}
