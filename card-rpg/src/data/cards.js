export const SUITS = { SPADE: '♠', HEART: '♥', DIAMOND: '♦', CLUB: '♣' };

const makeCard = (suit, value, label, effect, desc) => ({ suit, value, label, effect, desc });

const numberCards = (suit, effectFn) =>
  [2, 3, 4, 5, 6, 7, 8, 9, 10].map(n =>
    makeCard(suit, n, `${n}${suit}`, effectFn(n), `+${Math.floor(n / 2)} au jet`)
  );

export const DECK = [
  // ♠ Spades → Attack bonus
  ...numberCards(SUITS.SPADE, n => ({ type: 'attack', bonus: Math.floor(n / 2) })),
  makeCard(SUITS.SPADE, 11, `J♠`, { type: 'attack', bonus: 3 }, 'Frappe précise : +3 ATK'),
  makeCard(SUITS.SPADE, 12, `Q♠`, { type: 'attack', bonus: 0, special: 'double' }, 'Double dommage si 6'),
  makeCard(SUITS.SPADE, 13, `K♠`, { type: 'attack', bonus: 5 }, 'Frappe royale : +5 ATK'),
  makeCard(SUITS.SPADE, 14, `A♠`, { type: 'attack', bonus: 0, special: 'crit' }, 'Critique : rejoue si 1-2'),

  // ♥ Hearts → Heal
  ...numberCards(SUITS.HEART, n => ({ type: 'heal', bonus: Math.floor(n / 2) })),
  makeCard(SUITS.HEART, 11, `J♥`, { type: 'heal', bonus: 3 }, 'Soin de fortune : +3 HP'),
  makeCard(SUITS.HEART, 12, `Q♥`, { type: 'heal', bonus: 0, special: 'fullheal' }, 'Guérison totale (6)'),
  makeCard(SUITS.HEART, 13, `K♥`, { type: 'heal', bonus: 5 }, 'Soin royal : +5 HP'),
  makeCard(SUITS.HEART, 14, `A♥`, { type: 'heal', bonus: 0, special: 'revive' }, 'Résurrection si 0 HP'),

  // ♦ Diamonds → Movement bonus
  ...numberCards(SUITS.DIAMOND, n => ({ type: 'move', bonus: Math.floor(n / 2) })),
  makeCard(SUITS.DIAMOND, 11, `J♦`, { type: 'move', bonus: 3 }, 'Sprint : +3 déplacement'),
  makeCard(SUITS.DIAMOND, 12, `Q♦`, { type: 'move', bonus: 0, special: 'teleport' }, 'Téléportation (6)'),
  makeCard(SUITS.DIAMOND, 13, `K♦`, { type: 'move', bonus: 5 }, 'Déplacement royal : +5'),
  makeCard(SUITS.DIAMOND, 14, `A♦`, { type: 'move', bonus: 0, special: 'freemove' }, 'Mouvement libre sans dé'),

  // ♣ Clubs → Defense/Magic
  ...numberCards(SUITS.CLUB, n => ({ type: 'defense', bonus: Math.floor(n / 2) })),
  makeCard(SUITS.CLUB, 11, `J♣`, { type: 'defense', bonus: 3 }, 'Bouclier : +3 DEF'),
  makeCard(SUITS.CLUB, 12, `Q♣`, { type: 'magic', bonus: 4 }, 'Sort de feu : 4 dégâts fixes'),
  makeCard(SUITS.CLUB, 13, `K♣`, { type: 'defense', bonus: 5 }, 'Armure royale : +5 DEF'),
  makeCard(SUITS.CLUB, 14, `A♣`, { type: 'magic', bonus: 0, special: 'stun' }, 'Étourdissement (6)'),
];

export function shuffleDeck(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
