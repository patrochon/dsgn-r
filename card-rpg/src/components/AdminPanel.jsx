import { useState, useMemo, useCallback } from 'react';
import { FULL_DECK, getCards, getCardWeights, RARITY_COLOR, CAT_META } from '../data/cards';

const KEY_CARDS   = 'detopia_custom_cards';
const KEY_WEIGHTS = 'detopia_card_weights';

const EFFECT_TYPES = ['move','defense','attack','magic_attack','heal','buff','magic','gold','passive','legendary','move_bonus','cure'];
const RANGES       = ['self','melee','r2','r4','r5','r6','line','aoe1','aoe2','global','wall_melee','back'];
const RARITIES     = ['common','uncommon','rare','legendary'];
const RARITY_FR    = { common:'Commune', uncommon:'Peu commune', rare:'Rare', legendary:'Légendaire' };
const CAT_MAP      = Object.fromEntries(CAT_META.map(c => [c.key, c]));

// ── Styles partagés ──────────────────────────────────────────────────────────
const BASE = {
  overlay: { position:'fixed', inset:0, background:'#06060f', zIndex:9000, display:'flex', flexDirection:'column', fontFamily:"'Segoe UI', system-ui, sans-serif", color:'#ddd', overflow:'hidden' },
  header:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #1e1e2e', flexShrink:0, background:'#0a0a18' },
  tabs:    { display:'flex', gap:8, padding:'12px 24px', borderBottom:'1px solid #1a1a2a', background:'#08080f', flexShrink:0 },
  scroll:  { flex:1, overflowY:'auto', padding:'20px 24px' },
  btn:     { border:'1px solid #2a2a4a', borderRadius:8, padding:'7px 18px', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.05em', transition:'all 0.15s' },
  input:   { background:'#12121e', border:'1px solid #2a2a3a', borderRadius:6, color:'#ddd', padding:'5px 10px', fontSize:12, width:'100%' },
  label:   { fontSize:11, color:'#666', marginBottom:3, display:'block' },
  row:     { display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))' },
};

// ── Probability bar ──────────────────────────────────────────────────────────
function ProbBar({ pct, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, background:'#1a1a2a', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${Math.min(pct * 5, 100)}%`, height:'100%', background: color || '#88aaff', borderRadius:3, transition:'width 0.3s' }}/>
      </div>
      <span style={{ fontSize:11, color:'#888', minWidth:42, textAlign:'right' }}>{pct.toFixed(2)}%</span>
    </div>
  );
}

// ── Card row in editor ───────────────────────────────────────────────────────
function CardRow({ card, isExpanded, onToggle, onChange }) {
  const rc = RARITY_COLOR[card.rarity] ?? '#888';
  const handleField = (path, val) => {
    const updated = JSON.parse(JSON.stringify(card));
    const parts = path.split('.');
    let obj = updated;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onChange(card.id, updated);
  };

  return (
    <div style={{ borderBottom:'1px solid #14141f', overflow:'hidden' }}>
      <div
        onClick={onToggle}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer', userSelect:'none',
          background: isExpanded ? '#101020' : 'transparent',
          transition:'background 0.15s' }}
        onMouseOver={e => { if (!isExpanded) e.currentTarget.style.background = '#0e0e1c'; }}
        onMouseOut={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize:18, minWidth:26 }}>{card.icon}</span>
        <span style={{ fontSize:13, fontWeight:600, flex:1 }}>{card.name}</span>
        <span style={{ fontSize:10, border:`1px solid ${rc}`, color:rc, borderRadius:4, padding:'1px 7px', marginRight:4 }}>{RARITY_FR[card.rarity]}</span>
        <span style={{ fontSize:10, color:'#555', background:'#1a1a2a', borderRadius:4, padding:'1px 7px' }}>{card.catLabel}</span>
        <span style={{ fontSize:14, color:'#444', marginLeft:4 }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div style={{ padding:'14px 16px 20px', background:'#0d0d1c', borderTop:'1px solid #1a1a2a' }}>
          <div style={{ ...BASE.row, marginBottom:12 }}>
            <div>
              <label style={BASE.label}>Icône</label>
              <input style={{ ...BASE.input, width:60, textAlign:'center', fontSize:18 }}
                value={card.icon} onChange={e => handleField('icon', e.target.value)} />
            </div>
            <div>
              <label style={BASE.label}>Nom</label>
              <input style={BASE.input} value={card.name} onChange={e => handleField('name', e.target.value)} />
            </div>
            <div>
              <label style={BASE.label}>Rareté</label>
              <select style={{ ...BASE.input, cursor:'pointer' }} value={card.rarity} onChange={e => handleField('rarity', e.target.value)}>
                {RARITIES.map(r => <option key={r} value={r}>{RARITY_FR[r]}</option>)}
              </select>
            </div>
            <div>
              <label style={BASE.label}>Catégorie</label>
              <select style={{ ...BASE.input, cursor:'pointer' }} value={card.category}
                onChange={e => {
                  const meta = CAT_MAP[e.target.value];
                  if (!meta) return;
                  const updated = { ...JSON.parse(JSON.stringify(card)), category: meta.key, catColor: meta.color, catLabel: meta.label };
                  onChange(card.id, updated);
                }}>
                {CAT_META.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={BASE.label}>Description</label>
            <textarea style={{ ...BASE.input, resize:'vertical', minHeight:52, lineHeight:1.5 }}
              value={card.desc} onChange={e => handleField('desc', e.target.value)} />
          </div>

          <div style={{ fontSize:11, color:'#555', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.1em' }}>Effet</div>
          <div style={{ ...BASE.row, marginBottom:10 }}>
            <div>
              <label style={BASE.label}>Type</label>
              <select style={{ ...BASE.input, cursor:'pointer' }} value={card.effect.type} onChange={e => handleField('effect.type', e.target.value)}>
                {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={BASE.label}>Bonus</label>
              <input type="number" style={BASE.input} value={card.effect.bonus}
                onChange={e => handleField('effect.bonus', Number(e.target.value))} />
            </div>
            <div>
              <label style={BASE.label}>Portée</label>
              <select style={{ ...BASE.input, cursor:'pointer' }} value={card.effect.range ?? 'self'} onChange={e => handleField('effect.range', e.target.value)}>
                {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={BASE.label}>Coût Magie</label>
              <input type="number" style={BASE.input} min={0} value={card.effect.magieCost ?? 0}
                onChange={e => handleField('effect.magieCost', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label style={BASE.label}>Effet spécial (code)</label>
            <input style={BASE.input} value={card.effect.special ?? ''} placeholder="ex: stat:armor+1 ou burn"
              onChange={e => handleField('effect.special', e.target.value || null)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Cartes ──────────────────────────────────────────────────────────────
function CardsTab({ cards, setCards }) {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [flash, setFlash] = useState('');

  const categories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    for (const c of cards) {
      if (!seen.has(c.category)) { seen.add(c.category); cats.push({ key: c.category, label: c.catLabel }); }
    }
    return cats;
  }, [cards]);

  const visible = useMemo(() => {
    return cards.filter(c => {
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.id.includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cards, catFilter, search]);

  const handleChange = useCallback((id, updated) => {
    setCards(prev => prev.map(c => c.id === id ? updated : c));
  }, [setCards]);

  const save = () => {
    localStorage.setItem(KEY_CARDS, JSON.stringify(cards));
    setFlash('saved');
    setTimeout(() => setFlash(''), 1800);
  };
  const reset = () => {
    localStorage.removeItem(KEY_CARDS);
    setCards(FULL_DECK.map(c => JSON.parse(JSON.stringify(c))));
    setFlash('reset');
    setTimeout(() => setFlash(''), 1800);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center', padding:'12px 0', flexWrap:'wrap', flexShrink:0 }}>
        <input placeholder="Rechercher..." style={{ ...BASE.input, width:180 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ color:'#444', fontSize:12 }}>{visible.length} carte{visible.length !== 1 ? 's' : ''}</span>
        <div style={{ flex:1 }}/>
        <button style={{ ...BASE.btn, background: flash==='saved' ? '#1a3a1a' : '#0e0e1a', color: flash==='saved' ? '#55cc88' : '#88aaff', borderColor: flash==='saved' ? '#336633' : '#2a2a4a' }} onClick={save}>
          {flash==='saved' ? 'OK Sauvegardé' : 'Sauvegarder'}
        </button>
        <button style={{ ...BASE.btn, background:'#0e0e1a', color:'#ff8866', borderColor:'#3a1a1a' }} onClick={reset}>
          Réinitialiser
        </button>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14, flexShrink:0 }}>
        <button onClick={() => setCatFilter('all')}
          style={{ ...BASE.btn, fontSize:11, padding:'4px 12px', background: catFilter==='all' ? '#1a2a3a' : 'transparent', color: catFilter==='all' ? '#88ccff' : '#555', borderColor: catFilter==='all' ? '#3a5a7a' : '#1e1e2e' }}>
          Toutes ({cards.length})
        </button>
        {categories.map(c => (
          <button key={c.key} onClick={() => setCatFilter(c.key)}
            style={{ ...BASE.btn, fontSize:11, padding:'4px 12px', background: catFilter===c.key ? '#1a2a3a' : 'transparent', color: catFilter===c.key ? '#88ccff' : '#555', borderColor: catFilter===c.key ? '#3a5a7a' : '#1e1e2e' }}>
            {c.label} ({cards.filter(x => x.category === c.key).length})
          </button>
        ))}
      </div>

      <div style={{ fontSize:11, color:'#444', marginBottom:14, fontStyle:'italic', flexShrink:0 }}>
        Les modifications s'appliquent à la prochaine partie démarrée.
      </div>

      <div style={{ flex:1, overflowY:'auto', border:'1px solid #1a1a2a', borderRadius:8 }}>
        {visible.map(card => (
          <CardRow key={card.id} card={card}
            isExpanded={expandedId === card.id}
            onToggle={() => setExpandedId(prev => prev === card.id ? null : card.id)}
            onChange={handleChange}
          />
        ))}
        {visible.length === 0 && (
          <div style={{ textAlign:'center', color:'#444', padding:40 }}>Aucune carte ne correspond.</div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Rareté / Probabilité ────────────────────────────────────────────────
function RarityTab({ cards, weights, setWeights }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rarity');
  const [flash, setFlash] = useState('');

  const totalWeight = useMemo(() => cards.reduce((s, c) => s + Math.max(0, weights[c.id] ?? 1), 0), [cards, weights]);

  const sorted = useMemo(() => {
    let list = filter === 'all' ? [...cards] : cards.filter(c => c.rarity === filter);
    list = list.map(c => ({ ...c, w: Math.max(0, weights[c.id] ?? 1), prob: totalWeight > 0 ? (Math.max(0, weights[c.id] ?? 1) / totalWeight * 100) : 0 }));
    if (sortBy === 'rarity') {
      const order = { legendary:0, rare:1, uncommon:2, common:3 };
      list.sort((a,b) => order[a.rarity] - order[b.rarity] || a.name.localeCompare(b.name));
    } else if (sortBy === 'weight') {
      list.sort((a,b) => b.w - a.w || a.name.localeCompare(b.name));
    } else if (sortBy === 'prob') {
      list.sort((a,b) => b.prob - a.prob);
    } else {
      list.sort((a,b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [cards, weights, filter, sortBy, totalWeight]);

  const setWeight = (id, val) => {
    const v = Math.max(0, Math.min(10, Math.floor(Number(val))));
    setWeights(prev => ({ ...prev, [id]: v }));
  };

  const save = () => {
    localStorage.setItem(KEY_WEIGHTS, JSON.stringify(weights));
    setFlash('saved');
    setTimeout(() => setFlash(''), 1800);
  };
  const reset = () => {
    localStorage.removeItem(KEY_WEIGHTS);
    setWeights({});
    setFlash('reset');
    setTimeout(() => setFlash(''), 1800);
  };

  const raritySummary = useMemo(() => {
    const map = {};
    for (const c of cards) {
      const w = Math.max(0, weights[c.id] ?? 1);
      if (!map[c.rarity]) map[c.rarity] = { count:0, weight:0 };
      map[c.rarity].count++;
      map[c.rarity].weight += w;
    }
    return map;
  }, [cards, weights]);

  const excl = cards.filter(c => (weights[c.id] ?? 1) === 0).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center', padding:'12px 0', flexWrap:'wrap', flexShrink:0 }}>
        <span style={{ fontSize:12, color:'#888' }}>Taille du deck : <strong style={{ color:'#88ccff' }}>{totalWeight}</strong> cartes</span>
        {excl > 0 && <span style={{ fontSize:11, color:'#ff6644', background:'#1a0a0a', border:'1px solid #3a1a1a', borderRadius:4, padding:'2px 8px' }}>{excl} carte{excl>1?'s':''} exclue{excl>1?'s':''}</span>}
        <div style={{ flex:1 }}/>
        <button style={{ ...BASE.btn, background: flash==='saved' ? '#1a3a1a' : '#0e0e1a', color: flash==='saved' ? '#55cc88' : '#88aaff', borderColor: flash==='saved' ? '#336633' : '#2a2a4a' }} onClick={save}>
          {flash==='saved' ? 'OK Sauvegardé' : 'Sauvegarder'}
        </button>
        <button style={{ ...BASE.btn, background:'#0e0e1a', color:'#ff8866', borderColor:'#3a1a1a' }} onClick={reset}>
          Réinitialiser
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:14, flexShrink:0 }}>
        {RARITIES.map(r => {
          const info = raritySummary[r] ?? { count:0, weight:0 };
          const rc = RARITY_COLOR[r];
          const pct = totalWeight > 0 ? info.weight / totalWeight * 100 : 0;
          return (
            <div key={r} style={{ background:'#0d0d1c', border:`1px solid ${rc}22`, borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontSize:11, color:rc, fontWeight:700, marginBottom:4 }}>{RARITY_FR[r].toUpperCase()}</div>
              <div style={{ fontSize:18, color:'#ddd', fontWeight:700 }}>{info.count}</div>
              <div style={{ fontSize:11, color:'#555', marginBottom:6 }}>cartes · {info.weight} dans deck</div>
              <ProbBar pct={pct} color={rc} />
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10, flexShrink:0, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:'#555' }}>Filtrer :</span>
        {['all', ...RARITIES].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ ...BASE.btn, fontSize:11, padding:'3px 10px',
              background: filter===r ? '#1a2a3a' : 'transparent',
              color: filter===r ? (r==='all' ? '#88ccff' : (RARITY_COLOR[r]||'#88ccff')) : '#444',
              borderColor: filter===r ? '#3a5a7a' : '#1e1e2e' }}>
            {r === 'all' ? 'Toutes' : RARITY_FR[r]}
          </button>
        ))}
        <span style={{ fontSize:11, color:'#555', marginLeft:8 }}>Trier :</span>
        {[['rarity','Rareté'],['name','Nom'],['weight','Poids'],['prob','Prob.']].map(([k,l]) => (
          <button key={k} onClick={() => setSortBy(k)}
            style={{ ...BASE.btn, fontSize:11, padding:'3px 10px',
              background: sortBy===k ? '#1a2a3a' : 'transparent',
              color: sortBy===k ? '#88ccff' : '#444',
              borderColor: sortBy===k ? '#3a5a7a' : '#1e1e2e' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ fontSize:11, color:'#444', marginBottom:10, fontStyle:'italic', flexShrink:0 }}>
        Poids 1 = probabilité normale · Poids 0 = carte exclue du deck · Max 10
      </div>

      <div style={{ flex:1, overflowY:'auto', border:'1px solid #1a1a2a', borderRadius:8 }}>
        <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 100px 100px 1fr', gap:12, padding:'8px 14px', background:'#0a0a18', borderBottom:'1px solid #1a1a2a', fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:'0.08em', position:'sticky', top:0 }}>
          <div></div>
          <div>Carte</div>
          <div>Rareté</div>
          <div style={{ textAlign:'center' }}>Poids</div>
          <div>Probabilité</div>
        </div>

        {sorted.map(card => {
          const rc = RARITY_COLOR[card.rarity] ?? '#888';
          const isExcl = card.w === 0;
          return (
            <div key={card.id} style={{ display:'grid', gridTemplateColumns:'32px 1fr 100px 100px 1fr', gap:12, padding:'8px 14px', borderBottom:'1px solid #0f0f1a', alignItems:'center', opacity: isExcl ? 0.4 : 1, transition:'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#0e0e1c'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize:18, textAlign:'center' }}>{card.icon}</span>
              <span style={{ fontSize:13 }}>{card.name}</span>
              <span style={{ fontSize:10, color:rc, border:`1px solid ${rc}44`, borderRadius:4, padding:'1px 6px', display:'inline-block', textAlign:'center' }}>{RARITY_FR[card.rarity]}</span>
              <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                <button onClick={() => setWeight(card.id, card.w - 1)} style={{ background:'#1a1a2a', border:'1px solid #2a2a3a', color:'#aaa', borderRadius:4, width:22, height:22, cursor:'pointer', fontSize:14, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>-</button>
                <span style={{ minWidth:18, textAlign:'center', fontSize:13, fontWeight:700, color: card.w === 0 ? '#ff4444' : card.w > 1 ? '#55cc88' : '#ddd' }}>{card.w}</span>
                <button onClick={() => setWeight(card.id, card.w + 1)} style={{ background:'#1a1a2a', border:'1px solid #2a2a3a', color:'#aaa', borderRadius:4, width:22, height:22, cursor:'pointer', fontSize:14, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
              <ProbBar pct={card.prob} color={rc} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main AdminPanel ──────────────────────────────────────────────────────────
export default function AdminPanel({ onClose }) {
  const [tab, setTab] = useState('cards');
  const [cards, setCards] = useState(() => getCards().map(c => JSON.parse(JSON.stringify(c))));
  const [weights, setWeights] = useState(() => getCardWeights());

  const tabBtn = (id, label, active) => (
    <button onClick={() => setTab(id)} style={{
      ...BASE.btn,
      background: active ? '#1a2a4a' : 'transparent',
      color: active ? '#88ccff' : '#555',
      borderColor: active ? '#3a5a8a' : '#1e1e2e',
      fontSize: 13,
    }}>{label}</button>
  );

  return (
    <div style={BASE.overlay}>
      <div style={BASE.header}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18, color:'#88aaff', fontWeight:700, letterSpacing:2 }}>ADMINISTRATION</span>
          <span style={{ fontSize:11, color:'#333', background:'#0a0a18', border:'1px solid #1e1e2e', borderRadius:4, padding:'2px 8px' }}>Détopia</span>
        </div>
        <button onClick={onClose} style={{ ...BASE.btn, background:'transparent', color:'#666', borderColor:'#1e1e2e', fontSize:14 }}>Fermer</button>
      </div>

      <div style={BASE.tabs}>
        {tabBtn('cards', 'Cartes', tab === 'cards')}
        {tabBtn('rarity', 'Rareté / Probabilité', tab === 'rarity')}
      </div>

      <div style={BASE.scroll}>
        {tab === 'cards'  && <CardsTab  cards={cards}   setCards={setCards}     />}
        {tab === 'rarity' && <RarityTab cards={cards}   weights={weights} setWeights={setWeights} />}
      </div>
    </div>
  );
}
