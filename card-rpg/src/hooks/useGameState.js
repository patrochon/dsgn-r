import { useState, useCallback } from 'react';
import { FULL_DECK, shuffleDeck } from '../data/cards';
import { MULTIPLAYER_MAPS } from '../data/multiplayerMaps';
import { T } from '../data/map';
import { MONSTER_PILE_1, MONSTER_PILE_2, MONSTER_PILE_3, shuffleMonsters } from '../data/monsters';
import { TRAPS } from '../data/traps';

const HAND_LIMIT = 6;
const PLAYER_COLORS = ['#ff4444', '#44aaff', '#44ff88', '#ffcc00', '#ff88ff', '#ff8844'];

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function buildPlayer(charData, index, mapData) {
  const stats = charData.stats ?? { force: 1, magie: 1, vie: 6, deplacement: 0, richesse: 1, destin: 1 };
  const maxHp = 20 + stats.vie * 2;
  const start = mapData.playerStarts[index] ?? mapData.playerStarts[0];
  const deck = shuffleDeck([...FULL_DECK]);
  return {
    id: index,
    name: charData.name ?? `Joueur ${index + 1}`,
    race: charData.race ?? null,
    cls: charData.cls ?? null,
    spec: charData.spec ?? null,
    x: start.x,
    y: start.y,
    baseX: start.x,
    baseY: start.y,
    hp: maxHp,
    maxHp,
    stats: { ...stats },
    inventory: [],
    gold: 0,
    lastScroll: null,
    readyScroll: null,
    hand: deck.splice(0, 6),
    deck,
    discard: [],
    isAlive: true,
    physicalImmune: false,
    facing: null,
    magicAbsorbAvailable: true,
    forcedImmobile: false,
    color: PLAYER_COLORS[index] ?? '#ffffff',
  };
}

// Parse 'stat:force+2,vie+1' style special strings, returns array of {stat, val}
function parseStatSpecial(special) {
  if (!special || !special.startsWith('stat:')) return [];
  const parts = special.replace('stat:', '').split(',');
  const result = [];
  for (const part of parts) {
    const m = part.match(/^([a-z_]+)([+-]\d+)$/);
    if (m) result.push({ stat: m[1], val: parseInt(m[2]) });
  }
  return result;
}

// Parse 'perm:stat+val,...' style
function parsePermSpecial(special) {
  if (!special) return [];
  const permMatch = special.match(/perm:([^)]+)/);
  if (!permMatch) return [];
  const parts = permMatch[1].split(',');
  const result = [];
  for (const part of parts) {
    const m = part.match(/^([a-z_]+)([+-]\d+)$/);
    if (m) result.push({ stat: m[1], val: parseInt(m[2]) });
  }
  return result;
}

function applyStatDeltas(player, deltas) {
  let p = { ...player, stats: { ...player.stats } };
  for (const { stat, val } of deltas) {
    if (stat === 'vie') {
      const hpGain = val * 2;
      p.maxHp += hpGain;
      p.hp = Math.min(p.maxHp, p.hp + hpGain);
    }
    if (p.stats[stat] !== undefined) {
      p.stats[stat] += val;
    }
  }
  return p;
}

// Check if card is equippable (free action)
export function isEquippable(card) {
  return ['defense', 'attack', 'magic_attack', 'passive', 'legendary'].includes(card?.effect?.type);
}

// Check if card is usable (costs action)
export function isUsable(card) {
  return ['heal', 'buff', 'cure', 'magic'].includes(card?.effect?.type);
}

function generateInitialTiles(mapData) {
  const startKeys = new Set(mapData.playerStarts.map(s => `${s.x},${s.y}`));
  const free = [];
  for (let y = 0; y < mapData.grid.length; y++) {
    for (let x = 0; x < mapData.grid[0].length; x++) {
      if (mapData.grid[y][x] === T.FLOOR && !startKeys.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }

  const total = free.length;
  const eCount = Math.floor(total * 0.40);
  const tCount = Math.floor(total * 0.25);
  const cCount = Math.floor(total * 0.25);

  const cx = Math.floor(mapData.grid[0].length / 2);
  const cy = Math.floor(mapData.grid.length / 2);
  const maxDist = cx + cy;

  // — Enemies (40%) — tous en pile 1 au départ
  const p1 = shuffleMonsters([...MONSTER_PILE_1]);
  let p1idx = 0;
  const enemies = {};
  for (let i = 0; i < eCount; i++) {
    const { x, y } = free[i];
    const m = p1[p1idx % p1.length];
    p1idx++;
    enemies[`${x},${y}`] = { ...m, hp: m.maxHp };
  }

  // — Traps (25%) — random among 6 trap types
  const traps = {};
  for (let i = eCount; i < eCount + tCount; i++) {
    const { x, y } = free[i];
    traps[`${x},${y}`] = { ...TRAPS[Math.floor(Math.random() * TRAPS.length)] };
  }

  // — Chests (25%) — loot scales with proximity to center
  const chests = {};
  for (let i = eCount + tCount; i < eCount + tCount + cCount; i++) {
    const { x, y } = free[i];
    const ratio = (Math.abs(x - cx) + Math.abs(y - cy)) / maxDist;
    const loot = ratio > 0.6 ? 2 : ratio > 0.3 ? 3 : 4;
    chests[`${x},${y}`] = { loot };
  }

  return { enemies, traps, chests };
}

// Dijkstra movement reachability — returns { tiles: string[], budgetAtTile: {key: number} }
// hasZeles   : uphill costs 1 (not 2), downhill grants +2 budget
// wallPass   : traverse all walls freely
// oneWallPass: traverse at most one wall (Feux Follets passive)
function runMoveDijkstra(fromX, fromY, budget, facing, hasZeles, wallPass, oneWallPass, grid, heights) {
  const visited = {};
  const queue = [{ x: fromX, y: fromY, budget, wallsUsed: 0, dir: facing ?? null }];
  const tilesSet = new Set();
  const budgetAtTile = {};
  while (queue.length > 0) {
    queue.sort((a, b) => b.budget - a.budget);
    const { x, y, budget: bgt, wallsUsed, dir } = queue.shift();
    const dirKey = dir ? `${dir.dx},${dir.dy}` : 'n';
    const visitKey = `${x},${y},${wallsUsed},${dirKey}`;
    if (visited[visitKey]) continue;
    visited[visitKey] = true;
    const isWall = grid[y]?.[x] === T.WALL;
    if (!(x === fromX && y === fromY) && !isWall) {
      if ((budgetAtTile[`${x},${y}`] ?? -1) < bgt) budgetAtTile[`${x},${y}`] = bgt;
      tilesSet.add(`${x},${y}`);
    }
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
      const nIsWall = grid[ny][nx] === T.WALL;
      if (nIsWall) {
        if (!wallPass && !(oneWallPass && wallsUsed === 0)) continue;
      }
      const nWallsUsed = wallsUsed + (nIsWall ? 1 : 0);
      if (!wallPass && nWallsUsed > 1) continue;
      const hDiff = nIsWall ? 0 : ((heights[ny]?.[nx] ?? 0) - (heights[y]?.[x] ?? 0));
      let stepCost = hasZeles
        ? (hDiff > 0 ? 1 : hDiff < 0 ? -2 : 1)
        : Math.max(0, 1 + hDiff);
      // 180-degree turn costs 1 extra movement
      if (dir && dir.dx === -dx && dir.dy === -dy) stepCost += 1;
      const newBgt = bgt - stepCost;
      if (newBgt >= 0) queue.push({ x: nx, y: ny, budget: newBgt, wallsUsed: nWallsUsed, dir: { dx, dy } });
    }
  }
  return { tiles: [...tilesSet], budgetAtTile };
}

// Apply Cailloux passive: -1 per hit, immune if physicalImmune
function physDmg(rawDmg, target) {
  if (target?.physicalImmune) return 0;
  const reduction = target?.race?.passive === 'cailloux' ? 1 : 0;
  return Math.max(0, rawDmg - reduction);
}

// Generate organic height map (0 = flat, 1 = elevated, 2 = high ground)
function generateHeights(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const h = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const seeds = Math.floor(rows * cols * 0.07);
  for (let s = 0; s < seeds; s++) {
    const sy = Math.floor(Math.random() * rows);
    const sx = Math.floor(Math.random() * cols);
    if (grid[sy][sx] === T.WALL) continue;
    const peak = Math.random() < 0.35 ? 2 : 1;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const ny = sy + dy, nx = sx + dx;
        if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
        if (grid[ny][nx] === T.WALL) continue;
        const d = Math.abs(dx) + Math.abs(dy);
        const th = peak - Math.floor(d / 2);
        if (th > 0) h[ny][nx] = Math.max(h[ny][nx], th);
      }
    }
  }
  return h;
}

export function useGameState(characters) {
  const [mapData] = useState(() => MULTIPLAYER_MAPS[Math.floor(Math.random() * MULTIPLAYER_MAPS.length)]);
  const [mapName] = useState(() => mapData.name);
  const [grid] = useState(() => mapData.grid.map(r => [...r]));
  const [heights] = useState(() => generateHeights(mapData.grid));
  const [{ enemies: initEnemies, traps: initTraps, chests: initChests }] = useState(() => generateInitialTiles(mapData));
  const [enemies, setEnemies] = useState(initEnemies);
  const [traps,   setTraps]   = useState(initTraps);
  const [chests,  setChests]  = useState(initChests);

  const [players, setPlayers] = useState(() =>
    (characters ?? []).map((ch, i) => buildPlayer(ch, i, mapData))
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [actionsLeft, setActionsLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [phase, setPhase] = useState('draw');
  const [tilesBudget, setTilesBudget] = useState({});
  const [moveRerolled, setMoveRerolled] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [highlightTiles, setHighlightTiles] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [log, setLog] = useState(['Bienvenue dans la partie multijoueur !', 'Joueur 1 commence — tirez vos cartes.']);
  const [winner, setWinner] = useState(null);

  const currentPlayer = players[currentIdx] ?? players[0];

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 30));

  // Animate dice, call onDone(finalValue)
  const animateRoll = (onDone) => {
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDiceResult(rollDie());
      count++;
      if (count > 6) {
        clearInterval(interval);
        const final = rollDie();
        setDiceResult(final);
        setRolling(false);
        onDone(final);
      }
    }, 80);
  };

  // Draw cards up to HAND_LIMIT for current player, set actionsLeft, reset hasMoved
  const drawCards = useCallback(() => {
    const cp = players[currentIdx];
    const wasForcedImmobile = cp?.race?.passive === 'anciens' && cp?.forcedImmobile;
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      if (p.physicalImmune) addLog(`🪨 ${p.name} est immunisé aux dégâts physiques ce tour.`);
      p.physicalImmune = false;
      // Gold income: receive richesse stat in gold each turn
      const income = p.stats?.richesse ?? 1;
      p.gold = (p.gold ?? 0) + income;
      addLog(`💰 ${p.name} reçoit ${income} pièce(s) d'or (Richesse: ${p.stats?.richesse ?? 1}). Total: ${p.gold}`);
      // Anciens: reset absorb, clear forced immobile flag
      if (p.race?.passive === 'anciens') {
        p.magicAbsorbAvailable = true;
        p.forcedImmobile = false;
      }
      // Draw exactly 1 card per turn (up to hand limit)
      const needed = p.hand.length < HAND_LIMIT ? 1 : 0;
      if (needed > 0) {
        let deck = [...p.deck];
        let discard = [...p.discard];
        if (deck.length < needed) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
        const drawn = deck.splice(0, needed);
        p.hand = [...p.hand, ...drawn];
        p.deck = deck;
        p.discard = discard;
        addLog(`${p.name} tire ${drawn.length} carte(s).`);
      }
      next[currentIdx] = p;
      return next;
    });
    setMoveRerolled(false);
    setActionsLeft(3); // 3 actions per turn: move, attack, class ability
    if (wasForcedImmobile) {
      setHasMoved(true);
      addLog(`🌙 ${cp.name} reste immobile ce tour (prix de l'absorption magique).`);
    } else {
      setHasMoved(false);
    }
    setPhase('player_turn');
  }, [currentIdx, players]);

  // Equip card — FREE, applies stat bonuses, moves to inventory + discard
  const equipCard = useCallback((card) => {
    if (!card || !isEquippable(card)) return false;
    setPlayers(prev => {
      const next = [...prev];
      let p = { ...next[currentIdx], stats: { ...next[currentIdx].stats } };
      // Apply stat bonuses from effect.special (stat:... or perm:...)
      const special = card.effect.special ?? '';
      let deltas = parseStatSpecial(special);
      if (deltas.length === 0) deltas = parsePermSpecial(special);

      // For attack/defense/magic_attack with bonus, apply the bonus to force or magie
      if (deltas.length === 0 && card.effect.bonus > 0) {
        if (card.effect.type === 'magic_attack') {
          deltas = [{ stat: 'magie', val: card.effect.bonus }, { stat: 'force', val: Math.floor(card.effect.bonus / 2) }];
        } else if (card.effect.type === 'attack') {
          deltas = [{ stat: 'force', val: card.effect.bonus }];
        } else if (card.effect.type === 'defense') {
          deltas = [{ stat: 'force', val: card.effect.bonus }];
        } else if (card.effect.type === 'legendary' && special.includes('all+3')) {
          deltas = Object.keys(p.stats).map(s => ({ stat: s, val: 3 }));
        }
      }

      p = applyStatDeltas(p, deltas);

      // Special legendary bonuses
      if (card.effect.type === 'legendary') {
        if (special.includes('all+3') && deltas.length === 0) {
          p = applyStatDeltas(p, Object.keys(p.stats).map(s => ({ stat: s, val: 3 })));
        }
        if (special.includes('perm:vie+10') || special.includes('vie+10')) {
          p.maxHp += 20;
          p.hp = Math.min(p.maxHp, p.hp + 20);
        }
        if (special.includes('force+5') && !deltas.find(d => d.stat === 'force')) {
          p.stats.force = (p.stats.force ?? 0) + 5;
        }
      }

      p.hand = p.hand.filter(c => c !== card);
      p.discard = [...p.discard, card];
      p.inventory = [...p.inventory, card];
      next[currentIdx] = p;
      return next;
    });
    addLog(`${currentPlayer.name} équipe ${card.icon} ${card.name} (gratuit).`);
    setSelectedCard(null);
    return true;
  }, [currentIdx, currentPlayer]);

  // Start move — costs 1 action, animates die, shows reachable tiles
  const startMove = useCallback(() => {
    if (actionsLeft < 1 || hasMoved) return;
    setPhase('rolling_move');
    const card = selectedCard;
    const special = (card?.effect?.type === 'move') ? (card.effect.special ?? null) : null;
    const bonus   = (card?.effect?.type === 'move') ? (card.effect.bonus  ?? 0)    : 0;

    animateRoll((roll) => {
      const cp = players[currentIdx];
      let range = roll + bonus;
      let logSuffix = bonus !== 0 ? ` +${bonus}` : '';
      let wallPass = false;

      // Apply card special effects that modify the die result
      if (special === 'double_roll') {
        range = roll * 2;
        logSuffix = ' ×2';
      } else if (special === 'fixed_move') {
        range = bonus; // bonus holds the fixed distance (6 for ailes_vent)
        logSuffix = ` (fixe ${range})`;
      }
      if (special === 'wall_pass') wallPass = true;

      addLog(`🎲 ${currentPlayer.name} lance le dé : ${roll}${logSuffix} = ${range} cases.${card?.effect?.type === 'move' ? ` [${card.name}]` : ''}`);

      const hasZeles = cp.race?.passive === 'zeles';
      const hasFeuxFollets = cp.race?.passive === 'feux_follets';
      const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, range, cp.facing, hasZeles, wallPass, hasFeuxFollets, grid, heights);
      const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
      setTilesBudget(budgetAtTile);
      setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
      setPhase('choosing_move');
    });
  }, [actionsLeft, hasMoved, selectedCard, currentIdx, players, grid, heights, setTilesBudget]);

  // Anciens passive: reroll movement once per turn (no action cost)
  const rerollMove = useCallback(() => {
    if (moveRerolled || players[currentIdx]?.race?.passive !== 'anciens') return;
    setMoveRerolled(true);
    const card = selectedCard;
    const special = (card?.effect?.type === 'move') ? (card.effect.special ?? null) : null;
    const bonus   = (card?.effect?.type === 'move') ? (card.effect.bonus  ?? 0)    : 0;
    setPhase('rolling_move');
    animateRoll((roll) => {
      const cp = players[currentIdx];
      let range = roll + bonus;
      let logSuffix = bonus !== 0 ? ` +${bonus}` : '';
      let wallPass = false;
      if (special === 'double_roll')  { range = roll * 2; logSuffix = ' ×2'; }
      else if (special === 'fixed_move') { range = bonus; logSuffix = ` (fixe ${range})`; }
      if (special === 'wall_pass') wallPass = true;
      addLog(`🌙 ${cp.name} relance le dé : ${roll}${logSuffix} = ${range} cases.`);
      const hasZeles = false;
      const hasFeuxFollets = cp.race?.passive === 'feux_follets';
      const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, range, cp.facing, hasZeles, wallPass, hasFeuxFollets, grid, heights);
      const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
      setTilesBudget(budgetAtTile);
      setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
      setPhase('choosing_move');
    });
  }, [moveRerolled, currentIdx, players, selectedCard, grid, heights]);

  // Complete the move
  const moveToTile = useCallback((tx, ty) => {
    if (phase !== 'choosing_move' && phase !== 'choosing_attack'
      && phase !== 'longs_bras_passive' && phase !== 'choosing_portal'
      && phase !== 'bum_throw' && phase !== 'fou_attack' && phase !== 'fou_portal') return;

    if (phase === 'choosing_move') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key)) return;
      if (players.some((p, i) => i !== currentIdx && p.isAlive && p.baseX === tx && p.baseY === ty)) return;
      setHighlightTiles([]);
      const isContinuation = hasMoved; // Zélés mid-move continuation
      if (!isContinuation) {
        setHasMoved(true);
        setActionsLeft(prev => prev - 1);
      }
      const budgetHere = tilesBudget[key] ?? 0;
      const hasZeles = players[currentIdx]?.race?.passive === 'zeles';
      let damageTakenThisMove = 0;

      // Collect all teleport tiles on the map
      const teleportTiles = [];
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
          if (grid[y][x] === T.TELEPORT) teleportTiles.push({ x, y });
        }
      }

      let finalX = tx;
      let finalY = ty;
      let teleported = false;
      const hasChapeaux = players[currentIdx]?.race?.passive === 'chapeaux';

      if (grid[ty][tx] === T.TELEPORT && teleportTiles.length > 1) {
        const others = teleportTiles.filter(t => !(t.x === tx && t.y === ty));
        if (hasChapeaux && others.length > 1) {
          // Discard move card before suspending for portal choice
          if (selectedCard?.effect?.type === 'move') {
            setPlayers(prev => {
              const next = [...prev];
              const p = { ...next[currentIdx] };
              p.hand = p.hand.filter(c => c !== selectedCard);
              p.discard = [...p.discard, selectedCard];
              next[currentIdx] = p;
              return next;
            });
            setSelectedCard(null);
          }
          // Move player to entry portal, then let them choose exit
          setPlayers(prev => {
            const next = [...prev];
            next[currentIdx] = { ...next[currentIdx], x: tx, y: ty };
            return next;
          });
          setHighlightTiles(others.map(t => `${t.x},${t.y}`));
          setPhase('choosing_portal');
          addLog(`🎩 ${currentPlayer.name} choisit sa sortie de portail !`);
          return;
        }
        const dest = others[Math.floor(Math.random() * others.length)];
        finalX = dest.x;
        finalY = dest.y;
        teleported = true;
      }

      // Update position + facing direction (from clicked tile relative to start)
      const moveDirX = tx !== cp.x ? Math.sign(tx - cp.x) : 0;
      const moveDirY = tx === cp.x ? Math.sign(ty - cp.y) : 0;
      const newFacing = (moveDirX !== 0 || moveDirY !== 0) ? { dx: moveDirX, dy: moveDirY } : cp.facing;
      setPlayers(prev => {
        const next = [...prev];
        next[currentIdx] = { ...next[currentIdx], x: finalX, y: finalY, facing: newFacing };
        return next;
      });
      // Discard move card if selected
      if (selectedCard?.effect?.type === 'move') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.hand = p.hand.filter(c => c !== selectedCard);
          p.discard = [...p.discard, selectedCard];
          next[currentIdx] = p;
          return next;
        });
        setSelectedCard(null);
      }
      if (teleported) {
        addLog(`🌀 ${currentPlayer.name} est téléporté en (${finalX}, ${finalY}) !`);
      } else {
        addLog(`${currentPlayer.name} se déplace en (${tx}, ${ty}).`);
      }

      // Shop: draw 3 bonus cards on landing
      if (grid[finalY][finalX] === T.SHOP) {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          let deck = [...p.deck];
          let discard = [...p.discard];
          if (deck.length < 3) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
          const drawn = deck.splice(0, 3);
          p.hand = [...p.hand, ...drawn];
          p.deck = deck;
          p.discard = discard;
          next[currentIdx] = p;
          addLog(`🏪 ${p.name} visite le magasin et pioche 3 cartes !`);
          return next;
        });
      }

      const destKey = `${finalX},${finalY}`;
      const cp = players[currentIdx];
      let turnEnded = false;

      // Helper: handle player death after damage
      const handleDeath = (updPlayers) => {
        const alive = updPlayers.filter(p => p.isAlive);
        if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
        else {
          let ni = (currentIdx + 1) % updPlayers.length;
          while (!updPlayers[ni]?.isAlive) ni = (ni + 1) % updPlayers.length;
          setCurrentIdx(ni); setActionsLeft(0); setHasMoved(false); setPhase('draw');
        }
        return true;
      };

      // — Monster encounter —
      const monsterThere = enemies[destKey];
      if (monsterThere && !turnEnded) {
        const roll = rollDie();
        const pDmg = Math.max(1, roll + cp.stats.force + Math.floor(cp.stats.richesse / 2) - monsterThere.defense);
        const mDmg = Math.max(1, monsterThere.attack - Math.floor(cp.stats.force / 3));
        const rounds = Math.ceil(monsterThere.maxHp / pDmg);
        const rawDmgTaken = Math.max(0, (rounds - 1) * mDmg);
        const dmgTaken = physDmg(rawDmgTaken, cp);
        const won = cp.physicalImmune || cp.hp - dmgTaken > 0;
        const loot = won ? (monsterThere.loot ?? 1) : 0;

        addLog(`⚔️ ${cp.name} affronte ${monsterThere.icon} ${monsterThere.name} (pile ${monsterThere.pile}) ! (dé:${roll})`);
        // Pile 1 vaincu → pile 2 ; pile 2 vaincu → pile 3 ; pile 3 vaincu → case libre
        if (won) {
          if (monsterThere.pile === 1) {
            const p2 = MONSTER_PILE_2[Math.floor(Math.random() * MONSTER_PILE_2.length)];
            setEnemies(prev => ({ ...prev, [destKey]: { ...p2, hp: p2.maxHp } }));
            addLog(`💀 ${monsterThere.name} vaincu — un ${p2.icon} ${p2.name} surgit sur la case !`);
          } else if (monsterThere.pile === 2) {
            const p3 = MONSTER_PILE_3[Math.floor(Math.random() * MONSTER_PILE_3.length)];
            setEnemies(prev => ({ ...prev, [destKey]: { ...p3, hp: p3.maxHp } }));
            addLog(`💀 ${monsterThere.name} vaincu — un ${p3.icon} ${p3.name} surgit sur la case !`);
          } else {
            setEnemies(prev => { const n = { ...prev }; delete n[destKey]; return n; });
          }
        } else {
          setEnemies(prev => { const n = { ...prev }; delete n[destKey]; return n; });
        }
        const nextPlayers = players.map((p, i) => {
          if (i !== currentIdx) return p;
          let np = { ...p, hp: Math.max(0, p.hp - dmgTaken) };
          if (!won) {
            if (np.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              np = { ...np, hp: np.maxHp, x: np.baseX, y: np.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
            } else {
              np.isAlive = false; np.hp = 0;
            }
          }
          if (won && loot > 0) {
            let deck = [...np.deck], discard = [...np.discard];
            if (deck.length < loot) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
            const drawn = deck.splice(0, loot);
            np = { ...np, hand: [...np.hand, ...drawn], deck, discard };
          }
          return np;
        });
        damageTakenThisMove += dmgTaken;
        setPlayers(nextPlayers);
        if (won) {
          if (monsterThere.pile !== 1) addLog(`✅ ${monsterThere.name} vaincu (-${dmgTaken} PV, +${loot} carte(s))`);
          else addLog(`✅ -${dmgTaken} PV, +${loot} carte(s)`);
        } else if (nextPlayers[currentIdx].isAlive) {
          addLog(`✨ ${cp.name} renaît à sa base ! (${nextPlayers[currentIdx].stats.destin} vie(s) restante(s))`);
          let ni = (currentIdx + 1) % nextPlayers.length;
          while (!nextPlayers[ni]?.isAlive) ni = (ni + 1) % nextPlayers.length;
          setCurrentIdx(ni); setActionsLeft(0); setHasMoved(false); setPhase('draw');
          addLog(`--- Tour de ${nextPlayers[ni].name} ---`);
          turnEnded = true;
        } else {
          addLog(`💀 ${cp.name} est définitivement tué par ${monsterThere.name} !`);
          turnEnded = handleDeath(nextPlayers);
        }
      }

      // — Trap —
      const trapThere = traps[destKey];
      if (trapThere && !turnEnded) {
        const roll = rollDie();
        addLog(`🪤 ${cp.name} déclenche ${trapThere.icon} ${trapThere.name} !`);
        setTraps(prev => { const n = { ...prev }; delete n[destKey]; return n; });

        let rawDmg = 0, loseActions = 0, discardCard = false;
        if (trapThere.effect === 'damage')         { rawDmg = roll + trapThere.value; }
        if (trapThere.effect === 'damage_action')  { rawDmg = roll + trapThere.value; loseActions = 1; }
        if (trapThere.effect === 'damage_discard') { rawDmg = roll + trapThere.value; discardCard = true; }
        if (trapThere.effect === 'lose_actions')   { loseActions = trapThere.value; }
        const dmg = physDmg(rawDmg, cp);
        damageTakenThisMove += dmg;

        if (cp.physicalImmune && rawDmg > 0) addLog(`🪨 Immunité physique — dégâts du piège annulés !`);
        if (loseActions > 0) setActionsLeft(prev => Math.max(0, prev - loseActions));

        let trapFatal = false;
        const nextPlayers = players.map((p, i) => {
          if (i !== currentIdx) return p;
          let np = { ...p, hp: Math.max(0, p.hp - dmg) };
          if (np.hp <= 0) {
            trapFatal = true;
            if (np.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              np = { ...np, hp: np.maxHp, x: np.baseX, y: np.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
            } else {
              np.isAlive = false; np.hp = 0;
            }
          }
          if (!trapFatal && discardCard && np.hand.length > 0) {
            const di = Math.floor(Math.random() * np.hand.length);
            np = { ...np, hand: np.hand.filter((_, j) => j !== di), discard: [...np.discard, np.hand[di]] };
          }
          return np;
        });
        setPlayers(nextPlayers);

        const msgs = [];
        if (dmg > 0) msgs.push(`-${dmg} PV`);
        if (loseActions > 0) msgs.push(`-${loseActions} action(s)`);
        if (discardCard && !trapFatal) msgs.push(`-1 carte`);
        addLog(`💥 ${trapThere.desc} — ${msgs.join(', ')}`);
        if (trapFatal) {
          if (nextPlayers[currentIdx]?.isAlive) {
            addLog(`✨ ${cp.name} renaît à sa base ! (${nextPlayers[currentIdx].stats.destin} vie(s) restante(s))`);
            let ni = (currentIdx + 1) % nextPlayers.length;
            while (!nextPlayers[ni]?.isAlive) ni = (ni + 1) % nextPlayers.length;
            setCurrentIdx(ni); setActionsLeft(0); setHasMoved(false); setPhase('draw');
            addLog(`--- Tour de ${nextPlayers[ni].name} ---`);
            turnEnded = true;
          } else {
            addLog(`💀 ${cp.name} est tué par ${trapThere.name} !`);
            turnEnded = handleDeath(nextPlayers);
          }
        }
      }

      // — Chest —
      const chestThere = chests[destKey];
      if (chestThere && !turnEnded) {
        const loot = chestThere.loot ?? 2;
        const totalLoot = hasChapeaux ? loot * 2 : loot;
        setChests(prev => { const n = { ...prev }; delete n[destKey]; return n; });
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          let deck = [...p.deck], discard = [...p.discard];
          if (deck.length < totalLoot) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
          const drawn = deck.splice(0, totalLoot);
          next[currentIdx] = { ...p, hand: [...p.hand, ...drawn], deck, discard };
          return next;
        });
        addLog(`💰 ${cp.name} ouvre un coffre !${hasChapeaux ? ` 🎩 ×2 —` : ''} +${totalLoot} carte(s) piochée(s)`);
      }

      if (!turnEnded) {
        // Passif Zélés : si aucun dégât reçu et budget restant > 0 → continue le déplacement
        if (hasZeles && damageTakenThisMove === 0 && budgetHere > 0) {
          const { tiles: contTiles, budgetAtTile: contBudget } =
            runMoveDijkstra(finalX, finalY, budgetHere, newFacing, true, false, false, grid, heights);
          const zelOtherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
          const filteredCont = contTiles.filter(t => !zelOtherBases.has(t));
          if (filteredCont.length > 0) {
            setTilesBudget(contBudget);
            setHighlightTiles(filteredCont);
            setPhase('choosing_move');
            addLog(`⚡ Zélés continue son déplacement (${budgetHere} pts restants) !`);
            return;
          }
        }
        // Passif Longs Bras : après déplacement, propose d'activer une case adjacente
        const hasLongsBras = players[currentIdx]?.race?.passive === 'longs_bras';
        if (hasLongsBras) {
          const adjKeys = [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy]) => `${finalX+dx},${finalY+dy}`);
          const adjTargets = adjKeys.filter(k => enemies[k] || traps[k] || chests[k]);
          if (adjTargets.length > 0) {
            setHighlightTiles(adjTargets);
            setPhase('longs_bras_passive');
            addLog(`🦾 Passif Longs Bras : choisissez une case adjacente à activer (ou ⏭️ pour passer).`);
            return;
          }
        }
        setPhase('player_turn');
      }
    } else if (phase === 'longs_bras_passive') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key)) return;
      setHighlightTiles([]);
      const cp = players[currentIdx];
      // Trigger the adjacent tile effect at no action cost
      if (enemies[key]) {
        const m = enemies[key];
        const roll = rollDie();
        const pDmg = Math.max(1, roll + cp.stats.force + Math.floor(cp.stats.richesse / 2) - m.defense);
        const mDmg = Math.max(1, m.attack - Math.floor(cp.stats.force / 3));
        const rounds = Math.ceil(m.maxHp / pDmg);
        const dmgTaken = physDmg(mDmg * rounds, cp);
        const won = cp.physicalImmune || pDmg * rounds >= m.maxHp;
        addLog(`🦾 ${cp.name} frappe ${m.icon} ${m.name} depuis la case adjacente !`);
        if (won) {
          if (m.pile === 1) {
            const p2 = MONSTER_PILE_2[Math.floor(Math.random() * MONSTER_PILE_2.length)];
            setEnemies(prev => ({ ...prev, [key]: { ...p2, hp: p2.maxHp } }));
            addLog(`💀 ${m.name} vaincu — un ${p2.icon} ${p2.name} surgit !`);
          } else if (m.pile === 2) {
            const p3 = MONSTER_PILE_3[Math.floor(Math.random() * MONSTER_PILE_3.length)];
            setEnemies(prev => ({ ...prev, [key]: { ...p3, hp: p3.maxHp } }));
            addLog(`💀 ${m.name} vaincu — un ${p3.icon} ${p3.name} surgit !`);
          } else {
            setEnemies(prev => { const n = { ...prev }; delete n[key]; return n; });
            addLog(`✅ ${m.name} vaincu !`);
          }
        }
        const nextPlayers = players.map((p, i) => {
          if (i !== currentIdx) return p;
          let np = { ...p, hp: Math.max(0, p.hp - dmgTaken) };
          if (!won) {
            if (np.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              np = { ...np, hp: np.maxHp, x: np.baseX, y: np.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
            } else {
              np.isAlive = false; np.hp = 0;
            }
          }
          return np;
        });
        setPlayers(nextPlayers);
        if (!won) {
          if (nextPlayers[currentIdx].isAlive) {
            addLog(`✨ ${cp.name} renaît à sa base ! (${nextPlayers[currentIdx].stats.destin} vie(s) restante(s))`);
          } else {
            addLog(`💀 ${cp.name} est tué par ${m.name} !`);
          }
        }
      } else if (traps[key]) {
        const trap = traps[key];
        const roll = rollDie();
        addLog(`🦾 ${cp.name} déclenche ${trap.icon} ${trap.name} à distance !`);
        setTraps(prev => { const n = { ...prev }; delete n[key]; return n; });
        let dmg = 0;
        if (trap.effect === 'damage' || trap.effect === 'damage_action' || trap.effect === 'damage_discard')
          dmg = roll + trap.value;
        if (dmg > 0) addLog(`💥 Piège détruit (${dmg} dégâts absorbés par les longs bras).`);
        else addLog(`💥 Piège désamorcé.`);
      } else if (chests[key]) {
        const loot = chests[key].loot ?? 2;
        setChests(prev => { const n = { ...prev }; delete n[key]; return n; });
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          let deck = [...p.deck], discard = [...p.discard];
          if (deck.length < loot) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
          const drawn = deck.splice(0, loot);
          next[currentIdx] = { ...p, hand: [...p.hand, ...drawn], deck, discard };
          return next;
        });
        addLog(`🦾 ${cp.name} saisit le coffre adjacent ! +${loot} carte(s)`);
      }
      setPhase('player_turn');
    } else if (phase === 'choosing_portal') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key)) return;
      setHighlightTiles([]);
      setPlayers(prev => {
        const next = [...prev];
        next[currentIdx] = { ...next[currentIdx], x: tx, y: ty };
        return next;
      });
      addLog(`🎩 ${currentPlayer.name} sort du portail en (${tx}, ${ty}) !`);
      // Apply shop effect if portal destination happens to be a shop (edge case)
      if (grid[ty][tx] === T.SHOP) {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          let deck = [...p.deck], discard = [...p.discard];
          if (deck.length < 3) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
          const drawn = deck.splice(0, 3);
          p.hand = [...p.hand, ...drawn]; p.deck = deck; p.discard = discard;
          next[currentIdx] = p;
          addLog(`🏪 ${p.name} visite le magasin et pioche 3 cartes !`);
          return next;
        });
      }
      setPhase('player_turn');
    } else if (phase === 'choosing_attack') {
      attackTile(tx, ty);
    } else if (phase === 'bum_throw') {
      throwWeapon(tx, ty);
    } else if (phase === 'fou_attack') {
      fouAttack(tx, ty);
    } else if (phase === 'fou_portal') {
      confirmFouPortal(tx, ty);
    }
  }, [phase, highlightTiles, tilesBudget, hasMoved, currentIdx, selectedCard, currentPlayer, enemies, traps, chests, players, grid, heights]);

  // Show attack targets (adjacent players and enemies)
  const showAttackTargets = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    // Base range from stat portee, extended by weapon card special
    let range = cp.stats.portee ?? 1;
    if (selectedCard?.effect?.special) {
      const sp = selectedCard.effect.special;
      const rangeMatch = sp.match(/range(\d+)/);
      if (rangeMatch) range = Math.max(range, parseInt(rangeMatch[1]));
    }
    const tiles = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > range) continue;
        if (dx === 0 && dy === 0) continue;
        const nx = cp.x + dx;
        const ny = cp.y + dy;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        if (grid[ny][nx] === T.WALL) continue;
        // Check if another player or enemy is here
        const hasTarget = players.some((p, i) => i !== currentIdx && p.isAlive && p.x === nx && p.y === ny)
          || enemies[`${nx},${ny}`];
        if (hasTarget) tiles.push(`${nx},${ny}`);
      }
    }
    setHighlightTiles(tiles);
    setPhase('choosing_attack');
    addLog(`${cp.name} choisit une cible...`);
  }, [actionsLeft, currentIdx, players, grid, enemies, selectedCard]);

  // Bum passive: throw a physical weapon card at a player within range 2 (free targeting)
  const startBumThrow = useCallback(() => {
    if (actionsLeft < 1 || !selectedCard || selectedCard.effect.type !== 'attack') return;
    const cp = players[currentIdx];
    if (cp.cls?.passive !== 'bum') return;
    const tiles = [];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > 2 || (dx === 0 && dy === 0)) continue;
        const nx = cp.x + dx, ny = cp.y + dy;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        if (grid[ny][nx] === T.WALL) continue;
        if (players.some((p, i) => i !== currentIdx && p.isAlive && p.x === nx && p.y === ny))
          tiles.push(`${nx},${ny}`);
      }
    }
    if (tiles.length === 0) { addLog(`🧣 Pas de cible à portée pour lancer l'arme.`); return; }
    setHighlightTiles(tiles);
    setPhase('bum_throw');
    addLog(`🧣 ${cp.name} prépare son lancer — choisissez une cible.`);
  }, [actionsLeft, selectedCard, currentIdx, players, grid]);

  // Bum throw — roll damage, destroy card
  const throwWeapon = useCallback((tx, ty) => {
    if (phase !== 'bum_throw') return;
    const key = `${tx},${ty}`;
    if (!highlightTiles.includes(key)) return;
    setHighlightTiles([]);
    setPhase('rolling_attack');
    const cp = players[currentIdx];
    const card = selectedCard;
    const targetPlayerIdx = players.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === tx && p.y === ty);
    if (targetPlayerIdx < 0) { setPhase('player_turn'); return; }
    animateRoll((roll) => {
      const target = players[targetPlayerIdx];
      const rawDmg = roll + (card?.effect?.bonus ?? 0) + cp.stats.force;
      const defense = Math.floor(target.stats.force / 3);
      const actualDmg = physDmg(Math.max(1, rawDmg - defense), target);
      addLog(`🧣 ${cp.name} lance ${card?.icon ?? '🗡️'} ${card?.name ?? 'une arme'} sur ${target.name} : dé=${roll}, dégâts=${actualDmg}`);
      setPlayers(prev => {
        const next = [...prev];
        let t = { ...next[targetPlayerIdx] };
        t.hp = Math.max(0, t.hp - actualDmg);
        if (t.hp <= 0) {
          if (t.stats.destin > 0) {
            const newDeck = shuffleDeck([...FULL_DECK]);
            const livesLeft = t.stats.destin - 1;
            t = { ...t, hp: t.maxHp, x: t.baseX, y: t.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
            addLog(`✨ ${next[targetPlayerIdx].name} renaît à sa base ! (${livesLeft} vie(s) restante(s))`);
          } else {
            t.isAlive = false;
            addLog(`💀 ${t.name} est définitivement éliminé !`);
          }
        }
        next[targetPlayerIdx] = t;
        // Destroy the weapon card (removed from game, not discarded)
        let thrower = { ...next[currentIdx] };
        thrower.hand = thrower.hand.filter(c => c !== card);
        next[currentIdx] = thrower;
        const alive = next.filter(p => p.isAlive);
        if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
        else setPhase('player_turn');
        return next;
      });
      setSelectedCard(null);
      setActionsLeft(prev => prev - 1);
    });
  }, [phase, highlightTiles, currentIdx, players, selectedCard]);

  // Attack a tile
  const attackTile = useCallback((tx, ty) => {
    if (phase !== 'choosing_attack') return;
    const key = `${tx},${ty}`;
    if (!highlightTiles.includes(key)) return;
    setHighlightTiles([]);
    setPhase('rolling_attack');

    const cp = players[currentIdx];
    const card = selectedCard;
    const targetPlayerIdx = players.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === tx && p.y === ty);
    const targetEnemy = enemies[key];

    animateRoll((roll) => {
      const chanceBonus = Math.floor(cp.stats.richesse / 2);
      const effectiveRoll = Math.min(6, roll + chanceBonus);
      const isMagic = card?.effect?.type === 'magic_attack';
      const baseStat = isMagic ? cp.stats.magie : cp.stats.force;
      let dmg = effectiveRoll + baseStat + Math.floor(cp.stats.destin / 3);
      if (card) {
        dmg += card.effect.bonus ?? 0;
        if (card.effect.special === 'crit_5_6' && effectiveRoll >= 5) dmg = Math.floor(dmg * 1.5);
        if (card.effect.special === 'double_on_6' && effectiveRoll === 6) dmg *= 2;
      }

      if (targetPlayerIdx >= 0) {
        const target = players[targetPlayerIdx];
        // Passif Anciens : absorbe une source de dégâts magiques par tour
        if (isMagic && target.race?.passive === 'anciens' && target.magicAbsorbAvailable) {
          setPlayers(prev => {
            const next = [...prev];
            next[targetPlayerIdx] = { ...next[targetPlayerIdx], magicAbsorbAvailable: false, forcedImmobile: true };
            return next;
          });
          addLog(`🌙 ${target.name} absorbe les dégâts magiques ! (restera immobile au prochain déplacement)`);
          setActionsLeft(prev => prev - 1);
          setPhase('player_turn');
          return;
        }
        // Passif Feux Follets : ne peut pas être attaqué de dos
        if (target.race?.passive === 'feux_follets' && target.facing) {
          const relDx = cp.x - target.x;
          const relDy = cp.y - target.y;
          const dot = target.facing.dx * relDx + target.facing.dy * relDy;
          if (dot < 0) {
            addLog(`🔥 ${target.name} est insaisissable — attaque de dos impossible !`);
            setActionsLeft(prev => prev - 1);
            setPhase('player_turn');
            return;
          }
        }
        const defense = Math.floor(target.stats.force / 3);
        const isMagicAtk = card?.effect?.type === 'magic_attack';
        const rawActualDmg = Math.max(1, dmg - defense);
        const actualDmg = isMagicAtk ? rawActualDmg : physDmg(rawActualDmg, target);
        if (!isMagicAtk && target.physicalImmune) {
          addLog(`🪨 ${target.name} est immunisé aux dégâts physiques — attaque annulée !`);
        }
        addLog(`${cp.name} attaque ${target.name} : dé=${roll}, dégâts=${actualDmg}`);
        setPlayers(prev => {
          const next = [...prev];
          let t = { ...next[targetPlayerIdx] };
          t.hp = Math.max(0, t.hp - actualDmg);
          if (t.hp <= 0) {
            if (t.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              const livesLeft = t.stats.destin - 1;
              t = { ...t, hp: t.maxHp, x: t.baseX, y: t.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
              addLog(`✨ ${next[targetPlayerIdx].name} renaît à sa base ! (${livesLeft} vie(s) restante(s))`);
            } else {
              t.isAlive = false;
              addLog(`💀 ${t.name} est définitivement éliminé !`);
            }
          }
          next[targetPlayerIdx] = t;
          // Check win
          const alive = next.filter(p => p.isAlive);
          if (alive.length === 1) {
            setWinner(alive[0]);
            setPhase('win');
          } else {
            setPhase('player_turn');
          }
          return next;
        });
      } else if (targetEnemy) {
        const defense = targetEnemy.defense ?? 0;
        const actualDmg = Math.max(1, dmg - defense);
        addLog(`${cp.name} attaque ${targetEnemy.name} : dé=${roll}, dégâts=${actualDmg}`);
        const newHp = targetEnemy.hp - actualDmg;
        if (newHp <= 0) {
          addLog(`✅ ${targetEnemy.name} est vaincu !`);
          setEnemies(prev => { const n = { ...prev }; delete n[key]; return n; });
        } else {
          setEnemies(prev => ({ ...prev, [key]: { ...targetEnemy, hp: newHp } }));
        }
        setPhase('player_turn');
      } else {
        setPhase('player_turn');
      }

      // Discard attack card if it's a usable attack (not an equipped weapon)
      if (card && (card.effect.type === 'attack' || card.effect.type === 'magic_attack')) {
        // Only discard from hand if it's still in the hand (not already in inventory)
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          if (p.hand.includes(card)) {
            p.hand = p.hand.filter(c => c !== card);
            p.discard = [...p.discard, card];
            next[currentIdx] = p;
          }
          return next;
        });
        setSelectedCard(null);
      }

      setActionsLeft(prev => prev - 1);
    });
  }, [phase, highlightTiles, currentIdx, players, enemies, selectedCard]);

  // Use item (heal / buff / cure / magic scroll) — costs 1 action
  const useItem = useCallback(() => {
    const card = selectedCard;
    if (!card || !isUsable(card)) return;
    const cp = players[currentIdx];

    // Magie prerequisite: player must have enough magie to power the item
    const magieCost = card.effect.magieCost ?? 0;
    if (magieCost > 0 && (cp.stats.magie ?? 0) < magieCost) {
      addLog(`❌ ${cp.name} n'a pas assez de Magie pour utiliser ${card.icon} ${card.name} (requis : ${magieCost}, actuel : ${cp.stats.magie ?? 0}).`);
      return;
    }

    if (card.effect.type === 'heal') {
      const healAmt = card.effect.bonus;
      setPlayers(prev => {
        const next = [...prev];
        const p = { ...next[currentIdx] };
        p.hp = Math.min(p.maxHp, p.hp + healAmt);
        p.hand = p.hand.filter(c => c !== card);
        p.discard = [...p.discard, card];
        next[currentIdx] = p;
        return next;
      });
      addLog(`${cp.name} utilise ${card.icon} ${card.name} : +${healAmt} HP.`);
    } else if (card.effect.type === 'buff') {
      const special = card.effect.special ?? '';
      if (special.startsWith('perm:')) {
        const deltas = parsePermSpecial(special);
        setPlayers(prev => {
          const next = [...prev];
          let p = { ...next[currentIdx] };
          p = applyStatDeltas(p, deltas);
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`${cp.name} utilise ${card.icon} ${card.name} : effet permanent !`);
      } else {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`${cp.name} utilise ${card.icon} ${card.name} : ${card.desc}`);
      }
    } else if (card.effect.type === 'cure') {
      setPlayers(prev => {
        const next = [...prev];
        const p = { ...next[currentIdx] };
        p.hand = p.hand.filter(c => c !== card);
        p.discard = [...p.discard, card];
        next[currentIdx] = p;
        return next;
      });
      addLog(`${cp.name} utilise ${card.icon} ${card.name} : effets négatifs annulés.`);
    } else if (card.effect.type === 'magic') {
      const isChapeaux = cp.race?.passive === 'chapeaux';
      if (isChapeaux) {
        // Chapeaux: cast immediately
        addLog(`🎩 ${cp.name} lance immédiatement ${card.icon} ${card.name} : ${card.effect.bonus} dégâts magiques !`);
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          p.lastScroll = card;
          next[currentIdx] = p;
          return next;
        });
      } else {
        // Materialize: scroll leaves hand, sits ready — effect fires next turn
        if (cp.readyScroll) {
          addLog(`📜 ${cp.name} remplace ${cp.readyScroll.icon} ${cp.readyScroll.name} par ${card.icon} ${card.name} (le précédent est défaussé).`);
        } else {
          addLog(`📜 ${cp.name} matérialise ${card.icon} ${card.name} — prêt à lancer le tour prochain.`);
        }
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.hand = p.hand.filter(c => c !== card);
          // Previous ready scroll goes to discard if replaced
          if (p.readyScroll) p.discard = [...p.discard, p.readyScroll];
          p.readyScroll = card;
          next[currentIdx] = p;
          return next;
        });
      }
    }

    setSelectedCard(null);
    // Playing cards is free — no action cost
  }, [selectedCard, currentIdx, players]);

  // Fou passive: replay last scroll's damage on a valid target (1 action)
  const startFouAttack = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    if (cp.cls?.passive !== 'fou' || !cp.lastScroll) return;
    let range = cp.stats.portee ?? 1;
    const tiles = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > range || (dx === 0 && dy === 0)) continue;
        const nx = cp.x + dx, ny = cp.y + dy;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        if (grid[ny][nx] === T.WALL) continue;
        const hasTarget = players.some((p, i) => i !== currentIdx && p.isAlive && p.x === nx && p.y === ny)
          || enemies[`${nx},${ny}`];
        if (hasTarget) tiles.push(`${nx},${ny}`);
      }
    }
    if (tiles.length === 0) { addLog(`🃏 Pas de cible à portée pour le sort du Fou.`); return; }
    setHighlightTiles(tiles);
    setPhase('fou_attack');
    addLog(`🃏 ${cp.name} canalise ${cp.lastScroll.icon} ${cp.lastScroll.name} — choisissez une cible.`);
  }, [actionsLeft, currentIdx, players, grid, enemies]);

  // Fou attack — apply last scroll's damage to the target
  const fouAttack = useCallback((tx, ty) => {
    if (phase !== 'fou_attack') return;
    const key = `${tx},${ty}`;
    if (!highlightTiles.includes(key)) return;
    setHighlightTiles([]);
    setPhase('rolling_attack');
    const cp = players[currentIdx];
    const scroll = cp.lastScroll;
    const dmg = scroll?.effect?.bonus ?? 0;
    const targetPlayerIdx = players.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === tx && p.y === ty);
    const targetEnemy = enemies[key];
    addLog(`🃏 ${cp.name} rejoue ${scroll?.icon ?? '✨'} ${scroll?.name ?? 'un sort'} — ${dmg} dégâts magiques !`);
    if (targetPlayerIdx >= 0) {
      setPlayers(prev => {
        const next = [...prev];
        let t = { ...next[targetPlayerIdx] };
        t.hp = Math.max(0, t.hp - dmg);
        if (t.hp <= 0) {
          if (t.stats.destin > 0) {
            const newDeck = shuffleDeck([...FULL_DECK]);
            const livesLeft = t.stats.destin - 1;
            t = { ...t, hp: t.maxHp, x: t.baseX, y: t.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
            addLog(`✨ ${next[targetPlayerIdx].name} renaît à sa base ! (${livesLeft} vie(s) restante(s))`);
          } else {
            t.isAlive = false;
            addLog(`💀 ${t.name} est définitivement éliminé !`);
          }
        }
        next[targetPlayerIdx] = t;
        const alive = next.filter(p => p.isAlive);
        if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
        else setPhase('player_turn');
        return next;
      });
    } else if (targetEnemy) {
      const newHp = targetEnemy.hp - dmg;
      if (newHp <= 0) {
        addLog(`✅ ${targetEnemy.name} est vaincu !`);
        setEnemies(prev => { const n = { ...prev }; delete n[key]; return n; });
      } else {
        setEnemies(prev => ({ ...prev, [key]: { ...targetEnemy, hp: newHp } }));
      }
      setPhase('player_turn');
    } else {
      setPhase('player_turn');
    }
    setActionsLeft(prev => prev - 1);
  }, [phase, highlightTiles, currentIdx, players, enemies]);

  // Alchimiste passive: spend 1 action to heal HP equal to magie stat
  const alchimisteHeal = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    if (cp.cls?.passive !== 'alchimiste') return;
    const healAmt = cp.stats.magie ?? 0;
    if (healAmt <= 0) { addLog(`⚗️ Pas de Magie pour se soigner.`); return; }
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      next[currentIdx] = p;
      return next;
    });
    addLog(`⚗️ ${cp.name} utilise sa Magie pour se soigner de ${healAmt} PV !`);
    setActionsLeft(prev => prev - 1);
  }, [actionsLeft, currentIdx, players]);

  // Cast the materialized scroll (costs 1 action, available next turn after materializing)
  const castReadyScroll = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    if (!cp.readyScroll) return;
    const card = cp.readyScroll;
    addLog(`📜 ${cp.name} lance ${card.icon} ${card.name} : ${card.effect.bonus} dégâts magiques !`);
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      p.readyScroll = null;
      p.discard = [...p.discard, card];
      p.lastScroll = card;
      next[currentIdx] = p;
      return next;
    });
    setActionsLeft(prev => prev - 1);
  }, [actionsLeft, currentIdx, players]);

  // End turn — advance to next living player
  const endTurn = useCallback(() => {
    // Compute all end-of-turn player updates in one pass
    let updPlayers = [...players];

    // Passif Cailloux : immobile ce tour → immunité physique jusqu'au prochain tour
    if (!hasMoved && updPlayers[currentIdx]?.race?.passive === 'cailloux') {
      updPlayers[currentIdx] = { ...updPlayers[currentIdx], physicalImmune: true };
      addLog(`🪨 ${updPlayers[currentIdx].name} reste immobile — immunité physique activée !`);
    }

    // Passif Bum : pousse l'adversaire sur la même case vers une case adjacente
    if (updPlayers[currentIdx]?.cls?.passive === 'bum') {
      const bum = updPlayers[currentIdx];
      const victimIdx = updPlayers.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === bum.x && p.y === bum.y);
      if (victimIdx >= 0) {
        const victim = updPlayers[victimIdx];
        const facing = bum.facing;
        const dirsToTry = facing
          ? [[facing.dx, facing.dy], [-1,0],[1,0],[0,-1],[0,1]]
          : [[-1,0],[1,0],[0,-1],[0,1]];
        let pushX = null, pushY = null;
        for (const [dx, dy] of dirsToTry) {
          const nx = bum.x + dx, ny = bum.y + dy;
          if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
          if (grid[ny][nx] === T.WALL) continue;
          pushX = nx; pushY = ny; break;
        }
        if (pushX !== null) {
          const destKey = `${pushX},${pushY}`;
          addLog(`🧣 ${bum.name} pousse ${victim.name} vers (${pushX}, ${pushY}) !`);
          const trapThere = traps[destKey];
          let trapDmg = 0;
          if (trapThere) {
            const roll = rollDie();
            addLog(`🪤 ${victim.name} atterrit sur ${trapThere.icon} ${trapThere.name} !`);
            setTraps(prev => { const n = { ...prev }; delete n[destKey]; return n; });
            if (trapThere.effect === 'damage' || trapThere.effect === 'damage_action' || trapThere.effect === 'damage_discard')
              trapDmg = physDmg(roll + trapThere.value, victim);
            if (trapDmg > 0) addLog(`💥 ${trapThere.desc} — -${trapDmg} PV à ${victim.name}`);
          }
          let newVictim = { ...victim, x: pushX, y: pushY, hp: Math.max(0, victim.hp - trapDmg) };
          if (newVictim.hp <= 0) {
            if (newVictim.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              newVictim = { ...newVictim, hp: newVictim.maxHp, x: newVictim.baseX, y: newVictim.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], stats: { ...newVictim.stats, destin: newVictim.stats.destin - 1 } };
              addLog(`✨ ${victim.name} renaît à sa base ! (${newVictim.stats.destin} vie(s) restante(s))`);
            } else {
              newVictim = { ...newVictim, isAlive: false, hp: 0 };
              addLog(`💀 ${victim.name} est définitivement éliminé !`);
            }
          }
          updPlayers = updPlayers.map((p, i) => i === victimIdx ? newVictim : p);
          // Win check after push
          const alive = updPlayers.filter(p => p.isAlive);
          if (alive.length === 1) {
            setPlayers(updPlayers);
            setWinner(alive[0]); setPhase('win');
            setActionsLeft(0); setHasMoved(false); setSelectedCard(null); setHighlightTiles([]);
            return;
          }
        } else {
          addLog(`🧣 Pas de case libre pour pousser ${victim.name}.`);
        }
      }
    }

    // Passif Alchimiste : achète une potion (vente forcée) et repousse l'adversaire
    if (updPlayers[currentIdx]?.cls?.passive === 'alchimiste') {
      const alchi = updPlayers[currentIdx];
      const victimIdx = updPlayers.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === alchi.x && p.y === alchi.y);
      if (victimIdx >= 0) {
        const victim = updPlayers[victimIdx];
        // Buy a random potion from victim (forced sale)
        const victimPotions = victim.hand.filter(c => c.category === 'potion');
        if (alchi.gold >= 1 && victimPotions.length > 0) {
          const card = victimPotions[Math.floor(Math.random() * victimPotions.length)];
          addLog(`⚗️ ${alchi.name} achète ${card.icon} ${card.name} à ${victim.name} pour 1 pièce d'or (vente forcée) !`);
          updPlayers = updPlayers.map((p, i) => {
            if (i === currentIdx) return { ...p, gold: p.gold - 1, hand: [...p.hand, card] };
            if (i === victimIdx) return { ...p, gold: p.gold + 1, hand: p.hand.filter(c2 => c2 !== card) };
            return p;
          });
        } else if (victimPotions.length === 0) {
          addLog(`⚗️ ${victim.name} n'a aucune potion à vendre.`);
        } else {
          addLog(`⚗️ ${alchi.name} n'a pas assez d'or pour acheter (requis : 1).`);
        }
        // Push victim one tile
        const alchiNow = updPlayers[currentIdx];
        const facing = alchiNow.facing;
        const dirsToTry = facing
          ? [[facing.dx, facing.dy], [-1,0],[1,0],[0,-1],[0,1]]
          : [[-1,0],[1,0],[0,-1],[0,1]];
        let pushX = null, pushY = null;
        for (const [dx, dy] of dirsToTry) {
          const nx = alchiNow.x + dx, ny = alchiNow.y + dy;
          if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
          if (grid[ny][nx] === T.WALL) continue;
          pushX = nx; pushY = ny; break;
        }
        if (pushX !== null) {
          const victimNow = updPlayers[victimIdx];
          const destKey = `${pushX},${pushY}`;
          addLog(`⚗️ ${alchiNow.name} repousse ${victimNow.name} en (${pushX}, ${pushY}) !`);
          const trapThere = traps[destKey];
          let trapDmg = 0;
          if (trapThere) {
            const roll = rollDie();
            addLog(`🪤 ${victimNow.name} atterrit sur ${trapThere.icon} ${trapThere.name} !`);
            setTraps(prev => { const n = { ...prev }; delete n[destKey]; return n; });
            if (trapThere.effect === 'damage' || trapThere.effect === 'damage_action' || trapThere.effect === 'damage_discard')
              trapDmg = physDmg(roll + trapThere.value, victimNow);
            if (trapDmg > 0) addLog(`💥 ${trapThere.desc} — -${trapDmg} PV à ${victimNow.name}`);
          }
          let newVictim = { ...victimNow, x: pushX, y: pushY, hp: Math.max(0, victimNow.hp - trapDmg) };
          if (newVictim.hp <= 0) {
            if (newVictim.stats.destin > 0) {
              const newDeck = shuffleDeck([...FULL_DECK]);
              newVictim = { ...newVictim, hp: newVictim.maxHp, x: newVictim.baseX, y: newVictim.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], stats: { ...newVictim.stats, destin: newVictim.stats.destin - 1 } };
              addLog(`✨ ${victimNow.name} renaît à sa base ! (${newVictim.stats.destin} vie(s) restante(s))`);
            } else {
              newVictim = { ...newVictim, isAlive: false, hp: 0 };
              addLog(`💀 ${victimNow.name} est définitivement éliminé !`);
            }
          }
          updPlayers = updPlayers.map((p, i) => i === victimIdx ? newVictim : p);
          const alive = updPlayers.filter(p => p.isAlive);
          if (alive.length === 1) {
            setPlayers(updPlayers);
            setWinner(alive[0]); setPhase('win');
            setActionsLeft(0); setHasMoved(false); setSelectedCard(null); setHighlightTiles([]);
            return;
          }
        } else {
          addLog(`⚗️ Pas de case libre pour repousser ${updPlayers[victimIdx].name}.`);
        }
      }
    }

    // Passif Fou : se téléporte à un portail de son choix si fin de tour sur la case d'un adversaire
    if (updPlayers[currentIdx]?.cls?.passive === 'fou') {
      const fou = updPlayers[currentIdx];
      const onOpponent = updPlayers.some((p, i) => i !== currentIdx && p.isAlive && p.x === fou.x && p.y === fou.y);
      if (onOpponent) {
        const portals = [];
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === T.TELEPORT) portals.push({ x, y });
          }
        }
        if (portals.length > 0) {
          setPlayers(updPlayers);
          setHighlightTiles(portals.map(p => `${p.x},${p.y}`));
          setPhase('fou_portal');
          addLog(`🃏 ${fou.name} termine son tour sur un adversaire — choisissez un portail de sortie !`);
          setActionsLeft(0); setHasMoved(false); setSelectedCard(null);
          return; // Wait for portal choice before advancing turn
        }
      }
    }

    setPlayers(updPlayers);

    let next = currentIdx;
    let attempts = 0;
    do {
      next = (next + 1) % updPlayers.length;
      attempts++;
    } while (!updPlayers[next].isAlive && attempts < updPlayers.length);

    setCurrentIdx(next);
    setActionsLeft(0);
    setHasMoved(false);
    setSelectedCard(null);
    setHighlightTiles([]);
    setPhase('draw');
    addLog(`--- Tour de ${updPlayers[next].name} ---`);
  }, [currentIdx, players, hasMoved, traps, grid]);

  const skipPassive = useCallback(() => {
    setHighlightTiles([]);
    setPhase('player_turn');
  }, []);

  const skipPortalChoice = useCallback(() => {
    // Pick a random portal from highlighted ones
    if (highlightTiles.length === 0) { setPhase('player_turn'); return; }
    const pick = highlightTiles[Math.floor(Math.random() * highlightTiles.length)];
    const [px, py] = pick.split(',').map(Number);
    setHighlightTiles([]);
    setPlayers(prev => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], x: px, y: py };
      return next;
    });
    addLog(`🌀 Sortie aléatoire en (${px}, ${py}).`);
    setPhase('player_turn');
  }, [highlightTiles, currentIdx]);

  // Fou portal selection at end of turn — then advance to next player
  const confirmFouPortal = useCallback((tx, ty) => {
    if (phase !== 'fou_portal') return;
    const key = `${tx},${ty}`;
    if (!highlightTiles.includes(key)) return;
    setHighlightTiles([]);
    setPlayers(prev => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], x: tx, y: ty };
      return next;
    });
    addLog(`🃏 ${players[currentIdx].name} se téléporte au portail (${tx}, ${ty}) !`);
    let next = currentIdx;
    let attempts = 0;
    do {
      next = (next + 1) % players.length;
      attempts++;
    } while (!players[next].isAlive && attempts < players.length);
    setCurrentIdx(next);
    setPhase('draw');
    addLog(`--- Tour de ${players[next].name} ---`);
  }, [phase, highlightTiles, currentIdx, players]);

  return {
    players,
    currentIdx,
    currentPlayer,
    grid,
    heights,
    enemies,
    traps,
    chests,
    actionsLeft,
    hasMoved,
    phase,
    setPhase,
    diceResult,
    rolling,
    log,
    highlightTiles,
    selectedCard,
    setSelectedCard,
    mapName,
    drawCards,
    equipCard,
    startMove,
    rerollMove,
    moveRerolled,
    moveToTile,
    showAttackTargets,
    attackTile,
    startBumThrow,
    throwWeapon,
    startFouAttack,
    fouAttack,
    confirmFouPortal,
    alchimisteHeal,
    castReadyScroll,
    skipPassive,
    skipPortalChoice,
    useItem,
    endTurn,
    winner,
    isEquippable,
    isUsable,
  };
}
