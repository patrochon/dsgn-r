export default function ActionBar({ phase, selectedCard, combat, onDraw, onMove, onHeal, onEnemyTurn }) {
  const cardType = selectedCard?.effect?.type;
  const inCombat = !!combat;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      {phase === 'draw' && (
        <Btn label="🃏 Tirer des cartes" onClick={onDraw} primary />
      )}

      {phase === 'action' && !inCombat && (
        <>
          <Btn
            label="🗺️ Se déplacer"
            onClick={onMove}
            disabled={!selectedCard || cardType !== 'move'}
            hint={!selectedCard ? 'Sélectionnez une carte ♦ d\'abord' : cardType !== 'move' ? 'Carte de déplacement (♦) requise' : 'Cliquez une tuile surlignée'}
            primary={cardType === 'move'}
          />
          {cardType === 'heal' && (
            <Btn label="💚 Se soigner" onClick={onHeal} primary />
          )}
          <Btn
            label="⏩ Passer (sans carte)"
            onClick={onEnemyTurn}
            hint="Passer votre tour"
          />
        </>
      )}

      {phase === 'move' && (
        <div style={{ color: '#5ab4ff', fontSize: 13 }}>
          🗺️ Cliquez une case surlignée pour vous déplacer
        </div>
      )}

      {phase === 'combat' && (
        <div style={{ color: '#f88', fontSize: 13 }}>
          ⚔️ Combat ! Choisissez une carte et une action ci-dessus
        </div>
      )}

      {phase === 'roll' && (
        <div style={{ color: '#ffcc44', fontSize: 13 }}>🎲 Lancement du dé…</div>
      )}

      {phase === 'enemy_attack' && (
        <div style={{ color: '#f66', fontSize: 13 }}>👹 L'ennemi attaque…</div>
      )}

      {phase === 'enemy' && (
        <Btn label="⏩ Tour ennemi" onClick={onEnemyTurn} primary />
      )}
    </div>
  );
}

function Btn({ label, onClick, disabled, hint, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={hint}
      style={{
        background: primary ? '#1a3a5a' : '#1a1a2e',
        border: `1px solid ${primary ? '#5ab4ff' : '#444'}`,
        borderRadius: 8,
        color: disabled ? '#555' : primary ? '#88ccff' : '#aaa',
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: primary ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
