import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import GameMap from './components/GameMap';
import CardHand from './components/CardHand';
import PlayerPanel from './components/PlayerPanel';
import CombatPanel from './components/CombatPanel';
import DiceDisplay from './components/DiceDisplay';
import Inventory from './components/Inventory';
import ActionBar from './components/ActionBar';
import CharacterCreation from './CharacterCreation';

export default function App() {
  const [character, setCharacter] = useState(null);
  const g = useGameState(character);

  if (!character) return <CharacterCreation onComplete={setCharacter} />;

  const handleMove = () => {
    g.showMoveRange(g.selectedCard);
    g.setPhase('move');
  };

  if (g.phase === 'gameover') {
    return (
      <Screen>
        <div style={{ textAlign: 'center', color: '#f44' }}>
          <div style={{ fontSize: 64 }}>💀</div>
          <h2 style={{ color: '#f44' }}>Vous êtes mort</h2>
          <p style={{ color: '#888' }}>Le donjon vous a vaincu...</p>
          <button onClick={g.restart} style={btnStyle('#8a2222', '#f44')}>🔄 Recommencer</button>
        </div>
      </Screen>
    );
  }

  if (g.phase === 'win') {
    return (
      <Screen>
        <div style={{ textAlign: 'center', color: '#ffd700' }}>
          <div style={{ fontSize: 64 }}>🏆</div>
          <h2 style={{ color: '#ffd700' }}>Victoire !</h2>
          <p style={{ color: '#aaa' }}>Vous avez conquis le donjon !</p>
          <button onClick={g.restart} style={btnStyle('#2a4a1a', '#88ff88')}>🔄 Rejouer</button>
        </div>
      </Screen>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1a',
      color: '#eee',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 16,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 18, color: '#88aaff', letterSpacing: 2 }}>
          ⚔️ CARD DUNGEON RPG
        </h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {character && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {character.race?.icon} {character.race?.name} · {character.cls?.icon} {character.cls?.name} · {character.spec?.icon} {character.spec?.name}
            </div>
          )}
          <div style={{ color: '#555', fontSize: 13 }}>{g.mapName}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setCharacter(null)} style={{ ...btnStyle('#1a1a2e', '#666'), fontSize: 11, padding: '4px 10px' }}>
            👤 Nouveau perso
          </button>
          <button onClick={g.restart} style={{ ...btnStyle('#1a1a2e', '#666'), fontSize: 11, padding: '4px 10px' }}>
            🔄 Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: Map */}
        <div style={{ flex: '0 0 auto' }}>
          <GameMap
            grid={g.grid}
            player={g.player}
            enemies={g.enemies}
            itemMap={g.itemMap}
            highlightTiles={g.highlightTiles}
            phase={g.phase}
            onTileClick={g.moveToTile}
          />
        </div>

        {/* Right: Panels */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PlayerPanel player={g.player} />
          <Inventory items={g.player.inventory} />

          {/* Dice */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <DiceDisplay value={g.diceResult} rolling={g.rolling} />
            <div style={{ flex: 1, fontSize: 11, color: '#666' }}>
              🃏 Deck: {g.deck.length} | 🗑️ Défausse: {g.discard.length}
            </div>
          </div>

          {/* Combat */}
          <CombatPanel
            combat={g.combat}
            player={g.player}
            selectedCard={g.selectedCard}
            phase={g.phase}
            onAttack={g.attackAction}
            onHeal={g.useCardAction}
            onDefend={g.defenseAction}
            onMagic={g.magicAction}
          />
        </div>
      </div>

      {/* Bottom: Cards + Actions */}
      <div style={{ marginTop: 16, background: '#0f0f1e', border: '1px solid #222', borderRadius: 10, padding: 14 }}>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>
          MAIN — {g.hand.length} carte(s)
        </div>
        <CardHand
          hand={g.hand}
          selected={g.selectedCard}
          onSelect={g.selectCard}
          disabled={['roll', 'enemy_attack', 'gameover', 'win'].includes(g.phase)}
        />
        <div style={{ marginTop: 12 }}>
          <ActionBar
            phase={g.phase}
            selectedCard={g.selectedCard}
            combat={g.combat}
            onDraw={g.drawCards}
            onMove={handleMove}
            onHeal={g.useCardAction}
            onEnemyTurn={g.enemyTurn}
          />
        </div>
      </div>

      {/* Log */}
      <div style={{ marginTop: 12, background: '#0a0a12', border: '1px solid #1a1a2a', borderRadius: 8, padding: 10, maxHeight: 120, overflowY: 'auto' }}>
        {g.log.map((line, i) => (
          <div key={i} style={{ fontSize: 11, color: i === 0 ? '#ddd' : '#555', lineHeight: 1.6 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function Screen({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {children}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg, border: `1px solid ${color}`, borderRadius: 8,
    color, padding: '10px 24px', cursor: 'pointer', fontSize: 14,
    marginTop: 16,
  };
}
