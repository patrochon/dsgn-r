// Deck complet — 78 cartes en 8 catégories
// effect.type → correspond aux handlers du jeu
// effect.range → portée de l'effet :
//   'self'   : soi-même uniquement
//   'melee'  : case adjacente (portée 1)
//   'back'   : case directement derrière le joueur
//   'r2'     : jusqu'à 2 cases (distance Manhattan)
//   'r4'     : jusqu'à 4 cases
//   'r6'     : jusqu'à 6 cases
//   'line'   : ligne droite dans la direction du joueur
//   'aoe1'   : zone rayon 1 (toutes les cases adjacentes)
//   'aoe2'   : zone rayon 2
//   'global' : toute la carte

const C = {
  MOVE:       { key: 'deplacement',  color: '#55ccff', label: 'Déplacement' },
  ARMOR:      { key: 'armure',       color: '#aaaaee', label: 'Armure'       },
  WEAPON:     { key: 'arme',         color: '#ff9955', label: 'Arme'         },
  MAGIC_WPN:  { key: 'arme_magique', color: '#ff55ff', label: 'Arme Magique' },
  POTION:     { key: 'potion',       color: '#55ff99', label: 'Potion'        },
  SCROLL:     { key: 'parchemin',    color: '#ffcc44', label: 'Parchemin'     },
  RARE:       { key: 'objet_rare',   color: '#ff8844', label: 'Objet Rare'   },
  LEGENDARY:  { key: 'legendaire',   color: '#ffdd00', label: 'Légendaire'   },
};

const R = { COMMON: 'common', UNCOMMON: 'uncommon', RARE: 'rare', LEGENDARY: 'legendary' };

function goldValue(rarity, effectType, bonus, magieCost) {
  if (rarity === 'legendary') return 6;
  if (effectType === 'magic') {
    if (magieCost >= 6) return 6;
    if (magieCost >= 4) return 4;
    if (magieCost >= 3) return 3;
    return 2;
  }
  if (effectType === 'move') {
    if (rarity === 'rare')     return 4;
    if (rarity === 'uncommon') return 2;
    return 1;
  }
  if (rarity === 'rare')     return (effectType === 'passive' || bonus >= 5) ? 5 : 4;
  if (rarity === 'uncommon') return bonus >= 5 ? 3 : 2;
  return bonus >= 3 ? 2 : 1;
}

// range: portée de l'effet de la carte (voir liste en haut de fichier)
function card(id, name, icon, cat, rarity, effectType, bonus, desc, special = null, magieCost = 0, range = null) {
  return {
    id, name, icon,
    category: cat.key, catColor: cat.color, catLabel: cat.label,
    rarity,
    effect: { type: effectType, bonus, special, magieCost, range },
    desc,
    goldValue: goldValue(rarity, effectType, bonus, magieCost),
  };
}

// ─── DÉPLACEMENT (12) ─────────────────────────────────────────────────────────
const MOVE_CARDS = [
  card('sprint',      'Sprint',              '💨', C.MOVE, R.COMMON,   'move', 3, 'Dé + 3 cases de mouvement.',                                          null,          0, 'self'),
  card('charge',      'Charge',              '⚡', C.MOVE, R.COMMON,   'move', 2, 'Dé + 2 cases. Si tu atteins un ennemi, +2 Force ce tour.',             'charge',      0, 'self'),
  card('glissade',    'Glissade',            '🌊', C.MOVE, R.COMMON,   'move', 2, 'Dé + 2 cases en diagonale autorisée.',                                'diagonal',    0, 'self'),
  card('retraite',    'Retraite tactique',   '🔙', C.MOVE, R.COMMON,   'move', 2, 'Recule de dé + 2 cases. Esquive la prochaine attaque.',                'dodge',       0, 'self'),
  card('roulade',     'Roulade',             '🔄', C.MOVE, R.COMMON,   'move', 1, 'Dé + 1 case. Immunité aux dégâts ce tour si 4+.',                     'roll_dodge',  0, 'self'),
  card('foulees',     'Foulées légères',     '🦶', C.MOVE, R.COMMON,   'move', 2, "Dé + 2 cases. Ne déclenche pas d'ennemis adjacents.",                 'stealth_move',0, 'self'),
  card('bond',        'Bond',                '🐇', C.MOVE, R.UNCOMMON, 'move', 0, 'Saute par-dessus 3 cases (ignore obstacles), atterrit dé + 0.',        'jump',        0, 'self'),
  card('course',      'Course effrénée',     '🏃', C.MOVE, R.UNCOMMON, 'move', 0, 'Déplacement = dé × 2 cases.',                                         'double_roll', 0, 'self'),
  card('ailes_vent',  'Ailes du vent',       '🕊️', C.MOVE, R.UNCOMMON, 'move', 6, 'Ignore le dé. Déplace-toi de 6 cases exactement.',                    'fixed_move',  0, 'self'),
  card('escalade',    'Escalade',            '🧗', C.MOVE, R.UNCOMMON, 'move', 3, "Traverse un mur. Dé + 3 cases de l'autre côté.",                      'wall_pass',   0, 'self'),
  card('teleport_ct', 'Téléportation courte','✨', C.MOVE, R.RARE,     'move', 0, "Si dé ≥ 4, téléporte-toi sur n'importe quelle case visible.",          'teleport',    0, 'self'),
  card('blink',       'Blink',               '🌀', C.MOVE, R.RARE,     'move', 0, 'Échange ta position avec un ennemi adjacent (dé ≥ 3).',                'blink',       0, 'self'),
];

// ─── ARMURES (18) ─────────────────────────────────────────────────────────────
const ARMOR_CARDS = [
  card('vetes_matelasses', 'Vêtements matelassés',  '🧥', C.ARMOR, R.COMMON,   'defense', 1, '+1 Force, +2 Vie.',                                                   'stat:vie+2,force+1',              0, 'self'),
  card('gambison',         'Gambison',               '🦺', C.ARMOR, R.COMMON,   'defense', 2, '+2 Force, +1 Déplacement.',                                           'stat:force+2,deplacement+1',      0, 'self'),
  card('cuir_tanne',       'Cuir tanné',             '🥾', C.ARMOR, R.COMMON,   'defense', 2, '+2 Force. Léger, sans malus.',                                        'stat:force+2',                    0, 'self'),
  card('cape_resistance',  'Cape de résistance',     '🧣', C.ARMOR, R.COMMON,   'defense', 1, '+1 Force, +1 Richesse.',                                              'stat:force+1,richesse+1',         0, 'self'),
  card('haubert',          'Haubert de mailles',     '⛓️', C.ARMOR, R.COMMON,   'defense', 3, '+3 Force. -1 Déplacement.',                                           'stat:force+3,deplacement-1',      0, 'self'),
  card('jambières',        "Jambières d'acier",      '🦿', C.ARMOR, R.COMMON,   'defense', 2, '+1 Force, +1 Vie.',                                                   'stat:force+1,vie+1',              0, 'self'),
  card('gantelets',        'Gantelets de combat',    '🥊', C.ARMOR, R.COMMON,   'defense', 2, '+2 Force en attaque corps-à-corps.',                                  'stat:force+2',                    0, 'self'),
  card('bouclier_bois',    'Bouclier de bois',       '🛡️', C.ARMOR, R.COMMON,   'defense', 2, '+2 Force, +1 Vie. Bloque 1 dégât/tour.',                              'stat:force+2,vie+1,block1',       0, 'self'),
  card('heaume',           'Heaume fermé',           '⛑️', C.ARMOR, R.UNCOMMON, 'defense', 2, '+2 Force. Immunise contre les coups critiques.',                      'stat:force+2,no_crit',            0, 'self'),
  card('plastron',         "Plastron d'acier",       '🧲', C.ARMOR, R.UNCOMMON, 'defense', 4, '+4 Force. -2 Déplacement.',                                           'stat:force+4,deplacement-2',      0, 'self'),
  card('bouclier_acier',   "Bouclier d'acier",       '🔵', C.ARMOR, R.UNCOMMON, 'defense', 3, '+3 Force, +1 Vie. -1 Déplacement.',                                   'stat:force+3,vie+1,deplacement-1',0, 'self'),
  card('cuirasse_templier','Cuirasse des Templiers', '✝️', C.ARMOR, R.UNCOMMON, 'defense', 4, '+4 Force, +2 Vie.',                                                   'stat:force+4,vie+2',              0, 'self'),
  card('cotte_plates',     'Cotte de plates',        '🏰', C.ARMOR, R.UNCOMMON, 'defense', 5, '+5 Force. -2 Déplacement.',                                           'stat:force+5,deplacement-2',      0, 'self'),
  card('armure_elfique',   'Armure elfique',         '🌿', C.ARMOR, R.UNCOMMON, 'defense', 3, '+3 Force, +1 Déplacement. Légère et résistante.',                     'stat:force+3,deplacement+1',      0, 'self'),
  card('pavois',           'Pavois',                 '🔷', C.ARMOR, R.RARE,     'defense', 4, '+4 Force, +2 Vie. Bloque 2 dégâts/tour. -2 Déplacement.',             'stat:force+4,vie+2,block2,deplacement-2',0,'self'),
  card('armure_plaques',   'Armure de plaques',      '⚙️', C.ARMOR, R.RARE,     'defense', 6, '+6 Force. -3 Déplacement. Immunité aux dégâts < 3.',                  'stat:force+6,deplacement-3,immune_low', 0,'self'),
  card('amulette_prot',    'Amulette de protection', '🪬', C.ARMOR, R.RARE,     'defense', 0, '+2 Vie, +2 Destin. Réduit les dégâts magiques de moitié.',             'stat:vie+2,destin+2,resist_magic',0, 'self'),
  card('anneau_defense',   'Anneau de défense',      '💠', C.ARMOR, R.RARE,     'defense', 0, '+2 Force, +1 Richesse, +1 Vie. Jamais de critique adverse.',           'stat:force+2,richesse+1,vie+1,no_crit',0,'self'),
];

// ─── ARMEMENT NON MAGIQUE (12) ────────────────────────────────────────────────
const WEAPON_CARDS = [
  card('canif',       'Canif',              '🗡️', C.WEAPON, R.COMMON,   'attack', 1, 'Force requise 1. Attaque ×2 si dé = 6. +1 Richesse.',                    'double_on_6',      0, 'melee'),
  card('epee_courte', 'Épée courte',        '⚔️', C.WEAPON, R.COMMON,   'attack', 2, 'Force requise 2. Équilibrée, aucun malus.',                              null,               0, 'melee'),
  card('hache_main',  'Hache de main',      '🪓', C.WEAPON, R.COMMON,   'attack', 2, "Force requise 2. Lançable à 2 cases — détruite après le lancer.",        'throw_destroy',    0, 'melee'),
  card('baton_combat','Bâton de combat',    '🏑', C.WEAPON, R.COMMON,   'attack', 1, 'Force requise 1. +1 Magie. Frappe derrière sans dépenser de mouvement.', 'back_free_attack', 0, 'back'),
  card('lance',       'Lance',              '🏹', C.WEAPON, R.COMMON,   'attack', 2, "Force requise 2. Portée 2 cases. Repousse l'ennemi d'une case.",          'push_enemy',       0, 'r2'),
  card('epee_longue', 'Épée longue',        '🔱', C.WEAPON, R.UNCOMMON, 'attack', 3, 'Force requise 3. Aucun déplacement possible ce tour.',                   'no_move_after',    0, 'melee'),
  card('hache_guerre','Hache de guerre',    '⚒️', C.WEAPON, R.UNCOMMON, 'attack', 3, "Force requise 3. Perce 2 points d'armure ennemie.",                      'armor_pierce2',    0, 'melee'),
  card('arc_court',   'Arc court',          '🏹', C.WEAPON, R.UNCOMMON, 'attack', 3, "Force requise 3. Portée 3–4 cases. Aucun effet si ennemi adjacent.",     'range_min3',       0, 'r4'),
  card('fleau',       "Fléau d'armes",      '⛓️', C.WEAPON, R.UNCOMMON, 'attack', 3, "Force requise 3. Désarme l'ennemi (défausse 1 carte) sur dé 6.",         'disarm_6',         0, 'melee'),
  card('marteau',     'Marteau de guerre',  '🔨', C.WEAPON, R.UNCOMMON, 'attack', 5, "Force requise 5. Étourdit l'ennemi sur dé 6 (passe son tour).",           'stun_6',           0, 'melee'),
  card('arc_long',    'Arc long',           '🎯', C.WEAPON, R.RARE,     'attack', 5, 'Force requise 5. Portée 3–6 cases. +2 Force si immobile.',               'aim',              0, 'r6'),
  card('arbalete',    'Arbalète',           '🔰', C.WEAPON, R.RARE,     'attack', 5, "Force requise 5. Portée 2–5 cases. Perce toute l'armure si immobile.",   'pierce_if_still',  0, 'r5'),
];

// ─── ARMEMENT MAGIQUE (6) ─────────────────────────────────────────────────────
const MAGIC_WEAPON_CARDS = [
  card('epee_flamme',   'Épée flamboyante',  '🔥', C.MAGIC_WPN, R.RARE,      'magic_attack', 4, '+4 Force, +2 Magie. Brûle l\'ennemi : dégâts supplémentaires sur dé 5-6.',     'burn',        0, 'melee'),
  card('arc_tenebres',  'Arc des Ténèbres',  '🌑', C.MAGIC_WPN, R.RARE,      'magic_attack', 3, '+3 Force, +3 Magie. Maudit la cible (-2 à tous ses jets).',                     'curse',       0, 'r4'),
  card('sceptre_givre', 'Sceptre de givre',  '❄️', C.MAGIC_WPN, R.RARE,      'magic_attack', 2, '+2 Force, +4 Magie. Ralentit l\'ennemi : -3 Déplacement pour 2 tours.',         'slow_enemy',  0, 'r2'),
  card('dague_venin',   'Dague venimeuse',   '🐍', C.MAGIC_WPN, R.RARE,      'magic_attack', 3, '+3 Force, +2 Destin. Empoisonne : -2 HP/tour pendant 3 tours.',                 'poison',      0, 'melee'),
  card('hache_runique',  'Hache runique',    '🪬', C.MAGIC_WPN, R.RARE,      'magic_attack', 5, '+5 Force, +2 Destin. Active une rune aléatoire sur dé 4+.',                     'rune',        0, 'melee'),
  card('lame_spectrale','Lame spectrale',    '👻', C.MAGIC_WPN, R.LEGENDARY, 'magic_attack', 3, '+3 Force, +4 Magie. Ignore totalement l\'armure et la résistance.',             'ignore_armor',0, 'melee'),
];

// ─── POTIONS (12) ─────────────────────────────────────────────────────────────
const POTION_CARDS = [
  card('soin_mineur',  'Potion de soin mineur',  '🧪', C.POTION, R.COMMON,   'heal', 10, 'Restaure 10 HP. (✨1)',                                                         null,                             1, 'self'),
  card('soin_moyen',   'Potion de soin moyen',   '💚', C.POTION, R.COMMON,   'heal', 20, 'Restaure 20 HP. (✨2)',                                                         null,                             2, 'self'),
  card('soin_majeur',  'Potion de soin majeur',  '💊', C.POTION, R.UNCOMMON, 'heal', 30, 'Restaure 30 HP. (✨3)',                                                         null,                             3, 'self'),
  card('force_brew',   'Potion de Force',         '💪', C.POTION, R.COMMON,   'buff',  3, '+3 Force pendant 1 combat. (✨1)',                                             'buff:force+3,duration:combat',   1, 'self'),
  card('celerite',     'Potion de Célérité',      '⚡', C.POTION, R.COMMON,   'buff',  3, '+3 Déplacement pendant 1 tour. (✨1)',                                         'buff:deplacement+3,duration:turn',1, 'self'),
  card('resistance',   'Potion de Résistance',    '🛡️', C.POTION, R.UNCOMMON, 'buff',  4, '+4 Force défensive pendant 1 combat. (✨2)',                                   'buff:defense+4,duration:combat', 2, 'self'),
  card('chance_brew',  'Potion de Richesse',       '🍀', C.POTION, R.UNCOMMON, 'buff',  3, '+3 Richesse pendant 3 tours. (✨2)',                                           'buff:richesse+3,duration:3turns',2, 'self'),
  card('antidote',     'Antidote',                '🌿', C.POTION, R.COMMON,   'cure',  0, 'Annule poison, malédiction ou ralentissement. (✨1)',                          'cure_all',                       1, 'self'),
  card('magie_brew',   'Potion de Magie',         '🔮', C.POTION, R.UNCOMMON, 'buff',  5, '+5 Magie. Lance immédiatement un sort aléatoire. (✨2)',                       'buff:magie+5,cast_random',       2, 'self'),
  card('elixir_vie',   'Élixir de Vie',           '❤️', C.POTION, R.RARE,     'buff',  0, '+5 Vie permanent (augmente le HP max). (✨4)',                                 'perm:vie+5',                     4, 'self'),
  card('destin_brew',  'Potion de Destin',        '🌟', C.POTION, R.RARE,     'buff',  0, '+2 Destin permanent. (✨3)',                                                   'perm:destin+2',                  3, 'self'),
  card('philtre_rage', 'Philtre de rage',         '🩸', C.POTION, R.RARE,     'buff',  6, '+6 Force pendant 1 combat. -3 Déplacement. Frénésie : attaque deux fois. (✨3)','buff:force+6,deplacement-3,frenzy',3,'self'),
];

// ─── PARCHEMINS MAGIQUES (9) ──────────────────────────────────────────────────
const SCROLL_CARDS = [
  card('boule_feu',    'Boule de Feu',         '🔥', C.SCROLL, R.UNCOMMON, 'magic',  8, "8 dégâts magiques à l'ennemi ciblé + 4 aux adjacents. (✨3)",    'aoe',        3, 'r4'),
  card('eclair',       'Éclair',               '⚡', C.SCROLL, R.UNCOMMON, 'magic',  6, 'Touche jusqu\'à 3 ennemis en ligne. 6 dégâts. (✨2)',             'chain',      2, 'line'),
  card('gel',          'Nova de Givre',        '❄️', C.SCROLL, R.UNCOMMON, 'magic',  5, 'Gèle tous les ennemis proches : passent leur prochain tour. (✨2)','freeze',    2, 'aoe2'),
  card('invocation',   'Invocation',           '👾', C.SCROLL, R.RARE,     'magic',  0, 'Crée un allié combattant adjacent pendant 2 tours. (✨4)',        'summon',     4, 'melee'),
  card('soin_masse',   'Soin de masse',        '✨', C.SCROLL, R.UNCOMMON, 'magic', 15, 'Restaure 15 HP à tous les alliés adjacents. (✨3)',               'aoe_heal',   3, 'aoe1'),
  card('malediction',  'Malédiction',          '🧿', C.SCROLL, R.UNCOMMON, 'magic',  0, 'Réduit toutes les stats ennemies de 2 pendant 3 tours. (✨2)',    'debuff_all', 2, 'r4'),
  card('bouclier_mag', 'Bouclier Magique',     '🔵', C.SCROLL, R.RARE,     'magic',  0, 'Absorbe les 10 prochains dégâts reçus. (✨3)',                    'shield10',   3, 'self'),
  card('vision',       'Vision prophétique',   '👁️', C.SCROLL, R.RARE,     'magic',  0, 'Révèle toute la carte. +2 Richesse pour ce tour. (✨2)',          'reveal_map', 2, 'global'),
  card('resurrection', 'Résurrection',         '💀', C.SCROLL, R.LEGENDARY,'magic',  0, 'Si tu tombes à 0 HP ce tour, reviens à 50% HP. Usage unique. (✨6)','revive_50',6, 'self'),
];

// ─── OBJETS RARES (6) ─────────────────────────────────────────────────────────
const RARE_CARDS = [
  card('pierre_ancetre','Pierre de l\'Ancêtre', '🪨', C.RARE, R.RARE, 'passive', 0, '+3 Destin, +2 Magie permanent. Les dés < 2 comptent comme 2.',       'perm:destin+3,magie+2,min_roll2',   0, 'self'),
  card('anneau_chaos',  'Anneau du Chaos',      '💫', C.RARE, R.RARE, 'passive', 0, '+4 Richesse permanent. À chaque tour : effet aléatoire.',             'perm:richesse+4,chaos_effect',       0, 'self'),
  card('bottes_fantome','Bottes du Fantôme',    '👻', C.RARE, R.RARE, 'passive', 0, '+4 Déplacement permanent. Traverse les murs à volonté.',              'perm:deplacement+4,wall_walk',       0, 'self'),
  card('cape_invis',    "Cape d'Invisibilité",  '🌫️', C.RARE, R.RARE, 'passive', 0, 'Évite automatiquement 1 combat par tour (choix du joueur).',          'perm:avoid_combat',                  0, 'self'),
  card('orbe_vision',   'Orbe de Vision',       '🔭', C.RARE, R.RARE, 'passive', 0, 'Voit les ennemis et items à travers les murs. +2 Richesse.',          'perm:richesse+2,see_through',        0, 'self'),
  card('grimoire',      'Grimoire interdit',    '📖', C.RARE, R.RARE, 'passive', 0, '+5 Magie permanent. Lance un sort gratuit par combat (portée 2).',    'perm:magie+5,free_spell',            0, 'self'),
];

// ─── OBJETS LÉGENDAIRES (3) ───────────────────────────────────────────────────
const LEGENDARY_CARDS = [
  card('couronne_rois', 'Couronne des Rois',   '👑', C.LEGENDARY, R.LEGENDARY, 'legendary', 0, 'Toutes les stats +3 permanent. Les ennemis proches ont 10% de chance de fuir.','perm:all+3,enemy_flee10',           0, 'aoe2'),
  card('oeil_destin',   "L'Œil du Destin",    '👁️', C.LEGENDARY, R.LEGENDARY, 'legendary', 0, "Rejoue n'importe quel dé jusqu'à 3 fois par partie. +3 Destin.",               'perm:destin+3,reroll3',             0, 'global'),
  card('coeur_dragon',  'Cœur de Dragon',     '🐉', C.LEGENDARY, R.LEGENDARY, 'legendary', 0, '+20 HP max, +5 Force. Immunité au feu et au poison. Régénère 2 HP/tour.',       'perm:vie+10,force+5,immune_fire_poison,regen2', 0, 'self'),
];

export const FULL_DECK = [
  ...MOVE_CARDS,
  ...ARMOR_CARDS,
  ...WEAPON_CARDS,
  ...MAGIC_WEAPON_CARDS,
  ...POTION_CARDS,
  ...SCROLL_CARDS,
  ...RARE_CARDS,
  ...LEGENDARY_CARDS,
];

export const DECK_BY_CATEGORY = {
  deplacement:  MOVE_CARDS,
  armure:       ARMOR_CARDS,
  arme:         WEAPON_CARDS,
  arme_magique: MAGIC_WEAPON_CARDS,
  potion:       POTION_CARDS,
  parchemin:    SCROLL_CARDS,
  objet_rare:   RARE_CARDS,
  legendaire:   LEGENDARY_CARDS,
};

export const RARITY_COLOR = {
  common:    '#888',
  uncommon:  '#55ccff',
  rare:      '#cc88ff',
  legendary: '#ffdd00',
};

// Metadata for displaying range badges in the UI
export const RANGE_META = {
  self:   { label: 'Soi',  color: '#666666' },
  melee:  { label: '✊',   color: '#ff9955' },
  back:   { label: '↩',   color: '#cc8844' },
  r2:     { label: '●2',  color: '#55ccff' },
  r4:     { label: '●4',  color: '#44aaee' },
  r5:     { label: '●5',  color: '#3399cc' },
  r6:     { label: '●6',  color: '#2288cc' },
  line:   { label: '━▶',  color: '#ffdd44' },
  aoe1:   { label: '💥1', color: '#ff7744' },
  aoe2:   { label: '💥2', color: '#ff4422' },
  global: { label: '⊕',   color: '#ffdd00' },
};

export const CAT_META = Object.values(C);

export function shuffleDeck(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// Keep old export names for backwards compat
export const DECK = FULL_DECK;
