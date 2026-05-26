import { useState, useCallback, useRef } from 'react';
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
  const finalMaxHp = (charData.spec?.passive === 'imperissable') ? maxHp * 2 : maxHp;
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
    hp: finalMaxHp,
    maxHp: finalMaxHp,
    stats: { ...stats },
    inventory: [],
    gold: (stats.richesse ?? 1) * 3,
    lastScroll: null,
    readyScroll: null,
    equippedWeapon: null,
    equippedArmor: null,
    hand: deck.splice(0, 6),
    deck,
    discard: [],
    isAlive: true,
    physicalImmune: false,
    facing: null,
    premierSoinUsed: false,
    forcedImmobileNextTurn: false,
    weaponJustSwapped: false,
    armorJustSwapped: false,
    prisonEffect: null,
    wikiSwapped: false,
    slowMalus: 0,
    tempDepBonus: 0,
    frenzied: false,
    stunned: false,
    cursed: false,
    tempHp: 0,
    hunterTarget: null,
    hunterStreak: 0,
    scrollsUsedThisTurn: 0,
    nextAttackBonus: 0,
    curseImmune: false,
    goldDoubleRemaining: 0,
    frenziedAttacks: 0,
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

// Derive stat deltas for any equippable card (mirrors equipCard logic)
function getCardDeltas(card, stats) {
  const special = card.effect.special ?? '';
  let deltas = parseStatSpecial(special);
  if (deltas.length === 0) deltas = parsePermSpecial(special);
  if (deltas.length === 0 && card.effect.bonus > 0) {
    if (card.effect.type === 'magic_attack') {
      deltas = [{ stat: 'magie', val: card.effect.bonus }, { stat: 'force', val: Math.floor(card.effect.bonus / 2) }];
    } else if (card.effect.type === 'defense') {
      deltas = [];
    } else if (card.effect.type === 'legendary' && special.includes('all+3')) {
      deltas = Object.keys(stats).map(s => ({ stat: s, val: 3 }));
    }
  }
  return deltas;
}

// Remove an equipped card: reverse its stat bonuses and pull it from inventory
function unequipCard(p, card) {
  const deltas = getCardDeltas(card, p.stats);
  p = applyStatDeltas(p, deltas.map(d => ({ stat: d.stat, val: -d.val })));
  if (card.effect.type === 'legendary') {
    const special = card.effect.special ?? '';
    if (special.includes('perm:vie+10') || special.includes('vie+10')) {
      p.maxHp = Math.max(p.hp, p.maxHp - 20);
    }
    if (special.includes('force+5') && !deltas.find(d => d.stat === 'force')) {
      p.stats = { ...p.stats, force: Math.max(0, (p.stats.force ?? 0) - 5) };
    }
  }
  p.inventory = p.inventory.filter(c => c !== card);
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

// Returns a Set of tile keys occupied by block_passage armor wearers (excluding excludeIdx)
function getBlockedTiles(players, excludeIdx) {
  const blocked = new Set();
  players.forEach((p, i) => {
    if (i !== excludeIdx && p.isAlive && p.equippedArmor?.effect?.special?.includes('block_passage')) {
      blocked.add(`${p.x},${p.y}`);
    }
  });
  return blocked.size > 0 ? blocked : null;
}

// Dijkstra movement reachability — returns { tiles: string[], budgetAtTile: {key: number} }
// wallPass   : traverse all walls freely
// oneWallPass: traverse at most one wall (Feux Follets passive)
function runMoveDijkstra(fromX, fromY, budget, facing, wallPass, oneWallPass, grid, blockedTiles = null) {
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
      let stepCost = 1;
      // 180-degree turn costs 1 extra movement
      if (dir && dir.dx === -dx && dir.dy === -dy) stepCost += 1;
      const newBgt = bgt - stepCost;
      if (newBgt >= 0 && !(blockedTiles?.has(`${nx},${ny}`))) queue.push({ x: nx, y: ny, budget: newBgt, wallsUsed: nWallsUsed, dir: { dx, dy } });
    }
  }
  return { tiles: [...tilesSet], budgetAtTile };
}

// Apply Cailloux passive: -1 per hit, immune if physicalImmune; imperissable immune to AOE
function physDmg(rawDmg, target, isAoe = false) {
  if (target?.physicalImmune) return 0;
  if (isAoe && target?.spec?.passive === 'imperissable') return 0;
  const reduction = target?.race?.passive === 'cailloux' ? 1 : 0;
  return Math.max(0, rawDmg - reduction);
}

function absorbDamage(player, dmg) {
  const temp = player.tempHp ?? 0;
  if (temp <= 0) return { player, remaining: dmg };
  const absorbed = Math.min(temp, dmg);
  return { player: { ...player, tempHp: temp - absorbed }, remaining: dmg - absorbed };
}

// Initiative: monster goes first if its attack > player's (force + magie)
function monsterGoesFirst(player, monster) {
  return monster.attack > ((player.stats?.force ?? 0) + (player.stats?.magie ?? 0));
}

const GOLEMS = {
  1: { icon: '⛰️', name: 'Golem de Terre',  maxHp: 6,  attack: 3, defense: 0, pile: null, isGolem: true },
  3: { icon: '🪨', name: 'Golem de Pierre', maxHp: 12, attack: 5, defense: 1, pile: null, isGolem: true },
  6: { icon: '✨', name: 'Golem d\'Or',      maxHp: 24, attack: 8, defense: 2, pile: null, isGolem: true },
};

function getCrossedPlayers(startX, startY, endX, endY, allPlayers, currentIdx) {
  const crossed = [];
  if (startX === endX && startY !== endY) {
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    for (let i = 0; i < allPlayers.length; i++) {
      if (i === currentIdx || !allPlayers[i].isAlive) continue;
      if (allPlayers[i].x === startX && allPlayers[i].y > minY && allPlayers[i].y < maxY) crossed.push(i);
    }
  } else if (startY === endY && startX !== endX) {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    for (let i = 0; i < allPlayers.length; i++) {
      if (i === currentIdx || !allPlayers[i].isAlive) continue;
      if (allPlayers[i].y === startY && allPlayers[i].x > minX && allPlayers[i].x < maxX) crossed.push(i);
    }
  }
  return crossed;
}

export function useGameState(characters) {
  const [mapData] = useState(() => MULTIPLAYER_MAPS[Math.floor(Math.random() * MULTIPLAYER_MAPS.length)]);
  const [mapName] = useState(() => mapData.name);
  const [grid] = useState(() => mapData.grid.map(r => [...r]));
const [{ enemies: initEnemies, traps: initTraps, chests: initChests }] = useState(() => generateInitialTiles(mapData));
  const [enemies, setEnemies] = useState(initEnemies);
  const [traps,   setTraps]   = useState(initTraps);
  const [chests,  setChests]  = useState(initChests);
  const [prisons, setPrisons] = useState(() => {
    const ps = {};
    for (let y = 0; y < mapData.grid.length; y++) {
      for (let x = 0; x < mapData.grid[y].length; x++) {
        if (mapData.grid[y][x] === T.PRISON) ps[`${x},${y}`] = { level: 1 };
      }
    }
    return ps;
  });

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
  const [pendingMessager, setPendingMessager] = useState(null);
  const [pendingAutodefense, setPendingAutodefense] = useState(null);
  const [pendingVoodoo, setPendingVoodoo] = useState(null);
  const [pendingNde, setPendingNde] = useState(null);
  const [pendingVoyageAstral, setPendingVoyageAstral] = useState(null);
  const [pendingMoveRoll, setPendingMoveRoll] = useState(null);
  const [pendingGolem, setPendingGolem] = useState(null);
  const [pendingShopOffer, setPendingShopOffer] = useState(null);

  const treasurePileRef = useRef({
    1: shuffleDeck(FULL_DECK.filter(c => c.rarity === 'common')),
    2: shuffleDeck(FULL_DECK.filter(c => c.rarity === 'uncommon')),
    3: shuffleDeck(FULL_DECK.filter(c => c.rarity === 'rare' || c.rarity === 'legendary')),
  });

  const currentPlayer = players[currentIdx] ?? players[0];

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 30));

  const drawFromTreasurePile = (pileNum) => {
    const piles = treasurePileRef.current;
    let pile = [...(piles[pileNum] ?? [])];
    if (pile.length === 0) {
      if (pileNum === 1) pile = shuffleDeck(FULL_DECK.filter(c => c.rarity === 'common'));
      else if (pileNum === 2) pile = shuffleDeck(FULL_DECK.filter(c => c.rarity === 'uncommon'));
      else pile = shuffleDeck(FULL_DECK.filter(c => c.rarity === 'rare' || c.rarity === 'legendary'));
    }
    if (pile.length === 0) return null;
    const drawn = pile[0];
    treasurePileRef.current = { ...piles, [pileNum]: pile.slice(1) };
    return drawn;
  };

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
    const wasForcedImmobileJJ = cp?.forcedImmobileNextTurn === true;
    const wasStunned = cp?.stunned === true;
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      if (p.physicalImmune) addLog(`🪨 ${p.name} est immunisé aux dégâts physiques ce tour.`);
      p.physicalImmune = false;
      p.forcedImmobileNextTurn = false;
      // Gold income: 3 gold per richesse point each turn
      const income = (p.stats?.richesse ?? 1) * 3;
      const doubleIncome = (p.goldDoubleRemaining ?? 0) > 0;
      const actualIncome = doubleIncome ? income * 2 : income;
      if (doubleIncome) { p.goldDoubleRemaining--; }
      p.gold = (p.gold ?? 0) + actualIncome;
      addLog(`💰 ${p.name} reçoit ${actualIncome} pièce(s) d'or${doubleIncome ? ' (×2 🥂)' : ''}. Total: ${p.gold}`);
      // Draw exactly 1 card per turn (up to hand limit)
      const needed = p.hand.length < HAND_LIMIT ? 1 : 0;
      if (needed > 0) {
        let deck = [...p.deck];
        let discard = [...p.discard];
        if (deck.length < needed) { deck = [...deck, ...shuffleDeck(discard)]; discard = []; }
        const drawn = deck.splice(0, needed);
        // Potion limit: max 2 potions in hand
        const potionsInHand = p.hand.filter(c => c.category === 'potion').length;
        const kept   = drawn.filter(c => c.category !== 'potion' || potionsInHand < 2);
        const tooMany = drawn.filter(c => c.category === 'potion' && potionsInHand >= 2);
        p.hand = [...p.hand, ...kept];
        p.deck = deck;
        p.discard = [...discard, ...tooMany];
        if (kept.length > 0)   addLog(`${p.name} tire ${kept.map(c => c.icon).join('')}.`);
        if (tooMany.length > 0) addLog(`🧪 ${p.name} défausse ${tooMany.map(c => c.icon).join('')} (limite 2 potions en main).`);
      }
      p.weaponJustSwapped = false;
      p.armorJustSwapped = false;
      p.wikiSwapped = false;
      p.slowMalus = 0;
      p.tempDepBonus = 0;
      p.frenzied = false;
      p.stunned = false;
      p.scrollsUsedThisTurn = 0;
      p.curseImmune = false;
      next[currentIdx] = p;
      return next;
    });
    setMoveRerolled(false);
    if (wasStunned) {
      setActionsLeft(0);
      setHasMoved(true);
      addLog(`💫 ${cp.name} est étourdi — passe son tour !`);
    } else if (wasForcedImmobileJJ) {
      setActionsLeft(3);
      setHasMoved(true);
      addLog(`🥋 ${cp.name} est immobilisé ce tour (Jiu Jitsu) !`);
    } else {
      setActionsLeft(3);
      setHasMoved(false);
    }
    setPhase('player_turn');
  }, [currentIdx, players]);

  // Equip card — FREE, applies stat bonuses, one weapon + one armor slot, max 2 magic items
  const equipCard = useCallback((card) => {
    if (!card || !isEquippable(card)) return false;
    const isWeapon    = card.effect.type === 'attack' || card.effect.type === 'magic_attack';
    const isArmor     = card.effect.type === 'defense';
    const isMagicItem = card.effect.type === 'passive' || card.effect.type === 'legendary';

    // Magic item slot check (max 2)
    if (isMagicItem) {
      const cp = players[currentIdx];
      const magicCount = cp.inventory.filter(c => c.effect.type === 'passive' || c.effect.type === 'legendary').length;
      if (magicCount >= 2) {
        addLog(`❌ ${cp.name} ne peut pas porter plus de 2 objets magiques.`);
        return false;
      }
    }
    // Magic weapon magie requirement
    if (card.effect.type === 'magic_attack' && (card.effect.magieCost ?? 0) > 0) {
      const cp2 = players[currentIdx];
      if ((cp2.stats.magie ?? 0) < card.effect.magieCost) {
        addLog(`❌ ${cp2.name} n'a pas assez de Magie pour équiper ${card.icon} ${card.name} (requis : ${card.effect.magieCost}, actuel : ${cp2.stats.magie ?? 0}).`);
        return false;
      }
    }
    // Armor force requirement
    if (isArmor && (card.effect.bonus ?? 0) > 0) {
      const cp3 = players[currentIdx];
      if ((cp3.stats.force ?? 0) < card.effect.bonus) {
        addLog(`❌ ${cp3.name} n'a pas assez de Force pour équiper ${card.icon} ${card.name} (requis : ${card.effect.bonus}, actuel : ${cp3.stats.force ?? 0}).`);
        return false;
      }
    }
    setPlayers(prev => {
      const next = [...prev];
      let p = { ...next[currentIdx], stats: { ...next[currentIdx].stats } };

      // Unequip previous card in the same slot
      if (isWeapon && p.equippedWeapon) {
        addLog(`↩ ${p.name} retire ${p.equippedWeapon.icon} ${p.equippedWeapon.name} (défaussé).`);
        p = unequipCard(p, p.equippedWeapon);
        p.equippedWeapon = null;
        p.weaponJustSwapped = true;
      } else if (isWeapon) {
        p.weaponJustSwapped = false;
      }
      if (isArmor && p.equippedArmor) {
        addLog(`↩ ${p.name} retire ${p.equippedArmor.icon} ${p.equippedArmor.name} (défaussé).`);
        p = unequipCard(p, p.equippedArmor);
        p.equippedArmor = null;
        p.armorJustSwapped = true;
      } else if (isArmor) {
        p.armorJustSwapped = false;
      }

      // Apply new card's deltas
      const deltas = getCardDeltas(card, p.stats);
      p = applyStatDeltas(p, deltas);

      // Special legendary bonuses
      if (card.effect.type === 'legendary') {
        const special = card.effect.special ?? '';
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
      if (isWeapon) p.equippedWeapon = card;
      if (isArmor)  p.equippedArmor  = card;
      next[currentIdx] = p;
      return next;
    });
    const weaponSwapped = players[currentIdx]?.equippedWeapon != null && (card.effect.type === 'attack' || card.effect.type === 'magic_attack');
    const armorSwapped  = players[currentIdx]?.equippedArmor != null && card.effect.type === 'defense';
    const swapNote = weaponSwapped ? ` Ne peut attaquer qu'au prochain tour.` : armorSwapped ? ` Protection inactive jusqu'au prochain tour.` : '';
    addLog(`${currentPlayer.name} équipe ${card.icon} ${card.name} (gratuit).${swapNote}`);
    setSelectedCard(null);
    return true;
  }, [currentIdx, currentPlayer, players]);

  // Start move — costs 1 action, animates die, shows reachable tiles
  const startMove = useCallback(() => {
    if (actionsLeft < 1 || hasMoved) return;
    const cpCheck = players[currentIdx];

    // Prison roll: restricted movement check
    if (cpCheck?.prisonEffect) {
      const { level } = cpCheck.prisonEffect;
      const threshold = level === 1 ? 4 : level === 2 ? 3 : 1;
      const damage    = level === 2 ? 1 : level === 3 ? 3 : 0;
      setPhase('rolling_prison');
      animateRoll((roll) => {
        // Always consume the prisonEffect after attempting the roll
        setPlayers(prev => {
          const next = [...prev];
          next[currentIdx] = { ...next[currentIdx], prisonEffect: null };
          return next;
        });
        if (roll <= threshold) {
          addLog(`🎲 ${cpCheck.name} réussit l'évasion (${roll} ≤ ${threshold}) — avance de ${roll} case(s).`);
          const cp2 = { ...cpCheck, prisonEffect: null };
          const hasFF = cp2.race?.passive === 'peluches';
          const { tiles, budgetAtTile } = runMoveDijkstra(cp2.x, cp2.y, roll, cp2.facing, false, hasFF, grid, getBlockedTiles(players, currentIdx));
          const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
          setTilesBudget(budgetAtTile);
          setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
          setPhase('choosing_move');
        } else {
          const failMsg = damage > 0
            ? `🔒 ${cpCheck.name} échoue l'évasion (${roll} > ${threshold}) — reste immobile et subit ${damage} dégât(s).`
            : `🔒 ${cpCheck.name} échoue l'évasion (${roll} > ${threshold}) — ne peut pas se déplacer.`;
          addLog(failMsg);
          if (damage > 0) {
            setPlayers(prev => {
              const next = [...prev];
              const p = { ...next[currentIdx] };
              p.hp = Math.max(0, p.hp - damage);
              next[currentIdx] = p;
              return next;
            });
          }
          setHasMoved(true);
          setPhase('player_turn');
        }
      });
      return;
    }

    setPhase('rolling_move');
    const card = selectedCard;
    const special = (card?.effect?.type === 'move') ? (card.effect.special ?? null) : null;
    const bonus   = (card?.effect?.type === 'move') ? (card.effect.bonus  ?? 0)    : 0;

    animateRoll((roll) => {
      const cp = players[currentIdx];

      // Malédiction (Arc des Ténèbres): premier mouvement après malédiction → dé impair = dégâts magiques
      if (cp.cursed) {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.cursed = false;
          if (roll % 2 !== 0) p.hp = Math.max(0, p.hp - roll);
          next[currentIdx] = p;
          return next;
        });
        if (roll % 2 !== 0) {
          addLog(`🌑 Malédiction ! ${cp.name} roule ${roll} (impair) — subit ${roll} dégâts magiques !`);
        } else {
          addLog(`🌑 Malédiction de ${cp.name} dissipée (${roll} — pair, pas de dégât).`);
        }
      }

      let baseRange = roll + bonus;
      let logSuffix = bonus !== 0 ? ` +${bonus}` : '';
      let wallPass = false;

      if (special === 'double_roll') { baseRange = roll * 2; logSuffix = ' ×2'; }
      else if (special === 'fixed_move') { baseRange = bonus; logSuffix = ` (fixe ${baseRange})`; }
      if (special === 'wall_pass') wallPass = true;

      const depBonus = cp.stats.deplacement ?? 0;
      const optionalDep = cp.race?.passive === 'longs_bras' || cp.race?.passive === 'zeles';
      const frenziedDepMalus = cp.frenzied ? 3 : 0;
      const mandatoryMod = (cp.tempDepBonus ?? 0) - (cp.slowMalus ?? 0) - frenziedDepMalus;
      const adjustedBase = baseRange + mandatoryMod;

      // Touffus: raw roll = 6 → choice between move or bonus action
      if (cp.race?.passive === 'touffus' && roll === 6) {
        setPendingMoveRoll({ roll: adjustedBase, wallPass, depBonus });
        setPhase('touffus_bonus_choice');
        addLog(`🎲 ${cp.name} lance le dé : 6 — se déplacer (${Math.max(0, adjustedBase + depBonus)} cases) ou action bonus ?`);
        return;
      }

      // Secrétariat: can adjust movement roll by ±1
      if (cp.spec?.passive === 'secretariat') {
        setPendingMoveRoll({ roll: adjustedBase, wallPass, depBonus });
        setPhase('secretariat_move_choice');
        addLog(`🎲 ${cp.name} lance le dé : ${roll}${logSuffix} = ${adjustedBase + depBonus} cases. Secrétariat : ajuster de ±1 ?`);
        return;
      }

      // Optional deplacement bonus (Longs Bras, Zélés)
      if (optionalDep && depBonus > 0) {
        setPendingMoveRoll({ roll: adjustedBase, wallPass, depBonus });
        setPhase('choosing_move_bonus');
        addLog(`🎲 ${cp.name} lance le dé : ${roll}${logSuffix} = ${adjustedBase} cases. Bonus déplacement +${depBonus} disponible.`);
        return;
      }

      // All others: add deplacement automatically
      const finalRange = Math.max(0, adjustedBase + depBonus);
      const logDep = (adjustedBase !== baseRange || depBonus !== 0) ? ` (base ${baseRange}${mandatoryMod !== 0 ? `, modif ${mandatoryMod > 0 ? '+' : ''}${mandatoryMod}` : ''}${depBonus !== 0 ? `, dep ${depBonus > 0 ? '+' : ''}${depBonus}` : ''})` : '';
      addLog(`🎲 ${cp.name} lance le dé : ${roll}${logSuffix}${logDep} = ${finalRange} cases.${card?.effect?.type === 'move' ? ` [${card.name}]` : ''}`);

      const hasPeluches = cp.race?.passive === 'peluches';
      const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, finalRange, cp.facing, wallPass, hasPeluches, grid, getBlockedTiles(players, currentIdx));
      const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
      setTilesBudget(budgetAtTile);
      setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
      setPhase('choosing_move');
    });
  }, [actionsLeft, hasMoved, selectedCard, currentIdx, players, grid, setTilesBudget]);

  // Pay gold to bypass prison effect this turn
  const prisonPayGold = useCallback(() => {
    const cp = players[currentIdx];
    if (!cp?.prisonEffect) return;
    const cost = cp.prisonEffect.level * 2;
    if (cp.gold < cost) {
      addLog(`❌ ${cp.name} n'a pas assez d'or pour se libérer (requis: ${cost}, disponible: ${cp.gold}).`);
      return;
    }
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      p.gold -= cost;
      p.prisonEffect = null;
      next[currentIdx] = p;
      return next;
    });
    addLog(`🔓 ${cp.name} paie ${cost}💰 et annule l'effet prison — déplacement libre ce tour.`);
  }, [currentIdx, players]);

  // Confirm optional deplacement bonus (Longs Bras, Zélés)
  const confirmMoveBonus = useCallback((useBonus) => {
    if (phase !== 'choosing_move_bonus') return;
    const cp = players[currentIdx];
    const { roll, wallPass, depBonus } = pendingMoveRoll;
    const finalRange = Math.max(0, useBonus ? roll + depBonus : roll);
    setPendingMoveRoll(null);
    addLog(`🎲 ${cp.name} se déplace de ${finalRange} case(s)${useBonus ? ` (+${depBonus} bonus)` : ' (sans bonus)'}.`);
    const hasPeluches = cp.race?.passive === 'peluches';
    const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, finalRange, cp.facing, wallPass, hasPeluches, grid, getBlockedTiles(players, currentIdx));
    const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
    setTilesBudget(budgetAtTile);
    setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
    setPhase('choosing_move');
  }, [phase, currentIdx, players, pendingMoveRoll, grid]);

  // Touffus: take bonus action instead of moving (roll=6)
  const touffusBonusAction = useCallback(() => {
    if (phase !== 'touffus_bonus_choice') return;
    setPendingMoveRoll(null);
    setHasMoved(true);
    setActionsLeft(prev => prev + 1);
    addLog(`🌿 ${players[currentIdx].name} (Touffus) renonce au mouvement — action bonus accordée !`);
    setPhase('player_turn');
  }, [phase, currentIdx, players]);

  // Touffus: continue with normal movement (roll=6)
  const touffusContinueMove = useCallback(() => {
    if (phase !== 'touffus_bonus_choice') return;
    const cp = players[currentIdx];
    const { roll, wallPass, depBonus } = pendingMoveRoll;
    const finalRange = Math.max(0, roll + depBonus);
    setPendingMoveRoll(null);
    addLog(`🌿 ${cp.name} (Touffus) choisit de se déplacer (${finalRange} cases).`);
    const hasPeluches = cp.race?.passive === 'peluches';
    const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, finalRange, cp.facing, wallPass, hasPeluches, grid, getBlockedTiles(players, currentIdx));
    const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
    setTilesBudget(budgetAtTile);
    setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
    setPhase('choosing_move');
  }, [phase, currentIdx, players, pendingMoveRoll, grid]);

  // Wiki passive: swap force ↔ magie once per turn; discard cards no longer usable
  const wikiSwapStats = useCallback(() => {
    const cp = players[currentIdx];
    if (cp?.cls?.passive !== 'wiki' || cp?.wikiSwapped) return;
    setPlayers(prev => {
      const next = [...prev];
      let p = { ...next[currentIdx], stats: { ...next[currentIdx].stats } };
      const oldForce = p.stats.force;
      const oldMagie = p.stats.magie;
      p.stats.force = oldMagie;
      p.stats.magie = oldForce;
      p.wikiSwapped = true;
      // Discard weapon if force requirement no longer met
      if (p.equippedWeapon) {
        const req = p.equippedWeapon.effect.bonus ?? 0;
        if (p.stats.force < req) {
          addLog(`🔴 ${p.name} ne peut plus porter ${p.equippedWeapon.icon} ${p.equippedWeapon.name} (Force ${p.stats.force} < requis ${req}) — défaussé.`);
          p = unequipCard(p, p.equippedWeapon);
          p.equippedWeapon = null;
        }
      }
      next[currentIdx] = p;
      return next;
    });
    const cp2 = players[currentIdx];
    addLog(`📚 ${cp2.name} (Wiki) interéchange Force (${cp2.stats.force}) ↔ Magie (${cp2.stats.magie}).`);
  }, [currentIdx, players]);

  // Skip Cravaté prison swap (optional)
  const skipPrisonSwap = useCallback(() => {
    setHighlightTiles([]);
    setPhase('player_turn');
  }, []);

  // Anciens passive: reroll movement once per turn (no action cost)
  const rerollMove = useCallback(() => {
    if (moveRerolled || players[currentIdx]?.race?.passive !== '__no_race__') return; // no race has reroll
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
      const hasPeluches2 = cp.race?.passive === 'peluches';
      const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, range, cp.facing, wallPass, hasPeluches2, grid, getBlockedTiles(players, currentIdx));
      const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
      setTilesBudget(budgetAtTile);
      setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
      setPhase('choosing_move');
    });
  }, [moveRerolled, currentIdx, players, selectedCard, grid]);

  // Complete the move
  const moveToTile = useCallback((tx, ty) => {
    // Cravaté swap selection
    if (phase === 'choosing_prison_swap') {
      const key = `${tx},${ty}`;
      setHighlightTiles([]);
      if (highlightTiles.includes(key)) {
        const cp = players[currentIdx];
        const targetPlayerIdx = players.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === tx && p.y === ty);
        if (targetPlayerIdx >= 0) {
          const [myX, myY] = [cp.x, cp.y];
          setPlayers(prev => {
            const next = [...prev];
            next[currentIdx]    = { ...next[currentIdx], x: tx, y: ty };
            next[targetPlayerIdx] = { ...next[targetPlayerIdx], x: myX, y: myY };
            return next;
          });
          addLog(`👔 ${cp.name} interéchange avec ${players[targetPlayerIdx].name} !`);
        } else if (enemies[key]) {
          const enemy = enemies[key];
          const [myX, myY] = [cp.x, cp.y];
          setPlayers(prev => { const next = [...prev]; next[currentIdx] = { ...next[currentIdx], x: tx, y: ty }; return next; });
          setEnemies(prev => { const n = { ...prev }; delete n[key]; n[`${myX},${myY}`] = enemy; return n; });
          addLog(`👔 ${cp.name} interéchange avec ${enemy.icon} ${enemy.name} !`);
        }
      } else {
        addLog(`👔 Échange annulé.`);
      }
      setPhase('player_turn');
      return;
    }

    if (phase !== 'choosing_move' && phase !== 'choosing_attack'
      && phase !== 'longs_bras_passive' && phase !== 'choosing_portal'
      && phase !== 'bum_throw' && phase !== 'fou_attack' && phase !== 'fou_portal'
      && phase !== 'voyage_astral_select' && phase !== 'voyage_astral_move') return;

    if (phase === 'choosing_move') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key)) return;
      if (players.some((p, i) => i !== currentIdx && p.isAlive && p.baseX === tx && p.baseY === ty)) return;
      setHighlightTiles([]);
      if (!hasMoved) {
        setHasMoved(true);
        setActionsLeft(prev => prev - 1);
      }
      const budgetHere = tilesBudget[key] ?? 0;
      let damageTakenThisMove = 0;
      const startX = players[currentIdx].x;
      const startY = players[currentIdx].y;

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

      const hasImmuneForce = players[currentIdx]?.equippedArmor?.effect?.special?.includes('immune_forced_move');
      if (grid[ty][tx] === T.TELEPORT && teleportTiles.length > 1 && !hasImmuneForce) {
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

      const cp = players[currentIdx];
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

      // Shop: draw 3 bonus cards on landing; Couponing: buy mechanic
      if (grid[finalY][finalX] === T.SHOP && cp.spec?.passive !== 'pacte') {
        if (cp.spec?.passive === 'couponing') {
          let offerDeck = [...cp.deck], offerDiscard = [...cp.discard];
          if (offerDeck.length < 3) { offerDeck = [...offerDeck, ...shuffleDeck(offerDiscard)]; offerDiscard = []; }
          const offerCards = offerDeck.splice(0, 3);
          setPlayers(prev => {
            const next = [...prev];
            const p = { ...next[currentIdx], deck: offerDeck };
            if (cp.deck.length < 3) p.discard = offerDiscard;
            next[currentIdx] = p;
            return next;
          });
          setPendingShopOffer({ cards: offerCards, boughtCount: 0 });
          setPhase('shop_couponing');
          addLog(`🏪 ${cp.name} (Couponing) visite le magasin — 1er achat : 1💰, 2ème : prix normal.`);
        } else {
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
      }

      const destKey = `${finalX},${finalY}`;
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
      if (monsterThere && !turnEnded && !(monsterThere.isGolem && monsterThere.ownerIdx === currentIdx)) {
        if (cp.cls?.passive === 'messager') {
          const crossedIdxs = !teleported ? getCrossedPlayers(startX, startY, finalX, finalY, players, currentIdx) : [];
          setPendingMessager({ type: 'monster', destKey, monsterThere, finalX, finalY, budgetHere, newFacing, teleported, damageTakenThisMove, crossedIdxs });
          setPhase('messager_monster');
          addLog(`📨 ${cp.name} tombe sur ${monsterThere.icon} ${monsterThere.name} — combattre ou passer ?`);
          return;
        }
        // Pacte: auto-kill monster
        if (cp.spec?.passive === 'pacte') {
          const goldReward = monsterThere.attack ?? 1;
          const treasureCard = drawFromTreasurePile(monsterThere.pile);
          addLog(`📜 ${cp.name} (Pacte) élimine ${monsterThere.icon} ${monsterThere.name} automatiquement ! +${goldReward}💰${treasureCard ? ` + ${treasureCard.icon}` : ''}`);
          if (monsterThere.pile === 1) {
            const p2 = MONSTER_PILE_2[Math.floor(Math.random() * MONSTER_PILE_2.length)];
            setEnemies(prev => ({ ...prev, [destKey]: { ...p2, hp: p2.maxHp } }));
          } else if (monsterThere.pile === 2) {
            const p3 = MONSTER_PILE_3[Math.floor(Math.random() * MONSTER_PILE_3.length)];
            setEnemies(prev => ({ ...prev, [destKey]: { ...p3, hp: p3.maxHp } }));
          } else {
            setEnemies(prev => { const n = { ...prev }; delete n[destKey]; return n; });
          }
          setPlayers(prev => {
            const next = [...prev];
            let np = { ...next[currentIdx] };
            const doubleG = (np.goldDoubleRemaining ?? 0) > 0;
            np.gold = (np.gold ?? 0) + (doubleG ? goldReward * 2 : goldReward);
            if (doubleG) { np.goldDoubleRemaining--; addLog(`🥂 Champagne ! Or doublé (${np.goldDoubleRemaining} restant(s))`); }
            if (treasureCard) np.hand = [...np.hand, treasureCard];
            next[currentIdx] = np;
            return next;
          });
          // fall through — don't return, continue to check traps/chests
        } else {
        const roll = rollDie();
        const pDmg = Math.max(1, roll + cp.stats.force + Math.floor(cp.stats.richesse / 2) - monsterThere.defense);
        const mDmg = Math.max(1, monsterThere.attack - Math.floor(cp.stats.force / 3));
        const rounds = Math.ceil(monsterThere.maxHp / pDmg);
        const mFirst = monsterGoesFirst(cp, monsterThere);
        const rawDmgTaken = mFirst ? rounds * mDmg : Math.max(0, (rounds - 1) * mDmg);
        const dmgTaken = physDmg(rawDmgTaken, cp);
        const won = cp.physicalImmune || cp.hp - dmgTaken > 0;
        const goldReward = won ? (monsterThere.attack ?? 1) : 0;
        const treasureCard = won ? drawFromTreasurePile(monsterThere.pile) : null;
        const playerPower = (cp.stats.force ?? 0) + (cp.stats.magie ?? 0);
        addLog(`⚔️ ${cp.name} affronte ${monsterThere.icon} ${monsterThere.name} (pile ${monsterThere.pile}) ! (dé:${roll})`);
        addLog(mFirst
          ? `⚠️ ${monsterThere.name} a l'initiative — ATK ${monsterThere.attack} > Force+Magie ${playerPower}`
          : `⚡ ${cp.name} a l'initiative — Force+Magie ${playerPower} ≥ ATK ${monsterThere.attack}`);
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
            if (np.hp <= 0 && np.spec?.passive === 'premier_soin' && !np.premierSoinUsed) {
              const reviveHp = rollDie();
              np = { ...np, hp: reviveHp, premierSoinUsed: true };
              addLog(`🩹 Premier Soin : ${np.name} réssucite avec ${reviveHp} PV !`);
            } else if (np.stats.destin > 0) {
              const keepGold = np.spec?.passive === 'nde' ? np.gold : 0;
              const keepHand = np.spec?.passive === 'nde' ? [...np.hand] : [];
              const reviveHp = np.spec?.passive === 'nde' ? rollDie() : np.maxHp;
              const newDeck = shuffleDeck([...FULL_DECK]);
              if (np.spec?.passive === 'nde') addLog(`💀 NDE : ${np.name} renaît avec ${reviveHp} PV, conserve or et main !`);
              np = { ...np, hp: reviveHp, x: np.baseX, y: np.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
            } else {
              np.isAlive = false; np.hp = 0;
            }
          }
          if (won) {
            np = { ...np, gold: (np.gold ?? 0) + goldReward };
            if (treasureCard) np = { ...np, hand: [...np.hand, treasureCard] };
          }
          return np;
        });
        damageTakenThisMove += dmgTaken;
        setPlayers(nextPlayers);
        if (won) {
          addLog(`✅ ${monsterThere.name} vaincu ! -${dmgTaken} PV, +${goldReward}💰${treasureCard ? ` + ${treasureCard.icon} ${treasureCard.name}` : ''}`);
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
        } // end else (not pacte)
      }

      // — Trap —
      const trapThere = traps[destKey];
      if (trapThere && !turnEnded) {
        if (cp.spec?.passive === 'ectomorphe') {
          addLog(`👻 ${cp.name} (Ectomorphe) passe à travers ${trapThere.icon} ${trapThere.name} sans le déclencher !`);
        } else {
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
            if (np.spec?.passive === 'premier_soin' && !np.premierSoinUsed) {
              const reviveHp = rollDie();
              np = { ...np, hp: reviveHp, premierSoinUsed: true };
              addLog(`🩹 Premier Soin : ${np.name} réssucite avec ${reviveHp} PV !`);
              trapFatal = false;
            } else if (np.stats.destin > 0) {
              const keepGold = np.spec?.passive === 'nde' ? np.gold : 0;
              const keepHand = np.spec?.passive === 'nde' ? [...np.hand] : [];
              const reviveHp = np.spec?.passive === 'nde' ? rollDie() : np.maxHp;
              const newDeck = shuffleDeck([...FULL_DECK]);
              if (np.spec?.passive === 'nde') addLog(`💀 NDE : ${np.name} renaît avec ${reviveHp} PV, conserve or et main !`);
              np = { ...np, hp: reviveHp, x: np.baseX, y: np.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
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
        } // end else (not ectomorphe)
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
        // Jiu Jutsu: check if movement triggers jiu_jutsu
        {
          const jjOther = players.find((p, i) => {
            if (!p.isAlive || !p.facing || i === currentIdx) return false;
            if (p.spec?.passive === 'jiu_jutse') {
              return (p.x - p.facing.dx === finalX && p.y - p.facing.dy === finalY);
            }
            if (cp.spec?.passive === 'jiu_jutse') {
              return (p.x + p.facing.dx === finalX && p.y + p.facing.dy === finalY);
            }
            return false;
          });
          if (jjOther) {
            const jjOtherIdx = players.indexOf(jjOther);
            const [jjIdx, advIdx] = cp.spec?.passive === 'jiu_jutse' ? [currentIdx, jjOtherIdx] : [jjOtherIdx, currentIdx];
            const jjP = players[jjIdx];
            const advP = players[advIdx];
            const [jjNewX, jjNewY] = [advP.x, advP.y];
            const [advNewX, advNewY] = [jjP.x, jjP.y];
            const jiuDmg = physDmg(advP.stats.force ?? 1, advP);
            addLog(`🥋 Jiu Jitsu ! ${jjP.name} et ${advP.name} échangent de place — ${advP.name} subit ${jiuDmg} dégâts !`);
            setPlayers(prev => {
              const next = [...prev];
              next[jjIdx] = { ...next[jjIdx], x: jjNewX, y: jjNewY };
              let adv = { ...next[advIdx], x: advNewX, y: advNewY, forcedImmobileNextTurn: true };
              adv.hp = Math.max(0, adv.hp - jiuDmg);
              if (adv.hp <= 0) {
                if (adv.spec?.passive === 'premier_soin' && !adv.premierSoinUsed) {
                  const reviveHp = rollDie();
                  adv = { ...adv, hp: reviveHp, premierSoinUsed: true };
                  addLog(`🩹 Premier Soin : ${adv.name} réssucite avec ${reviveHp} PV !`);
                } else if (adv.stats.destin > 0) {
                  const keepGold = adv.spec?.passive === 'nde' ? adv.gold : 0;
                  const keepHand = adv.spec?.passive === 'nde' ? [...adv.hand] : [];
                  const reviveHp = adv.spec?.passive === 'nde' ? rollDie() : adv.maxHp;
                  const newDeck = shuffleDeck([...FULL_DECK]);
                  adv = { ...adv, hp: reviveHp, x: adv.baseX, y: adv.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...adv.stats, destin: adv.stats.destin - 1 } };
                } else {
                  adv.isAlive = false; adv.hp = 0;
                }
              }
              next[advIdx] = adv;
              return next;
            });
            // Check if trap at adversary's new position
            const advNewKey = `${advNewX},${advNewY}`;
            if (traps[advNewKey]) {
              const trap = traps[advNewKey];
              const trapRoll = rollDie();
              addLog(`🪤 ${advP.name} atterrit sur ${trap.icon} ${trap.name} !`);
              setTraps(prev => { const n = { ...prev }; delete n[advNewKey]; return n; });
              let trapDmg = 0;
              if (trap.effect === 'damage' || trap.effect === 'damage_action' || trap.effect === 'damage_discard') trapDmg = trapRoll + trap.value;
              if (trapDmg > 0) {
                setPlayers(prev => {
                  const next = [...prev];
                  const p = { ...next[advIdx] };
                  p.hp = Math.max(0, p.hp - trapDmg);
                  next[advIdx] = p;
                  return next;
                });
                addLog(`💥 ${trap.name} : -${trapDmg} PV à ${advP.name}`);
              }
            }
          }
        }
        // Passif Messager : échange de carte lors d'un croisement en ligne droite
        if (players[currentIdx]?.cls?.passive === 'messager' && !teleported) {
          const crossedIdxs = getCrossedPlayers(startX, startY, finalX, finalY, players, currentIdx);
          if (crossedIdxs.length > 0) {
            setPendingMessager({ type: 'exchange', crossedPlayerIdx: crossedIdxs[0], finalX, finalY, budgetHere, newFacing, damageTakenThisMove });
            setPhase('messager_exchange');
            addLog(`📨 ${currentPlayer.name} croise ${players[crossedIdxs[0]].name} en chemin — échange de carte ?`);
            return;
          }
        }
        // — Prison landing —
        const prisonThere = prisons[destKey];
        if (prisonThere) {
          const lvl = prisonThere.level;
          const goldCost = lvl * 2;
          const threshold = lvl === 1 ? 4 : lvl === 2 ? 3 : 1;
          // Upgrade the prison (max lvl 3)
          setPrisons(prev => ({ ...prev, [destKey]: { level: Math.min(3, lvl + 1) } }));
          // Apply prisonEffect to player
          setPlayers(prev => {
            const next = [...prev];
            next[currentIdx] = { ...next[currentIdx], prisonEffect: { level: lvl } };
            return next;
          });
          addLog(`⛓️ ${cp.name} atterrit sur une Case Prison (niv.${lvl}) ! Prochain tour: rouler ≤${threshold} pour avancer, sinon immobile${lvl > 1 ? ` (-${lvl === 2 ? 1 : 3} PV)` : ''}. Payer ${goldCost}💰 pour annuler.`);
          // Cravaté passive: can swap with adversary within 6 tiles
          if (players[currentIdx]?.cls?.passive === 'cravate') {
            const swapTargets = [];
            for (let dy2 = -6; dy2 <= 6; dy2++) {
              for (let dx2 = -6; dx2 <= 6; dx2++) {
                if (Math.abs(dx2) + Math.abs(dy2) > 6) continue;
                const nx = finalX + dx2, ny = finalY + dy2;
                if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
                const k = `${nx},${ny}`;
                if (players.some((p, i) => i !== currentIdx && p.isAlive && p.x === nx && p.y === ny)) swapTargets.push(k);
                else if (enemies[k]) swapTargets.push(k);
              }
            }
            const uniqueTargets = [...new Set(swapTargets)];
            if (uniqueTargets.length > 0) {
              setHighlightTiles(uniqueTargets);
              setPhase('choosing_prison_swap');
              addLog(`👔 ${cp.name} (Cravaté) peut interchanger avec un adversaire à portée (ou ⏭️ pour passer).`);
              return;
            }
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
        const mFirstLB = monsterGoesFirst(cp, m);
        const rawLBDmg = mFirstLB ? rounds * mDmg : Math.max(0, (rounds - 1) * mDmg);
        const dmgTaken = physDmg(rawLBDmg, cp);
        const won = cp.physicalImmune || pDmg * rounds >= m.maxHp;
        const goldRewardLB = won ? (m.attack ?? 1) : 0;
        const treasureCardLB = won ? drawFromTreasurePile(m.pile) : null;
        const playerPowerLB = (cp.stats.force ?? 0) + (cp.stats.magie ?? 0);
        addLog(`🦾 ${cp.name} frappe ${m.icon} ${m.name} depuis la case adjacente !`);
        addLog(mFirstLB
          ? `⚠️ ${m.name} a l'initiative — ATK ${m.attack} > Force+Magie ${playerPowerLB}`
          : `⚡ ${cp.name} a l'initiative — Force+Magie ${playerPowerLB} ≥ ATK ${m.attack}`);
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
          }
          addLog(`✅ ${m.name} vaincu ! +${goldRewardLB}💰${treasureCardLB ? ` + ${treasureCardLB.icon} ${treasureCardLB.name}` : ''}`);
        }
        const nextPlayers = players.map((p, i) => {
          if (i !== currentIdx) return p;
          let np = { ...p, hp: Math.max(0, p.hp - dmgTaken) };
          if (!won) {
            if (np.hp <= 0 && np.spec?.passive === 'premier_soin' && !np.premierSoinUsed) {
              const reviveHp = rollDie();
              np = { ...np, hp: reviveHp, premierSoinUsed: true };
              addLog(`🩹 Premier Soin : ${np.name} réssucite avec ${reviveHp} PV !`);
            } else if (np.stats.destin > 0) {
              const keepGold = np.spec?.passive === 'nde' ? np.gold : 0;
              const keepHand = np.spec?.passive === 'nde' ? [...np.hand] : [];
              const reviveHp = np.spec?.passive === 'nde' ? rollDie() : np.maxHp;
              const newDeck = shuffleDeck([...FULL_DECK]);
              if (np.spec?.passive === 'nde') addLog(`💀 NDE : ${np.name} renaît avec ${reviveHp} PV, conserve or et main !`);
              np = { ...np, hp: reviveHp, x: np.baseX, y: np.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
            } else {
              np.isAlive = false; np.hp = 0;
            }
          }
          if (won) {
            np = { ...np, gold: (np.gold ?? 0) + goldRewardLB };
            if (treasureCardLB) np = { ...np, hand: [...np.hand, treasureCardLB] };
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
    } else if (phase === 'voyage_astral_select') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key) || !enemies[key]) return;
      setPendingVoyageAstral({ monsterKey: key });
      const mx = tx, my = ty;
      const destTiles = [];
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        let nx = mx + dx, ny = my + dy;
        while (nx >= 0 && ny >= 0 && ny < grid.length && nx < grid[0].length && grid[ny][nx] !== T.WALL) {
          if (!enemies[`${nx},${ny}`]) destTiles.push(`${nx},${ny}`);
          else break;
          nx += dx; ny += dy;
        }
      }
      if (destTiles.length === 0) {
        addLog(`🌌 Aucune destination possible pour ce monstre.`);
        setHighlightTiles(Object.keys(enemies));
        return;
      }
      setHighlightTiles(destTiles);
      setPhase('voyage_astral_move');
      addLog(`🌌 Choisissez la destination du monstre.`);
    } else if (phase === 'voyage_astral_move') {
      const destKey = `${tx},${ty}`;
      if (!highlightTiles.includes(destKey)) return;
      setHighlightTiles([]);
      const { monsterKey } = pendingVoyageAstral;
      const monster = enemies[monsterKey];
      setPendingVoyageAstral(null);
      setEnemies(prev => {
        const n = { ...prev };
        delete n[monsterKey];
        n[destKey] = monster;
        return n;
      });
      addLog(`🌌 ${currentPlayer.name} déplace ${monster.icon} ${monster.name} vers (${tx}, ${ty}).`);
      setHasMoved(true);
      setActionsLeft(prev => prev - 1);
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
  }, [phase, highlightTiles, tilesBudget, hasMoved, currentIdx, selectedCard, currentPlayer, enemies, traps, chests, players, grid, pendingVoyageAstral]);

  // Map range string → numeric radius (for circular targeting)
  const RANGE_NUMS = { melee: 1, back: 1, r2: 2, r4: 4, r5: 5, r6: 6, aoe1: 1, aoe2: 2, wall_melee: 1 };

  // Show attack targets (adjacent players and enemies)
  const showAttackTargets = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    const weapon = cp.equippedWeapon;
    if (!weapon) {
      addLog(`⚔️ Impossible d'attaquer sans arme équipée.`);
      return;
    }
    if (cp.weaponJustSwapped) {
      addLog(`⏳ ${cp.name} vient de changer d'arme — peut attaquer au prochain tour.`);
      return;
    }
    const cardRange = weapon?.effect?.range ?? null;

    // Base range: stat portee, then legacy special override, then card range property
    let range = cp.stats.portee ?? 1;
    if (weapon?.effect?.special) {
      const sp = weapon.effect.special;
      const m = sp.match(/range(\d+)/);
      if (m) range = Math.max(range, parseInt(m[1]));
    }
    if (cardRange && RANGE_NUMS[cardRange]) range = Math.max(range, RANGE_NUMS[cardRange]);

    const tiles = [];
    const isTarget = (nx, ny) =>
      players.some((p, i) => i !== currentIdx && p.isAlive && p.x === nx && p.y === ny)
      || !!enemies[`${nx},${ny}`];

    if (cardRange === 'back') {
      // Single tile directly behind the player (opposite of facing)
      if (cp.facing) {
        const bx = cp.x - cp.facing.dx;
        const by = cp.y - cp.facing.dy;
        if (bx >= 0 && by >= 0 && by < grid.length && bx < grid[0].length && grid[by][bx] !== T.WALL)
          if (isTarget(bx, by)) tiles.push(`${bx},${by}`);
      }
    } else if (cardRange === 'line') {
      // All tiles in facing direction until a wall
      if (cp.facing) {
        let lx = cp.x + cp.facing.dx, ly = cp.y + cp.facing.dy;
        while (lx >= 0 && ly >= 0 && ly < grid.length && lx < grid[0].length && grid[ly][lx] !== T.WALL) {
          if (isTarget(lx, ly)) tiles.push(`${lx},${ly}`);
          lx += cp.facing.dx; ly += cp.facing.dy;
        }
      }
    } else if (cardRange === 'wall_melee') {
      // Lame spectrale: melee range but can attack through walls
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = cp.x + dx, ny = cp.y + dy;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        if (grid[ny][nx] !== T.WALL) {
          if (isTarget(nx, ny)) tiles.push(`${nx},${ny}`);
        } else {
          // Wall tile: check through it (the tile beyond the wall)
          const nx2 = nx + dx, ny2 = ny + dy;
          if (nx2 >= 0 && ny2 >= 0 && ny2 < grid.length && nx2 < grid[0].length && grid[ny2][nx2] !== T.WALL) {
            if (isTarget(nx2, ny2)) tiles.push(`${nx2},${ny2}`);
          }
        }
      }
    } else {
      if (cardRange === 'global') range = Math.max(grid.length, (grid[0]?.length ?? 0));
      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          if (Math.abs(dx) + Math.abs(dy) > range || (dx === 0 && dy === 0)) continue;
          const nx = cp.x + dx, ny = cp.y + dy;
          if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
          if (grid[ny][nx] === T.WALL) continue;
          if (isTarget(nx, ny)) tiles.push(`${nx},${ny}`);
        }
      }
    }
    setHighlightTiles(tiles);
    setPhase('choosing_attack');
    addLog(`${cp.name} choisit une cible...`);
  }, [actionsLeft, currentIdx, players, grid, enemies]);

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
            t = { ...t, hp: t.maxHp, x: t.baseX, y: t.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
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
    const card = cp.equippedWeapon;
    const targetPlayerIdx = players.findIndex((p, i) => i !== currentIdx && p.isAlive && p.x === tx && p.y === ty);
    const targetEnemy = enemies[key];

    animateRoll((roll) => {
      const chanceBonus = Math.floor(cp.stats.richesse / 2);
      const effectiveRoll = Math.min(6, roll + chanceBonus);
      const isMagic = card?.effect?.type === 'magic_attack';
      // Coeur Noir: reduce attacker's magie to 1 if adjacent to a coeur_noir player
      let effectiveMagie = cp.stats.magie;
      if (isMagic) {
        const nearCoeurNoir = players.some((p, i) => i !== currentIdx && p.isAlive && p.spec?.passive === 'coeur_noir' && Math.abs(cp.x - p.x) + Math.abs(cp.y - p.y) <= 1);
        if (nearCoeurNoir) {
          effectiveMagie = Math.min(effectiveMagie, 1);
          addLog(`🖤 Cœur Noir réduit la Magie de ${cp.name} à 1 !`);
        }
      }
      const frenziedBonus = (!isMagic && cp.frenzied) ? 6 : 0;
      const meleeForceBonusAtt = (!isMagic && cardRange === 'melee' && cp.equippedArmor?.effect?.special?.includes('melee_force_bonus')) ? 1 : 0;
      const baseStat = (isMagic ? effectiveMagie : cp.stats.force + meleeForceBonusAtt) + frenziedBonus;
      let hunterBonus = 0;
      if (card?.effect?.special === 'hunter' && targetPlayerIdx >= 0) {
        if (cp.hunterTarget === targetPlayerIdx && (cp.hunterStreak ?? 0) >= 1) {
          hunterBonus = (cp.hunterStreak ?? 0) >= 2 ? 6 : 3;
          addLog(`🪬 ${cp.name} (Hache du chasseur) bonus chasseur : +${hunterBonus} dégâts !`);
        }
      }
      const atkBonus = cp.nextAttackBonus ?? 0;
      let dmg = effectiveRoll + baseStat + Math.floor(cp.stats.destin / 3) + hunterBonus + atkBonus;
      if (atkBonus > 0) addLog(`🥛 ${cp.name} bonus prochaine attaque : +${atkBonus} dégâts !`);
      if (card) {
        if (card.effect.special === 'crit_5_6' && effectiveRoll >= 5) dmg = Math.floor(dmg * 1.5);
        if (card.effect.special === 'double_on_6' && effectiveRoll === 6) dmg *= 2;
        if (card.effect.special === 'burn' && effectiveRoll >= 5) { dmg = Math.floor(dmg * 1.5); addLog(`🔥 Brûlure : dégâts amplifiés !`); }
        if (card.effect.special === 'aim' && !hasMoved) { dmg += 2; addLog(`🎯 Visée : +2 Force (immobile).`); }
      }
      if (!isMagic && cp.frenzied) { dmg *= 2; addLog(`🩸 Frénésie — attaque double !`); }
      const beerAttacks = cp.frenziedAttacks ?? 0;
      if (!isMagic && beerAttacks > 0) { dmg *= 2; addLog(`🍺 ${cp.name} (Bière de viking) ×2 ! (${beerAttacks} attaque(s) restante(s))`); }
      const piercedArmor = (card?.effect?.special === 'pierce_if_still' && !hasMoved) || card?.effect?.special === 'ignore_armor';
      // Imperissable: AOE immunity
      const isAoeAtk = card?.effect?.range === 'aoe1' || card?.effect?.range === 'aoe2';
      if (isAoeAtk && targetPlayerIdx >= 0 && players[targetPlayerIdx]?.spec?.passive === 'imperissable') {
        addLog(`💎 ${players[targetPlayerIdx].name} est immunisé aux dégâts de zone !`);
        setActionsLeft(prev => prev - 1);
        setPhase('player_turn');
        return;
      }

      if (targetPlayerIdx >= 0) {
        const target = players[targetPlayerIdx];
        // Passif Peluches : ne peut pas être attaqué de dos
        if (target.race?.passive === 'peluches' && target.facing) {
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
        const defense = piercedArmor ? 0 : Math.floor(target.stats.force / 3);
        if (piercedArmor) addLog(`🔰 Armure percée — défense de ${target.name} annulée !`);
        const isMagicAtk = card?.effect?.type === 'magic_attack';
        const rawActualDmg = Math.max(1, dmg - defense);
        const actualDmg = isMagicAtk ? rawActualDmg : physDmg(rawActualDmg, target);
        if (!isMagicAtk && target.physicalImmune) {
          addLog(`🪨 ${target.name} est immunisé aux dégâts physiques — attaque annulée !`);
        }
        // Voodoo reflect: defender can redirect damage if they have enough gold
        if (!isMagicAtk && target.spec?.passive === 'voodoo' && target.gold >= actualDmg) {
          setPendingVoodoo({ defenderIdx: targetPlayerIdx, attackerIdx: currentIdx, damage: actualDmg });
          setPhase('voodoo_reflect');
          addLog(`🧿 ${target.name} (Voodoo) peut renvoyer ${actualDmg} dégâts en dépensant ${actualDmg}💰 !`);
          setActionsLeft(prev => prev - 1);
          return;
        }
        addLog(`${cp.name} attaque ${target.name} : dé=${roll}, dégâts=${actualDmg}`);
        setPlayers(prev => {
          const next = [...prev];
          let t = { ...next[targetPlayerIdx] };
          const { player: tAfterAbsorb, remaining: remainingDmg } = absorbDamage(t, actualDmg);
          if (remainingDmg < actualDmg) addLog(`🔵 Bouclier Magique de ${t.name} absorbe ${actualDmg - remainingDmg} dégâts !`);
          t = tAfterAbsorb;
          t.hp = Math.max(0, t.hp - remainingDmg);
          if (t.hp <= 0) {
            if (t.spec?.passive === 'premier_soin' && !t.premierSoinUsed) {
              const reviveHp = rollDie();
              t = { ...t, hp: reviveHp, premierSoinUsed: true };
              addLog(`🩹 Premier Soin : ${t.name} réssucite avec ${reviveHp} PV !`);
            } else if (t.stats.destin > 0) {
              const keepGold = t.spec?.passive === 'nde' ? t.gold : 0;
              const keepHand = t.spec?.passive === 'nde' ? [...t.hand] : [];
              const reviveHp = t.spec?.passive === 'nde' ? rollDie() : t.maxHp;
              const newDeck = shuffleDeck([...FULL_DECK]);
              const livesLeft = t.stats.destin - 1;
              if (t.spec?.passive === 'nde') addLog(`💀 NDE : ${t.name} renaît avec ${reviveHp} PV, conserve or et main !`);
              t = { ...t, hp: reviveHp, x: t.baseX, y: t.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
              if (t.spec?.passive !== 'nde') addLog(`✨ ${next[targetPlayerIdx].name} renaît à sa base ! (${livesLeft} vie(s) restante(s))`);
            } else {
              t.isAlive = false;
              addLog(`💀 ${t.name} est définitivement éliminé !`);
            }
          }
          // Autodefense counter: if physical attack and target survived, counter-attack
          if (!isMagicAtk && t.hp > 0 && t.spec?.passive === 'autodefense') {
            const counterDmg = physDmg(Math.max(1, (t.stats.force ?? 1)), next[currentIdx]);
            addLog(`🥊 ${t.name} (Autodéfense) contre-attaque : ${counterDmg} dégâts !`);
            let attacker = { ...next[currentIdx] };
            attacker.hp = Math.max(0, attacker.hp - counterDmg);
            if (attacker.hp <= 0) {
              if (attacker.spec?.passive === 'premier_soin' && !attacker.premierSoinUsed) {
                const reviveHp = rollDie();
                attacker = { ...attacker, hp: reviveHp, premierSoinUsed: true };
                addLog(`🩹 Premier Soin : ${attacker.name} réssucite avec ${reviveHp} PV !`);
              } else if (attacker.stats.destin > 0) {
                const keepGold = attacker.spec?.passive === 'nde' ? attacker.gold : 0;
                const keepHand = attacker.spec?.passive === 'nde' ? [...attacker.hand] : [];
                const reviveHp = attacker.spec?.passive === 'nde' ? rollDie() : attacker.maxHp;
                const newDeck = shuffleDeck([...FULL_DECK]);
                attacker = { ...attacker, hp: reviveHp, x: attacker.baseX, y: attacker.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...attacker.stats, destin: attacker.stats.destin - 1 } };
              } else {
                attacker.isAlive = false; attacker.hp = 0;
              }
            }
            next[currentIdx] = attacker;
          }
          // Weapon special effects (only if target survived)
          if (t.isAlive) {
            if (card?.effect?.special === 'curse') {
              if (t.curseImmune) {
                addLog(`🥦 ${t.name} est immunisé contre la malédiction !`);
              } else {
                t = { ...t, cursed: true };
                addLog(`🌑 ${t.name} est maudit — dé impair sur son prochain déplacement = dégâts magiques !`);
              }
            }
            if (card?.effect?.special === 'stun_6' && effectiveRoll === 6) {
              if (t.equippedArmor?.effect?.special?.includes('no_stun')) {
                addLog(`⛑️ ${t.name} est immunisé à l'étourdissement (Casque de baseball) !`);
              } else {
                t = { ...t, stunned: true };
                addLog(`💫 ${t.name} est étourdi — passera son prochain tour !`);
              }
            }
            if (card?.effect?.special === 'disarm_6' && effectiveRoll === 6 && t.equippedWeapon) {
              addLog(`⛓️ ${t.name} est désarmé ! ${t.equippedWeapon.icon} ${t.equippedWeapon.name} défaussé.`);
              t = unequipCard(t, t.equippedWeapon);
              t = { ...t, equippedWeapon: null };
            }
            if (card?.effect?.special === 'slow_enemy') {
              t = { ...t, slowMalus: 4 };
              addLog(`❄️ ${t.name} est ralenti — -4 Déplacement à son prochain tour !`);
            }
            if (card?.effect?.special === 'push_enemy') {
              if (t.equippedArmor?.effect?.special?.includes('immune_forced_move')) {
                addLog(`🤿 ${t.name} est immunisé aux déplacements forcés (Scaphandrier) !`);
              } else {
              const pdx = t.x - cp.x, pdy = t.y - cp.y;
              const pnx = t.x + Math.sign(pdx !== 0 ? pdx : 0);
              const pny = t.y + Math.sign(pdy !== 0 ? pdy : (pdx === 0 ? 1 : 0));
              if (pnx >= 0 && pny >= 0 && pny < grid.length && pnx < grid[0].length && grid[pny][pnx] !== T.WALL) {
                t = { ...t, x: pnx, y: pny };
                addLog(`🏹 ${t.name} est repoussé d'une case !`);
              }
              }
            }
          }
          // Hunter streak update + consume attack buffs
          {
            let att = { ...next[currentIdx] };
            if (card?.effect?.special === 'hunter') {
              if (!t.isAlive) {
                att.hunterTarget = null; att.hunterStreak = 0;
              } else if (att.hunterTarget === targetPlayerIdx) {
                att.hunterStreak = Math.min(2, (att.hunterStreak ?? 0) + 1);
              } else {
                att.hunterStreak = 1; att.hunterTarget = targetPlayerIdx;
              }
            }
            att.nextAttackBonus = 0;
            if ((cp.frenziedAttacks ?? 0) > 0) att.frenziedAttacks = cp.frenziedAttacks - 1;
            next[currentIdx] = att;
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
        const mFirstAtk = monsterGoesFirst(cp, targetEnemy);
        const playerPowerAtk = (cp.stats.force ?? 0) + (cp.stats.magie ?? 0);
        addLog(mFirstAtk
          ? `⚠️ ${targetEnemy.name} a l'initiative — ATK ${targetEnemy.attack} > Force+Magie ${playerPowerAtk}`
          : `⚡ ${cp.name} a l'initiative — Force+Magie ${playerPowerAtk} ≥ ATK ${targetEnemy.attack}`);
        // Monster counter-attack if it goes first (and survives at least 1 round)
        if (mFirstAtk) {
          const counterDmg = physDmg(Math.max(1, targetEnemy.attack - Math.floor(cp.stats.force / 3)), cp);
          addLog(`💢 ${targetEnemy.name} contre-attaque : ${counterDmg} dégâts sur ${cp.name} !`);
          setPlayers(prev => {
            const next = [...prev];
            const p = { ...next[currentIdx] };
            p.hp = Math.max(0, p.hp - counterDmg);
            next[currentIdx] = p;
            return next;
          });
        }
        addLog(`${cp.name} attaque ${targetEnemy.name} : dé=${roll}, dégâts=${actualDmg}`);
        const newHp = targetEnemy.hp - actualDmg;
        if (newHp <= 0) {
          const goldRewardAtk = targetEnemy.attack ?? 1;
          const treasureCardAtk = drawFromTreasurePile(targetEnemy.pile);
          addLog(`✅ ${targetEnemy.name} est vaincu ! +${goldRewardAtk}💰${treasureCardAtk ? ` + ${treasureCardAtk.icon} ${treasureCardAtk.name}` : ''}`);
          setEnemies(prev => { const n = { ...prev }; delete n[key]; return n; });
          setPlayers(prev => {
            const next = [...prev];
            let np = { ...next[currentIdx] };
            const doubleGold = (np.goldDoubleRemaining ?? 0) > 0;
            np.gold = (np.gold ?? 0) + (doubleGold ? goldRewardAtk * 2 : goldRewardAtk);
            if (doubleGold) { np.goldDoubleRemaining--; addLog(`🥂 Champagne ! Or doublé : +${goldRewardAtk * 2}💰 (${np.goldDoubleRemaining} restant(s))`); }
            if (treasureCardAtk) np.hand = [...np.hand, treasureCardAtk];
            np.nextAttackBonus = 0;
            if ((cp.frenziedAttacks ?? 0) > 0) np.frenziedAttacks = cp.frenziedAttacks - 1;
            next[currentIdx] = np;
            return next;
          });
        } else {
          setPlayers(prev => {
            const next = [...prev];
            let np = { ...next[currentIdx] };
            np.nextAttackBonus = 0;
            if ((cp.frenziedAttacks ?? 0) > 0) np.frenziedAttacks = cp.frenziedAttacks - 1;
            next[currentIdx] = np;
            return next;
          });
          setEnemies(prev => ({ ...prev, [key]: { ...targetEnemy, hp: newHp } }));
        }
        setPhase('player_turn');
      } else {
        setPhase('player_turn');
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
      const isCurseShield = card.effect.special === 'curse_shield';
      setPlayers(prev => {
        const next = [...prev];
        const p = { ...next[currentIdx] };
        p.hp = Math.min(p.maxHp, p.hp + healAmt);
        p.cursed = false;
        if (isCurseShield) p.curseImmune = true;
        p.hand = p.hand.filter(c => c !== card);
        p.discard = [...p.discard, card];
        next[currentIdx] = p;
        return next;
      });
      addLog(`${cp.name} utilise ${card.icon} ${card.name} : +${healAmt} HP.${isCurseShield ? ' Immunisé contre les malédictions !' : ''}`);
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
      } else if (special === 'gold_1d6') {
        const goldGained = rollDie();
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.gold = (p.gold ?? 0) + goldGained;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`🍀 ${cp.name} utilise ${card.icon} ${card.name} : +${goldGained}💰 !`);
      } else if (special === 'celerite') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.tempDepBonus = (p.tempDepBonus ?? 0) + 3;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`⚡ ${cp.name} utilise ${card.icon} ${card.name} : +3 Déplacement ce tour !`);
      } else if (special === 'rage') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.frenzied = true;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`🩸 ${cp.name} entre en Frénésie : +6 Force, -3 Déplacement, attaque double ce tour !`);
      } else if (special === 'next_atk_bonus_3' || special === 'next_atk_bonus_6') {
        const bonus = special === 'next_atk_bonus_3' ? 3 : 6;
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.nextAttackBonus = (p.nextAttackBonus ?? 0) + bonus;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`${cp.name} utilise ${card.icon} ${card.name} : +${bonus} dégâts sur la prochaine attaque !`);
      } else if (special === 'next_move_bonus_3') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.tempDepBonus = (p.tempDepBonus ?? 0) + 3;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`${cp.name} utilise ${card.icon} ${card.name} : +3 Déplacement ce tour !`);
      } else if (special === 'temphp_curse_shield') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.tempHp = (p.tempHp ?? 0) + 12;
          p.curseImmune = true;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`${cp.name} utilise ${card.icon} ${card.name} : +12 PV temporaires + immunité malédiction !`);
      } else if (special === 'gold_double_3') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.goldDoubleRemaining = (p.goldDoubleRemaining ?? 0) + 3;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`🥂 ${cp.name} utilise ${card.icon} ${card.name} : les 3 prochains gains d'or seront doublés !`);
      } else if (special === 'frenzied_3') {
        setPlayers(prev => {
          const next = [...prev];
          const p = { ...next[currentIdx] };
          p.frenziedAttacks = (p.frenziedAttacks ?? 0) + 3;
          p.hand = p.hand.filter(c => c !== card);
          p.discard = [...p.discard, card];
          next[currentIdx] = p;
          return next;
        });
        addLog(`🍺 ${cp.name} utilise ${card.icon} ${card.name} : ×2 sur les 3 prochaines attaques physiques !`);
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
        p.slowMalus = 0;
        p.cursed = false;
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
            t = { ...t, hp: t.maxHp, x: t.baseX, y: t.baseY, gold: 0, hand: [], deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...t.stats, destin: livesLeft } };
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
        const goldRewardFou = targetEnemy.attack ?? 1;
        const treasureCardFou = drawFromTreasurePile(targetEnemy.pile);
        addLog(`✅ ${targetEnemy.name} est vaincu ! +${goldRewardFou}💰${treasureCardFou ? ` + ${treasureCardFou.icon} ${treasureCardFou.name}` : ''}`);
        setEnemies(prev => { const n = { ...prev }; delete n[key]; return n; });
        setPlayers(prev => {
          const next = [...prev];
          let np = { ...next[currentIdx] };
          const doubleGFou = (np.goldDoubleRemaining ?? 0) > 0;
          np.gold = (np.gold ?? 0) + (doubleGFou ? goldRewardFou * 2 : goldRewardFou);
          if (doubleGFou) { np.goldDoubleRemaining--; addLog(`🥂 Champagne ! Or doublé (${np.goldDoubleRemaining} restant(s))`); }
          if (treasureCardFou) np.hand = [...np.hand, treasureCardFou];
          next[currentIdx] = np;
          return next;
        });
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
      p.cursed = false;
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
    const maxScrolls = cp.equippedArmor?.effect?.special?.includes('extra_scroll') ? 2 : 1;
    if ((cp.scrollsUsedThisTurn ?? 0) >= maxScrolls) {
      addLog(`❌ ${cp.name} a déjà utilisé ${maxScrolls} parchemin(s) ce tour.`);
      return;
    }
    const card = cp.readyScroll;
    const isFreeze = card.effect.special === 'freeze';
    const isShield = card.effect.special === 'shield10';
    const isSummon = card.effect.special === 'summon';
    addLog(`📜 ${cp.name} lance ${card.icon} ${card.name}${card.effect.bonus > 0 ? ` : ${card.effect.bonus} dégâts magiques !` : ' !'}`);

    if (isSummon) {
      // Check for adjacent free tile
      let hasAdj = false;
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = cp.x + dx, ny = cp.y + dy;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        if (grid[ny][nx] === T.WALL) continue;
        const k = `${nx},${ny}`;
        if (!enemies[k] && !players.some(p => p.isAlive && p.x === nx && p.y === ny)) { hasAdj = true; break; }
      }
      if (!hasAdj) {
        addLog(`⛰️ Pas de case libre adjacente pour invoquer un Golem !`);
        return;
      }
      setPlayers(prev => {
        const next = [...prev];
        const p = next[currentIdx];
        next[currentIdx] = { ...p, readyScroll: null, discard: [...p.discard, card], lastScroll: card, scrollsUsedThisTurn: (p.scrollsUsedThisTurn ?? 0) + 1 };
        return next;
      });
      setActionsLeft(prev => prev - 1);
      setPhase('choosing_golem');
      return;
    }

    setPlayers(prev => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], readyScroll: null, discard: [...next[currentIdx].discard, card], lastScroll: card, scrollsUsedThisTurn: (next[currentIdx].scrollsUsedThisTurn ?? 0) + 1 };
      if (isFreeze) {
        const caster = next[currentIdx];
        for (let i = 0; i < next.length; i++) {
          if (i === currentIdx || !next[i].isAlive) continue;
          const p = next[i];
          if (Math.abs(p.x - caster.x) + Math.abs(p.y - caster.y) <= 2) {
            next[i] = { ...p, slowMalus: 4 };
            addLog(`❄️ ${p.name} est gelé — -4 Déplacement à son prochain tour !`);
          }
        }
      }
      if (isShield) {
        next[currentIdx] = { ...next[currentIdx], tempHp: (next[currentIdx].tempHp ?? 0) + 18 };
        addLog(`🔵 ${cp.name} gagne 18 PV temporaires !`);
      }
      return next;
    });
    setActionsLeft(prev => prev - 1);
  }, [actionsLeft, currentIdx, players, enemies, grid]);

  // Messager: fight the monster on current tile
  const messagerFight = useCallback(() => {
    if (phase !== 'messager_monster') return;
    const pm = pendingMessager;
    if (!pm || pm.type !== 'monster') return;
    setPendingMessager(null);
    const cp = players[currentIdx];
    const { destKey, monsterThere, finalX, finalY, budgetHere, newFacing, crossedIdxs } = pm;
    let damageTakenThisMove = pm.damageTakenThisMove ?? 0;
    let turnEnded = false;

    const roll = rollDie();
    const pDmg = Math.max(1, roll + cp.stats.force + Math.floor(cp.stats.richesse / 2) - monsterThere.defense);
    const mDmg = Math.max(1, monsterThere.attack - Math.floor(cp.stats.force / 3));
    const rounds = Math.ceil(monsterThere.maxHp / pDmg);
    const mFirst = monsterGoesFirst(cp, monsterThere);
    const rawDmgTaken = mFirst ? rounds * mDmg : Math.max(0, (rounds - 1) * mDmg);
    const dmgTaken = physDmg(rawDmgTaken, cp);
    const won = cp.physicalImmune || cp.hp - dmgTaken > 0;
    const goldReward = won ? (monsterThere.attack ?? 1) : 0;
    const treasureCard = won ? drawFromTreasurePile(monsterThere.pile) : null;
    const playerPower = (cp.stats.force ?? 0) + (cp.stats.magie ?? 0);
    addLog(`⚔️ ${cp.name} affronte ${monsterThere.icon} ${monsterThere.name} (pile ${monsterThere.pile}) ! (dé:${roll})`);
    addLog(mFirst
      ? `⚠️ ${monsterThere.name} a l'initiative — ATK ${monsterThere.attack} > Force+Magie ${playerPower}`
      : `⚡ ${cp.name} a l'initiative — Force+Magie ${playerPower} ≥ ATK ${monsterThere.attack}`);
    if (won) {
      if (monsterThere.pile === 1) {
        const p2 = MONSTER_PILE_2[Math.floor(Math.random() * MONSTER_PILE_2.length)];
        setEnemies(prev => ({ ...prev, [destKey]: { ...p2, hp: p2.maxHp } }));
        addLog(`💀 ${monsterThere.name} vaincu — un ${p2.icon} ${p2.name} surgit !`);
      } else if (monsterThere.pile === 2) {
        const p3 = MONSTER_PILE_3[Math.floor(Math.random() * MONSTER_PILE_3.length)];
        setEnemies(prev => ({ ...prev, [destKey]: { ...p3, hp: p3.maxHp } }));
        addLog(`💀 ${monsterThere.name} vaincu — un ${p3.icon} ${p3.name} surgit !`);
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
        if (np.hp <= 0 && np.spec?.passive === 'premier_soin' && !np.premierSoinUsed) {
          const reviveHp = rollDie();
          np = { ...np, hp: reviveHp, premierSoinUsed: true };
          addLog(`🩹 Premier Soin : ${np.name} réssucite avec ${reviveHp} PV !`);
        } else if (np.stats.destin > 0) {
          const keepGold = np.spec?.passive === 'nde' ? np.gold : 0;
          const keepHand = np.spec?.passive === 'nde' ? [...np.hand] : [];
          const reviveHp = np.spec?.passive === 'nde' ? rollDie() : np.maxHp;
          const newDeck = shuffleDeck([...FULL_DECK]);
          if (np.spec?.passive === 'nde') addLog(`💀 NDE : ${np.name} renaît avec ${reviveHp} PV, conserve or et main !`);
          np = { ...np, hp: reviveHp, x: np.baseX, y: np.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...np.stats, destin: np.stats.destin - 1 } };
        } else {
          np.isAlive = false; np.hp = 0;
        }
      }
      if (won) {
        np = { ...np, gold: (np.gold ?? 0) + goldReward };
        if (treasureCard) np = { ...np, hand: [...np.hand, treasureCard] };
      }
      return np;
    });
    damageTakenThisMove += dmgTaken;
    setPlayers(nextPlayers);
    if (won) {
      addLog(`✅ ${monsterThere.name} vaincu ! -${dmgTaken} PV, +${goldReward}💰${treasureCard ? ` + ${treasureCard.icon} ${treasureCard.name}` : ''}`);
    } else if (nextPlayers[currentIdx].isAlive) {
      addLog(`✨ ${cp.name} renaît à sa base ! (${nextPlayers[currentIdx].stats.destin} vie(s) restante(s))`);
      let ni = (currentIdx + 1) % nextPlayers.length;
      while (!nextPlayers[ni]?.isAlive) ni = (ni + 1) % nextPlayers.length;
      setCurrentIdx(ni); setActionsLeft(0); setHasMoved(false); setPhase('draw');
      addLog(`--- Tour de ${nextPlayers[ni].name} ---`);
      turnEnded = true;
    } else {
      addLog(`💀 ${cp.name} est définitivement tué par ${monsterThere.name} !`);
      const alive = nextPlayers.filter(p => p.isAlive);
      if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
      else {
        let ni = (currentIdx + 1) % nextPlayers.length;
        while (!nextPlayers[ni]?.isAlive) ni = (ni + 1) % nextPlayers.length;
        setCurrentIdx(ni); setActionsLeft(0); setHasMoved(false); setPhase('draw');
        addLog(`--- Tour de ${nextPlayers[ni].name} ---`);
      }
      turnEnded = true;
    }
    if (!turnEnded) {
      if (crossedIdxs && crossedIdxs.length > 0) {
        setPendingMessager({ type: 'exchange', crossedPlayerIdx: crossedIdxs[0], finalX, finalY, budgetHere, newFacing, damageTakenThisMove });
        setPhase('messager_exchange');
        addLog(`📨 ${cp.name} croise ${players[crossedIdxs[0]].name} — échange de carte ?`);
        return;
      }
      const hasLongsBras = players[currentIdx]?.race?.passive === 'longs_bras';
      if (hasLongsBras) {
        const adjKeys = [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy]) => `${finalX+dx},${finalY+dy}`);
        const adjTargets = adjKeys.filter(k => enemies[k] || traps[k] || chests[k]);
        if (adjTargets.length > 0) { setHighlightTiles(adjTargets); setPhase('longs_bras_passive'); addLog(`🦾 Passif Longs Bras : choisissez une case adjacente.`); return; }
      }
      setPhase('player_turn');
    }
  }, [phase, pendingMessager, currentIdx, players, enemies, traps, chests, prisons, grid, highlightTiles]);

  // Messager: skip the monster on current tile
  const messagerSkip = useCallback(() => {
    if (phase !== 'messager_monster') return;
    const pm = pendingMessager;
    if (!pm || pm.type !== 'monster') return;
    setPendingMessager(null);
    const cp = players[currentIdx];
    const { monsterThere, finalX, finalY, budgetHere, newFacing, crossedIdxs } = pm;
    addLog(`📨 ${cp.name} passe à travers ${monsterThere.icon} ${monsterThere.name} sans combattre.`);
    if (crossedIdxs && crossedIdxs.length > 0) {
      setPendingMessager({ type: 'exchange', crossedPlayerIdx: crossedIdxs[0], finalX, finalY, budgetHere, newFacing, damageTakenThisMove: 0 });
      setPhase('messager_exchange');
      addLog(`📨 ${cp.name} croise ${players[crossedIdxs[0]].name} — échange de carte ?`);
      return;
    }
    const hasLongsBras = cp.race?.passive === 'longs_bras';
    if (hasLongsBras) {
      const adjKeys = [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy]) => `${finalX+dx},${finalY+dy}`);
      const adjTargets = adjKeys.filter(k => enemies[k] || traps[k] || chests[k]);
      if (adjTargets.length > 0) { setHighlightTiles(adjTargets); setPhase('longs_bras_passive'); addLog(`🦾 Passif Longs Bras : choisissez une case adjacente.`); return; }
    }
    setPhase('player_turn');
  }, [phase, pendingMessager, currentIdx, players, enemies, traps, chests, grid]);

  // Messager: accept random card exchange with crossed player
  const messagerAcceptExchange = useCallback(() => {
    if (phase !== 'messager_exchange') return;
    const pm = pendingMessager;
    if (!pm || pm.type !== 'exchange') return;
    const { crossedPlayerIdx, finalX, finalY, budgetHere, newFacing, damageTakenThisMove } = pm;
    setPendingMessager(null);
    const cp = players[currentIdx];
    const target = players[crossedPlayerIdx];
    if (target && target.hand.length > 0 && cp.hand.length > 0) {
      const myIdx = Math.floor(Math.random() * cp.hand.length);
      const theirIdx = Math.floor(Math.random() * target.hand.length);
      const myCard = cp.hand[myIdx];
      const theirCard = target.hand[theirIdx];
      setPlayers(prev => {
        const next = [...prev];
        const me = { ...next[currentIdx], hand: [...next[currentIdx].hand] };
        const them = { ...next[crossedPlayerIdx], hand: [...next[crossedPlayerIdx].hand] };
        me.hand[myIdx] = theirCard;
        them.hand[theirIdx] = myCard;
        next[currentIdx] = me;
        next[crossedPlayerIdx] = them;
        return next;
      });
      addLog(`📨 ${cp.name} échange ${myCard.icon} contre ${theirCard.icon} ${theirCard.name} (${target.name}) !`);
    } else {
      addLog(`📨 Pas de cartes à échanger.`);
    }
    const hasLongsBras = players[currentIdx]?.race?.passive === 'longs_bras';
    if (hasLongsBras) {
      const adjKeys = [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy]) => `${finalX+dx},${finalY+dy}`);
      const adjTargets = adjKeys.filter(k => enemies[k] || traps[k] || chests[k]);
      if (adjTargets.length > 0) { setHighlightTiles(adjTargets); setPhase('longs_bras_passive'); addLog(`🦾 Passif Longs Bras : choisissez une case adjacente.`); return; }
    }
    setPhase('player_turn');
  }, [phase, pendingMessager, currentIdx, players, enemies, traps, chests, grid]);

  // Messager: decline the card exchange
  const messagerDeclineExchange = useCallback(() => {
    if (phase !== 'messager_exchange') return;
    const pm = pendingMessager;
    if (!pm || pm.type !== 'exchange') return;
    const { finalX, finalY, budgetHere, newFacing } = pm;
    setPendingMessager(null);
    addLog(`📨 ${players[currentIdx].name} refuse l'échange.`);
    const hasLongsBras = players[currentIdx]?.race?.passive === 'longs_bras';
    if (hasLongsBras) {
      const adjKeys = [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy]) => `${finalX+dx},${finalY+dy}`);
      const adjTargets = adjKeys.filter(k => enemies[k] || traps[k] || chests[k]);
      if (adjTargets.length > 0) { setHighlightTiles(adjTargets); setPhase('longs_bras_passive'); addLog(`🦾 Passif Longs Bras : choisissez une case adjacente.`); return; }
    }
    setPhase('player_turn');
  }, [phase, pendingMessager, currentIdx, players, enemies, traps, chests, grid]);

  // Voodoo: defender spends gold equal to damage, attacker takes that damage instead
  const voodooReflect = useCallback(() => {
    if (phase !== 'voodoo_reflect') return;
    const { defenderIdx, attackerIdx, damage } = pendingVoodoo;
    setPendingVoodoo(null);
    addLog(`🧿 ${players[defenderIdx].name} renvoie ${damage} dégâts à ${players[attackerIdx].name} !`);
    setPlayers(prev => {
      const next = [...prev];
      const defender = { ...next[defenderIdx] };
      let attacker = { ...next[attackerIdx] };
      defender.gold = Math.max(0, defender.gold - damage);
      attacker.hp = Math.max(0, attacker.hp - damage);
      if (attacker.hp <= 0) {
        if (attacker.spec?.passive === 'premier_soin' && !attacker.premierSoinUsed) {
          const reviveHp = rollDie();
          attacker = { ...attacker, hp: reviveHp, premierSoinUsed: true };
          addLog(`🩹 Premier Soin : ${attacker.name} réssucite avec ${reviveHp} PV !`);
        } else if (attacker.stats.destin > 0) {
          const keepGold = attacker.spec?.passive === 'nde' ? attacker.gold : 0;
          const keepHand = attacker.spec?.passive === 'nde' ? [...attacker.hand] : [];
          const reviveHp = attacker.spec?.passive === 'nde' ? rollDie() : attacker.maxHp;
          const newDeck = shuffleDeck([...FULL_DECK]);
          attacker = { ...attacker, hp: reviveHp, x: attacker.baseX, y: attacker.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...attacker.stats, destin: attacker.stats.destin - 1 } };
          addLog(`✨ ${players[attackerIdx].name} renaît à sa base !`);
        } else {
          attacker.isAlive = false; attacker.hp = 0;
          addLog(`💀 ${players[attackerIdx].name} est éliminé !`);
        }
      }
      next[attackerIdx] = attacker;
      next[defenderIdx] = defender;
      const alive = next.filter(p => p.isAlive);
      if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
      else setPhase('player_turn');
      return next;
    });
  }, [phase, pendingVoodoo, players]);

  // Voodoo: take the damage normally
  const voodooSkip = useCallback(() => {
    if (phase !== 'voodoo_reflect') return;
    const { defenderIdx, damage } = pendingVoodoo;
    setPendingVoodoo(null);
    addLog(`🧿 ${players[defenderIdx].name} absorbe les dégâts.`);
    setPlayers(prev => {
      const next = [...prev];
      let defender = { ...next[defenderIdx] };
      defender.hp = Math.max(0, defender.hp - damage);
      if (defender.hp <= 0) {
        if (defender.spec?.passive === 'premier_soin' && !defender.premierSoinUsed) {
          const reviveHp = rollDie();
          defender = { ...defender, hp: reviveHp, premierSoinUsed: true };
          addLog(`🩹 Premier Soin : ${defender.name} réssucite avec ${reviveHp} PV !`);
        } else if (defender.stats.destin > 0) {
          const keepGold = defender.spec?.passive === 'nde' ? defender.gold : 0;
          const keepHand = defender.spec?.passive === 'nde' ? [...defender.hand] : [];
          const reviveHp = defender.spec?.passive === 'nde' ? rollDie() : defender.maxHp;
          const newDeck = shuffleDeck([...FULL_DECK]);
          defender = { ...defender, hp: reviveHp, x: defender.baseX, y: defender.baseY, gold: keepGold, hand: keepHand, deck: newDeck, discard: [], inventory: [], readyScroll: null, equippedWeapon: null, equippedArmor: null, facing: null, stats: { ...defender.stats, destin: defender.stats.destin - 1 } };
          addLog(`✨ ${players[defenderIdx].name} renaît à sa base !`);
        } else {
          defender.isAlive = false; defender.hp = 0;
          addLog(`💀 ${players[defenderIdx].name} est éliminé !`);
        }
      }
      next[defenderIdx] = defender;
      const alive = next.filter(p => p.isAlive);
      if (alive.length === 1) { setWinner(alive[0]); setPhase('win'); }
      else setPhase('player_turn');
      return next;
    });
  }, [phase, pendingVoodoo, players]);

  // Voyage Astral: use move action to select and teleport a monster
  const startVoyageAstral = useCallback(() => {
    if (actionsLeft < 1 || hasMoved) return;
    const cp = players[currentIdx];
    if (cp.spec?.passive !== 'voyage_astral') return;
    const monsterTiles = Object.keys(enemies);
    if (monsterTiles.length === 0) { addLog(`🌌 Aucun monstre à déplacer.`); return; }
    setHighlightTiles(monsterTiles);
    setPhase('voyage_astral_select');
    addLog(`🌌 ${cp.name} — Voyage Astral : choisissez un monstre à déplacer.`);
  }, [actionsLeft, hasMoved, currentIdx, players, enemies]);

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

  // Secrétariat: adjust movement roll by ±1
  const secretariatAdjustMove = useCallback((delta) => {
    if (phase !== 'secretariat_move_choice') return;
    const cp = players[currentIdx];
    const { roll, wallPass, depBonus } = pendingMoveRoll;
    const finalRange = Math.max(0, roll + depBonus + delta);
    setPendingMoveRoll(null);
    addLog(`📋 ${cp.name} (Secrétariat) ajuste son déplacement${delta !== 0 ? ` de ${delta > 0 ? '+' : ''}${delta}` : ''} = ${finalRange} case(s).`);
    const hasPeluches = cp.race?.passive === 'peluches';
    const { tiles, budgetAtTile } = runMoveDijkstra(cp.x, cp.y, finalRange, cp.facing, wallPass, hasPeluches, grid, getBlockedTiles(players, currentIdx));
    const otherBases = new Set(players.filter((p, i) => i !== currentIdx && p.isAlive).map(p => `${p.baseX},${p.baseY}`));
    setTilesBudget(budgetAtTile);
    setHighlightTiles(tiles.filter(t => !otherBases.has(t)));
    setPhase('choosing_move');
  }, [phase, currentIdx, players, pendingMoveRoll, grid]);

  // Summon a Golem at an adjacent free tile
  const summonGolem = useCallback((level) => {
    if (phase !== 'choosing_golem') return;
    const cp = players[currentIdx];
    const golemData = GOLEMS[level];
    if (!golemData) return;
    if ((cp.stats.magie ?? 0) < level) {
      addLog(`❌ Magie insuffisante pour ce niveau (requis : ${level}, actuel : ${cp.stats.magie}).`);
      return;
    }
    const adjTiles = [];
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = cp.x + dx, ny = cp.y + dy;
      if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
      if (grid[ny][nx] === T.WALL) continue;
      const k = `${nx},${ny}`;
      if (!enemies[k] && !players.some(p => p.isAlive && p.x === nx && p.y === ny)) adjTiles.push(k);
    }
    if (adjTiles.length === 0) {
      addLog(`⛰️ Pas de case libre adjacente !`);
      setPendingGolem(null);
      setPhase('player_turn');
      return;
    }
    const targetKey = adjTiles[0];
    const [gx, gy] = targetKey.split(',').map(Number);
    const golem = { ...golemData, hp: golemData.maxHp, ownerIdx: currentIdx };
    setEnemies(prev => ({ ...prev, [targetKey]: golem }));
    setPendingGolem(null);
    addLog(`⛰️ ${cp.name} invoque un ${golemData.icon} ${golemData.name} en (${gx},${gy}) ! (PV:${golemData.maxHp}, F:${golemData.attack})`);
    setPhase('player_turn');
  }, [phase, currentIdx, players, grid, enemies]);

  // Couponing shop: buy a card from the offer
  const couponingBuy = useCallback((cardIndex) => {
    if (phase !== 'shop_couponing' || !pendingShopOffer) return;
    const { cards, boughtCount } = pendingShopOffer;
    if (cardIndex < 0 || cardIndex >= cards.length) return;
    const c = cards[cardIndex];
    const cp = players[currentIdx];
    const cost = boughtCount === 0 ? 1 : (c.goldValue ?? 2);
    if ((cp.gold ?? 0) < cost) {
      addLog(`❌ ${cp.name} n'a pas assez d'or (requis : ${cost}💰, disponible : ${cp.gold ?? 0}💰).`);
      return;
    }
    addLog(`🏷️ ${cp.name} achète ${c.icon} ${c.name} pour ${cost}💰.`);
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      p.gold = (p.gold ?? 0) - cost;
      p.hand = [...p.hand, c];
      next[currentIdx] = p;
      return next;
    });
    const remaining = cards.filter((_, i) => i !== cardIndex);
    if (boughtCount >= 1 || remaining.length === 0) {
      setPlayers(prev => {
        const next = [...prev];
        const p = { ...next[currentIdx] };
        p.discard = [...p.discard, ...remaining];
        next[currentIdx] = p;
        return next;
      });
      setPendingShopOffer(null);
      setPhase('player_turn');
    } else {
      setPendingShopOffer({ cards: remaining, boughtCount: 1 });
      addLog(`🏪 Choisissez un deuxième article au prix normal.`);
    }
  }, [phase, pendingShopOffer, currentIdx, players]);

  const couponingSkipShop = useCallback(() => {
    if (phase !== 'shop_couponing' || !pendingShopOffer) return;
    const cp = players[currentIdx];
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      p.discard = [...p.discard, ...pendingShopOffer.cards];
      next[currentIdx] = p;
      return next;
    });
    setPendingShopOffer(null);
    setPhase('player_turn');
    addLog(`🏪 ${cp.name} quitte le magasin.`);
  }, [phase, pendingShopOffer, currentIdx, players]);

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
    enemies,
    traps,
    chests,
    prisons,
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
    confirmMoveBonus,
    touffusBonusAction,
    touffusContinueMove,
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
    messagerFight,
    messagerSkip,
    messagerAcceptExchange,
    messagerDeclineExchange,
    pendingMessager,
    pendingAutodefense,
    pendingVoodoo,
    pendingVoyageAstral,
    pendingMoveRoll,
    pendingGolem,
    pendingShopOffer,
    secretariatAdjustMove,
    summonGolem,
    couponingBuy,
    couponingSkipShop,
    prisonPayGold,
    skipPrisonSwap,
    wikiSwapStats,
    skipPassive,
    skipPortalChoice,
    useItem,
    endTurn,
    winner,
    isEquippable,
    isUsable,
    voodooReflect,
    voodooSkip,
    startVoyageAstral,
  };
}
