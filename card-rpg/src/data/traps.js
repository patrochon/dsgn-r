// 6 pièges différents — déclenchés en marchant sur la case
export const TRAPS = [
  { id: 'fire',    name: 'Piège à feu',     icon: '🔥', color: '#ff6622',
    desc: 'Inflige d6+4 dégâts de feu',                effect: 'damage',        value: 4 },
  { id: 'blades',  name: 'Piège à lames',   icon: '⚔️', color: '#cc4444',
    desc: 'Inflige d6+6 dégâts tranchants',            effect: 'damage',        value: 6 },
  { id: 'web',     name: 'Toile collante',  icon: '🕸️', color: '#aaaaaa',
    desc: 'Perd 2 actions immédiates',                 effect: 'lose_actions',  value: 2 },
  { id: 'pit',     name: 'Fosse piégée',    icon: '🕳️', color: '#886644',
    desc: 'Inflige d6+2 dégâts et coûte 1 action',    effect: 'damage_action', value: 2 },
  { id: 'curse',   name: 'Malédiction',     icon: '💀', color: '#aa44cc',
    desc: 'Inflige d6+3 dégâts et défausse 1 carte',  effect: 'damage_discard',value: 3 },
  { id: 'bomb',    name: 'Bombe explosive', icon: '💣', color: '#ffaa00',
    desc: 'Inflige d6+8 dégâts d\'explosion',         effect: 'damage',        value: 8 },
];
