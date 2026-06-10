// Stat bonuses: { force, magie, vie, deplacement, richesse, destin }

export const RACES = [
  {
    id: 'longs_bras',
    name: 'Les Longs Bras',
    icon: '🦾',
    flavor: 'Créatures d\'une allonge démesurée. Ils frappent là où personne ne les attend.',
    bonuses: { force: 1, vie: 3, deplacement: 1 },
    passive: 'longs_bras',
  },
  {
    id: 'chapeaux',
    name: 'Les Chapeaux',
    icon: '🎩',
    flavor: 'Nul ne sait ce qui se cache sous leurs bords. Leur destin est écrit dans l\'ombre.',
    bonuses: { magie: 1, destin: 1, armor: 1 },
    passive: 'chapeaux',
  },
  {
    id: 'cailloux',
    name: 'Les Cailloux',
    icon: '🪨',
    flavor: 'Lents, massifs, imperturbables. Ils encaissent tout et restent debout.',
    bonuses: { force: 2, vie: 3 },
    passive: 'cailloux',
  },
  {
    id: 'zeles',
    name: 'Les Zélés',
    icon: '⚡',
    flavor: 'Débordants d\'énergie. Ils courent plus vite que leur propre ombre.',
    bonuses: { magie: 1, deplacement: 2 },
    passive: 'zeles',
  },
  {
    id: 'peluches',
    name: 'Les Peluches',
    icon: '🧸',
    flavor: 'Adorables en apparence, imprévisibles en pratique. La richesse les suit partout.',
    bonuses: { force: 1, richesse: 1, destin: 1 },
    passive: 'peluches',
  },
  {
    id: 'touffus',
    name: 'Les Touffus',
    icon: '🌿',
    flavor: 'Lents mais sages. Sur un résultat de 6, ils peuvent renoncer au mouvement pour une action bonus.',
    bonuses: { magie: 2, deplacement: -1, destin: 1 },
    passive: 'touffus',
  },
];

export const CLASSES = [
  {
    id: 'bum',
    name: 'Le Bum',
    icon: '🧣',
    flavor: 'Maître de la débrouillardise. Il trouve toujours une sortie — ou une combine.',
    bonuses: { force: 1 },
    passive: 'bum',
  },
  {
    id: 'fou',
    name: 'Le Fou',
    icon: '🃏',
    flavor: 'Imprévisible et redoutable. Ses décisions insensées deviennent des coups de génie.',
    bonuses: { magie: 1 },
    passive: 'fou',
  },
  {
    id: 'alchimiste',
    name: "L'Alchimiste",
    icon: '⚗️',
    flavor: 'Il transforme la matière et les corps. Ses potions guérissent... ou détruisent.',
    bonuses: { vie: 3, richesse: 1 },
    passive: 'alchimiste',
  },
  {
    id: 'messager',
    name: 'Le Messager',
    icon: '📨',
    flavor: 'Plus rapide que la rumeur. Il traverse les zones de combat sans même être vu.',
    bonuses: { deplacement: 1 },
    passive: 'messager',
  },
  {
    id: 'cravate',
    name: 'Le Cravaté',
    icon: '👔',
    flavor: 'L\'autorité incarnée. Sa seule présence intimide — et son poing confirme.',
    bonuses: { richesse: 2 },
    passive: 'cravate',
  },
  {
    id: 'wiki',
    name: "L'Ancien",
    icon: '📚',
    flavor: 'Il sait tout sur tout. La connaissance est son arme la plus tranchante.',
    bonuses: { destin: 1 },
    passive: 'wiki',
  },
];

export const SPECS = [
  {
    id: 'autodefense',
    name: 'Autodéfense',
    icon: '🥊',
    flavor: 'Réflexes affûtés. Chaque attaque reçue prépare la riposte.',
    bonuses: { force: 1 },
    passive: 'autodefense',
  },
  {
    id: 'coeur_noir',
    name: 'Cœur Noir',
    icon: '🖤',
    flavor: 'Sa présence corrompt la magie des adversaires proches.',
    bonuses: { magie: 1 },
    passive: 'coeur_noir',
  },
  {
    id: 'premier_soin',
    name: 'Premier Soin',
    icon: '🩹',
    flavor: 'Toujours prêt à se relever. La douleur ne l\'arrête pas.',
    bonuses: { vie: 3, destin: 1 },
    passive: 'premier_soin',
  },
  {
    id: 'secretariat',
    name: 'Secrétariat',
    icon: '📋',
    flavor: 'Tout est planifié, archivé, optimisé. L\'efficacité est une arme.',
    bonuses: { deplacement: 1, richesse: 1 },
    passive: 'secretariat',
  },
  {
    id: 'voodoo',
    name: 'Voodoo',
    icon: '🧿',
    flavor: 'Liens invisibles entre les êtres. Ce qui arrive à l\'un, arrive à l\'autre.',
    bonuses: { magie: 1, richesse: 1 },
    passive: 'voodoo',
  },
  {
    id: 'nde',
    name: '« Near Death Experience »',
    icon: '💀',
    flavor: 'Il a touché la mort du doigt et en est revenu changé. Plus fort. Différent.',
    bonuses: { destin: 1 },
    passive: 'nde',
  },
  {
    id: 'jiu_jutse',
    name: 'Jiu Jitsu',
    icon: '🥋',
    flavor: 'Utilise la force de l\'ennemi contre lui. L\'art du retournement.',
    bonuses: {},
    passive: 'jiu_jutse',
  },
  {
    id: 'pacte',
    name: 'Un Pacte',
    icon: '📜',
    flavor: 'Un accord a été signé avec quelque chose. Les détails restent flous.',
    bonuses: {},
    passive: 'pacte',
  },
  {
    id: 'ectomorphe',
    name: 'Ectomorphe',
    icon: '👻',
    flavor: 'Léger comme une plume. Les pièges ne le sentent pas passer.',
    bonuses: {},
    passive: 'ectomorphe',
  },
  {
    id: 'couponing',
    name: 'Couponing',
    icon: '🏷️',
    flavor: 'L\'art de la négociation. Les bons plans ne se refusent pas.',
    bonuses: {},
    passive: 'couponing',
  },
  {
    id: 'imperissable',
    name: 'Impérissable',
    icon: '💎',
    flavor: 'Impossible à briser. Les zones de destruction glissent sur lui.',
    bonuses: {},
    passive: 'imperissable',
  },
  {
    id: 'voyage_astral',
    name: 'Voyage Astral',
    icon: '🌌',
    flavor: 'L\'âme se déplace indépendamment du corps. Pratique pour la reconnaissance.',
    bonuses: { magie: 1 },
    passive: 'voyage_astral',
  },
];

export const BASE_STATS = {
  force: 1, magie: 1, vie: 6, deplacement: 0, richesse: 1, destin: 1, portee: 1, armor: 0,
};

export function getSpecs() {
  try {
    const s = localStorage.getItem('detopia_custom_specs');
    if (s) return JSON.parse(s);
  } catch {}
  return SPECS;
}

export function computeStats(race, cls, spec) {
  const stats = { ...BASE_STATS };
  for (const src of [race?.bonuses, cls?.bonuses, spec?.bonuses]) {
    if (!src) continue;
    for (const [k, v] of Object.entries(src)) stats[k] = (stats[k] ?? 0) + v;
  }
  return stats;
}
