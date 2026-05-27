// 3 piles de 18 cartes monstres — pile 1: facile, pile 2: moyen, pile 3: difficile
// loot = nombre de cartes joueur piochées en récompense

export const MONSTER_PILE_1 = [
  { id:'rat_chat',   name:'Un rat-chat',        icon:'🐈',  maxHp: 6,  attack: 2, defense: 0, pile: 1, loot: 1 },
  { id:'morve',      name:'Une morve',           icon:'🤢',  maxHp: 8,  attack: 1, defense: 0, pile: 1, loot: 1 },
  { id:'bat',        name:'Chauve-souris',       icon:'🦇',  maxHp: 5,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'spider',     name:'Araignée',            icon:'🕷️',  maxHp: 7,  attack: 2, defense: 0, pile: 1, loot: 1 },
  { id:'farfadet',   name:'Farfadet',            icon:'🧚',  maxHp:10,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'skeleton',   name:'Squelette',           icon:'💀',  maxHp:12,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'ecaille_tox',name:'Écaille toxique',     icon:'🐊',  maxHp: 8,  attack: 4, defense: 2, pile: 1, loot: 1 },
  { id:'nevermore',  name:'Nevermore',           icon:'🐦‍⬛', maxHp: 4,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'serpent',    name:'Serpent du coloc',    icon:'🐍',  maxHp: 9,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'zombie',     name:'Zombie',              icon:'🧟',  maxHp:14,  attack: 2, defense: 1, pile: 1, loot: 1 },
  { id:'crab',       name:'Crabe géant',         icon:'🦀',  maxHp:10,  attack: 2, defense: 2, pile: 1, loot: 1 },
  { id:'barbo',      name:'Barbo',               icon:'🐟',  maxHp: 6,  attack: 3, defense: 0, pile: 1, loot: 1 },
  { id:'vieux_lunch',name:'Un vieux lunch',      icon:'🥪',  maxHp:11,  attack: 1, defense: 1, pile: 1, loot: 1 },
  { id:'gros_farf',  name:'Gros Farfadet',       icon:'👺',  maxHp:14,  attack: 3, defense: 1, pile: 1, loot: 1 },
  { id:'gens_morts', name:'Des gens morts',      icon:'🧟‍♀️', maxHp: 9,  attack: 5, defense: 0, pile: 1, loot: 1 },
  { id:'voyou',      name:'Un voyou',            icon:'😤',  maxHp:11,  attack: 2, defense: 1, pile: 1, loot: 1 },
  { id:'chat_loup',  name:'Un chat-loup',        icon:'🐾',  maxHp:13,  attack: 4, defense: 1, pile: 1, loot: 1 },
  { id:'lutin',      name:'Un lutin coquin',     icon:'😈',  maxHp: 8,  attack: 4, defense: 0, pile: 1, loot: 1 },
];

export const MONSTER_PILE_2 = [
  { id:'orc',        name:'Orc',                 icon:'👹',  maxHp:22,  attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'garou',      name:'Garou',               icon:'🐺',  maxHp:20,  attack: 7, defense: 1, pile: 2, loot: 2 },
  { id:'noye',       name:'Noyé',                icon:'🌊',  maxHp:28,  attack: 5, defense: 0, pile: 2, loot: 2 },
  { id:'culturiste', name:'Un culturiste',       icon:'💪',  maxHp:25,  attack: 8, defense: 2, pile: 2, loot: 2 },
  { id:'banshee',    name:'Banshee',             icon:'😱',  maxHp:18,  attack: 7, defense: 0, pile: 2, loot: 2 },
  { id:'robot',      name:'Un robot rebel',      icon:'🤖',  maxHp:30,  attack: 4, defense: 4, pile: 2, loot: 2 },
  { id:'harpy',      name:'Harpie',              icon:'🦅',  maxHp:19,  attack: 7, defense: 1, pile: 2, loot: 2 },
  { id:'hom_noir',   name:'Homme en noir',       icon:'🕴️',  maxHp:20,  attack: 8, defense: 2, pile: 2, loot: 2 },
  { id:'cyclops',    name:'Cyclope',             icon:'👁️',  maxHp:32,  attack: 6, defense: 3, pile: 2, loot: 2 },
  { id:'brule',      name:'Brûlé',               icon:'🔥',  maxHp:22,  attack: 9, defense: 0, pile: 2, loot: 2 },
  { id:'mercenary',  name:'Mercenaire noir',     icon:'🛡️',  maxHp:24,  attack: 7, defense: 3, pile: 2, loot: 2 },
  { id:'djinn',      name:'Djinn',               icon:'🌪️',  maxHp:20,  attack: 8, defense: 1, pile: 2, loot: 2 },
  { id:'mutation',   name:"Mutation d'Australie",icon:'🦘',  maxHp:26,  attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'dknight',    name:'Chevalier noir',      icon:'♟️',  maxHp:28,  attack: 7, defense: 4, pile: 2, loot: 2 },
  { id:'gspider',    name:'Grosse araignée',     icon:'🕸️',  maxHp:21,  attack: 6, defense: 2, pile: 2, loot: 2 },
  { id:'fee_degeul', name:'Fée dégueulace',      icon:'🧚',  maxHp:30,  attack: 6, defense: 1, pile: 2, loot: 2 },
  { id:'illythide',  name:'Petit Illythide',     icon:'🦑',  maxHp:18,  attack: 9, defense: 1, pile: 2, loot: 2 },
  { id:'ghoul',      name:'Goule',               icon:'🫀',  maxHp:24,  attack: 7, defense: 2, pile: 2, loot: 2 },
];

export const MONSTER_PILE_3 = [
  { id:'dragon_jeu', name:'Dragon pas mûre',     icon:'🐉',  maxHp:45,  attack:12, defense: 4, pile: 3, loot: 3 },
  { id:'astre',      name:'Astre brillant',      icon:'⭐',  maxHp:38,  attack:11, defense: 2, pile: 3, loot: 3 },
  { id:'lich',       name:'Liche',               icon:'💀',  maxHp:35,  attack:13, defense: 3, pile: 3, loot: 3 },
  { id:'behemoth',   name:'Béhémoth',            icon:'🦛',  maxHp:50,  attack:10, defense: 6, pile: 3, loot: 3 },
  { id:'bouh',       name:'Bouh!',               icon:'👻',  maxHp:30,  attack:14, defense: 0, pile: 3, loot: 3 },
  { id:'titan',      name:'Titan',               icon:'🗿',  maxHp:55,  attack: 9, defense: 6, pile: 3, loot: 3 },
  { id:'hydra',      name:'Hydre chevauchée',    icon:'🐍',  maxHp:42,  attack:12, defense: 3, pile: 3, loot: 3 },
  { id:'chimera',    name:'Chimère',             icon:'🦁',  maxHp:38,  attack:13, defense: 3, pile: 3, loot: 3 },
  { id:'mammon',     name:'Mammon',              icon:'💰',  maxHp:44,  attack:13, defense: 4, pile: 3, loot: 3 },
  { id:'gros_frette',name:'Un gros frette',      icon:'🧊',  maxHp:48,  attack:11, defense: 5, pile: 3, loot: 3 },
  { id:'chapeau',    name:'Homme au Chapeau',    icon:'🎩',  maxHp:40,  attack:14, defense: 2, pile: 3, loot: 3 },
  { id:'wendigo',    name:'Wendigo',             icon:'🌲',  maxHp:35,  attack:15, defense: 2, pile: 3, loot: 3 },
  { id:'lave',       name:'Lavé',                icon:'🫧',  maxHp:50,  attack:10, defense: 3, pile: 3, loot: 3 },
  { id:'coromalaria',name:'Coromalaria',         icon:'🦠',  maxHp:46,  attack:12, defense: 2, pile: 3, loot: 3 },
  { id:'anc_anc',    name:'Ancien ancien',       icon:'👴',  maxHp:38,  attack:14, defense: 4, pile: 3, loot: 3 },
  { id:'dragon_cuir',name:'Dragon de cuir noir', icon:'🖤',  maxHp:52,  attack:13, defense: 5, pile: 3, loot: 3 },
  { id:'john_smith', name:'John Smith',          icon:'🕵️',  maxHp:40,  attack:16, defense: 3, pile: 3, loot: 3 },
  { id:'warlord',    name:'Seigneur de guerre',  icon:'⚔️',  maxHp:55,  attack:15, defense: 5, pile: 3, loot: 3 },
];

export function shuffleMonsters(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
