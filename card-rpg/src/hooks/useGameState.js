import { useState, useCallback } from 'react';
import { DECK, shuffleDeck } from '../data/cards';
import { MAPS, T, ITEMS, ENEMIES } from '../data/map';

const HAND_SIZE = 4;
const MOVE_RANGE = 3; // highlight tiles within this range

function randomEnemy() {
  const pool = ENEMIES.slice(0, 4);
  const e = pool[Math.floor(Math.random() * pool.length)];
  return { ...e, maxHp: e.hp, id: Math.random() };
}

function buildEnemyMap(grid) {
  const enemies = {};
  grid.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === T.ENEMY) enemies[`${x},${y}`] = randomEnemy();
  }));
  return enemies;
}

function buildItemMap(grid) {
  const items = {};
  grid.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === T.ITEM || cell === T.CHEST) {
      const pool = cell === T.CHEST ? ITEMS.slice(0, 4) : ITEMS;
      items[`${x},${y}`] = { ...pool[Math.floor(Math.random() * pool.length)], isChest: cell === T.CHEST };
    }
  }));
  return items;
}

const initPlayer = () => {
  const vie = 5;
  return {
    x: 1, y: 1,
    hp: 20 + vie * 2, maxHp: 20 + vie * 2,
    xp: 0, level: 1,
    stats: {
      force:       3,  // dégâts physiques + résistance
      magie:       2,  // dégâts magiques + soins amplifiés
      vie:         vie, // points de vie max (maxHp = 20 + vie*2)
      deplacement: 3,  // cases de mouvement par tour
      chance:      1,  // bonus aux jets de dé
      destin:      1,  // cartes supplémentaires + effets critiques
    },
    inventory: [],
  };
};

export function useGameState() {
  const [mapIndex, setMapIndex] = useState(0);
  const mapData = MAPS[mapIndex];

  const [player, setPlayer] = useState(() => ({
    ...initPlayer(),
    x: mapData.playerStart.x,
    y: mapData.playerStart.y,
  }));

  const [grid, setGrid] = useState(() => mapData.grid.map(r => [...r]));
  const [enemies, setEnemies] = useState(() => buildEnemyMap(mapData.grid));
  const [itemMap, setItemMap] = useState(() => buildItemMap(mapData.grid));

  const [deck, setDeck] = useState(() => shuffleDeck(DECK));
  const [hand, setHand] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  const [phase, setPhase] = useState('draw'); // draw | action | move | combat | roll | enemy | result | gameover | win
  const [diceResult, setDiceResult] = useState(null);
  const [log, setLog] = useState(['Bienvenue dans le Donjon !', 'Tirez des cartes pour commencer.']);
  const [combat, setCombat] = useState(null); // { enemy, pos }
  const [highlightTiles, setHighlightTiles] = useState([]);
  const [rolling, setRolling] = useState(false);

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 20));

  // Draw cards up to hand size
  const drawCards = useCallback(() => {
    setHand(prev => {
      const needed = HAND_SIZE - prev.length;
      if (needed <= 0) return prev;
      let d = [...deck];
      let disc = [...discard];
      if (d.length < needed) {
        d = [...d, ...shuffleDeck(disc)];
        disc = [];
        setDiscard([]);
      }
      const drawn = d.splice(0, needed);
      setDeck(d);
      addLog(`Vous tirez ${drawn.length} carte(s).`);
      return [...prev, ...drawn];
    });
    setPhase('action');
  }, [deck, discard]);

  // Highlight reachable tiles for movement
  const showMoveRange = useCallback((card) => {
    const range = player.stats.deplacement + (card?.effect?.type === 'move' ? card.effect.bonus : 0);
    const tiles = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = player.x + dx, ny = player.y + dy;
        if (Math.abs(dx) + Math.abs(dy) > range) continue;
        if (nx < 0 || ny < 0 || ny >= grid.length || nx >= grid[0].length) continue;
        const cell = grid[ny][nx];
        if (cell !== T.WALL && !(dx === 0 && dy === 0)) {
          tiles.push(`${nx},${ny}`);
        }
      }
    }
    setHighlightTiles(tiles);
  }, [player, grid]);

  const selectCard = useCallback((card) => {
    setSelectedCard(card);
    if (card.effect.type === 'move') {
      showMoveRange(card);
      setPhase('move');
    }
  }, [showMoveRange]);

  const rollDie = () => Math.floor(Math.random() * 6) + 1;

  // Animate dice roll
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

  // Move action
  const moveToTile = useCallback((tx, ty) => {
    if (phase !== 'move') return;
    const key = `${tx},${ty}`;
    if (!highlightTiles.includes(key)) return;

    setHighlightTiles([]);

    if (enemies[key]) {
      setCombat({ enemy: enemies[key], pos: { x: tx, y: ty } });
      setPhase('combat');
      addLog(`Vous rencontrez ${enemies[key].name} !`);
      return;
    }

    if (itemMap[key]) {
      const item = itemMap[key];
      setPlayer(p => {
        if (item.stat === 'hp') {
          return { ...p, x: tx, y: ty, hp: Math.min(p.maxHp, p.hp + item.bonus), inventory: [...p.inventory, item] };
        }
        const newStats = { ...p.stats };
        if (newStats[item.stat] !== undefined) newStats[item.stat] += item.bonus;
        // vie augmente aussi maxHp
        const newMaxHp = item.stat === 'vie' ? p.maxHp + item.bonus * 2 : p.maxHp;
        return { ...p, x: tx, y: ty, stats: newStats, maxHp: newMaxHp, inventory: [...p.inventory, item] };
      });
      setItemMap(prev => { const n = { ...prev }; delete n[key]; return n; });
      addLog(`Vous ramassez : ${item.icon} ${item.name} (+${item.bonus} ${item.stat})`);
      discardSelectedCard();
      setPhase('enemy');
      return;
    }

    const cell = grid[ty][tx];
    if (cell === T.EXIT) {
      if (mapIndex + 1 < MAPS.length) {
        nextLevel();
      } else {
        setPhase('win');
        addLog('🏆 Vous avez conquis le donjon !');
      }
      return;
    }

    setPlayer(p => ({ ...p, x: tx, y: ty }));
    discardSelectedCard();
    addLog(`Vous vous déplacez en (${tx}, ${ty}).`);
    setPhase('enemy');
  }, [phase, highlightTiles, enemies, itemMap, grid, selectedCard]);

  const discardSelectedCard = () => {
    if (selectedCard) {
      setHand(prev => prev.filter(c => c !== selectedCard));
      setDiscard(prev => [...prev, selectedCard]);
      setSelectedCard(null);
    }
  };

  // Attack action
  const attackAction = useCallback(() => {
    if (!combat) return;
    setPhase('roll');
    animateRoll((roll) => {
      const card = selectedCard;
      // chance ajoute un bonus au jet brut
      const chanceBonus = Math.floor(player.stats.chance / 2);
      const effectiveRoll = Math.min(6, roll + chanceBonus);
      let dmg = effectiveRoll + player.stats.force;
      if (card?.effect?.type === 'attack') {
        if (card.effect.special === 'double' && effectiveRoll === 6) dmg *= 2;
        else if (card.effect.special === 'crit' && effectiveRoll <= 2) {
          setTimeout(() => attackAction(), 500);
          return;
        } else dmg += card.effect.bonus;
      }
      // destin : +1 dmg par tranche de 3 points de destin
      dmg += Math.floor(player.stats.destin / 3);
      dmg = Math.max(1, dmg - combat.enemy.defense);

      const newEnemyHp = combat.enemy.hp - dmg;
      addLog(`🗡️ Vous attaquez ${combat.enemy.name} : dé=${roll}, dégâts=${dmg}`);

      if (newEnemyHp <= 0) {
        addLog(`✅ ${combat.enemy.name} est vaincu ! +${combat.enemy.xp} XP`);
        setPlayer(p => {
          const newXp = p.xp + combat.enemy.xp;
          const levelUp = newXp >= p.level * 30;
          if (levelUp) addLog(`🎉 Niveau ${p.level + 1} !`);
          return {
            ...p,
            xp: levelUp ? newXp - p.level * 30 : newXp,
            level: levelUp ? p.level + 1 : p.level,
            maxHp: levelUp ? p.maxHp + 4 : p.maxHp,
            hp: levelUp ? Math.min(p.maxHp + 4, p.hp + 4) : p.hp,
            stats: levelUp ? {
              ...p.stats,
              force:       p.stats.force + 1,
              vie:         p.stats.vie + 1,
              chance:      p.stats.chance + 1,
              destin:      p.stats.destin + 1,
            } : p.stats,
          };
        });
        setEnemies(prev => { const n = { ...prev }; delete n[`${combat.pos.x},${combat.pos.y}`]; return n; });
        setPlayer(p => ({ ...p, x: combat.pos.x, y: combat.pos.y }));
        setCombat(null);
        discardSelectedCard();
        setPhase('enemy');
      } else {
        setCombat(prev => ({ ...prev, enemy: { ...prev.enemy, hp: newEnemyHp } }));
        discardSelectedCard();
        setPhase('enemy_attack');
        enemyAttack(newEnemyHp);
      }
    });
  }, [combat, player, selectedCard]);

  const enemyAttack = useCallback((enemyHp) => {
    setTimeout(() => {
      if (!combat) return;
      const roll = rollDie();
      const enemy = { ...combat.enemy, hp: enemyHp ?? combat.enemy.hp };
      // force réduit les dégâts reçus (résistance physique)
      const resistance = Math.floor(player.stats.force / 3);
      const dmg = Math.max(1, roll + enemy.attack - resistance);
      addLog(`👹 ${enemy.name} attaque : dé=${roll}, dégâts=${dmg}`);
      setPlayer(p => {
        const newHp = p.hp - dmg;
        if (newHp <= 0) {
          setPhase('gameover');
          addLog('💀 Vous êtes mort...');
          return { ...p, hp: 0 };
        }
        return { ...p, hp: newHp };
      });
      setCombat(prev => prev ? { ...prev, enemy: enemy } : null);
      setPhase('combat');
    }, 800);
  }, [combat, player]);

  const healAction = useCallback(() => {
    const card = selectedCard;
    if (!card || card.effect.type !== 'heal') return;
    setPhase('roll');
    animateRoll((roll) => {
      // magie amplifie les soins
      let heal = roll + card.effect.bonus + Math.floor(player.stats.magie / 2);
      if (card.effect.special === 'fullheal' && roll === 6) heal = player.maxHp;
      setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
      addLog(`💚 Soin : dé=${roll}, +${heal} HP (magie ${player.stats.magie})`);
      discardSelectedCard();
      setPhase('enemy');
    });
  }, [selectedCard, player]);

  const defenseAction = useCallback(() => {
    const card = selectedCard;
    if (!card) return;
    if (combat) {
      setPhase('roll');
      animateRoll((roll) => {
        const bonus = card.effect.bonus || 0;
        addLog(`🛡️ Défense : dé=${roll}, +${roll + bonus} DEF ce tour`);
        discardSelectedCard();
        enemyAttack();
      });
    }
  }, [selectedCard, combat, enemyAttack]);

  const magicAction = useCallback(() => {
    const card = selectedCard;
    if (!card || card.effect.type !== 'magic') return;
    if (!combat) return;
    setPhase('roll');
    animateRoll((roll) => {
      // magie amplifie les sorts
      let dmg = card.effect.bonus + Math.floor(player.stats.magie / 2);
      if (card.effect.special === 'stun' && roll === 6) {
        addLog(`✨ Sort : ÉTOURDISSEMENT ! ${combat.enemy.name} passe son tour.`);
        discardSelectedCard();
        setPhase('draw');
        return;
      }
      dmg = Math.max(1, dmg - combat.enemy.defense);
      const newHp = combat.enemy.hp - dmg;
      addLog(`✨ Sort de feu : ${dmg} dégâts fixes sur ${combat.enemy.name}`);
      if (newHp <= 0) {
        addLog(`✅ ${combat.enemy.name} est vaincu ! +${combat.enemy.xp} XP`);
        setEnemies(prev => { const n = { ...prev }; delete n[`${combat.pos.x},${combat.pos.y}`]; return n; });
        setPlayer(p => ({ ...p, x: combat.pos.x, y: combat.pos.y, xp: p.xp + combat.enemy.xp }));
        setCombat(null);
      } else {
        setCombat(prev => ({ ...prev, enemy: { ...prev.enemy, hp: newHp } }));
      }
      discardSelectedCard();
      setPhase('enemy');
    });
  }, [selectedCard, combat]);

  const enemyTurn = useCallback(() => {
    if (phase !== 'enemy') return;
    if (combat) {
      enemyAttack(combat.enemy.hp);
    } else {
      setPhase('draw');
      addLog('Tour ennemi : aucun ennemi en combat.');
    }
  }, [phase, combat, enemyAttack]);

  const nextLevel = () => {
    const nextIdx = mapIndex + 1;
    const nextMap = MAPS[nextIdx];
    setMapIndex(nextIdx);
    setGrid(nextMap.grid.map(r => [...r]));
    setEnemies(buildEnemyMap(nextMap.grid));
    setItemMap(buildItemMap(nextMap.grid));
    setPlayer(p => ({ ...p, x: nextMap.playerStart.x, y: nextMap.playerStart.y }));
    setPhase('draw');
    addLog(`🗺️ Nouveau niveau : ${nextMap.name}`);
  };

  const restart = () => {
    const m = MAPS[0];
    setMapIndex(0);
    setGrid(m.grid.map(r => [...r]));
    setEnemies(buildEnemyMap(m.grid));
    setItemMap(buildItemMap(m.grid));
    setPlayer({ ...initPlayer(), x: m.playerStart.x, y: m.playerStart.y });
    setDeck(shuffleDeck(DECK));
    setHand([]);
    setDiscard([]);
    setSelectedCard(null);
    setPhase('draw');
    setDiceResult(null);
    setLog(['Nouvelle partie commencée !']);
    setCombat(null);
    setHighlightTiles([]);
  };

  return {
    player, grid, enemies, itemMap,
    hand, deck, discard, selectedCard, setSelectedCard,
    phase, setPhase,
    diceResult, rolling,
    log, combat,
    highlightTiles,
    mapName: mapData.name,
    drawCards, selectCard, moveToTile, showMoveRange,
    attackAction, healAction, defenseAction, magicAction,
    enemyTurn, restart,
    discardSelectedCard,
  };
}
