const SUIT_COLOR = { '♠': '#ccc', '♥': '#e55', '♦': '#e88', '♣': '#8e8' };
const TYPE_LABEL = { attack: 'ATK', heal: 'HP', move: 'MV', defense: 'DEF', magic: 'MAG' };

export default function CardHand({ hand, selected, onSelect, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {hand.map((card, i) => {
        const isSelected = selected === card;
        const color = SUIT_COLOR[card.suit] ?? '#ccc';
        return (
          <div
            key={i}
            onClick={() => !disabled && onSelect(isSelected ? null : card)}
            style={{
              width: 70,
              height: 100,
              background: isSelected ? '#1a3a5a' : '#1a1a2e',
              border: `2px solid ${isSelected ? '#5ab4ff' : '#444'}`,
              borderRadius: 8,
              cursor: disabled ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 4px',
              color,
              transition: 'transform 0.1s, border 0.1s',
              transform: isSelected ? 'translateY(-8px) scale(1.05)' : 'none',
              boxShadow: isSelected ? '0 4px 16px #5ab4ff55' : '0 2px 6px #0006',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, alignSelf: 'flex-start', marginLeft: 2 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.2 }}>
              {card.desc}
            </div>
            <div style={{
              fontSize: 10,
              background: '#ffffff18',
              borderRadius: 4,
              padding: '1px 5px',
              color: '#88ccff',
            }}>
              {TYPE_LABEL[card.effect.type] ?? card.effect.type}
              {card.effect.bonus > 0 ? ` +${card.effect.bonus}` : ''}
            </div>
          </div>
        );
      })}
      {hand.length === 0 && (
        <div style={{ color: '#555', fontSize: 13, padding: '20px 0' }}>Main vide — tirez des cartes</div>
      )}
    </div>
  );
}
