import { MULTIPLAYER_MAPS } from './data/multiplayerMaps';
import { FULL_DECK } from './data/cards';
import { RACES, CLASSES, SPECS } from './data/character';
import { MONSTER_PILE_1, MONSTER_PILE_2, MONSTER_PILE_3 } from './data/monsters';
import { TRAPS } from './data/traps';
import CardHand from './components/CardHand';

// ─── Mini-tile renderer (3×3 grid for entity showcases) ───────────────────────
const TS = 56; // tile size for entity preview

const WALL_STYLE = {
  backgroundImage: `
    repeating-linear-gradient(0deg,transparent,transparent 9px,rgba(0,0,0,0.55) 9px,rgba(0,0,0,0.55) 10px),
    repeating-linear-gradient(90deg,transparent,transparent 14px,rgba(0,0,0,0.55) 14px,rgba(0,0,0,0.55) 15px)
  `,
  boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.04),inset -2px -2px 6px rgba(0,0,0,0.8)',
};

function MiniTile({ isWall, bg, border, children, glow }) {
  return (
    <div style={{
      width: TS, height: TS,
      background: isWall ? '#06060e' : bg,
      border: `1px solid ${isWall ? '#03030a' : border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      boxShadow: glow ? `inset 0 0 14px ${glow}` : undefined,
    }}>
      {isWall && <div style={{ position: 'absolute', inset: 0, ...WALL_STYLE }} />}
      {children}
    </div>
  );
}

function EntityCard({ id, title, subtitle, children }) {
  return (
    <div id={id} style={card3x3Style}>
      <div style={cardLabel}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#555', marginBottom: 6, textAlign: 'center' }}>{subtitle}</div>}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(3,${TS}px)`,
        gap: 1, border: '1px solid #1a1a2a', borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0,0,0,0.7)',
      }}>
        {children}
      </div>
    </div>
  );
}

function FloorTile() {
  return <MiniTile bg="#111120" border="#1c1c30" />;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card3x3Style = {
  background: '#0e0e1c',
  border: '1px solid #222236',
  borderRadius: 12,
  padding: '18px 18px 14px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
};
const cardLabel = {
  fontSize: 12, fontWeight: 700, color: '#88aaff',
  letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center',
};
const sectionTitle = {
  fontSize: 13, fontWeight: 700, color: '#555',
  letterSpacing: 3, textTransform: 'uppercase',
  borderBottom: '1px solid #1a1a2a', paddingBottom: 10, marginBottom: 24, marginTop: 48,
};

// ─── Character card ───────────────────────────────────────────────────────────
function CharacterCard({ race, cls, spec }) {
  return (
    <div style={{
      width: 160, borderRadius: 12, overflow: 'hidden',
      border: '2px solid #3a3a5a',
      background: 'linear-gradient(160deg, #12121f, #0e0e1c)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.7), 0 0 0 1px #222',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header bar */}
      <div style={{ background: '#1a1a2e', padding: '8px 10px', borderBottom: '1px solid #2a2a40' }}>
        <div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Personnage</div>
      </div>
      {/* Race */}
      <div style={{ padding: '10px 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>{race.icon}</span>
        <div>
          <div style={{ fontSize: 8, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase' }}>Race</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ccddff' }}>{race.name}</div>
        </div>
      </div>
      {/* Class */}
      <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{cls.icon}</span>
        <div>
          <div style={{ fontSize: 8, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase' }}>Classe</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ccddff' }}>{cls.name}</div>
        </div>
      </div>
      {/* Spec */}
      <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{spec.icon}</span>
        <div>
          <div style={{ fontSize: 8, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase' }}>Spécialisation</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ccddff' }}>{spec.name}</div>
        </div>
      </div>
      {/* Stats strip */}
      <div style={{ margin: '10px 10px 10px', padding: '8px 8px', background: '#0a0a14', borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {[
          { label: 'FOR', val: 2, color: '#ff9955' },
          { label: 'MAG', val: 1, color: '#ff55ff' },
          { label: 'VIE', val: 8, color: '#55ff99' },
          { label: 'DEP', val: 2, color: '#55ccff' },
          { label: 'RIC', val: 1, color: '#ffdd44' },
          { label: 'DES', val: 1, color: '#aa66ff' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 26%' }}>
            <div style={{ fontSize: 7, color: '#444', fontWeight: 700, letterSpacing: 0.3 }}>{s.label}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Map preview (scaled down) ────────────────────────────────────────────────
const MAP_TS = 28;

function MapGrid({ map }) {
  const PLAYER_COLORS = ['#ff4444','#44aaff','#44ff88','#ffcc00','#ff88ff','#ff8844'];
  const playerSet = {};
  map.playerStarts.forEach((p, i) => { playerSet[`${p.x},${p.y}`] = { label: p.label, color: PLAYER_COLORS[i] }; });

  const SPECIAL = {
    7: { bg: '#0d0019', border: '#8833ee', icon: '🌀', size: 10 },
    8: { bg: '#1c1400', border: '#cc9900', icon: '🏪', size: 10 },
    3: { bg: '#0d130d', border: '#2a4a2a', icon: '✦', size: 8, color: '#3a6a3a' },
    4: { bg: '#001810', border: '#00bb66', icon: '⭐', size: 10 },
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${map.grid[0].length},${MAP_TS}px)`,
      gap: 1, border: '2px solid #1c1c30', borderRadius: 6, overflow: 'hidden',
      boxShadow: '0 0 24px rgba(0,0,0,0.8)',
    }}>
      {map.grid.map((row, y) => row.map((cell, x) => {
        const key = `${x},${y}`;
        const player = playerSet[key];
        const isWall = cell === 1;
        const sp = SPECIAL[cell];

        return (
          <div key={key} style={{
            width: MAP_TS, height: MAP_TS, boxSizing: 'border-box',
            background: isWall ? '#06060e' : player ? `${player.color}20` : sp ? sp.bg : '#111120',
            border: `1px solid ${isWall ? '#03030a' : player ? `${player.color}66` : sp ? sp.border : '#1c1c30'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: sp && !player ? `inset 0 0 6px ${sp.border}44` : undefined,
          }}>
            {isWall && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 6px,rgba(0,0,0,0.5) 6px,rgba(0,0,0,0.5) 7px),repeating-linear-gradient(90deg,transparent,transparent 10px,rgba(0,0,0,0.5) 10px,rgba(0,0,0,0.5) 11px)`, boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.04)' }} />
            )}
            {player && (
              <div style={{ width: MAP_TS - 8, height: MAP_TS - 8, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${player.color}cc, ${player.color}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#000', boxShadow: `0 0 6px ${player.color}` }}>
                {player.label}
              </div>
            )}
            {!player && !isWall && sp && (
              <span style={{ fontSize: sp.size, lineHeight: 1, filter: `drop-shadow(0 0 3px ${sp.border})`, color: sp.color }}>{sp.icon}</span>
            )}
          </div>
        );
      }))}
    </div>
  );
}

// ─── Pick one card per category ───────────────────────────────────────────────
const byCategory = {};
for (const card of FULL_DECK) {
  if (!byCategory[card.category]) byCategory[card.category] = card;
}

const CARD_SECTIONS = [
  { key: 'deplacement',  label: 'Carte Déplacement' },
  { key: 'arme',         label: 'Carte Arme' },
  { key: 'armure',       label: 'Carte Armure' },
  { key: 'potion',       label: 'Carte Potion' },
  { key: 'parchemin',    label: 'Carte Parchemin' },
  { key: 'objet_rare',   label: 'Carte Trésor' },
  { key: 'arme_magique', label: 'Carte Arme Magique' },
  { key: 'legendaire',   label: 'Carte Légendaire' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function MapPreview() {
  const sampleMonsters = [
    { ...MONSTER_PILE_1[0], hp: MONSTER_PILE_1[0].maxHp },
    { ...MONSTER_PILE_2[0], hp: MONSTER_PILE_2[0].maxHp },
    { ...MONSTER_PILE_3[0], hp: MONSTER_PILE_3[0].maxHp },
  ];
  const sampleTraps = TRAPS.slice(0, 3);

  return (
    <div style={{
      background: '#08080f', minHeight: '100vh', padding: '32px 40px',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#eee',
    }}>
      <h1 style={{ textAlign: 'center', color: '#88aaff', letterSpacing: 3, fontSize: 22, margin: '0 0 4px' }}>
        ⚔️ DÉTOPIA — Référence Visuelle
      </h1>
      <p style={{ textAlign: 'center', color: '#444', marginBottom: 0, fontSize: 12 }}>
        Références pour redesign Illustrator
      </p>

      {/* ══ MAPS ══════════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Maps (6)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, maxWidth: 1800, margin: '0 auto' }}>
        {MULTIPLAYER_MAPS.map((map, i) => (
          <div key={map.id} id={`map-${map.id}`} style={{ background: '#0e0e1c', border: '1px solid #222236', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: '#333', fontSize: 11 }}>#{i+1}</span>
              <div style={{ fontWeight: 700, color: '#ccddff', fontSize: 16 }}>{map.name}</div>
            </div>
            <MapGrid map={map} />
            <div style={{ color: '#555', fontSize: 11, textAlign: 'center', lineHeight: 1.6, maxWidth: 400 }}>
              {map.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ══ HAND CARDS ════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Cartes en Main (8 types)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center' }}>
        {CARD_SECTIONS.map(({ key, label }) => {
          const card = byCategory[key];
          if (!card) return null;
          return (
            <div key={key} id={`card-${key}`} style={card3x3Style}>
              <div style={cardLabel}>{label}</div>
              <CardHand
                hand={[card]}
                selected={null}
                onSelect={() => {}}
                disabled={false}
              />
              <div style={{ fontSize: 10, color: '#444', textAlign: 'center', maxWidth: 120, lineHeight: 1.5 }}>
                {card.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ MONSTERS ══════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Cartes Monstre (3 piles)</div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
        {sampleMonsters.map((m, mi) => {
          const pileColor = m.pile === 1 ? '#44cc44' : m.pile === 2 ? '#ccaa00' : '#cc3333';
          return (
            <EntityCard key={m.id} id={mi === 0 ? 'entity-monstre' : undefined} title={`Monstre Pile ${m.pile}`} subtitle={m.name}>
              <FloorTile /><FloorTile /><FloorTile />
              <FloorTile />
              {/* Center: monster */}
              <MiniTile bg="#111120" border={pileColor + '66'} glow={pileColor + '22'}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -4, right: -8, width: 12, height: 12, borderRadius: '50%', background: pileColor, fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, boxShadow: `0 0 4px ${pileColor}` }}>{m.pile}</div>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{m.icon}</span>
                  <div style={{ width: 32, height: 4, background: '#0d0d1a', borderRadius: 2, marginTop: 2 }}>
                    <div style={{ width: '100%', height: '100%', background: pileColor, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 7, color: pileColor, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap' }}>
                    {m.name.length > 8 ? m.name.slice(0,8) + '…' : m.name}
                  </div>
                </div>
              </MiniTile>
              <FloorTile />
              <FloorTile /><FloorTile /><FloorTile />
            </EntityCard>
          );
        })}
      </div>

      {/* ══ TRAPS ═════════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Cartes Piège (3 exemples)</div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
        {sampleTraps.map((trap, ti) => (
          <EntityCard key={trap.id} id={ti === 0 ? 'entity-piege' : undefined} title="Carte Piège" subtitle={trap.name}>
            <FloorTile /><FloorTile /><FloorTile />
            <FloorTile />
            <MiniTile bg="#1a0e04" border={trap.color + '88'} glow={trap.color + '22'}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 20, lineHeight: 1, filter: `drop-shadow(0 0 4px ${trap.color})` }}>{trap.icon}</span>
                <div style={{ fontSize: 6, color: trap.color, fontWeight: 800, letterSpacing: 0.3 }}>PIÈGE</div>
              </div>
            </MiniTile>
            <FloorTile />
            <FloorTile /><FloorTile /><FloorTile />
          </EntityCard>
        ))}
      </div>

      {/* ══ MAP SPECIAL TILES ═════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Cases Spéciales</div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>

        {/* Portail / Téléporteur */}
        <EntityCard id="entity-portail" title="Carte Portail" subtitle="Téléporteur">
          <MiniTile isWall /><FloorTile /><MiniTile isWall />
          <FloorTile />
          <MiniTile bg="#0d0019" border="#8833ee" glow="#8833ee44">
            <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 6px #8833ee)' }}>🌀</span>
          </MiniTile>
          <FloorTile />
          <MiniTile isWall /><FloorTile /><MiniTile isWall />
        </EntityCard>

        {/* Base / Spawn */}
        <EntityCard id="entity-base" title="Carte Base" subtitle="Point de départ — P1">
          <FloorTile /><FloorTile /><FloorTile />
          <FloorTile />
          <MiniTile bg="#ff444420" border="#ff4444aa">
            <div style={{ width: TS - 12, height: TS - 12, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ff4444cc, #ff444466)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#000', boxShadow: '0 0 10px #ff4444' }}>
              🦾
            </div>
          </MiniTile>
          <FloorTile />
          <FloorTile /><FloorTile /><FloorTile />
        </EntityCard>

        {/* Magasin / Shop */}
        <EntityCard title="Carte Magasin" subtitle="Shop — piocher 3 cartes">
          <FloorTile /><MiniTile isWall /><FloorTile />
          <FloorTile />
          <MiniTile bg="#1c1400" border="#cc9900" glow="#cc990033">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 0 5px #cc9900)' }}>🏪</span>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#cc9900', letterSpacing: 0.5, textShadow: '0 0 4px #cc9900' }}>SHOP</div>
            </div>
          </MiniTile>
          <FloorTile />
          <FloorTile /><MiniTile isWall /><FloorTile />
        </EntityCard>

        {/* Coffre */}
        <EntityCard title="Carte Coffre" subtitle="Loot de cartes">
          <FloorTile /><FloorTile /><FloorTile />
          <FloorTile />
          <MiniTile bg="#181408" border="#aa882266" glow="#aa882222">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 0 4px #ffcc44)' }}>💰</span>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#cc9900' }}>×3</div>
            </div>
          </MiniTile>
          <FloorTile />
          <FloorTile /><FloorTile /><FloorTile />
        </EntityCard>

        {/* Objectif central */}
        <EntityCard title="Carte Objectif" subtitle="Centre de la map">
          <FloorTile /><FloorTile /><FloorTile />
          <FloorTile />
          <MiniTile bg="#001810" border="#00bb66" glow="#00bb6633">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 0 6px #00bb66)' }}>⭐</span>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#00bb66', letterSpacing: 0.5, textShadow: '0 0 4px #00bb66' }}>OBJ</div>
            </div>
          </MiniTile>
          <FloorTile />
          <FloorTile /><FloorTile /><FloorTile />
        </EntityCard>

        {/* Mur */}
        <EntityCard title="Mur" subtitle="Obstacle infranchissable">
          <MiniTile isWall /><MiniTile isWall /><MiniTile isWall />
          <FloorTile /><MiniTile isWall /><FloorTile />
          <FloorTile /><MiniTile isWall /><FloorTile />
        </EntityCard>

        {/* Hauteur */}
        <EntityCard title="Élévation" subtitle="Sol surélevé (×2)">
          <FloorTile /><FloorTile /><FloorTile />
          <FloorTile />
          <MiniTile bg="#1d1d32" border="#2a2a52">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <div style={{ position: 'absolute', top: 3, left: 3, fontSize: 9, color: '#ffee88', fontWeight: 900, textShadow: '0 0 3px #000' }}>▲▲</div>
              <span style={{ fontSize: 18, marginTop: 8 }}>🗿</span>
            </div>
          </MiniTile>
          <FloorTile />
          <FloorTile /><FloorTile /><FloorTile />
        </EntityCard>
      </div>

      {/* ══ PERSONNAGE ════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Carte Personnage (exemples)</div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { race: RACES[0], cls: CLASSES[0], spec: SPECS[0] },
          { race: RACES[1], cls: CLASSES[2], spec: SPECS[4] },
          { race: RACES[2], cls: CLASSES[4], spec: SPECS[11] },
        ].map((combo, i) => (
          <div key={i} id={`char-${i}`} style={card3x3Style}>
            <div style={cardLabel}>Carte Personnage #{i+1}</div>
            <CharacterCard {...combo} />
          </div>
        ))}
      </div>

      {/* ══ LEGEND ════════════════════════════════════════════════════════════ */}
      <div style={sectionTitle}>Légende complète</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingBottom: 48 }}>
        {[
          { label: 'Sol', bg: '#111120', border: '#1c1c30' },
          { label: 'Mur', bg: '#06060e', border: '#03030a', isWall: true },
          { label: 'Hauteur ①', bg: '#161626', border: '#222240' },
          { label: 'Hauteur ②', bg: '#1d1d32', border: '#2a2a52' },
          { label: 'Magasin', bg: '#1c1400', border: '#cc9900', icon: '🏪' },
          { label: 'Téléporteur', bg: '#0d0019', border: '#8833ee', icon: '🌀' },
          { label: 'Objectif', bg: '#001810', border: '#00bb66', icon: '⭐' },
          { label: 'Item', bg: '#0d130d', border: '#2a4a2a', icon: '✦', iconColor: '#3a6a3a' },
          { label: 'Monstre ①', bg: '#1a2a1a', border: '#44cc44', icon: '👾' },
          { label: 'Monstre ②', bg: '#2a2a14', border: '#ccaa00', icon: '👹' },
          { label: 'Monstre ③', bg: '#2a1414', border: '#cc3333', icon: '🐉' },
          { label: 'Piège', bg: '#1e1208', border: '#ff6633', icon: '🪤' },
          { label: 'Coffre', bg: '#181408', border: '#aa8822', icon: '💰' },
          { label: 'Base J1', bg: '#ff444415', border: '#ff4444aa', icon: '⬡', iconColor: '#ff4444' },
          { label: 'Base J2', bg: '#44aaff15', border: '#44aaffaa', icon: '⬡', iconColor: '#44aaff' },
          { label: '→ Déplacer', bg: 'rgba(80,180,255,0.18)', border: '#5ab4ff' },
          { label: '→ Attaquer', bg: 'rgba(255,80,60,0.22)', border: '#ff5040' },
        ].map(it => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0e0e1c', border: '1px solid #1a1a28', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 3, background: it.bg, border: `1px solid ${it.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              flexShrink: 0, color: it.iconColor,
              backgroundImage: it.isWall ? `repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,0.5) 4px,rgba(0,0,0,0.5) 5px),repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(0,0,0,0.5) 7px,rgba(0,0,0,0.5) 8px)` : undefined,
            }}>
              {it.icon && <span style={{ lineHeight: 1 }}>{it.icon}</span>}
            </div>
            <span style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap' }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
