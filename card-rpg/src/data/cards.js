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
  MOVE:       { key: 'deplacement',       color: '#55ccff', label: 'Déplacement'       },
  ARMOR:      { key: 'armure',            color: '#aaaaee', label: 'Armure'            },
  WEAPON:     { key: 'arme',              color: '#ff9955', label: 'Arme'              },
  MAGIC_WPN:  { key: 'arme_magique',      color: '#ff55ff', label: 'Arme Magique'      },
  POTION:     { key: 'potion',            color: '#55ff99', label: 'Potion'            },
  SCROLL:     { key: 'parchemin',         color: '#ffcc44', label: 'Parchemin'         },
  RARE:       { key: 'objet_rare',        color: '#ff8844', label: 'Objet Rare'        },
  LEGENDARY:  { key: 'legendaire',        color: '#ffdd00', label: 'Légendaire'        },
  TRINKET:    { key: 'bibelot',           color: '#88cc88', label: 'Bibelot'           },
  MOVE_BONUS: { key: 'bonus_deplacement', color: '#77ddff', label: 'Bonus Déplacement' },
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

// ─── ARMURES (20) — bonus = Points d'Armure (réduction de dégâts reçus) ──────
const ARMOR_CARDS = [
  card('vetes_matelasses', 'Vêtements matelassés',  '🧥', C.ARMOR, R.COMMON,    'defense', 2, '+1 Armure. Force requise 2.',                                             'stat:armor+1',                                   0, 'self'),
  card('robe_chambre',     'Robe de chambre',        '👘', C.ARMOR, R.COMMON,    'defense', 0, '+1 Armure, +1 Déplacement.',                                             'stat:armor+1,deplacement+1',                     0, 'self'),
  card('manteau_motard',   'Manteau de motard',      '🏍️', C.ARMOR, R.COMMON,   'defense', 3, '+2 Armure, +1 Richesse. Force requise 3.',                               'stat:armor+2,richesse+1',                        0, 'self'),
  card('kit_jogging',      'Kit de jogging',         '🏃', C.ARMOR, R.COMMON,    'defense', 0, '+3 Déplacement.',                                                        'stat:deplacement+3',                             0, 'self'),
  card('cape_resistance',  'Cape de résistance',     '🧣', C.ARMOR, R.COMMON,    'defense', 0, '+1 Armure, +2 Déplacement.',                                             'stat:armor+1,deplacement+2',                     0, 'self'),
  card('couvert_poubelle', 'Couvert de poubelle',    '🗑️', C.ARMOR, R.COMMON,   'defense', 2, '+2 Armure. Force requise 2.',                                            'stat:armor+2',                                   0, 'self'),
  card('kit_motocross',    'Kit de motocross',       '🏁', C.ARMOR, R.UNCOMMON,  'defense', 3, '+3 Armure. Force requise 3.',                                            'stat:armor+3',                                   0, 'self'),
  card('jambieres_hockey', 'Jambières de hockey',    '🦿', C.ARMOR, R.UNCOMMON,  'defense', 3, '+4 Armure, -3 Déplacement. Force requise 3.',                           'stat:armor+4,deplacement-3',                     0, 'self'),
  card('gants_boxe',       'Gants de boxe',          '🥊', C.ARMOR, R.UNCOMMON,  'defense', 0, '+1 Armure. +1 Force en corps à corps.',                                 'stat:armor+1,melee_force_bonus',                 0, 'self'),
  card('casque_baseball',  'Casque de baseball',     '⛑️', C.ARMOR, R.UNCOMMON,  'defense', 3, '+3 Armure. Force requise 3. Immunise contre l\'étourdissement.',        'stat:armor+3,no_stun',                           0, 'self'),
  card('plastron_acier',   "Plastron d'acier",       '🧲', C.ARMOR, R.RARE,      'defense', 4, '+6 Armure. Force requise 4.',                                            'stat:armor+6',                                   0, 'self'),
  card('bouclier_acier',   "Bouclier d'acier",       '🔵', C.ARMOR, R.RARE,      'defense', 4, '+4 Armure. Force requise 4.',                                            'stat:armor+4',                                   0, 'self'),
  card('equip_football',   'Équipement de football', '🏈', C.ARMOR, R.RARE,      'defense', 3, '+7 Armure. Force requise 3.',                                            'stat:armor+7',                                   0, 'self'),
  card('cotte_plates',     'Cotte de plates',        '🏰', C.ARMOR, R.RARE,      'defense', 5, '+8 Armure, -3 Déplacement. Force requise 5.',                           'stat:armor+8,deplacement-3',                     0, 'self'),
  card('armure_elfique',   'Armure elfique',         '🌿', C.ARMOR, R.RARE,      'defense', 2, '+5 Armure, +1 Déplacement. Force requise 2.',                           'stat:armor+5,deplacement+1',                     0, 'self'),
  card('chaine_bling',     'Chaîne bling bling',     '⛓️', C.ARMOR, R.RARE,     'defense', 0, '+3 Armure, +5 Richesse.',                                                'stat:armor+3,richesse+5',                        0, 'self'),
  card('porte_acier',      "Porte d'acier",          '🚪', C.ARMOR, R.LEGENDARY, 'defense', 6, '+10 Armure, -6 Dép. Force 6. Bloque le passage.',                       'stat:armor+10,deplacement-6,block_passage',      0, 'self'),
  card('scaphandrier',     'Scaphandrier',            '🤿', C.ARMOR, R.LEGENDARY, 'defense', 5, '+12 Armure, -5 Dép. Force 5. Immunisé déplacements forcés.',            'stat:armor+12,deplacement-5,immune_forced_move', 0, 'self'),
  card('chapeau_pointu',   'Le chapeau pointu',      '🎓', C.ARMOR, R.LEGENDARY, 'defense', 0, '+3 Armure, +4 Magie. Parchemin supplémentaire/tour.',                   'stat:armor+3,magie+4,extra_scroll',              0, 'self'),
  card('couronne_rois',    'Couronne des Rois',      '👑', C.ARMOR, R.LEGENDARY, 'defense', 0, 'Armure légendaire (tête). +6 Armure, +3 Force, +3 Magie, +6 HP permanent.', 'stat:armor+6,force+3,magie+3,vie+6',        0, 'self'),
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
  card('hache_chasseur', 'Hache du chasseur', '🪬', C.WEAPON, R.RARE, 'attack', 3, "Force requise 3. +3 dégâts si même cible qu'au dernier tour, +6 au deuxième tour consécutif. Reset si cible différente.", 'hunter', 0, 'melee'),
];

// ─── ARMEMENT MAGIQUE (6) ─────────────────────────────────────────────────────
const MAGIC_WEAPON_CARDS = [
  card('epee_flamme',   'Épée flamboyante',  '🔥', C.MAGIC_WPN, R.RARE,      'magic_attack', 4, '+4 Force, +2 Magie. Brûle l\'ennemi : dégâts supplémentaires sur dé 5-6.',     'burn',        0, 'melee'),
  card('arc_tenebres',  'Arc des Ténèbres',  '🌑', C.MAGIC_WPN, R.RARE,      'magic_attack', 3, 'Force requise 3. Maudit la cible : dé impair à son prochain déplacement = dégâts magiques égaux au résultat.', 'curse', 0, 'r4'),
  card('sceptre_givre', 'Sceptre de givre',  '❄️', C.MAGIC_WPN, R.RARE,      'magic_attack', 2, 'Force requise 2. Ralentit l\'ennemi : -4 Déplacement à son prochain tour.',   'slow_enemy',  0, 'r2'),
  card('dague_venin',   'Dague venimeuse',   '🐍', C.MAGIC_WPN, R.RARE,      'magic_attack', 3, 'Force requise 3. +2 Destin. Critique automatique sur dé 5-6 (×1.5 dégâts).',  'crit_5_6',    0, 'melee'),
  card('lame_spectrale','Lame spectrale',    '👻', C.MAGIC_WPN, R.LEGENDARY, 'magic_attack', 3, 'Force requise 3, Magie requise 4. Ignore armure et résistance. Attaque à travers les murs.', 'ignore_armor', 4, 'wall_melee'),
  card('epee_sang',     'Épée de sang',           '🩸', C.MAGIC_WPN, R.RARE, 'magic_attack', 6, 'Force requise 4, Magie requise 2. Corps-à-corps. 6 dégâts magiques ; le joueur relance tous les dés = 6.',                       'reroll_6',    2, 'melee'),
  card('arc_necro',     'Arc des Nécromanciens',  '💀', C.MAGIC_WPN, R.RARE, 'magic_attack', 6, 'Force requise 3, Magie requise 4. Portée 6 cases. 6 dégâts magiques ; la cible tombe à 1 Magie au prochain tour.',              'target_mag1', 4, 'r6'),
  card('telecommande',  'La Télécommande',        '📡', C.MAGIC_WPN, R.RARE, 'passive',       0, 'Magie requise 5. Peut relancer son jet de déplacement une fois par tour.',                                                      'reroll_move', 5, 'self'),
  card('sceptre_enchant',"Sceptre d'enchantement",'🔮', C.MAGIC_WPN, R.RARE, 'magic_attack', 6, 'Force requise 2, Magie requise 4. Portée 2 cases. 6 dégâts ; la cible remet une carte de son choix à l\'attaquant.',            'steal_card',  4, 'r2'),
];

// ─── POTIONS (12) ─────────────────────────────────────────────────────────────
const POTION_CARDS = [
  card('verre_eau',      "Verre d'eau",               '💧', C.POTION, R.COMMON,   'heal', 10, 'Restaure 10 HP. (✨1)',                                                                    null,                1, 'self'),
  card('grand_verre',    "Grand verre d'eau",          '🥤', C.POTION, R.COMMON,   'heal', 20, 'Restaure 20 HP. (✨2)',                                                                    null,                2, 'self'),
  card('gros_smoothie',  'Gros smoothie',              '🍵', C.POTION, R.UNCOMMON, 'heal', 30, 'Restaure 30 HP. (✨3)',                                                                    null,                3, 'self'),
  card('jus_vert',       'Verre de jus vert',          '🥦', C.POTION, R.COMMON,   'heal',  5, 'Restaure 5 HP. Immunise contre les malédictions jusqu\'au prochain tour. (✨1)',           'curse_shield',      1, 'self'),
  card('shake_prot',     "Shake de prot'",             '🥛', C.POTION, R.COMMON,   'buff',  0, '+3 dégâts sur la prochaine attaque. (✨1)',                                                'next_atk_bonus_3',  1, 'self'),
  card('double_allonge', 'Double allongé noir',        '☕', C.POTION, R.COMMON,   'buff',  0, '+3 Déplacement sur le prochain mouvement. (✨1)',                                          'next_move_bonus_3', 1, 'self'),
  card('antibiotique',   "Cuillère d'antibiotique",    '🧴', C.POTION, R.UNCOMMON, 'buff',  0, '+12 PV temporaires. Immunise contre les malédictions jusqu\'au prochain tour. (✨2)',      'temphp_curse_shield', 2, 'self'),
  card('champagne',      'Coupe de champagne',         '🥂', C.POTION, R.UNCOMMON, 'buff',  0, 'Double les 3 prochains gains d\'or. (✨2)',                                                'gold_double_3',     2, 'self'),
  card('jus_etoile',     "Verre de jus d'étoile",      '⭐', C.POTION, R.UNCOMMON, 'buff',  0, '+6 dégâts sur la prochaine attaque. (✨2)',                                                'next_atk_bonus_6',  2, 'self'),
  card('lait_licorne',   'Verre de lait de licorne',   '🦄', C.POTION, R.RARE,     'buff',  0, '+18 Vie permanent (augmente le HP max). (✨4)',                                            'perm:vie+18',       4, 'self'),
  card('sang_dragon',    'Verre de sang de dragon',    '🐉', C.POTION, R.RARE,     'buff',  0, '+1 Destin permanent. (✨2)',                                                               'perm:destin+1',     2, 'self'),
  card('biere_viking',   'Bière de viking',            '🍺', C.POTION, R.RARE,     'buff',  0, '×2 dégâts sur les 3 prochaines attaques physiques. (✨3)',                                 'frenzied_3',        3, 'self'),
];

// ─── PARCHEMINS MAGIQUES (13) ─────────────────────────────────────────────────
const SCROLL_CARDS = [
  card('boulette_feu',  'Boulette de Feu',        '🔥', C.SCROLL, R.COMMON,   'magic', 6, '6 dégâts magiques. Portée 4. Auto-dégâts 3 si cible < 3 cases. (✨4)',           'fireball',       4, 'r4'),
  card('eclair',        'Éclair',                  '⚡', C.SCROLL, R.COMMON,   'magic', 4, '4 dégâts magiques. Portée 6. (✨2)',                                               null,             2, 'r6'),
  card('nova_givre',    'Nova de Givre',           '❄️', C.SCROLL, R.UNCOMMON, 'magic', 2, '2 dégâts devant et derrière + gèle les ennemis proches. (✨2)',                   'nova_front_back', 2, 'auto'),
  card('soin_scroll',   'Soin',                   '✨', C.SCROLL, R.COMMON,   'magic', 0, 'Restaure 15 HP. (✨3)',                                                            'heal_15',        3, 'self'),
  card('tempete_lames', 'Tempête de lames',        '🌀', C.SCROLL, R.UNCOMMON, 'magic', 0, 'Dégâts physiques : 2 cases=2 dmg, 3 cases=4 dmg, 4 cases=6 dmg. (✨3)',           'blade_storm',    3, 'r4'),
  card('confusion',     'Confusion',               '😵', C.SCROLL, R.UNCOMMON, 'magic', 0, 'La cible s\'auto-attaque une fois (dégâts = sa Force). Portée 2. (✨4)',           'confusion',      4, 'r2'),
  card('malediction',   'Malédiction',             '🧿', C.SCROLL, R.UNCOMMON, 'magic', 0, 'Maudit la cible (dé impair sur son prochain dépl. = dégâts). Portée 2. (✨3)',    'curse',          3, 'r2'),
  card('proj_magiques', 'Projectiles magiques',    '🌟', C.SCROLL, R.UNCOMMON, 'magic', 0, 'Portée et dégâts = puissance choisie (2 à 6). (✨2-6)',                            'proj_scalable',  2, 'r2'),
  card('telekinesie',   'Télékinésie',             '🔮', C.SCROLL, R.RARE,     'magic', 0, 'Repousse la cible de 4/5/6 cases (devant ou derrière). (✨4/5/6)',                'tele_scalable',  4, 'r4'),
  card('invocation',    'Invocation — Golem',      '⛰️', C.SCROLL, R.RARE,     'magic', 0, 'Convoque un Golem. 4✨=Terre (6PV/F3), 5✨=Pierre (12PV/F5), 6✨=Or (24PV/F8). (✨4/5/6)', 'summon', 4, 'melee'),
  card('bouclier_mag',  'Bouclier Magique',        '🔵', C.SCROLL, R.RARE,     'magic', 0, 'Donne 18 points de vie temporaires. (✨3)',                                        'shield10',       3, 'self'),
  card('vision',        'Vision prophétique',      '👁️', C.SCROLL, R.UNCOMMON, 'magic', 0, 'Révèle les mains de tous les joueurs adverses. (✨2)',                             'reveal_hands',   2, 'global'),
  card('resurrection',  'Résurrection',            '💀', C.SCROLL, R.LEGENDARY,'magic', 0, 'Si tu tombes à 0 HP ce tour, reviens à 50% HP. Usage unique. (✨6)',               'revive_50',      6, 'self'),
];

// ─── OBJETS RARES (6) ─────────────────────────────────────────────────────────
const RARE_CARDS = [
  card('pierre_ancetre','Pierre de l\'Ancêtre', '🪨', C.RARE, R.RARE, 'passive', 0, 'Tous les "1" sur n\'importe quel jet de dé sont remplacés par "2".',                                                                            'min_roll_1to2',                               0, 'self'),
  card('anneau_chaos',  'Anneau du Chaos',      '💫', C.RARE, R.RARE, 'passive', 0, 'Lors du jet de déplacement, les résultats 1 et 2 font automatiquement reculer.',                                                               'move_1_2_backward',                           0, 'self'),
  card('flute_vent',    'Flûte du vent',        '🪈', C.RARE, R.RARE, 'passive', 0, 'Lors du jet de déplacement, si un des dés montre 5 ou 6, peut choisir de retourner à sa base.',                                               'wind_return_5_6',                             0, 'self'),
  card('cape_invis',    "Cape d'Invisibilité",  '🌫️', C.RARE, R.RARE, 'passive', 0, 'Évite 1 combat ou 1 piège par tour (au choix du joueur).',                                                                                     'avoid_combat_or_trap',                        0, 'self'),
  card('orbe_vision',   'Orbe de Vision',       '🔭', C.RARE, R.RARE, 'passive', 0, '+1 Richesse permanent. Peut ouvrir un coffre dans un rayon de 6 cases.',                                                                       'perm:richesse+1,open_chest_r6',               0, 'self'),
  card('grimoire',      'Grimoire interdit',    '📖', C.RARE, R.RARE, 'passive', 0, '+2 Magie, -1 Force permanent. Gagne automatiquement contre tous les monstres. Ne peut plus entrer dans les magasins.',                         'perm:magie+2,force-1,auto_win_monsters,no_shops', 0, 'self'),
];

// ─── OBJETS LÉGENDAIRES (1) ───────────────────────────────────────────────────
const LEGENDARY_CARDS = [
  card('coeur_dragon',  'Cœur de Dragon',    '🐉', C.LEGENDARY, R.LEGENDARY, 'legendary', 0, '+20 HP permanent. Peut utiliser l\'effet Boule de Feu une fois par tour, en plus des parchemins en sa possession.',                 'perm:vie+20,free_fireball_per_turn',        0, 'self'),
];

// ─── BIBELOTS (18) ────────────────────────────────────────────────────────────
const TRINKET_CARDS = [
  card('pierre_friction',    'Pierre de Friction',            '🔸', C.TRINKET, R.UNCOMMON, 'passive', 1, '+1 Force. Accumule 1 charge par dégât reçu (max 10) ; dépense tout sur le prochain coup.',                                                'perm:force+1,charge_on_hit10',       0, 'self'),
  card('bague_comptage',     'Bague de Comptage',             '💍', C.TRINKET, R.UNCOMMON, 'passive', 0, '+3 pièces d\'or supplémentaires à chaque ouverture d\'un trésor.',                                                                          'perm:chest_gold+3',                  0, 'self'),
  card('dent_bonheur',       'Dent Porte-Bonheur',            '🦷', C.TRINKET, R.UNCOMMON, 'passive', 1, '+1 Destin. Les dés de 2 comptent comme 3.',                                                                                                  'perm:destin+1,roll2_as3',            0, 'self'),
  card('ecaille_iguane',     "Écaille d'Iguane",              '🦎', C.TRINKET, R.COMMON,   'passive', 1, '+1 Force.',                                                                                                                                   'perm:force+1',                       0, 'self'),
  card('meche_cheveux',      'Mèche de Cheveux',              '✂️', C.TRINKET, R.COMMON,   'passive', 1, '+1 Magie.',                                                                                                                                   'perm:magie+1',                       0, 'self'),
  card('semelle_clouee',     'Semelle Clouée',                '👟', C.TRINKET, R.COMMON,   'passive', 1, '+1 Déplacement, +1 Force.',                                                                                                                   'perm:deplacement+1,force+1',         0, 'self'),
  card('bol_tibetain',       'Bol Tibétain',                  '🔔', C.TRINKET, R.UNCOMMON, 'passive', 3, '+3 HP permanent. Régénère 1 HP si aucun dégât reçu au tour précédent.',                                                                      'perm:vie+3,regen1_no_dmg',           0, 'self'),
  card('faux_ongles',        'Faux Ongles Crasseux',          '💅', C.TRINKET, R.UNCOMMON, 'passive', 0, 'Si l\'attaque physique sur un joueur fait ≤3 dégâts, la cible devient immobile au prochain tour.',                                           'perm:immobilize_low_phys',           0, 'self'),
  card('sel_guerre',         'Sel de Guerre',                 '🧂', C.TRINKET, R.UNCOMMON, 'passive', 1, '+1 Force. +3 dégâts contre une cible immobile.',                                                                                             'perm:force+1,bonus3_vs_immobile',    0, 'self'),
  card('bougie_noire',       'Bougie Noire',                  '🕯️', C.TRINKET, R.UNCOMMON, 'passive', 1, '+1 Magie. Accumule 1 charge par tour sans dégât reçu (max 10) ; dépense tout sur les prochains dégâts magiques.',                            'perm:magie+1,charge_no_dmg10',       0, 'self'),
  card('lasso',              'Lasso',                         '🧵', C.TRINKET, R.RARE,     'passive', 0, 'Si tu termines ton tour à ≤3 cases d\'un adversaire, il devient immobile à son prochain tour.',                                              'perm:lasso_immobilize3',             0, 'self'),
  card('galet_echo',         "Galet d'Écho",                  '🔘', C.TRINKET, R.RARE,     'passive', 1, '+1 Magie. Réduit de 1 le coût magique des parchemins, armes et armures.',                                                                     'perm:magie+1,reduce_mag_cost1',      0, 'self'),
  card('plume_nevermore',    'Plume de Nevermore',            '🪶', C.TRINKET, R.RARE,     'passive', 2, '+2 Magie. [Set Esprits] Avec Lunettes du Rêve + Sac de Sable : avance ou recule à guise, +Magie aux dommages magiques, +2 Destin, renvoie les adversaires adjacents à leur base.', 'perm:magie+2,set:esprits', 0, 'self'),
  card('collier_coquillages','Collier de Coquillages Sacrés', '🪸', C.TRINKET, R.RARE,     'passive', 2, '+2 Force. [Set Guerrier Sacré] Avec Tattoo Dansant + Hameçon Sacré : lance 3 dés de déplacement, +Force aux dommages physiques, +2 Destin, ne déclenche plus les pièges.', 'perm:force+2,set:guerrier_sacre', 0, 'self'),
  card('lunettes_reve',      'Lunettes du Rêve',              '🥽', C.TRINKET, R.RARE,     'passive', 3, '+3 Magie. [Set Esprits] Voir Plume de Nevermore pour le bonus de set.',                                                                        'perm:magie+3,set:esprits',           0, 'self'),
  card('tattoo_dansant',     'Tattoo Dansant',                '💃', C.TRINKET, R.RARE,     'passive', 4, '+4 Force. [Set Guerrier Sacré] Voir Collier de Coquillages Sacrés pour le bonus de set.',                                                     'perm:force+4,set:guerrier_sacre',    0, 'self'),
  card('sac_sable',          'Sac de Sable',                  '👝', C.TRINKET, R.RARE,     'passive', 5, '+5 Magie. [Set Esprits] Voir Plume de Nevermore pour le bonus de set.',                                                                        'perm:magie+5,set:esprits',           0, 'self'),
  card('hamecon_sacre',      "L'Hameçon Sacré",               '🪝', C.TRINKET, R.RARE,      'passive', 5, '+5 Force. [Set Guerrier Sacré] Voir Collier de Coquillages Sacrés pour le bonus de set.',                                                    'perm:force+5,set:guerrier_sacre',    0, 'self'),
  card('oeil_destin',        "L'Œil",                         '👁️', C.TRINKET, R.LEGENDARY, 'passive', 0, 'Bibelot magique. Lance 2 fois et choisit le résultat de son choix pour tous ses jets.',                                                           'reroll_choice',                      0, 'self'),
];

// ─── BONUS DE DÉPLACEMENT (35) ────────────────────────────────────────────────
function mb(id, name, icon, effectCode, desc) {
  return {
    id, name, icon,
    category: C.MOVE_BONUS.key, catColor: C.MOVE_BONUS.color, catLabel: C.MOVE_BONUS.label,
    rarity: R.COMMON,
    effect: { type: 'move_bonus', special: effectCode, bonus: 0, magieCost: 0, range: 'self' },
    desc,
    goldValue: 0,
  };
}

export const MOVE_BONUS_CARDS = [
  mb('mb_1',      '1',                    '①',   'fixed:1',        'Déplace de 1 case exactement.'),
  mb('mb_2',      '2',                    '②',   'fixed:2',        'Déplace de 2 cases exactement.'),
  mb('mb_3',      '3',                    '③',   'fixed:3',        'Déplace de 3 cases exactement.'),
  mb('mb_4',      '4',                    '④',   'fixed:4',        'Déplace de 4 cases exactement.'),
  mb('mb_5',      '5',                    '⑤',   'fixed:5',        'Déplace de 5 cases exactement.'),
  mb('mb_6',      '6',                    '⑥',   'fixed:6',        'Déplace de 6 cases exactement.'),
  mb('mb_p1',     '+1',                   '🔼',   'add:1',          'Ajoute 1 au jet de déplacement.'),
  mb('mb_p2',     '+2',                   '🔼',   'add:2',          'Ajoute 2 au jet de déplacement.'),
  mb('mb_p3',     '+3',                   '🔼',   'add:3',          'Ajoute 3 au jet de déplacement.'),
  mb('mb_p4',     '+4',                   '🔼',   'add:4',          'Ajoute 4 au jet de déplacement.'),
  mb('mb_p5',     '+5',                   '🔼',   'add:5',          'Ajoute 5 au jet de déplacement.'),
  mb('mb_p6',     '+6',                   '🔼',   'add:6',          'Ajoute 6 au jet de déplacement.'),
  mb('mb_p1d',    '+1 Dé',               '🎲',   'add_die:1',      'Ajoute 1 dé au déplacement.'),
  mb('mb_p2d',    '+2 Dés',              '🎲',   'add_die:2',      'Ajoute 2 dés au déplacement.'),
  mb('mb_m1',     '-1',                   '🔽',   'sub:1',          'Recule de 1 case.'),
  mb('mb_m2',     '-2',                   '🔽',   'sub:2',          'Recule de 2 cases.'),
  mb('mb_m3',     '-3',                   '🔽',   'sub:3',          'Recule de 3 cases.'),
  mb('mb_m4',     '-4',                   '🔽',   'sub:4',          'Recule de 4 cases.'),
  mb('mb_m5',     '-5',                   '🔽',   'sub:5',          'Recule de 5 cases.'),
  mb('mb_m6',     '-6',                   '🔽',   'sub:6',          'Recule de 6 cases.'),
  mb('mb_pair',   'Pair',                 '🔢',   'cond:even',      'Déplacement vaut 2, 4 ou 6.'),
  mb('mb_impair', 'Impaire',              '🔢',   'cond:odd',       'Déplacement vaut 1, 3 ou 5.'),
  mb('mb_bas',    'Bas',                  '⬇️',   'cond:low',       'Déplacement vaut 1, 2 ou 3.'),
  mb('mb_haut',   'Haut',                 '⬆️',   'cond:high',      'Déplacement vaut 4, 5 ou 6.'),
  mb('mb_petit',  'Petit',                '🔡',   'cond:tiny',      'Déplacement vaut 1 ou 2.'),
  mb('mb_fort',   'Fort',                 '💪',   'cond:strong',    'Déplacement vaut 5 ou 6.'),
  mb('mb_bizarre','Bizarre',              '🌀',   'special:back2',  'Recule de 2 cases.'),
  mb('mb_inverse','Inversé',              '🔄',   'special:negate', 'Recule du résultat obtenu.'),
  mb('mb_milieu', 'Milieu',               '🎯',   'cond:mid',       'Déplacement vaut 3 ou 4.'),
  mb('mb_gsplit', 'Gros Split',           '↕️',   'cond:bigsplit',  'Déplacement vaut 1 ou 6.'),
  mb('mb_psplit', 'Petit Split',          '↔️',   'cond:smallsplit','Déplacement vaut 3 ou 5.'),
  mb('mb_x2',     '×2',                  '✌️',   'multiply:2',     'Double le résultat du dé.'),
  mb('mb_x3',     '×3',                  '🤟',   'multiply:3',     'Triple le résultat du dé.'),
  mb('mb_escalade','Escalade',            '🧗',   'special:wall',   'Surmonte un mur.'),
  mb('mb_portail','Portail vers la ville','🏠',   'special:return_base','Retourne immédiatement à ta base.'),
];

export { MOVE_CARDS, ARMOR_CARDS, WEAPON_CARDS, MAGIC_WEAPON_CARDS, POTION_CARDS, SCROLL_CARDS, RARE_CARDS, LEGENDARY_CARDS, TRINKET_CARDS };

export const FULL_DECK = [
  ...MOVE_CARDS,
  ...ARMOR_CARDS,
  ...WEAPON_CARDS,
  ...MAGIC_WEAPON_CARDS,
  ...POTION_CARDS,
  ...SCROLL_CARDS,
  ...RARE_CARDS,
  ...LEGENDARY_CARDS,
  ...TRINKET_CARDS,
];

export const DECK_BY_CATEGORY = {
  deplacement:       MOVE_CARDS,
  armure:            ARMOR_CARDS,
  arme:              WEAPON_CARDS,
  arme_magique:      MAGIC_WEAPON_CARDS,
  potion:            POTION_CARDS,
  parchemin:         SCROLL_CARDS,
  objet_rare:        RARE_CARDS,
  legendaire:        LEGENDARY_CARDS,
  bibelot:           TRINKET_CARDS,
  bonus_deplacement: MOVE_BONUS_CARDS,
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
  melee:      { label: '✊',   color: '#ff9955' },
  wall_melee: { label: 'Mur', color: '#cc88ff' },
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
