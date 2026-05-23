// 3 piles de 18 cartes monstres — pile 1: facile, pile 2: moyen, pile 3: difficile
// loot = nombre de cartes joueur piochées en récompense

export const MONSTER_PILE_1 = [
  { id:'rat',       name:'Rat géant',       icon:'🐀', maxHp: 6,  attack: 2, defense: 0, pile: 1, loot: 1 },
  { id:'slime',     name:'Slime',           icon:'🫧', maxHp: 8,  attack: 1, defense: 1, pile: 1, loot: 1 },
  { id:'bat',       name:'Chauve-souris',   icon:'🦇', maxHp: 5,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'spider',    name:'Araignée',        icon:'🕷️', maxHp: 7,  attack: 2, defense: 0, pile: 1, loot: 1 },
  { id:'goblin',    name:'Gobelin',         icon:'👺', maxHp:10,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'skeleton',  name:'Squelette',       icon:'💀', maxHp:12,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'lizard',    name:'Lézard venimeux', icon:'🦎', maxHp: 8,  attack: 4, defense: 0, pile: 1, loot: 1 },
  { id:'raven',     name:'Corbeau sombre',  icon:'🐦‍⬛', maxHp: 4,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'serpent',   name:'Serpent',         icon:'🐍', maxHp: 9,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'zombie',    name:'Zombie',          icon:'🧟', maxHp:14,  attack: 2, defense: 1, pile: 1, loot: 1 },
  { id:'crab',      name:'Crabe géant',     icon:'🦀', maxHp:10,  attack: 2, defense: 2, pile: 1, loot: 1 },
  { id:'beetle',    name:'Scarabée blindé', icon:'🪲', maxHp: 6,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'mushroom',  name:'Champignard',     icon:'🍄', maxHp:11,  attack: 1, defense: 2, pile: 1, loot: 1 },
  { id:'hobgoblin', name:'Hobgobelin',      icon:'👾', maxHp:14,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'specter',   name:'Spectre',         icon:'👻', maxHp: 9,  attack: 5, defense: 0, pile: 1, loot: 1 },
  { id:'gnome',     name:'Gnome pillard',   icon:'🧝', maxHp:11,  attack: 2, defense: 1, pile: 1, loot: 1 },
  { id:'wererat',   name:'Rat-garou',       icon:'🐭', maxHp:13,  attack: 4, defense: 0, pile: 1, loot: 1 },
  { id:'imp',       name:'Diablotin',       icon:'😈', maxHp: 8,  attack: 4, defense: 0, pile: 1, loot: 1 },
];

export const MONSTER_PILE_2 = [
  { id:'orc',        name:'Orc guerrier',     icon:'👹', maxHp:22, attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'werewolf',   name:'Loup-garou',       icon:'🐺', maxHp:20, attack: 7, defense: 1, pile: 2, loot: 2 },
  { id:'troll',      name:'Troll des marais', icon:'🧌', maxHp:28, attack: 5, defense: 3, pile: 2, loot: 2 },
  { id:'minotaur',   name:'Minotaure',        icon:'🐂', maxHp:25, attack: 8, defense: 2, pile: 2, loot: 2 },
  { id:'banshee',    name:'Banshee',          icon:'😱', maxHp:18, attack: 7, defense: 0, pile: 2, loot: 2 },
  { id:'golem',      name:'Golem de pierre',  icon:'🗿', maxHp:30, attack: 4, defense: 4, pile: 2, loot: 2 },
  { id:'harpy',      name:'Harpie',           icon:'🦅', maxHp:19, attack: 7, defense: 1, pile: 2, loot: 2 },
  { id:'necro',      name:'Nécromant',        icon:'🧙', maxHp:20, attack: 8, defense: 1, pile: 2, loot: 2 },
  { id:'cyclops',    name:'Cyclope',          icon:'👁️', maxHp:32, attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'fire_elem',  name:'Élémentaire feu',  icon:'🔥', maxHp:22, attack: 9, defense: 0, pile: 2, loot: 2 },
  { id:'mercenary',  name:'Mercenaire noir',  icon:'🛡️', maxHp:24, attack: 7, defense: 2, pile: 2, loot: 2 },
  { id:'djinn',      name:'Djinn',            icon:'🌪️', maxHp:20, attack: 8, defense: 1, pile: 2, loot: 2 },
  { id:'scorpion',   name:'Scorpion géant',   icon:'🦂', maxHp:26, attack: 6, defense: 3, pile: 2, loot: 2 },
  { id:'dknight',    name:'Chevalier noir',   icon:'♟️', maxHp:28, attack: 7, defense: 3, pile: 2, loot: 2 },
  { id:'gspider',    name:'Araignée géante',  icon:'🕸️', maxHp:21, attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'yeti',       name:'Yéti',             icon:'❄️', maxHp:30, attack: 6, defense: 3, pile: 2, loot: 2 },
  { id:'medusa',     name:'Méduse',           icon:'🐙', maxHp:18, attack: 9, defense: 1, pile: 2, loot: 2 },
  { id:'ghoul',      name:'Goule',            icon:'🫀', maxHp:24, attack: 7, defense: 1, pile: 2, loot: 2 },
];

export const MONSTER_PILE_3 = [
  { id:'dragon',    name:'Dragon ancien',      icon:'🐉', maxHp:45, attack:12, defense: 4, pile: 3, loot: 3 },
  { id:'demon',     name:'Démon majeur',       icon:'👿', maxHp:38, attack:11, defense: 3, pile: 3, loot: 3 },
  { id:'lich',      name:'Liche',              icon:'💀', maxHp:35, attack:13, defense: 2, pile: 3, loot: 3 },
  { id:'behemoth',  name:'Béhémoth',           icon:'🦛', maxHp:50, attack:10, defense: 5, pile: 3, loot: 3 },
  { id:'ghost_lord',name:'Seigneur fantôme',   icon:'🌑', maxHp:30, attack:14, defense: 2, pile: 3, loot: 3 },
  { id:'giant',     name:'Titan de pierre',    icon:'🗿', maxHp:55, attack: 9, defense: 6, pile: 3, loot: 3 },
  { id:'hydra',     name:'Hydre',              icon:'🐍', maxHp:42, attack:12, defense: 3, pile: 3, loot: 3 },
  { id:'chimera',   name:'Chimère',            icon:'🦁', maxHp:38, attack:13, defense: 3, pile: 3, loot: 3 },
  { id:'archdemon', name:'Archidémon',         icon:'🔥', maxHp:44, attack:13, defense: 3, pile: 3, loot: 3 },
  { id:'frost_titan',name:'Titan du givre',    icon:'🧊', maxHp:48, attack:11, defense: 5, pile: 3, loot: 3 },
  { id:'shadow_king',name:'Roi des ombres',    icon:'👑', maxHp:40, attack:14, defense: 3, pile: 3, loot: 3 },
  { id:'fallen',    name:'Ange déchu',         icon:'🪽', maxHp:35, attack:15, defense: 2, pile: 3, loot: 3 },
  { id:'lava_golem',name:'Golem de lave',      icon:'🌋', maxHp:50, attack:10, defense: 6, pile: 3, loot: 3 },
  { id:'abomination',name:'Abomination',       icon:'👾', maxHp:46, attack:12, defense: 4, pile: 3, loot: 3 },
  { id:'anc_necro', name:'Nécromant ancien',   icon:'🧙', maxHp:38, attack:14, defense: 2, pile: 3, loot: 3 },
  { id:'dark_dragon',name:'Dragon noir',       icon:'🖤', maxHp:52, attack:13, defense: 5, pile: 3, loot: 3 },
  { id:'lich_king', name:'Liche seigneur',     icon:'💎', maxHp:40, attack:16, defense: 3, pile: 3, loot: 3 },
  { id:'warlord',   name:'Seigneur de guerre', icon:'⚔️', maxHp:55, attack:15, defense: 5, pile: 3, loot: 3 },
];

export function shuffleMonsters(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
