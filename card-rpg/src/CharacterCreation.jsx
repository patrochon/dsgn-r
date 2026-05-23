import { useState } from 'react';
import { RACES, CLASSES, SPECS, BASE_STATS, computeStats } from './data/character';

const STAT_META = [
  { key: 'force',       icon: '⚔️',  label: 'Force',       color: '#ff7755' },
  { key: 'magie',       icon: '✨',  label: 'Magie',       color: '#aa77ff' },
  { key: 'vie',         icon: '❤️',  label: 'Vie',         color: '#ff4466' },
  { key: 'deplacement', icon: '👢',  label: 'Déplacement', color: '#55ccff' },
  { key: 'chance',      icon: '🍀',  label: 'Chance',      color: '#88ff44' },
  { key: 'destin',      icon: '🌟',  label: 'Destin',      color: '#ffcc22' },
];

const STEPS = ['Race', 'Classe', 'Spécialisation', 'Confirmation'];

function StatBar({ statKey, base, current, color }) {
  const max = 20;
  const diff = current - base;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{ width: 90, fontSize: 11, color: '#888', textAlign: 'right' }}>
        {STAT_META.find(s => s.key === statKey)?.icon} {STAT_META.find(s => s.key === statKey)?.label}
      </div>
      <div style={{ flex: 1, background: '#1a1a2e', borderRadius: 4, height: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${(base / max) * 100}%`,
          background: color + '55',
          borderRadius: 4,
        }} />
        <div style={{
          position: 'absolute', left: `${(base / max) * 100}%`, top: 0, height: '100%',
          width: `${(diff / max) * 100}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ width: 28, fontSize: 13, fontWeight: 700, color, textAlign: 'right' }}>{current}</div>
      {diff > 0 && <div style={{ fontSize: 11, color: '#88ff88', width: 24 }}>+{diff}</div>}
      {diff === 0 && <div style={{ width: 24 }} />}
    </div>
  );
}

function ChoiceCard({ item, selected, onClick }) {
  const isSelected = selected?.id === item.id;
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        background: isSelected ? '#1a2a3a' : '#0f0f1e',
        border: `2px solid ${isSelected ? '#5ab4ff' : '#2a2a3e'}`,
        borderRadius: 10,
        padding: 14,
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: isSelected ? 'translateY(-3px)' : 'none',
        boxShadow: isSelected ? '0 6px 20px #5ab4ff33' : '0 2px 8px #0005',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6, textAlign: 'center' }}>{item.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#88ccff' : '#ccc', marginBottom: 4, textAlign: 'center' }}>
        {item.name}
      </div>
      <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4, marginBottom: 8, minHeight: 40 }}>
        {item.flavor}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {Object.entries(item.bonuses).map(([stat, val]) => {
          const meta = STAT_META.find(s => s.key === stat);
          return (
            <span key={stat} style={{
              background: meta?.color + '22',
              border: `1px solid ${meta?.color}55`,
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 11,
              color: meta?.color,
              fontWeight: 700,
            }}>
              {meta?.icon} +{val}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function CharacterCreation({ onComplete }) {
  const [step, setStep] = useState(0);
  const [race, setRace] = useState(null);
  const [cls, setCls] = useState(null);
  const [spec, setSpec] = useState(null);
  const [name, setName] = useState('');

  const currentStats = computeStats(race, cls, spec);

  const canNext = [!!race, !!cls, !!spec, name.trim().length > 0][step];

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else onComplete({ name: name.trim(), race, cls, spec, stats: currentStats });
  };

  const selections = [race, cls, spec];
  const setters = [setRace, setCls, setSpec];
  const pools = [RACES, CLASSES, SPECS];
  const cols = [3, 3, 4]; // grid columns per step

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1030 0%, #08080f 60%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px',
      boxSizing: 'border-box',
    }}>
      {/* Title */}
      <h1 style={{ margin: '0 0 6px', fontSize: 22, color: '#88aaff', letterSpacing: 3 }}>
        ⚔️ CRÉATION DE PERSONNAGE
      </h1>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              onClick={() => i < step && setStep(i)}
              style={{
                padding: '4px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: step === i ? 700 : 400,
                background: step === i ? '#1a3a5a' : i < step ? '#1a2a1a' : '#111',
                border: `1px solid ${step === i ? '#5ab4ff' : i < step ? '#4a8a4a' : '#2a2a3a'}`,
                color: step === i ? '#88ccff' : i < step ? '#88cc88' : '#444',
                cursor: i < step ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              {i < step ? '✓ ' : ''}{s}
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: '#2a2a3a' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 1400, alignItems: 'flex-start' }}>

        {/* Main choice area */}
        <div style={{ flex: 1 }}>
          {step < 3 && (
            <>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#aaa', fontWeight: 400 }}>
                {['Choisissez votre race', 'Choisissez votre classe', 'Choisissez votre spécialisation'][step]}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols[step]}, 1fr)`,
                gap: 12,
              }}>
                {pools[step].map(item => (
                  <ChoiceCard
                    key={item.id}
                    item={item}
                    selected={selections[step]}
                    onClick={v => setters[step](v)}
                  />
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ maxWidth: 500 }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 16, color: '#aaa', fontWeight: 400 }}>
                Donnez un nom à votre personnage
              </h2>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                placeholder="Entrez votre nom..."
                autoFocus
                maxLength={30}
                style={{
                  width: '100%',
                  background: '#0f0f1e',
                  border: '2px solid #3a3a5a',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: 20,
                  color: '#eee',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  marginBottom: 28,
                }}
              />

              {/* Summary */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[race, cls, spec].map((item, i) => item && (
                  <div key={i} style={{
                    background: '#10101e', border: '1px solid #2a2a3a',
                    borderRadius: 8, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, color: '#555' }}>{['Race', 'Classe', 'Spécialisation'][i]}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc' }}>{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats preview panel */}
        <div style={{
          width: 260,
          flexShrink: 0,
          background: '#0e0e1e',
          border: '1px solid #2a2a3a',
          borderRadius: 12,
          padding: 18,
          position: 'sticky',
          top: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 14, textAlign: 'center' }}>
            Aperçu des statistiques
          </div>

          {STAT_META.map(({ key, color }) => (
            <StatBar
              key={key}
              statKey={key}
              base={BASE_STATS[key]}
              current={currentStats[key]}
              color={color}
            />
          ))}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1a1a2a' }}>
            <div style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>HP de départ</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ff4466', textAlign: 'center' }}>
              {20 + currentStats.vie * 2}
            </div>
          </div>

          {/* Selected items recap */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['Race', race], ['Classe', cls], ['Spécia.', spec]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: '#444', width: 44 }}>{label}</span>
                {val
                  ? <span style={{ color: '#88aaff' }}>{val.icon} {val.name}</span>
                  : <span style={{ color: '#333' }}>—</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center' }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              background: '#1a1a2e', border: '1px solid #3a3a5a',
              borderRadius: 8, color: '#888', padding: '10px 24px',
              cursor: 'pointer', fontSize: 14,
            }}
          >
            ← Retour
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canNext}
          style={{
            background: canNext ? '#1a3a5a' : '#111',
            border: `1px solid ${canNext ? '#5ab4ff' : '#222'}`,
            borderRadius: 8,
            color: canNext ? '#88ccff' : '#333',
            padding: '10px 32px',
            cursor: canNext ? 'pointer' : 'not-allowed',
            fontSize: 14, fontWeight: 700,
            transition: 'all 0.15s',
          }}
        >
          {step < 3 ? 'Suivant →' : '⚔️ Commencer l\'aventure'}
        </button>
      </div>
    </div>
  );
}
