import { useState, useCallback } from 'react';
import { FULL_DECK, shuffleDeck } from '../data/cards';
import { MULTIPLAYER_MAPS } from '../data/multiplayerMaps';
import { T } from '../data/map';

const HAND_LIMIT = 5;
const PLAYER_COLORS = ['#ff4444', '#44aaff', '#44ff88', '#ffcc00', '#ff88ff', '#ff8844'];

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function buildPlayer(charData, index, mapData) {
  const stats = charData.stats ?? { force: 3, magie: 2, vie: 5, deplacement: 3, chance: 1, destin: 1 };
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
    hp: maxHp,
    maxHp,
    stats: { ...stats },
    inventory: [],
    hand: [],
    deck,
    discard: [],
    isAlive: true,
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

export function useGameState(characters) {
  const [mapData] = useState(() => MULTIPLAYER_MAPS[Math.floor(Math.random() * MULTIPLAYER_MAPS.length)]);
  const [mapName] = useState(() => mapData.name);
  const [grid] = useState(() => mapData.grid.map(r => [...r]));
  const [enemies, setEnemies] = useState({});

  const [players, setPlayers] = useState(() =>
    (characters ?? []).map((ch, i) => buildPlayer(ch, i, mapData))
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [actionsLeft, setActionsLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [phase, setPhase] = useState('draw');
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
    setPlayers(prev => {
      const next = [...prev];
      const p = { ...next[currentIdx] };
      const needed = HAND_LIMIT - p.hand.length;
      if (needed > 0) {
        let deck = [...p.deck];
        let discard = [...p.discard];
        if (deck.length < needed) {
          deck = [...deck, ...shuffleDeck(discard)];
          discard = [];
        }
        const drawn = deck.splice(0, needed);
        p.hand = [...p.hand, ...drawn];
        p.deck = deck;
        p.discard = discard;
        addLog(`${p.name} tire ${drawn.length} carte(s).`);
      }
      next[currentIdx] = p;
      return next;
    });
    setActionsLeft(players[currentIdx]?.stats?.deplacement ?? 3);
    setHasMoved(false);
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
    animateRoll((roll) => {
      const moveBonus = (card?.effect?.type === 'move') ? (card.effect.bonus ?? 0) : 0;
      const range = roll + moveBonus;
      addLog(`${currentPlayer.name} lance le dé : ${roll}${moveBonus > 0 ? ` +${moveBonus}` : ''} = ${range} cases.`);
      const tiles = [];
      const cp = players[currentIdx];
      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          if (Math.abs(dx) + Math.abs(dy) > range) continue;
          if (dx === 0 && dy === 0) continue;
          const nx = cp.x + dx;
          const ny = cp.y + dy;
          if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
          if (grid[ny][nx] === T.WALL) continue;
          tiles.push(`${nx},${ny}`);
        }
      }
      setHighlightTiles(tiles);
      setPhase('choosing_move');
    });
  }, [actionsLeft, hasMoved, selectedCard, currentIdx, players, grid]);

  // Complete the move
  const moveToTile = useCallback((tx, ty) => {
    if (phase !== 'choosing_move' && phase !== 'choosing_attack') return;

    if (phase === 'choosing_move') {
      const key = `${tx},${ty}`;
      if (!highlightTiles.includes(key)) return;
      setHighlightTiles([]);
      setHasMoved(true);
      setActionsLeft(prev => prev - 1);
      setPlayers(prev => {
        const next = [...prev];
        next[currentIdx] = { ...next[currentIdx], x: tx, y: ty };
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
      addLog(`${currentPlayer.name} se déplace en (${tx}, ${ty}).`);
      setPhase('player_turn');
    } else if (phase === 'choosing_attack') {
      attackTile(tx, ty);
    }
  }, [phase, highlightTiles, currentIdx, selectedCard, currentPlayer]);

  // Show attack targets (adjacent players and enemies)
  const showAttackTargets = useCallback(() => {
    if (actionsLeft < 1) return;
    const cp = players[currentIdx];
    // Check range from selected weapon card
    let range = 1;
    if (selectedCard?.effect?.special) {
      const sp = selectedCard.effect.special;
      const rangeMatch = sp.match(/range(\d+)/);
      if (rangeMatch) range = parseInt(rangeMatch[1]);
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
      const chanceBonus = Math.floor(cp.stats.chance / 2);
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
        const defense = Math.floor(target.stats.force / 3);
        const actualDmg = Math.max(1, dmg - defense);
        addLog(`${cp.name} attaque ${target.name} : dé=${roll}, dégâts=${actualDmg}`);
        setPlayers(prev => {
          const next = [...prev];
          const t = { ...next[targetPlayerIdx] };
          t.hp = Math.max(0, t.hp - actualDmg);
          if (t.hp <= 0) {
            t.isAlive = false;
            addLog(`💀 ${t.name} est éliminé !`);
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

    if (card.effect.type === 'heal') {
      const healAmt = card.effect.bonus + Math.floor(cp.stats.magie / 2);
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
      const dmg = card.effect.bonus + Math.floor(cp.stats.magie / 2);
      addLog(`${cp.name} lance ${card.icon} ${card.name} : ${dmg} dégâts magiques !`);
      setPlayers(prev => {
        const next = [...prev];
        const p = { ...next[currentIdx] };
        p.hand = p.hand.filter(c => c !== card);
        p.discard = [...p.discard, card];
        next[currentIdx] = p;
        return next;
      });
    }

    setSelectedCard(null);
    setActionsLeft(prev => prev - 1);
  }, [selectedCard, currentIdx, players]);

  // End turn — advance to next living player
  const endTurn = useCallback(() => {
    let next = currentIdx;
    let attempts = 0;
    do {
      next = (next + 1) % players.length;
      attempts++;
    } while (!players[next].isAlive && attempts < players.length);

    setCurrentIdx(next);
    setActionsLeft(0);
    setHasMoved(false);
    setSelectedCard(null);
    setHighlightTiles([]);
    setPhase('draw');
    addLog(`--- Tour de ${players[next].name} ---`);
  }, [currentIdx, players]);

  return {
    players,
    currentIdx,
    currentPlayer,
    grid,
    enemies,
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
    moveToTile,
    showAttackTargets,
    attackTile,
    useItem,
    endTurn,
    winner,
    isEquippable,
    isUsable,
  };
}
