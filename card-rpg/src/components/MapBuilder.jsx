import { useState, useCallback, useRef } from 'react';

// ─── Tile types (must match data/map.js) ──────────────────────────────────────
const T = {
  FLOOR:    0,
  WALL:     1,
  ENEMY:    2,
  ITEM:     3,
  EXIT:     4,
  PLAYER:   5,
  CHEST:    6,
  TELEPORT: 7,
  SHOP:     8,
  PRISON:   9,
};

const TILE_INFO = [
  { id: T.FLOOR,    label: 'Sol',        icon: null,  color: '#111120', border: '#1c1c30' },
  { id: T.WALL,     label: 'Mur',        icon: null,  color: '#06060e', border: '#03030a' },
  { id: T.ENEMY,    label: 'Ennemi',     icon: '👾',  color: '#1a2a1a', border: '#44cc44' },
  { id: T.ITEM,     label: 'Item',       icon: '✦',   color: '#0d130d', border: '#2a4a2a' },
  { id: T.EXIT,     label: 'Objectif',   icon: '⭐',  color: '#001810', border: '#00bb66' },
  { id: T.PLAYER,   label: 'Départ joueur', icon: '🧙', color: '#111120', border: '#5ab4ff' },
  { id: T.CHEST,    label: 'Coffre',     icon: '💰',  color: '#181408', border: '#aa8822' },
  { id: T.TELEPORT, label: 'Téléport',   icon: '🌀',  color: '#0d0019', border: '#8833ee' },
  { id: T.SHOP,     label: 'Magasin',    icon: '🏪',  color: '#1c1400', border: '#cc9900' },
  { id: T.PRISON,   label: 'Prison',     icon: '⛓️', color: '#1a0a0a', border: '#994422' },
];

const DEFAULT_ROWS = 12;
const DEFAULT_COLS = 12;
const CELL = 32;

function makeGrid(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      r === 0 || r === rows - 1 || c === 0 || c === cols - 1 ? T.WALL : T.FLOOR
    )
  );
}

function gridToCode(grid, name, playerStart) {
  const rows = grid.map(row => '    [' + row.join(',') + ']').join(',
');
  return `{
  name: '${name}',
  grid: [
${rows}
  ],
  playerStart: { x: ${playerStart.x}, y: ${playerStart.y} },
}`;
}

export default function MapBuilder() {
  const [rows, setRows]               = useState(DEFAULT_ROWS);
  const [cols, setCols]               = useState(DEFAULT_COLS);
  const [grid, setGrid]               = useState(() => makeGrid(DEFAULT_ROWS, DEFAULT_COLS));
  const [activeTile, setActiveTile]   = useState(T.WALL);
  const [mapName, setMapName]         = useState('Ma Carte');
  const [playerStart, setPlayerStart] = useState({ x: 1, y: 1 });
  const [exported, setExported]       = useState('');
  const [isPainting, setIsPainting]   = useState(false);
  const [showCode, setShowCode]       = useState(false);
  const [copied, setCopied]           = useState(false);

  const handleResize = (newRows, newCols) => {
    const r = Math.max(5, Math.min(24, newRows));
    const c = Math.max(5, Math.min(24, newCols));
    setRows(r); setCols(c);
    setGrid(makeGrid(r, c));
    setExported(''); setShowCode(false);
  };

  const paint = useCallback((r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = activeTile;
      return next;
    });
    if (activeTile === T.PLAYER) setPlayerStart({ x: c, y: r });
  }, [activeTile, rows, cols]);

  const handleMouseDown = (r, c, e) => {
    e.preventDefault();
    setIsPainting(true);
    paint(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (isPainting) paint(r, c);
  };

  const handleMouseUp = () => setIsPainting(false);

  const handleExport = () => {
    const code = gridToCode(grid, mapName, playerStart);
    setExported(code);
    setShowCode(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exported).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleClearFloor = () => {
    setGrid(makeGrid(rows, cols));
    setExported(''); setShowCode(false);
  };

  return (
    <div
      style={{ display: 'flex', gap: 18, flexWrap: 'wrap', padding: 16, alignItems: 'flex-start' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Palette & Settings ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 160 }}>
        <div style={{ color: '#88aaff', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
          🗺️ Constructeur de map
        </div>

        {/* Name */}
        <div>
          <div style={LBL}>Nom</div>
          <input value={mapName} onChange={e => setMapName(e.target.value)} style={INP} />
        </div>

        {/* Grid size */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={LBL}>Lignes</div>
            <input type="number" min={5} max={24} value={rows}
              onChange={e => handleResize(Number(e.target.value), cols)}
              style={{ ...INP, textAlign: 'center' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={LBL}>Colonnes</div>
            <input type="number" min={5} max={24} value={cols}
              onChange={e => handleResize(rows, Number(e.target.value))}
              style={{ ...INP, textAlign: 'center' }} />
          </div>
        </div>

        {/* Tile palette */}
        <div>
          <div style={LBL}>Type de tuile actif</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {TILE_INFO.map(t => (
              <button key={t.id} onClick={() => setActiveTile(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: activeTile === t.id ? t.border + '33' : '#0e0e1c',
                border: `1px solid ${activeTile === t.id ? t.border : '#2a2a3a'}`,
                borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                color: activeTile === t.id ? '#ddd' : '#666',
                fontWeight: activeTile === t.id ? 700 : 400,
                fontSize: 12, transition: 'all 0.1s', textAlign: 'left',
              }}>
                <span style={{
                  width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                  background: t.color, border: `1px solid ${t.border}`,
                  display: 'inline-block',
                }} />
                {t.icon && <span style={{ fontSize: 11 }}>{t.icon}</span>}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleClearFloor} style={BTN}>🗑️ Réinitialiser</button>
        <button onClick={handleExport} style={{ ...BTN, borderColor: '#5ab4ff', color: '#88ccff' }}>
          📋 Générer le code
        </button>
      </div>

      {/* ── Grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, userSelect: 'none' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gap: 1, background: '#03030a',
          border: '1px solid #2a2a3a', borderRadius: 6,
          padding: 3, cursor: 'crosshair',
        }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const info = TILE_INFO.find(t => t.id === cell) ?? TILE_INFO[0];
              const isPS = playerStart.x === c && playerStart.y === r;
              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={e => handleMouseDown(r, c, e)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  title={`[${c},${r}] ${info.label}`}
                  style={{
                    width: CELL, height: CELL,
                    background: info.color,
                    border: `1px solid ${isPS ? '#5ab4ff' : info.border}`,
                    boxShadow: isPS ? '0 0 6px #5ab4ff' : undefined,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, cursor: 'crosshair',
                  }}>
                  {isPS
                    ? <span style={{ pointerEvents: 'none' }}>{info.icon ?? '🧙'}</span>
                    : info.icon
                      ? <span style={{ pointerEvents: 'none' }}>{info.icon}</span>
                      : null}
                </div>
              );
            })
          )}
        </div>
        <div style={{ fontSize: 10, color: '#444', textAlign: 'center' }}>
          {rows} × {cols} — cliquer ou glisser pour peindre · 🧙 = départ joueur
        </div>
      </div>

      {/* ── Code output ── */}
      {showCode && (
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: '#88aaff', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
            Code exporté
          </div>
          <pre style={{
            background: '#0a0a14', border: '1px solid #1a1a2a', borderRadius: 8,
            padding: 12, color: '#88ff99', fontSize: 10, lineHeight: 1.5,
            overflowY: 'auto', maxHeight: 520, whiteSpace: 'pre-wrap',
            wordBreak: 'break-all', margin: 0,
          }}>{exported}</pre>
          <button onClick={handleCopy} style={{ ...BTN, borderColor: copied ? '#44cc44' : '#2a2a3a', color: copied ? '#88ff99' : '#555' }}>
            {copied ? '✅ Copié !' : '📋 Copier'}
          </button>
          <div style={{ fontSize: 10, color: '#444', lineHeight: 1.6 }}>
            Collez ce bloc dans <code style={{ color: '#88aaff' }}>src/data/map.js</code> à l'intérieur du tableau <code style={{ color: '#88aaff' }}>MAPS</code>.
          </div>
        </div>
      )}
    </div>
  );
}

const LBL = {
  fontSize: 10, color: '#555', fontWeight: 700,
  letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4,
};
const INP = {
  background: '#0a0a16', border: '1px solid #2a2a3a', borderRadius: 6,
  color: '#ccc', fontSize: 12, padding: '5px 8px', width: '100%',
  outline: 'none', boxSizing: 'border-box',
};
const BTN = {
  background: '#0e0e1c', border: '1px solid #2a2a3a', borderRadius: 6,
  color: '#555', fontSize: 12, padding: '7px 10px',
  cursor: 'pointer', transition: 'all 0.12s',
};
