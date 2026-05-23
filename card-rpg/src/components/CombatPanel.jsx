export default function CombatPanel({ combat, player, selectedCard, phase, onAttack, onHeal, onDefend, onMagic }) {
  if (!combat) return null;
  const e = combat.enemy;
  const hpPct = Math.max(0, e.hp / e.maxHp);

  const cardType = selectedCard?.effect?.type;
  const inRoll = phase === 'roll' || phase === 'enemy_attack';

  return (
    <div style={{
      background: '#1a0a0a',
      border: '2px solid #8a2222',
      borderRadius: 10,
      padding: 14,
      marginTop: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 32 }}>{e.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#f88', fontWeight: 700, fontSize: 15 }}>{e.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
            <span>❤️ {e.hp}/{e.maxHp}</span>
            <span>⚔️ {e.attack} 🛡️ {e.defense}</span>
          </div>
          <div style={{ background: '#2a0a0a', borderRadius: 4, height: 6, marginTop: 3 }}>
            <div style={{ background: '#c44', width: `${hpPct * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ActionBtn
          label="⚔️ Attaquer"
          active={cardType === 'attack'}
          disabled={inRoll || !['combat', 'action'].includes(phase)}
          onClick={onAttack}
          hint={cardType === 'attack' ? `+${selectedCard.effect.bonus} bonus` : 'Jouer une carte ♠'}
        />
        <ActionBtn
          label="🛡️ Défendre"
          active={cardType === 'defense'}
          disabled={inRoll || !['combat', 'action'].includes(phase)}
          onClick={onDefend}
          hint={cardType === 'defense' ? `+${selectedCard.effect.bonus} DEF` : 'Jouer une carte ♣'}
        />
        <ActionBtn
          label="✨ Sort"
          active={cardType === 'magic'}
          disabled={inRoll || !['combat', 'action'].includes(phase) || cardType !== 'magic'}
          onClick={onMagic}
          hint={cardType === 'magic' ? selectedCard.desc : 'Jouer une carte ♣ magique'}
        />
        <ActionBtn
          label="💚 Soigner"
          active={cardType === 'heal'}
          disabled={inRoll || !['combat', 'action'].includes(phase) || cardType !== 'heal'}
          onClick={onHeal}
          hint={cardType === 'heal' ? selectedCard.desc : 'Jouer une carte ♥'}
        />
      </div>
    </div>
  );
}

function ActionBtn({ label, active, disabled, onClick, hint }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={hint}
      style={{
        background: active ? '#2a4a2a' : '#2a1a1a',
        border: `1px solid ${active ? '#4a8a4a' : '#5a2a2a'}`,
        borderRadius: 6,
        color: disabled ? '#555' : '#ddd',
        padding: '6px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
