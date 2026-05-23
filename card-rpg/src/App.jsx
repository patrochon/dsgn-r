import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import GameMap from './components/GameMap';
import CardHand from './components/CardHand';
import PlayerPanel from './components/PlayerPanel';
import DiceDisplay from './components/DiceDisplay';
import Inventory from './components/Inventory';
import AllPlayersStatus from './components/AllPlayersStatus';
import CharacterCreation from './CharacterCreation';

// ─── Player count selection ────────────────────────────────────────────────────
function PlayerCountSelect({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#08080f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#eee', gap: 32,
    }}>
      <h1 style={{ margin: 0, fontSize: 26, color: '#88aaff', letterSpacing: 3 }}>⚔️ CARD DUNGEON RPG</h1>
      <p style={{ color: '#555', margin: 0 }}>Dernier survivant gagne</p>
      <div>
        <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 16 }}>Nombre de joueurs</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => onSelect(n)} style={{
              width: 64, height: 64, borderRadius: 12,
              background: '#12121e', border: '2px solid #2a2a4a',
              color: '#88ccff', fontSize: 22, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#5ab4ff'; e.currentTarget.style.background = '#1a2a3a'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.background = '#12121e'; }}
            >{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [playerCount, setPlayerCount] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [setupIdx, setSetupIdx] = useState(0);

  // Step 1: choose player count
  if (!playerCount) return <PlayerCountSelect onSelect={setPlayerCount} />;

  // Step 2: create each character
  if (setupIdx < playerCount) {
    return (
      <CharacterCreation
        playerIndex={setupIdx}
        totalPlayers={playerCount}
        onComplete={char => {
          const next = [...characters, char];
          setCharacters(next);
          setSetupIdx(setupIdx + 1);
        }}
      />
    );
  }

  // Step 3: game
  return <Game characters={characters} onRestart={() => { setPlayerCount(null); setCharacters([]); setSetupIdx(0); }} />;
}

// ─── Game ─────────────────────────────────────────────────────────────────────
function Game({ characters, onRestart }) {
  const g = useGameState(characters);
  const cp = g.currentPlayer;
  const cardType = g.selectedCard?.effect?.type;

  // Helpers
  const isEquippable = cardType && ['defense', 'attack', 'magic_attack', 'passive', 'legendary'].includes(cardType);
  const isUsable = cardType && ['heal', 'buff', 'cure', 'magic'].includes(cardType);
  const canAttack = g.actionsLeft >= 1 && g.phase === 'player_turn';
  const canMove = g.actionsLeft >= 1 && !g.hasMoved && g.phase === 'player_turn';
  const canUse = g.actionsLeft >= 1 && g.phase === 'player_turn' && isUsable;

  const clickable = g.phase === 'choosing_move' || g.phase === 'choosing_attack';

  // Win screen
  if (g.phase === 'win' && g.winner) {
    return (
      <Screen>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 72 }}>🏆</div>
          <h2 style={{ color: '#ffd700', fontSize: 28 }}>{g.winner.name} remporte la partie !</h2>
          <div style={{ fontSize: 48, margin: '8px 0' }}>{g.winner.race?.icon ?? '🧙'}</div>
          <p style={{ color: '#888', marginBottom: 24 }}>
            {g.winner.race?.name} · {g.winner.cls?.name} · {g.winner.spec?.name}
          </p>
          <button onClick={onRestart} style={btnStyle('#1a4a1a', '#88ff88')}>🔄 Nouvelle partie</button>
        </div>
      </Screen>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a', color: '#eee',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '12px 16px', boxSizing: 'border-box',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 17, color: '#88aaff', letterSpacing: 2 }}>⚔️ CARD DUNGEON RPG</h1>

        {/* Current player indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#0f0f1e', border: `2px solid ${cp?.color ?? '#444'}`,
          borderRadius: 10, padding: '6px 14px',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cp?.color, boxShadow: `0 0 8px ${cp?.color}` }} />
          <span style={{ fontWeight: 700, color: cp?.color, fontSize: 14 }}>{cp?.name}</span>
          <span style={{ color: '#555', fontSize: 12 }}>—</span>
          <span style={{ fontSize: 12, color: '#aaa' }}>
            {g.phase === 'draw' ? '🃏 Tirez vos cartes'
              : g.phase === 'player_turn' ? `${g.actionsLeft} action${g.actionsLeft !== 1 ? 's' : ''} restante${g.actionsLeft !== 1 ? 's' : ''}`
              : g.phase === 'rolling_move' || g.phase === 'rolling_attack' ? '🎲 Lancement…'
              : g.phase === 'choosing_move' ? '🗺️ Choisissez une case'
              : g.phase === 'choosing_attack' ? '⚔️ Choisissez une cible'
              : g.phase}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ color: '#444', fontSize: 12, alignSelf: 'center' }}>{g.mapName}</div>
          <button onClick={onRestart} style={{ ...btnStyle('#1a1a2e', '#555'), fontSize: 11, padding: '4px 10px' }}>↩ Menu</button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Map */}
        <div style={{ flex: '0 0 auto' }}>
          <GameMap
            grid={g.grid}
            players={g.players}
            currentIdx={g.currentIdx}
            enemies={g.enemies}
            highlightTiles={g.highlightTiles}
            phase={g.phase}
            onTileClick={(x, y) => {
              if (g.phase === 'choosing_move') g.moveToTile(x, y);
              else if (g.phase === 'choosing_attack') g.attackTile(x, y);
            }}
          />
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 210, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AllPlayersStatus players={g.players} currentIdx={g.currentIdx} />
          {cp && <PlayerPanel player={cp} />}
          {cp && <Inventory items={cp.inventory} />}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <DiceDisplay value={g.diceResult} rolling={g.rolling} />
            <div style={{ fontSize: 11, color: '#444' }}>
              🃏 {cp?.deck?.length ?? 0} | 🗑️ {cp?.discard?.length ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: hand + actions ── */}
      <div style={{ marginTop: 14, background: '#0f0f1e', border: '1px solid #222', borderRadius: 10, padding: 14 }}>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {g.phase === 'draw' && (
            <Btn label="🃏 Tirer des cartes" onClick={g.drawCards} primary />
          )}
          {g.phase === 'player_turn' && (<>
            <Btn
              label={`🗺️ Se déplacer (1 action)${g.hasMoved ? ' ✓' : ''}`}
              onClick={g.startMove}
              disabled={!canMove}
              primary={canMove}
              hint={g.hasMoved ? 'Déjà déplacé ce tour' : !g.selectedCard || cardType !== 'move' ? 'Facultatif : sélectionnez une carte ♦ pour bonus' : `Carte ${g.selectedCard.name} active`}
            />
            <Btn
              label="⚔️ Attaquer (1 action)"
              onClick={g.showAttackTargets}
              disabled={!canAttack}
              primary={canAttack}
            />
            {isEquippable && (
              <Btn
                label={`✨ Équiper ${g.selectedCard?.icon ?? ''} (gratuit)`}
                onClick={() => g.equipCard(g.selectedCard)}
                primary
              />
            )}
            {isUsable && (
              <Btn
                label={`🧪 Utiliser ${g.selectedCard?.icon ?? ''} (1 action)`}
                onClick={g.useItem}
                disabled={!canUse}
                primary={canUse}
              />
            )}
            <Btn label="⏭️ Fin de tour" onClick={g.endTurn} />
          </>)}
          {g.phase === 'choosing_move' && (
            <div style={{ color: '#5ab4ff', fontSize: 13, padding: '8px 0' }}>🗺️ Cliquez une case bleue pour vous déplacer</div>
          )}
          {g.phase === 'choosing_attack' && (
            <div style={{ color: '#ff6644', fontSize: 13, padding: '8px 0' }}>⚔️ Cliquez une cible surlignée pour attaquer</div>
          )}
          {(g.phase === 'rolling_move' || g.phase === 'rolling_attack') && (
            <div style={{ color: '#ffcc44', fontSize: 13, padding: '8px 0' }}>🎲 Lancement du dé…</div>
          )}
        </div>

        {/* Card hand */}
        <div style={{ color: '#444', fontSize: 10, textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>
          MAIN DE {cp?.name?.toUpperCase()} — {cp?.hand?.length ?? 0} carte(s) · Sélectionnez une carte puis une action
        </div>
        <CardHand
          hand={cp?.hand ?? []}
          selected={g.selectedCard}
          onSelect={card => g.setSelectedCard(g.selectedCard === card ? null : card)}
          disabled={!['player_turn', 'draw'].includes(g.phase)}
        />
      </div>

      {/* Log */}
      <div style={{ marginTop: 10, background: '#0a0a12', border: '1px solid #1a1a2a', borderRadius: 8, padding: 10, maxHeight: 100, overflowY: 'auto' }}>
        {g.log.map((line, i) => (
          <div key={i} style={{ fontSize: 11, color: i === 0 ? '#ddd' : '#444', lineHeight: 1.6 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function Btn({ label, onClick, disabled, hint, primary }) {
  return (
    <button onClick={onClick} disabled={disabled} title={hint} style={{
      background: primary && !disabled ? '#1a3a5a' : '#1a1a2e',
      border: `1px solid ${primary && !disabled ? '#5ab4ff' : '#333'}`,
      borderRadius: 8, color: disabled ? '#444' : primary ? '#88ccff' : '#888',
      padding: '7px 14px', cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12, fontWeight: primary ? 700 : 400, transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

function btnStyle(bg, color) {
  return { background: bg, border: `1px solid ${color}`, borderRadius: 8, color, padding: '10px 28px', cursor: 'pointer', fontSize: 14 };
}
