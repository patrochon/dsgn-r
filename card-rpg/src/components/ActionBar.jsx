const ATTACK_TYPES = new Set(['attack', 'magic_attack']);
const USE_TYPES    = new Set(['heal', 'buff', 'cure', 'passive', 'legendary']);

export default function ActionBar({ phase, selectedCard, combat, onDraw, onMove, onHeal, onEnemyTurn }) {
  const cardType = selectedCard?.effect?.type;
  const inCombat = !!combat;
  const inRoll = phase === 'roll' || phase === 'enemy_attack';

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
            hint={!selectedCard ? 'Sélectionnez une carte de déplacement' : cardType !== 'move' ? 'Carte de déplacement requise' : 'Cliquez une tuile surlignée'}
            primary={cardType === 'move'}
          />
          {USE_TYPES.has(cardType) && (
            <Btn label={`${selectedCard?.icon ?? '🧪'} Utiliser`} onClick={onHeal} primary hint={selectedCard?.desc} />
          )}
          <Btn
            label="⏩ Passer"
            onClick={onEnemyTurn}
            hint="Passer votre tour sans action"
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
          ⚔️ Sélectionnez une carte puis une action dans le panneau combat
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
