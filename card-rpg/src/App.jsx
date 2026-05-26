import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import GameMap from './components/GameMap';
import CardHand from './components/CardHand';
import PlayerPanel from './components/PlayerPanel';
import DiceDisplay from './components/DiceDisplay';
import Inventory from './components/Inventory';
import AllPlayersStatus from './components/AllPlayersStatus';
import CharacterCreation from './CharacterCreation';
import SpecEditor from './components/SpecEditor';

// ─── Player count selection ────────────────────────────────────────────────────
function PlayerCountSelect({ onSelect, onEditSpecs }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#08080f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#eee', gap: 32,
    }}>
      <h1 style={{ margin: 0, fontSize: 26, color: '#88aaff', letterSpacing: 3 }}>⚔️ DÉTOPIA</h1>
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
      <button
        onClick={onEditSpecs}
        style={{
          background: 'transparent', border: '1px solid #2a2a3a', borderRadius: 8,
          color: '#555', padding: '8px 20px', cursor: 'pointer', fontSize: 12,
          transition: 'all 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.color = '#88aaff'; e.currentTarget.style.borderColor = '#3a3a5a'; }}
        onMouseOut={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#2a2a3a'; }}
      >✦ Modifier les spécialisations</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [playerCount, setPlayerCount] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [setupIdx, setSetupIdx] = useState(0);
  const [editingSpecs, setEditingSpecs] = useState(false);

  // Spec editor
  if (editingSpecs) return <SpecEditor onClose={() => setEditingSpecs(false)} />;

  // Step 1: choose player count
  if (!playerCount) return <PlayerCountSelect onSelect={setPlayerCount} onEditSpecs={() => setEditingSpecs(true)} />;

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
  const isUsable = cardType && ['heal', 'buff', 'cure'].includes(cardType);
  const isScroll = cardType === 'magic';
  const canAttack = g.actionsLeft >= 1 && g.phase === 'player_turn'
    && !!cp?.equippedWeapon && !cp?.weaponJustSwapped;
  const canMove = g.actionsLeft >= 1 && !g.hasMoved && g.phase === 'player_turn';
  const magieCost = g.selectedCard?.effect?.magieCost ?? 0;
  const hasMagie = magieCost === 0 || (cp?.stats?.magie ?? 0) >= magieCost;
  const canUse = g.phase === 'player_turn' && isUsable && hasMagie; // card use is free
  const canMaterialize = g.phase === 'player_turn' && isScroll && hasMagie;
  const canCastReady = g.actionsLeft >= 1 && g.phase === 'player_turn' && !!cp?.readyScroll;

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
        <h1 style={{ margin: 0, fontSize: 17, color: '#88aaff', letterSpacing: 2 }}>⚔️ DÉTOPIA</h1>

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
              : g.phase === 'player_turn' ? `Tour actif — ${g.actionsLeft} action${g.actionsLeft !== 1 ? 's' : ''}`
              : g.phase === 'rolling_move' || g.phase === 'rolling_attack' || g.phase === 'rolling_prison' ? '🎲 Lancement…'
              : g.phase === 'choosing_prison_swap' ? '👔 Cravaté — choisissez un adversaire à interchanger'
              : g.phase === 'choosing_move_bonus' ? '🎲 Bonus de déplacement disponible'
              : g.phase === 'touffus_bonus_choice' ? '🌿 Touffus — déplacer ou action bonus ?'
              : g.phase === 'choosing_move' ? '🗺️ Choisissez une case'
              : g.phase === 'choosing_attack' ? '⚔️ Choisissez une cible'
              : g.phase === 'longs_bras_passive' ? '🦾 Passif — case adjacente'
              : g.phase === 'choosing_portal' ? '🎩 Choisissez votre portail de sortie'
              : g.phase === 'bum_throw' ? '🧣 Choisissez une cible à atteindre'
              : g.phase === 'fou_attack' ? '🃏 Sort du Fou — choisissez une cible'
              : g.phase === 'fou_portal' ? '🃏 Téléportation du Fou — choisissez un portail'
              : g.phase === 'messager_monster' ? '📨 Monstre — combattre ou passer ?'
              : g.phase === 'messager_exchange' ? '📨 Échange de carte'
              : g.phase === 'autodefense_counter' ? '🥊 Autodéfense — contre-attaquer ?'
              : g.phase === 'voodoo_reflect' ? '🧿 Voodoo — renvoyer les dégâts ?'
              : g.phase === 'voyage_astral_select' ? '🌌 Voyage Astral — choisissez un monstre'
              : g.phase === 'voyage_astral_move' ? '🌌 Voyage Astral — choisissez la destination'
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
            traps={g.traps}
            chests={g.chests}
            prisons={g.prisons}
            highlightTiles={g.highlightTiles}
            phase={g.phase}
            onTileClick={(x, y) => {
              if (g.phase === 'choosing_move' || g.phase === 'voyage_astral_select' || g.phase === 'voyage_astral_move' || g.phase === 'choosing_prison_swap') g.moveToTile(x, y);
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
            {cp?.prisonEffect && !g.hasMoved && (
              <Btn
                label={`🔓 Payer ${cp.prisonEffect.level * 2}💰 — annuler prison`}
                onClick={g.prisonPayGold}
                primary={cp.gold >= cp.prisonEffect.level * 2}
                disabled={cp.gold < cp.prisonEffect.level * 2}
                hint={`Niv.${cp.prisonEffect.level} — ou tentez le jet de dé en vous déplaçant`}
              />
            )}
            <Btn
              label={`🗺️ Se déplacer (1 action)${g.hasMoved ? ' ✓' : cp?.prisonEffect ? ' 🔒 Jet requis' : ''}`}
              onClick={g.startMove}
              disabled={!canMove}
              primary={canMove}
              hint={g.hasMoved ? 'Déjà déplacé ce tour' : cp?.prisonEffect ? `Prison niv.${cp.prisonEffect.level} — jet de dé requis` : !g.selectedCard || cardType !== 'move' ? 'Facultatif : sélectionnez une carte ♦ pour bonus' : `Carte ${g.selectedCard.name} active`}
            />
            <Btn
              label="⚔️ Attaquer (1 action)"
              onClick={g.showAttackTargets}
              disabled={!canAttack}
              primary={canAttack}
              hint={g.actionsLeft < 1 ? 'Plus d\'actions' : !cp?.equippedWeapon ? 'Équipez une arme pour attaquer' : cp?.weaponJustSwapped ? 'Arme changée — attaque disponible au prochain tour' : undefined}
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
                label={`🧪 Utiliser ${g.selectedCard?.icon ?? ''}${magieCost > 0 ? ` ✨${magieCost}` : ''} (gratuit)`}
                onClick={g.useItem}
                disabled={!canUse}
                primary={canUse}
                hint={!hasMagie ? `Magie insuffisante — requis : ${magieCost}, actuel : ${cp?.stats?.magie ?? 0}` : undefined}
              />
            )}
            {isScroll && (
              <Btn
                label={cp?.race?.passive === 'chapeaux'
                  ? `🎩 Lancer ${g.selectedCard?.icon ?? ''}${magieCost > 0 ? ` ✨${magieCost}` : ''} (Chapeaux)`
                  : `📜 Matérialiser ${g.selectedCard?.icon ?? ''}${magieCost > 0 ? ` ✨${magieCost}` : ''}`}
                onClick={g.useItem}
                disabled={!canMaterialize}
                primary={canMaterialize}
                hint={!hasMagie ? `Magie insuffisante — requis : ${magieCost}` : cp?.race?.passive === 'chapeaux' ? 'Effet immédiat' : 'Prêt à lancer au prochain tour'}
              />
            )}
            {cp?.readyScroll && (
              <Btn
                label={`📜 Lancer ${cp.readyScroll.icon} ${cp.readyScroll.name} (1 action)`}
                onClick={g.castReadyScroll}
                disabled={!canCastReady}
                primary={canCastReady}
                hint={`${cp.readyScroll.effect.bonus} dégâts magiques — matérialisé au tour précédent`}
              />
            )}
            {cp?.cls?.passive === 'alchimiste' && (
              <Btn
                label={`⚗️ Se soigner (${cp.stats.magie ?? 0} PV, 1 action)`}
                onClick={g.alchimisteHeal}
                disabled={!canAttack}
                primary={canAttack}
                hint="Récupère des PV égaux à la stat Magie"
              />
            )}
            {cp?.cls?.passive === 'fou' && cp?.lastScroll && (
              <Btn
                label={`🃏 Sort du Fou : ${cp.lastScroll.icon} ${cp.lastScroll.name} (1 action)`}
                onClick={g.startFouAttack}
                disabled={!canAttack}
                primary={canAttack}
                hint={`Rejoue les dégâts de ${cp.lastScroll.name} sur une cible valide`}
              />
            )}
            {cp?.cls?.passive === 'bum' && g.selectedCard?.effect?.type === 'attack' && (
              <Btn
                label={`🧣 Lancer ${g.selectedCard.icon} (1 action)`}
                onClick={g.startBumThrow}
                disabled={!canAttack}
                primary={canAttack}
                hint="Lancer cette arme sur un joueur à 2 cases — la carte est détruite"
              />
            )}
            {cp?.spec?.passive === 'voyage_astral' && !g.hasMoved && (
              <Btn
                label="🌌 Voyage Astral (déplacer monstre)"
                onClick={g.startVoyageAstral}
                disabled={!canMove}
                primary={canMove}
                hint="Déplace un monstre en ligne droite au lieu de vous déplacer"
              />
            )}
            {cp?.cls?.passive === 'wiki' && !cp?.wikiSwapped && (
              <Btn
                label={`📚 Wiki — interchanger Force↔Magie (gratuit, 1×/tour)`}
                onClick={g.wikiSwapStats}
                primary
                hint={`Force: ${cp.stats.force} → ${cp.stats.magie} | Magie: ${cp.stats.magie} → ${cp.stats.force}`}
              />
            )}
            <Btn label="⏭️ Fin de tour" onClick={g.endTurn} />
          </>)}
          {g.phase === 'choosing_move' && (
            <div style={{ color: '#5ab4ff', fontSize: 13, padding: '8px 0' }}>🗺️ Cliquez une case bleue pour vous déplacer</div>
          )}
          {g.phase === 'choosing_move_bonus' && (<>
            <div style={{ color: '#aaffcc', fontSize: 13, padding: '8px 0' }}>
              Utiliser le bonus de déplacement ?
            </div>
            <Btn label={`✅ Avec bonus (+${cp?.stats?.deplacement ?? 0} cases)`} onClick={() => g.confirmMoveBonus(true)} primary />
            <Btn label="❌ Sans bonus" onClick={() => g.confirmMoveBonus(false)} />
          </>)}
          {g.phase === 'touffus_bonus_choice' && (<>
            <div style={{ color: '#aaffcc', fontSize: 13, padding: '8px 0' }}>
              🌿 Résultat 6 — se déplacer ou action bonus ?
            </div>
            <Btn label={`🗺️ Se déplacer (${Math.max(0, 6 + (cp?.stats?.deplacement ?? 0))} cases)`} onClick={g.touffusContinueMove} primary />
            <Btn label="⚡ Action bonus" onClick={g.touffusBonusAction} />
          </>)}
          {g.phase === 'choosing_attack' && (
            <div style={{ color: '#ff6644', fontSize: 13, padding: '8px 0' }}>⚔️ Cliquez une cible surlignée pour attaquer</div>
          )}
          {g.phase === 'bum_throw' && (
            <div style={{ color: '#ffaa44', fontSize: 13, padding: '8px 0' }}>🧣 Cliquez un joueur surlighté pour lancer l'arme (carte détruite)</div>
          )}
          {g.phase === 'fou_attack' && (
            <div style={{ color: '#cc88ff', fontSize: 13, padding: '8px 0' }}>🃏 Cliquez une cible surlignée pour appliquer le sort du Fou</div>
          )}
          {g.phase === 'fou_portal' && (<>
            <div style={{ color: '#cc88ff', fontSize: 13, padding: '8px 0' }}>🃏 Cliquez un portail surlighté pour vous téléporter</div>
            <Btn label="🎲 Portail aléatoire" onClick={g.skipPortalChoice} />
          </>)}
          {g.phase === 'choosing_prison_swap' && (<>
            <div style={{ color: '#ff9944', fontSize: 13, padding: '8px 0' }}>👔 Cravaté — cliquez un adversaire surligné pour interchanger (max 6 cases)</div>
            <Btn label="⏭️ Passer" onClick={g.skipPrisonSwap} />
          </>)}
          {g.phase === 'longs_bras_passive' && (<>
            <div style={{ color: '#aaffcc', fontSize: 13, padding: '8px 0' }}>🦾 Cliquez une case adjacente surlignée pour activer son effet (gratuit)</div>
            <Btn label="⏭️ Passer" onClick={g.skipPassive} />
          </>)}
          {g.phase === 'messager_monster' && (<>
            <div style={{ color: '#ff8844', fontSize: 13, padding: '8px 0' }}>
              📨 {cp?.name} — le monstre bloque le chemin. Combattre ou ignorer ?
            </div>
            <Btn label="⚔️ Combattre" onClick={g.messagerFight} primary />
            <Btn label="📨 Ignorer et passer" onClick={g.messagerSkip} />
          </>)}
          {g.phase === 'messager_exchange' && (<>
            <div style={{ color: '#44aaff', fontSize: 13, padding: '8px 0' }}>
              📨 {cp?.name} croise {g.pendingMessager?.crossedPlayerIdx != null ? g.players[g.pendingMessager.crossedPlayerIdx]?.name : 'un joueur'} — échangez une carte au hasard ?
            </div>
            <Btn label="🔄 Échanger (aléatoire)" onClick={g.messagerAcceptExchange} primary />
            <Btn label="❌ Refuser" onClick={g.messagerDeclineExchange} />
          </>)}
          {g.phase === 'autodefense_counter' && (<>
            <div style={{ color: '#ff8844', fontSize: 13, padding: '8px 0' }}>
              🥊 {g.pendingAutodefense ? g.players[g.pendingAutodefense.defenderIdx]?.name : '...'} — Autodéfense : contre-attaquer ?
            </div>
            <Btn label="🥊 Contre-attaquer" onClick={g.autodefenseCounter} primary />
            <Btn label="⏭️ Ignorer" onClick={g.autodefenseSkip} />
          </>)}
          {g.phase === 'voodoo_reflect' && (<>
            <div style={{ color: '#aa55ff', fontSize: 13, padding: '8px 0' }}>
              🧿 {g.pendingVoodoo ? g.players[g.pendingVoodoo.defenderIdx]?.name : '...'} — Renvoyer {g.pendingVoodoo?.damage ?? 0} dégâts ({g.pendingVoodoo?.damage ?? 0}💰) ?
            </div>
            <Btn label={`🧿 Renvoyer (${g.pendingVoodoo?.damage ?? 0}💰)`} onClick={g.voodooReflect} primary />
            <Btn label="❌ Absorber" onClick={g.voodooSkip} />
          </>)}
          {g.phase === 'voyage_astral_select' && (
            <div style={{ color: '#8855ff', fontSize: 13, padding: '8px 0' }}>🌌 Cliquez un monstre pour le déplacer</div>
          )}
          {g.phase === 'voyage_astral_move' && (
            <div style={{ color: '#8855ff', fontSize: 13, padding: '8px 0' }}>🌌 Cliquez la destination (ligne droite)</div>
          )}
          {g.phase === 'choosing_portal' && (<>
            <div style={{ color: '#cc88ff', fontSize: 13, padding: '8px 0' }}>🎩 Cliquez un portail surlighté pour choisir votre sortie</div>
            <Btn label="🎲 Sortie aléatoire" onClick={g.skipPortalChoice} />
          </>)}
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
          disabled={g.phase !== 'player_turn'}
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
