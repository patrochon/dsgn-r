// Tile types
export const T = {
  FLOOR: 0,
  WALL: 1,
  ENEMY: 2,
  ITEM: 3,
  EXIT: 4,
  PLAYER: 5,
  CHEST: 6,
};

export const MAPS = [
  {
    name: 'Donjon Niveau 1',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,2,0,1,0,2,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,0,3,0,1],
      [1,1,1,0,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,1,0,6,0,1,2,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,1],
      [1,3,0,0,1,1,0,1,1,0,0,1],
      [1,0,0,2,0,0,0,0,0,2,0,1],
      [1,0,0,0,0,0,0,0,0,0,4,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    playerStart: { x: 1, y: 1 },
  },
  {
    name: 'Caverne Niveau 2',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,2,0,0,0,0,2,0,0,1],
      [1,0,1,1,0,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,3,1],
      [1,2,1,0,1,1,0,1,0,1,2,1],
      [1,0,0,0,0,6,0,0,0,0,0,1],
      [1,0,1,0,1,1,0,1,0,1,0,1],
      [1,3,0,0,0,0,0,0,0,0,0,1],
      [1,2,1,1,0,1,1,0,1,1,2,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,0,0,0,0,2,0,4,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    playerStart: { x: 1, y: 1 },
  },
];

export const ITEMS = [
  { id: 'sword', name: 'Épée rouillée', icon: '⚔️', stat: 'attack', bonus: 2 },
  { id: 'shield', name: 'Bouclier de bois', icon: '🛡️', stat: 'defense', bonus: 2 },
  { id: 'boots', name: 'Bottes légères', icon: '👢', stat: 'move', bonus: 1 },
  { id: 'potion', name: 'Potion de soin', icon: '🧪', stat: 'hp', bonus: 10 },
  { id: 'ring', name: 'Anneau magique', icon: '💍', stat: 'magic', bonus: 3 },
  { id: 'helm', name: 'Casque en fer', icon: '⛑️', stat: 'defense', bonus: 3 },
  { id: 'bow', name: 'Arc court', icon: '🏹', stat: 'attack', bonus: 2 },
  { id: 'amulet', name: 'Amulette ancienne', icon: '📿', stat: 'hp', bonus: 15 },
];

export const ENEMIES = [
  { name: 'Gobelin', icon: '👺', hp: 8, attack: 2, defense: 0, xp: 10 },
  { name: 'Squelette', icon: '💀', hp: 12, attack: 3, defense: 1, xp: 15 },
  { name: 'Orc', icon: '👹', hp: 18, attack: 4, defense: 2, xp: 25 },
  { name: 'Vampire', icon: '🧛', hp: 15, attack: 5, defense: 1, xp: 30 },
  { name: 'Dragon', icon: '🐉', hp: 30, attack: 8, defense: 3, xp: 80 },
];
