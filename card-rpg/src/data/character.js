// Stat bonuses: { force, magie, vie, deplacement, richesse, destin }

export const RACES = [
  {
    id: 'longs_bras',
    name: 'Les Longs Bras',
    icon: '🦾',
    flavor: 'Créatures d\'une allonge démesurée. Ils frappent là où personne ne les attend.',
    bonuses: { force: 2, vie: 1, deplacement: 1, portee: 1 },
    passive: 'longs_bras',
  },
  {
    id: 'chapeaux',
    name: 'Les Chapeaux',
    icon: '🎩',
    flavor: 'Nul ne sait ce qui se cache sous leurs bords. Leur destin est écrit dans l\'ombre.',
    bonuses: { magie: 2, richesse: 1 },
    passive: 'chapeaux',
  },
  {
    id: 'cailloux',
    name: 'Les Cailloux',
    icon: '🪨',
    flavor: 'Lents, massifs, imperturbables. Ils encaissent tout et restent debout.',
    bonuses: { vie: 6, destin: 1 },
    passive: 'cailloux',
  },
  {
    id: 'zeles',
    name: 'Les Zélés',
    icon: '⚡',
    flavor: 'Débordants d\'énergie. Ils courent plus vite que leur propre ombre.',
    bonuses: { deplacement: 2, richesse: 1 },
    passive: 'zeles',
  },
  {
    id: 'feux_follets',
    name: 'Les Feux Follets',
    icon: '🔥',
    flavor: 'Insaisissables et capricieux. La richesse les suit comme une flamme dans la nuit.',
    bonuses: { richesse: 2, deplacement: 1 },
    passive: 'feux_follets',
  },
  {
    id: 'anciens',
    name: 'Les Anciens',
    icon: '🌙',
    flavor: 'Ils ont vu des ères entières s\'effondrer. Leur destin transcende le temps.',
    bonuses: { destin: 2, magie: 1 },
    passive: 'anciens',
  },
];

export const CLASSES = [
  {
    id: 'bum',
    name: 'Le Bum',
    icon: '🧣',
    flavor: 'Maître de la débrouillardise. Il trouve toujours une sortie — ou une combine.',
    bonuses: { force: 1, vie: 3 },
    passive: 'bum',
  },
  {
    id: 'fou',
    name: 'Le Fou',
    icon: '🃏',
    flavor: 'Imprévisible et redoutable. Ses décisions insensées deviennent des coups de génie.',
    bonuses: { magie: 2, richesse: 2, destin: 1 },
  },
  {
    id: 'alchimiste',
    name: "L'Alchimiste",
    icon: '⚗️',
    flavor: 'Il transforme la matière et les corps. Ses potions guérissent... ou détruisent.',
    bonuses: { magie: 3, vie: 2 },
  },
  {
    id: 'messager',
    name: 'Le Messager',
    icon: '📨',
    flavor: 'Plus rapide que la rumeur. Il traverse les zones de combat sans même être vu.',
    bonuses: { deplacement: 3, richesse: 2 },
  },
  {
    id: 'cravate',
    name: 'Le Cravaté',
    icon: '👔',
    flavor: 'L\'autorité incarnée. Sa seule présence intimide — et son poing confirme.',
    bonuses: { force: 3, destin: 2 },
  },
  {
    id: 'wiki',
    name: 'Le Wiki',
    icon: '📚',
    flavor: 'Il sait tout sur tout. La connaissance est son arme la plus tranchante.',
    bonuses: { destin: 3, magie: 2 },
  },
];

export const SPECS = [
  {
    id: 'autodefense',
    name: 'Autodéfense',
    icon: '🥊',
    flavor: 'Réflexes affûtés. Chaque attaque reçue prépare la riposte.',
    bonuses: { force: 2, vie: 1 },
  },
  {
    id: 'cantrip',
    name: 'Cantrip',
    icon: '✦',
    flavor: 'Petits sorts, grands effets. Les détails font la différence.',
    bonuses: { magie: 2, richesse: 1 },
  },
  {
    id: 'rcr',
    name: 'RCR',
    icon: '💊',
    flavor: 'Réanimation sur le terrain. Il ramène les morts — parfois contre leur gré.',
    bonuses: { vie: 2, force: 1 },
  },
  {
    id: 'secretariat',
    name: 'Secrétariat',
    icon: '📋',
    flavor: 'Tout est planifié, archivé, optimisé. L\'efficacité est une arme.',
    bonuses: { destin: 2, deplacement: 1 },
  },
  {
    id: 'voodoo',
    name: 'Voodoo',
    icon: '🧿',
    flavor: 'Liens invisibles entre les êtres. Ce qui arrive à l\'un, arrive à l\'autre.',
    bonuses: { magie: 2, destin: 1 },
  },
  {
    id: 'nde',
    name: '« Near Death Experience »',
    icon: '💀',
    flavor: 'Il a touché la mort du doigt et en est revenu changé. Plus fort. Différent.',
    bonuses: { vie: 2, destin: 1 },
  },
  {
    id: 'jiu_jutse',
    name: 'Jiu Jutse',
    icon: '🥋',
    flavor: 'Utilise la force de l\'ennemi contre lui. L\'art du retournement.',
    bonuses: { force: 2, deplacement: 1 },
  },
  {
    id: 'pacte',
    name: 'Un Pacte',
    icon: '📜',
    flavor: 'Un accord a été signé avec quelque chose. Les détails restent flous.',
    bonuses: { destin: 2, magie: 1 },
  },
  {
    id: 'scout',
    name: 'Scout',
    icon: '🔭',
    flavor: 'Toujours en avance. Il connaît le terrain avant même d\'y poser le pied.',
    bonuses: { deplacement: 2, richesse: 1 },
  },
  {
    id: 'medication',
    name: 'Médication',
    icon: '💉',
    flavor: 'Les bons médicaments au bon moment. La chimie comme style de vie.',
    bonuses: { vie: 2, magie: 1 },
  },
  {
    id: 'satanisme',
    name: 'Satanisme',
    icon: '🔱',
    flavor: 'Un abonnement aux forces obscures. Les avantages sont nombreux, les clauses aussi.',
    bonuses: { destin: 2, force: 1 },
  },
  {
    id: 'voyage_astral',
    name: 'Voyage Astral',
    icon: '🌌',
    flavor: 'L\'âme se déplace indépendamment du corps. Pratique pour la reconnaissance.',
    bonuses: { magie: 2, deplacement: 1 },
  },
];

export const BASE_STATS = {
  force: 2, magie: 2, vie: 4, deplacement: 3, richesse: 1, destin: 1, portee: 1,
};

export function computeStats(race, cls, spec) {
  const stats = { ...BASE_STATS };
  for (const src of [race?.bonuses, cls?.bonuses, spec?.bonuses]) {
    if (!src) continue;
    for (const [k, v] of Object.entries(src)) stats[k] = (stats[k] ?? 0) + v;
  }
  return stats;
}
