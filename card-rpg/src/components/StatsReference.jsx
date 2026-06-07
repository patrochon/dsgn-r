import { RACES, CLASSES, SPECS, BASE_STATS } from '../data/character';
import { ARMOR_CARDS, WEAPON_CARDS, MAGIC_WEAPON_CARDS, RARE_CARDS, LEGENDARY_CARDS, TRINKET_CARDS, POTION_CARDS, SCROLL_CARDS } from '../data/cards';
import { MONSTER_PILE_1, MONSTER_PILE_2, MONSTER_PILE_3 } from '../data/monsters';
import { RARITY_COLOR } from '../data/cards';

const S = {
  wrap:    { padding: '16px', color: '#eee', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', maxHeight: '100vh', background: '#111' },
  h1:      { color: '#ffdd00', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '12px', fontSize: '16px' },
  h2:      { color: '#88ccff', margin: '20px 0 6px', fontSize: '14px', borderLeft: '3px solid #88ccff', paddingLeft: '8px' },
  h3:      { color: '#aaaaaa', margin: '14px 0 4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
  table:   { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th:      { background: '#222', padding: '5px 8px', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #333', whiteSpace: 'nowrap' },
  td:      { padding: '4px 8px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'top' },
  tdNum:   { padding: '4px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center', color: '#88ff88' },
  even:    { background: '#161616' },
  odd:     { background: '#111' },
  chip:    { display: 'inline-block', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, marginRight: '4px' },
  desc:    { color: '#aaa', fontSize: '12px', lineHeight: '1.5' },
  sep:     { border: 'none', borderTop: '1px solid #222', margin: '20px 0' },
};

function Row({ cells, even }) {
  const bg = even ? S.even : S.odd;
  return (
    <tr style={bg}>
      {cells.map((c, i) => {
        const isNum = typeof c === 'number';
        return <td key={i} style={isNum ? { ...S.tdNum, ...bg } : { ...S.td, ...bg }}>{c ?? '—'}</td>;
      })}
    </tr>
  );
}

function Table({ cols, rows }) {
  return (
    <table style={S.table}>
      <thead><tr>{cols.map(c => <th key={c} style={S.th}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <Row key={i} cells={r} even={i % 2 === 0} />)}</tbody>
    </table>
  );
}

function statRow(item) {
  const b = item.bonuses ?? {};
  return [
    item.icon + ' ' + item.name,
    b.force  ?? 0,
    b.magie  ?? 0,
    b.vie    ?? 0,
    b.deplacement ?? 0,
    b.richesse ?? 0,
    b.destin ?? 0,
    b.armor ?? 0,
    item.passive ?? '—',
  ];
}

function cardRow(card) {
  const sp = card.effect?.special ?? '—';
  return [
    card.icon + ' ' + card.name,
    card.rarity,
    card.effect?.type ?? '—',
    card.effect?.bonus ?? 0,
    sp.length > 48 ? sp.slice(0, 48) + '…' : sp,
    card.desc,
  ];
}

function monsterRow(m) {
  return [m.icon + ' ' + m.name, m.maxHp, m.attack, m.defense, m.loot];
}

// ─── Données de référence ──────────────────────────────────────────────────────

const RARITIES = [
  { label: 'Commune',    key: 'common',    color: '#888888', desc: 'Cartes de base, effets simples. Présentes en grande quantité dans le deck.' },
  { label: 'Inhabituelle',key:'uncommon',  color: '#55ccff', desc: 'Effets spéciaux modérés. Plus rares à tirer.' },
  { label: 'Rare',       key: 'rare',      color: '#cc88ff', desc: 'Effets puissants ou uniques. Peuvent changer le cours d\'une partie.' },
  { label: 'Légendaire', key: 'legendary', color: '#ffdd00', desc: 'Effets exceptionnels. Une seule copie par type dans le jeu.' },
];

const EFFECT_TYPES = [
  { type: 'attack',       label: '⚔️ Attaque',         desc: 'Arme physique. S\'équipe (slot arme). Nécessite un jet de dé pour attaquer. Force requise selon l\'arme.' },
  { type: 'magic_attack', label: '✨ Attaque magique',  desc: 'Arme magique. S\'équipe (slot arme). Dégâts basés sur Magie. Magie requise selon l\'arme.' },
  { type: 'defense',      label: '🛡️ Défense',          desc: 'Armure. S\'équipe (slot armure). Donne des points d\'Armure qui réduisent les dégâts physiques reçus. Force requise selon l\'armure.' },
  { type: 'passive',      label: '🔮 Passif',           desc: 'Objet passif (rare ou bibelot). S\'équipe dans l\'inventaire. Effet permanent actif tant que l\'objet est équipé.' },
  { type: 'legendary',    label: '👑 Légendaire',        desc: 'Objet légendaire unique. S\'équipe dans l\'inventaire. Bonus permanents puissants.' },
  { type: 'heal',         label: '💚 Soin',             desc: 'Potion de soin. Utilisable (coûte 1 action). Restaure des HP immédiatement.' },
  { type: 'buff',         label: '⬆️ Buff',             desc: 'Potion de buff. Utilisable (coûte 1 action). Donne un bonus temporaire ce tour ou les suivants.' },
  { type: 'magic',        label: '📜 Magie',            desc: 'Parchemin magique. Utilisable (coûte 1 action + coût en ✨ Magie). Effet immédiat à portée.' },
  { type: 'move',         label: '💨 Déplacement',      desc: 'Carte de mouvement. Jouer avant de lancer le dé de déplacement pour modifier le résultat.' },
  { type: 'move_bonus',   label: '🔢 Bonus dépl.',      desc: 'Modificateur de déplacement. Piochée automatiquement dans un deck séparé, modifie le jet de dé.' },
];

const PASSIFS = [
  // Races
  { id: 'longs_bras',   src: '🦾 Race',   label: 'Longs Bras',    desc: 'Après chaque déplacement, peut activer gratuitement une case adjacente (monstre, piège ou coffre) sans s\'y déplacer.' },
  { id: 'chapeaux',     src: '🎩 Race',   label: 'Chapeaux',       desc: 'Peut choisir la sortie de téléportation. Double le butin des coffres.' },
  { id: 'cailloux',     src: '🪨 Race',   label: 'Cailloux',       desc: 'Réduit tous les dégâts physiques reçus de 1.' },
  { id: 'zeles',        src: '⚡ Race',   label: 'Zélés',          desc: 'Le bonus de Déplacement est optionnel : le joueur choisit de l\'appliquer ou non à chaque jet.' },
  { id: 'peluches',     src: '🧸 Race',   label: 'Peluches',       desc: 'Ne peut pas être attaqué de dos. Peut traverser un mur supplémentaire lors du déplacement.' },
  { id: 'touffus',      src: '🌿 Race',   label: 'Touffus',        desc: 'Sur un jet de dé 6, choisit entre se déplacer (6 cases) ou gagner une action bonus à la place.' },
  // Classes
  { id: 'bum',          src: '🧣 Classe', label: 'Bum',            desc: 'Peut lancer une carte arme physique comme projectile sur une cible à 2 cases (coûte 1 action). La carte est détruite.' },
  { id: 'fou',          src: '🃏 Classe', label: 'Fou',            desc: 'Peut attaquer une case au choix à portée adjacente, ou se téléporter sur une case visible (dé ≥ 4).' },
  { id: 'alchimiste',   src: '⚗️ Classe', label: 'Alchimiste',     desc: 'Bonus passifs de +3 Vie et +1 Richesse. Ses potions ont des effets amplifiés.' },
  { id: 'messager',     src: '📨 Classe', label: 'Messager',        desc: 'Peut choisir de passer à travers un monstre sans combattre. Échange une carte avec un joueur croisé en ligne droite.' },
  { id: 'cravate',      src: '👔 Classe', label: 'Cravaté',         desc: 'En atterrissant sur une Case Prison, peut interchanger sa position avec un adversaire à 6 cases.' },
  { id: 'wiki',         src: '📚 Classe', label: 'Wiki',            desc: 'Une fois par tour, peut interchanger ses stats Force ↔ Magie. Les armes avec Force requise sont défaussées si la condition n\'est plus remplie.' },
  // Spécialisations
  { id: 'autodefense',  src: '🥊 Spec',  label: 'Autodéfense',    desc: 'Contre-attaque automatique lors de certaines attaques reçues. +1 Force passif.' },
  { id: 'coeur_noir',   src: '🖤 Spec',  label: 'Cœur Noir',      desc: 'Réduit la Magie de tout attaquant adjacent à 1 lors d\'une attaque magique.' },
  { id: 'premier_soin', src: '🩹 Spec',  label: 'Premier Soin',   desc: 'Lors du premier passage à 0 HP de la partie, ressuscite avec un résultat de d6 HP au lieu de mourir.' },
  { id: 'secretariat',  src: '📋 Spec',  label: 'Secrétariat',    desc: 'Peut ajuster son jet de déplacement de ±1 après le lancer (une fois par tour).' },
  { id: 'voodoo',       src: '🧿 Spec',  label: 'Voodoo',         desc: 'Lie son sort à un autre joueur : les dégâts ou soins sont partagés entre les deux.' },
  { id: 'nde',          src: '💀 Spec',  label: 'Near Death Exp.',desc: 'En mourant, conserve son or et sa main. Revient avec un d6 HP à sa base. Consomme 1 Destin.' },
  { id: 'jiu_jutse',    src: '🥋 Spec',  label: 'Jiu Jitsu',      desc: 'Quand un adversaire se déplace vers le joueur, échange leur position. L\'adversaire subit ses propres dégâts de Force et est immobilisé.' },
  { id: 'pacte',        src: '📜 Spec',  label: 'Pacte',          desc: 'Lors d\'une rencontre avec un monstre, ce monstre est automatiquement tué (un seul monstre par rencontre). Les autres monstres sur la carte ne sont pas affectés.' },
  { id: 'ectomorphe',   src: '👻 Spec',  label: 'Ectomorphe',     desc: 'Ignore tous les pièges — les traverse sans les déclencher.' },
  { id: 'couponing',    src: '🏷️ Spec',  label: 'Couponing',      desc: 'Dans les magasins, 1er achat à 1💰, 2ème au prix normal. Voit 3 cartes à choisir au lieu d\'en piocher directement.' },
  { id: 'imperissable', src: '💎 Spec',  label: 'Impérissable',   desc: 'HP maximum doublé à la création. Immunisé aux dégâts de zone (AOE).' },
  { id: 'voyage_astral',src: '🌌 Spec',  label: 'Voyage Astral',  desc: 'Peut déplacer n\'importe quel monstre visible vers une case libre (1 action). +1 Magie passif.' },
];

const SPECIALS = [
  // Stats
  { key: 'stat:X+N',              label: 'stat:X+N',              desc: 'Bonus de stat quand équipé (X = force, magie, armor, deplacement…). Annulé si retiré.' },
  { key: 'perm:X+N',              label: 'perm:X+N',              desc: 'Bonus permanent appliqué à l\'équipement. Peut inclure plusieurs stats séparées par des virgules.' },
  // Rares / passifs
  { key: 'min_roll_1to2',         label: 'min_roll_1to2',         desc: 'Tous les résultats "1" sur n\'importe quel dé sont automatiquement remplacés par "2".' },
  { key: 'move_1_2_backward',     label: 'move_1_2_backward',     desc: 'Lors d\'un jet de déplacement, les résultats 1 et 2 font automatiquement reculer.' },
  { key: 'wind_return_5_6',       label: 'wind_return_5_6',       desc: 'Si un dé de déplacement montre 5 ou 6, peut choisir de retourner à sa base plutôt qu\'avancer.' },
  { key: 'avoid_combat_or_trap',  label: 'avoid_combat_or_trap',  desc: 'Une fois par tour, peut éviter 1 monstre OU 1 piège (au choix du joueur).' },
  { key: 'auto_win_monsters',     label: 'auto_win_monsters',     desc: 'Élimine automatiquement tous les monstres rencontrés sans combat (voir aussi passif Pacte).' },
  { key: 'no_shops',              label: 'no_shops',              desc: 'Ne peut plus entrer dans les cases Magasin.' },
  { key: 'reroll_choice',         label: 'reroll_choice',         desc: 'Lance tous ses jets 2 fois et choisit librement le résultat à garder.' },
  { key: 'perm:richesse+1,open_chest_r6', label: 'open_chest_r6', desc: 'Peut ouvrir un coffre dans un rayon de 6 cases sans se déplacer dessus.' },
  { key: 'perm:force+N,set:X',   label: 'set:X',                 desc: 'Fait partie d\'un set. Bonus de set activé quand tous les objets du groupe sont équipés simultanément.' },
  // Armes
  { key: 'double_on_6',           label: 'double_on_6',           desc: 'Si le dé d\'attaque donne 6, les dégâts sont doublés.' },
  { key: 'throw_destroy',         label: 'throw_destroy',         desc: 'Peut être lancée à 2 cases, mais est détruite après usage.' },
  { key: 'back_free_attack',      label: 'back_free_attack',      desc: 'Peut frapper la case directement derrière soi sans dépenser de mouvement.' },
  { key: 'push_enemy',            label: 'push_enemy',            desc: 'Repousse la cible d\'une case après l\'attaque.' },
  { key: 'no_move_after',         label: 'no_move_after',         desc: 'Après avoir attaqué, aucun déplacement possible ce tour.' },
  { key: 'armor_pierce2',         label: 'armor_pierce2',         desc: 'Perce 2 points d\'Armure de la cible (réduit l\'armure effective de 2).' },
  { key: 'range_min3',            label: 'range_min3',            desc: 'Portée minimum 3 cases : ne peut pas attaquer une cible adjacente.' },
  { key: 'disarm_6',              label: 'disarm_6',              desc: 'Sur un dé 6, désarme la cible (elle défausse 1 carte de sa main).' },
  { key: 'stun_6',                label: 'stun_6',                desc: 'Sur un dé 6, étourdit la cible — elle passe son prochain tour.' },
  { key: 'aim',                   label: 'aim',                   desc: '+2 Force si le joueur n\'a pas bougé ce tour.' },
  { key: 'pierce_if_still',       label: 'pierce_if_still',       desc: 'Perce toute l\'armure de la cible si le joueur n\'a pas bougé ce tour.' },
  { key: 'hunter',                label: 'hunter',                desc: '+3 dégâts si même cible qu\'au tour précédent, +6 au 2ème tour consécutif. Reset si cible différente.' },
  // Armes magiques
  { key: 'burn',                  label: 'burn',                  desc: 'Sur dé 5–6, dégâts amplifiés ×1.5 (brûlure).' },
  { key: 'curse',                 label: 'curse',                 desc: 'Maudit la cible : prochain déplacement impair = dégâts magiques égaux au résultat du dé.' },
  { key: 'slow_enemy',            label: 'slow_enemy',            desc: '-4 Déplacement à la cible pour son prochain tour.' },
  { key: 'crit_5_6',             label: 'crit_5_6',              desc: 'Critique automatique sur dé 5–6 : dégâts ×1.5.' },
  { key: 'reroll_6',              label: 'reroll_6',              desc: '6 dégâts magiques. Relance tous les dés montrant 6.' },
  { key: 'target_mag1',           label: 'target_mag1',           desc: 'La cible tombe à 1 Magie pour son prochain tour.' },
  { key: 'steal_card',            label: 'steal_card',            desc: 'La cible remet une carte de son choix à l\'attaquant.' },
  { key: 'ignore_armor',          label: 'ignore_armor',          desc: 'Ignore toute l\'armure et résistance physique de la cible.' },
  { key: 'reroll_move',           label: 'reroll_move',           desc: 'Peut relancer son jet de déplacement une fois par tour.' },
  // Parchemins
  { key: 'fireball',              label: 'fireball',              desc: '6 dégâts en zone. Auto-dégâts 3 si cible à moins de 3 cases.' },
  { key: 'nova_front_back',       label: 'nova_front_back',       desc: '2 dégâts devant et derrière le joueur + gèle les ennemis proches.' },
  { key: 'heal_15',               label: 'heal_15',               desc: 'Restaure 15 HP.' },
  { key: 'blade_storm',           label: 'blade_storm',           desc: 'Dégâts physiques progressifs par distance : 2 cases = 2 dmg, 3 = 4, 4 = 6.' },
  { key: 'confusion',             label: 'confusion',             desc: 'La cible s\'auto-attaque (dégâts = sa Force).' },
  { key: 'proj_scalable',         label: 'proj_scalable',         desc: 'Portée et dégâts = puissance choisie (2 à 6 ✨).' },
  { key: 'tele_scalable',         label: 'tele_scalable',         desc: 'Repousse la cible de 4/5/6 cases selon la puissance dépensée.' },
  { key: 'summon',                label: 'summon',                desc: 'Invoque un Golem allié : 4✨=Terre (6PV/F3), 5✨=Pierre (12PV/F5), 6✨=Or (24PV/F8).' },
  { key: 'shield10',              label: 'shield10',              desc: '18 PV temporaires absorbés avant les vrais PV.' },
  { key: 'reveal_hands',          label: 'reveal_hands',          desc: 'Révèle les mains de tous les adversaires.' },
  { key: 'revive_50',             label: 'revive_50',             desc: 'Si le joueur tombe à 0 HP ce tour, revient à 50% HP. Usage unique.' },
  // Déplacement
  { key: 'charge',                label: 'charge',                desc: 'Dé+2 cases. Si la case d\'arrivée est un ennemi, +2 Force ce tour.' },
  { key: 'diagonal',              label: 'diagonal',              desc: 'Dé+2 cases, les diagonales sont autorisées.' },
  { key: 'dodge',                 label: 'dodge',                 desc: 'Recule de dé+2 cases. Esquive la prochaine attaque reçue.' },
  { key: 'roll_dodge',            label: 'roll_dodge',            desc: 'Dé+1. Si dé ≥ 4, immunité aux dégâts ce tour.' },
  { key: 'stealth_move',          label: 'stealth_move',          desc: 'Dé+2 cases. Ne déclenche pas les ennemis adjacents en passant.' },
  { key: 'jump',                  label: 'jump',                  desc: 'Saute par-dessus 3 cases (ignore obstacles et ennemis).' },
  { key: 'double_roll',           label: 'double_roll',           desc: 'Déplacement = dé × 2.' },
  { key: 'fixed_move',            label: 'fixed_move',            desc: 'Ignore le dé. Déplacement fixe (selon bonus de la carte).' },
  { key: 'wall_pass',             label: 'wall_pass',             desc: 'Peut traverser des murs ce tour.' },
  { key: 'teleport',              label: 'teleport',              desc: 'Si dé ≥ 4, se téléporte sur n\'importe quelle case visible.' },
  { key: 'blink',                 label: 'blink',                 desc: 'Échange sa position avec un ennemi adjacent (dé ≥ 3).' },
  // Potions
  { key: 'next_atk_bonus_3',      label: 'next_atk_bonus_3',     desc: '+3 dégâts sur la prochaine attaque uniquement.' },
  { key: 'next_atk_bonus_6',      label: 'next_atk_bonus_6',     desc: '+6 dégâts sur la prochaine attaque uniquement.' },
  { key: 'gold_double_3',         label: 'gold_double_3',         desc: 'Double les 3 prochains gains d\'or.' },
  { key: 'frenzied_3',            label: 'frenzied_3',            desc: '×2 dégâts sur les 3 prochaines attaques physiques.' },
  { key: 'curse_shield',          label: 'curse_shield',          desc: 'Immunise contre les malédictions jusqu\'au prochain tour.' },
  { key: 'temphp_curse_shield',   label: 'temphp_curse_shield',   desc: '+12 PV temporaires + immunité malédictions jusqu\'au prochain tour.' },
];

const STATUTS = [
  { icon: '💫', label: 'Étourdi (stunned)',              desc: 'Passe son prochain tour complètement (aucune action, aucun mouvement).' },
  { icon: '🌑', label: 'Maudit (cursed)',                desc: 'Au prochain déplacement : si le dé est impair, subit autant de dégâts magiques que le résultat du dé.' },
  { icon: '🧊', label: 'Ralenti (slowMalus)',            desc: 'Perd N cases de déplacement ce tour (effet temporaire).' },
  { icon: '🔒', label: 'Immobile (forcedImmobile)',      desc: 'Ne peut pas se déplacer ce tour. Peut toujours faire des actions (attaquer, utiliser des cartes).' },
  { icon: '⛓️', label: 'Prison (prisonEffect)',          desc: 'Doit réussir un jet de dé ≤ seuil pour se déplacer. Sinon reste immobile (et subit des dégâts selon le niveau).' },
  { icon: '🔵', label: 'PV temporaires (tempHp)',        desc: 'Points de vie absorbés en premier avant les vrais PV. Disparaissent à la fin du tour.' },
  { icon: '🩸', label: 'Frénésie (frenzied)',            desc: '×2 dégâts physiques sur les attaques ce tour. Aussi -3 déplacement.' },
  { icon: '🪨', label: 'Immunité physique (physicalImmune)', desc: 'Immunisé à tous les dégâts physiques pour ce tour (donné par certaines capacités).' },
  { icon: '🛡️', label: 'Armure (armor)',                 desc: 'Stat permanente. Chaque point d\'Armure réduit tous les dégâts physiques reçus de 1 (min 0).' },
  { icon: '💀', label: 'Destin (destin)',                desc: 'Nombre de "vies". À 0 HP : consomme 1 Destin et renaît à la base. Si Destin = 0 : mort définitive.' },
];

const CARD_COLS_EXT = ['Nom', 'Rareté', 'Type', 'Bonus', 'Spécial', 'Description'];
const STAT_COLS = ['Nom', 'Force', 'Magie', 'Vie', 'Dépl.', 'Richesse', 'Destin', 'Armure', 'Passif ID'];
const MON_COLS  = ['Nom', 'HP max', 'ATK', 'DEF', 'Loot'];

export default function StatsReference() {
  return (
    <div style={S.wrap}>
      <div style={S.h1}>📊 Référence — Statistiques complètes</div>

      {/* ── RARETÉS ── */}
      <div style={S.h2}>Raretés</div>
      <Table
        cols={['Couleur', 'Rareté', 'Description']}
        rows={RARITIES.map(r => [
          <span style={{ ...S.chip, background: r.color, color: '#111' }}>{r.label}</span>,
          r.key,
          r.desc,
        ])}
      />

      {/* ── TYPES D'EFFETS ── */}
      <div style={S.h2}>Types d'effets de carte</div>
      <Table
        cols={['Type', 'Clé', 'Description']}
        rows={EFFECT_TYPES.map(e => [e.label, e.type, e.desc])}
      />

      {/* ── STATUTS ── */}
      <div style={S.h2}>Statuts et effets de terrain</div>
      <Table
        cols={['', 'Statut', 'Description']}
        rows={STATUTS.map(s => [s.icon, s.label, s.desc])}
      />

      <hr style={S.sep} />

      {/* ── PASSIFS ── */}
      <div style={S.h2}>Passifs — Races, Classes et Spécialisations</div>
      <Table
        cols={['Source', 'Passif ID', 'Description']}
        rows={PASSIFS.map(p => [p.src, p.id, p.desc])}
      />

      {/* ── SPÉCIAUX ── */}
      <div style={S.h2}>Effets spéciaux de cartes (special)</div>
      <Table
        cols={['Clé special', 'Description']}
        rows={SPECIALS.map(s => [
          <code style={{ color: '#88ff88', fontSize: '11px' }}>{s.label}</code>,
          s.desc,
        ])}
      />

      <hr style={S.sep} />

      {/* ── STATS DE BASE ── */}
      <div style={S.h2}>Stats de base (joueur sans équipement)</div>
      <Table
        cols={['Stat', 'Valeur de base', 'Description']}
        rows={[
          ['force',       BASE_STATS.force,       'Dégâts physiques, initiative en combat.'],
          ['magie',       BASE_STATS.magie,        'Dégâts magiques, initiative en combat.'],
          ['vie',         BASE_STATS.vie,          'HP max = 20 + vie×2. Bonus de vie augmente HP max et HP actuels.'],
          ['deplacement', BASE_STATS.deplacement,  'Cases supplémentaires ajoutées au jet de dé de mouvement.'],
          ['richesse',    BASE_STATS.richesse,     'Or gagné par tour = richesse×3. Aussi utilisé pour certains parchemins.'],
          ['destin',      BASE_STATS.destin,       'Nombre de résurrections disponibles. Chaque mort consomme 1 Destin.'],
          ['portee',      BASE_STATS.portee,       'Portée de base des attaques physiques (cases adjacentes = 1).'],
          ['armor',       BASE_STATS.armor,        'Points d\'Armure. Réduit les dégâts physiques reçus de cette valeur.'],
        ]}
      />

      {/* ── RACES ── */}
      <div style={S.h2}>Races</div>
      <Table cols={STAT_COLS} rows={RACES.map(statRow)} />

      {/* ── CLASSES ── */}
      <div style={S.h2}>Classes</div>
      <Table cols={STAT_COLS} rows={CLASSES.map(statRow)} />

      {/* ── SPÉCIALISATIONS ── */}
      <div style={S.h2}>Spécialisations</div>
      <Table cols={STAT_COLS} rows={SPECS.map(statRow)} />

      <hr style={S.sep} />

      {/* ── CARTES ── */}
      <div style={S.h2}>Armures</div>
      <Table cols={CARD_COLS_EXT} rows={ARMOR_CARDS.map(cardRow)} />

      <div style={S.h2}>Armes physiques</div>
      <Table cols={CARD_COLS_EXT} rows={WEAPON_CARDS.map(cardRow)} />

      <div style={S.h2}>Armes magiques</div>
      <Table cols={CARD_COLS_EXT} rows={MAGIC_WEAPON_CARDS.map(cardRow)} />

      <div style={S.h2}>Objets rares</div>
      <Table cols={CARD_COLS_EXT} rows={RARE_CARDS.map(cardRow)} />

      <div style={S.h2}>Objets légendaires</div>
      <Table cols={CARD_COLS_EXT} rows={LEGENDARY_CARDS.map(cardRow)} />

      <div style={S.h2}>Bibelots</div>
      <Table cols={CARD_COLS_EXT} rows={TRINKET_CARDS.map(cardRow)} />

      <div style={S.h2}>Potions</div>
      <Table cols={CARD_COLS_EXT} rows={POTION_CARDS.map(cardRow)} />

      <div style={S.h2}>Parchemins</div>
      <Table cols={CARD_COLS_EXT} rows={SCROLL_CARDS.map(cardRow)} />

      <hr style={S.sep} />

      {/* ── MONSTRES ── */}
      <div style={S.h2}>Monstres — Pile 1 (facile) · Loot : +2💰, +1 Force/3 kills</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_1.map(monsterRow)} />

      <div style={S.h2}>Monstres — Pile 2 (moyen) · Loot : +4💰, +1 Force/2 kills</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_2.map(monsterRow)} />

      <div style={S.h2}>Monstres — Pile 3 (difficile) · Loot : +6💰, +1 Force/kill</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_3.map(monsterRow)} />
    </div>
  );
}
