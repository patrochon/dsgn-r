import { RARITY_COLOR, RANGE_META } from '../data/cards';

const CAT_LABEL = {
  deplacement:  'MV',
  armure:       'ARM',
  arme:         'ATK',
  arme_magique: 'MAG⚔',
  potion:       'POT',
  parchemin:    'SCR',
  objet_rare:   'RARE',
  legendaire:   '★LEG',
};

export default function CardHand({ hand, selected, onSelect, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {hand.map((card, i) => {
        const isSelected = selected === card;
        const rarityColor = RARITY_COLOR[card.rarity] ?? '#888';
        const catColor = card.catColor ?? '#888';

        return (
          <div
            key={i}
            onClick={() => !disabled && onSelect(isSelected ? null : card)}
            title={card.desc}
            style={{
              width: 80,
              height: 116,
              background: isSelected ? '#1a2a3a' : '#0f0f1e',
              border: `2px solid ${isSelected ? rarityColor : catColor + '55'}`,
              borderRadius: 9,
              cursor: disabled ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 4px 5px',
              transition: 'transform 0.12s, border 0.12s, box-shadow 0.12s',
              transform: isSelected ? 'translateY(-10px) scale(1.06)' : 'none',
              boxShadow: isSelected ? `0 6px 20px ${rarityColor}55` : '0 2px 6px #0006',
              userSelect: 'none',
              boxSizing: 'border-box',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Rarity dot top-right */}
            <div style={{
              position: 'absolute', top: 5, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: rarityColor,
              boxShadow: `0 0 4px ${rarityColor}`,
            }} />

            {/* Category badge */}
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: catColor,
              background: catColor + '18',
              borderRadius: 3,
              padding: '1px 5px',
              marginBottom: 4,
              letterSpacing: 0.5,
              alignSelf: 'flex-start',
            }}>
              {CAT_LABEL[card.category] ?? card.category.toUpperCase()}
            </div>

            {/* Icon */}
            <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>{card.icon}</div>

            {/* Name */}
            <div style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: isSelected ? '#eee' : '#bbb',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: 4,
              wordBreak: 'break-word',
              maxWidth: 72,
            }}>
              {card.name}
            </div>

            {/* Bonus + range + gold badges */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {card.effect.bonus > 0 && (
                <div style={{
                  fontSize: 10,
                  background: catColor + '22',
                  border: `1px solid ${catColor}44`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  color: catColor,
                  fontWeight: 700,
                }}>
                  +{card.effect.bonus}
                </div>
              )}
              {card.effect.range && RANGE_META[card.effect.range] && (
                <div style={{
                  fontSize: 9,
                  background: RANGE_META[card.effect.range].color + '22',
                  border: `1px solid ${RANGE_META[card.effect.range].color}55`,
                  borderRadius: 4,
                  padding: '1px 4px',
                  color: RANGE_META[card.effect.range].color,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}>
                  {RANGE_META[card.effect.range].label}
                </div>
              )}
              {card.goldValue != null && (
                <div style={{
                  fontSize: 9,
                  background: '#2a2000',
                  border: '1px solid #554400',
                  borderRadius: 4,
                  padding: '1px 4px',
                  color: '#ffd700',
                  fontWeight: 700,
                }}>
                  💰{card.goldValue}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {hand.length === 0 && (
        <div style={{ color: '#444', fontSize: 13, padding: '20px 0' }}>
          Main vide — tirez des cartes
        </div>
      )}
    </div>
  );
}
