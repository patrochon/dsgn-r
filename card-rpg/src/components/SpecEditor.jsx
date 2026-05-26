import { useState } from 'react';
import { SPECS } from '../data/character';

const STAT_KEYS = [
  { key: 'force',       icon: '⚔️',  label: 'Force',      color: '#ff7755' },
  { key: 'magie',       icon: '✨',  label: 'Magie',      color: '#aa77ff' },
  { key: 'vie',         icon: '❤️',  label: 'Vie',        color: '#ff4466' },
  { key: 'deplacement', icon: '👢',  label: 'Déplacement',color: '#55ccff' },
  { key: 'richesse',    icon: '💰',  label: 'Richesse',   color: '#88ff44' },
  { key: 'destin',      icon: '🌟',  label: 'Destin',     color: '#ffcc22' },
];

export const STORAGE_KEY = 'detopia_custom_specs';

function loadFromStorage() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return SPECS.map(s => ({ ...s, bonuses: { ...s.bonuses } }));
}

const th = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: '#555', whiteSpace: 'nowrap', borderBottom: '2px solid #1e1e2e',
};
const td = { padding: '7px 10px', verticalAlign: 'middle' };
const inputBase = {
  background: '#0c0c1a', border: '1px solid #252535', borderRadius: 5,
  color: '#ddd', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.15s',
};

function AdjCell({ val, color, onAdj }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <button
        onClick={() => onAdj(-1)}
        style={{
          background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 4,
          color: '#cc4444', width: 22, height: 22, cursor: 'pointer', fontSize: 14,
          lineHeight: 1, padding: 0,
        }}
      >−</button>
      <span style={{
        width: 26, textAlign: 'center', fontWeight: 800,
        color: val > 0 ? color : '#2a2a3a', fontSize: 14,
      }}>
        {val > 0 ? `+${val}` : '—'}
      </span>
      <button
        onClick={() => onAdj(+1)}
        style={{
          background: '#0a1a0a', border: '1px solid #1a3a1a', borderRadius: 4,
          color: '#44cc44', width: 22, height: 22, cursor: 'pointer', fontSize: 14,
          lineHeight: 1, padding: 0,
        }}
      >+</button>
    </div>
  );
}

export default function SpecEditor({ onClose }) {
  const [specs, setSpecs] = useState(loadFromStorage);
  const [flash, setFlash] = useState(false);

  function setField(idx, field, val) {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  function adjBonus(idx, stat, delta) {
    setSpecs(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const next = Math.max(0, (s.bonuses[stat] ?? 0) + delta);
      const b = { ...s.bonuses };
      if (next === 0) delete b[stat]; else b[stat] = next;
      return { ...s, bonuses: b };
    }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setSpecs(SPECS.map(s => ({ ...s, bonuses: { ...s.bonuses } })));
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1030 0%, #08080f 60%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#eee',
      padding: '28px 24px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button
            onClick={onClose}
            style={{
              background: '#12121e', border: '1px solid #2a2a4a', borderRadius: 8,
              color: '#888', padding: '8px 16px', cursor: 'pointer', fontSize: 13,
            }}
          >← Retour</button>
          <h1 style={{ margin: 0, fontSize: 18, color: '#88aaff', letterSpacing: 2, fontWeight: 700 }}>
            ✦ SPÉCIALISATIONS
          </h1>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#120a0a', border: '1px solid #3a1a1a', borderRadius: 8,
                color: '#aa5544', padding: '8px 18px', cursor: 'pointer', fontSize: 12,
              }}
            >Réinitialiser</button>
            <button
              onClick={save}
              style={{
                background: flash ? '#0a1e0a' : '#0e1e30',
                border: `1px solid ${flash ? '#44cc44' : '#3a7acc'}`,
                borderRadius: 8,
                color: flash ? '#88ff88' : '#88ccff',
                padding: '8px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                transition: 'all 0.3s',
                minWidth: 120,
              }}
            >{flash ? '✓ Sauvegardé' : 'Sauvegarder'}</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #1e1e2e' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#0a0a16' }}>
              <tr>
                <th style={{ ...th, width: 56 }}>Icône</th>
                <th style={th}>Nom</th>
                <th style={{ ...th, minWidth: 220 }}>Description</th>
                {STAT_KEYS.map(s => (
                  <th key={s.key} style={{ ...th, color: s.color, minWidth: 100, textAlign: 'center' }}>
                    {s.icon} {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, idx) => (
                <tr
                  key={spec.id}
                  style={{
                    background: idx % 2 === 0 ? '#09091a' : '#0c0c1e',
                    borderBottom: '1px solid #141424',
                  }}
                >
                  {/* Icon */}
                  <td style={{ ...td, textAlign: 'center' }}>
                    <input
                      value={spec.icon}
                      onChange={e => setField(idx, 'icon', e.target.value)}
                      style={{ ...inputBase, width: 38, textAlign: 'center', fontSize: 20, padding: '3px 4px' }}
                    />
                  </td>

                  {/* Name */}
                  <td style={td}>
                    <input
                      value={spec.name}
                      onChange={e => setField(idx, 'name', e.target.value)}
                      style={{ ...inputBase, width: 150 }}
                    />
                  </td>

                  {/* Flavor */}
                  <td style={td}>
                    <input
                      value={spec.flavor}
                      onChange={e => setField(idx, 'flavor', e.target.value)}
                      style={{ ...inputBase, width: '100%', minWidth: 200 }}
                    />
                  </td>

                  {/* Stat bonuses */}
                  {STAT_KEYS.map(({ key, color }) => (
                    <td key={key} style={td}>
                      <AdjCell
                        val={spec.bonuses[key] ?? 0}
                        color={color}
                        onAdj={delta => adjBonus(idx, key, delta)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#333', textAlign: 'center' }}>
          Les modifications sont sauvegardées localement et s'appliquent à la prochaine création de personnage.
        </div>
      </div>
    </div>
  );
}
