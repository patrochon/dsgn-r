import { RACES, CLASSES, SPECS, BASE_STATS } from '../data/character';
import { ARMOR_CARDS, WEAPON_CARDS, MAGIC_WEAPON_CARDS, RARE_CARDS, LEGENDARY_CARDS, TRINKET_CARDS, POTION_CARDS, SCROLL_CARDS } from '../data/cards';
import { MONSTER_PILE_1, MONSTER_PILE_2, MONSTER_PILE_3 } from '../data/monsters';
import { RARITY_COLOR } from '../data/cards';

const S = {
  wrap:    { padding: '16px', color: '#eee', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', maxHeight: '100vh', background: '#111' },
  h1:      { color: '#ffdd00', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '12px', fontSize: '16px' },
  h2:      { color: '#88ccff', margin: '16px 0 6px', fontSize: '14px', borderLeft: '3px solid #88ccff', paddingLeft: '8px' },
  table:   { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th:      { background: '#222', padding: '5px 8px', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #333', whiteSpace: 'nowrap' },
  td:      { padding: '4px 8px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'top' },
  tdNum:   { padding: '4px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center', color: '#88ff88' },
  even:    { background: '#161616' },
  odd:     { background: '#111' },
};

function Row({ cells, even }) {
  const style = even ? S.even : S.odd;
  return (
    <tr style={style}>
      {cells.map((c, i) => {
        const isNum = typeof c === 'number';
        return <td key={i} style={isNum ? S.tdNum : S.td}>{c ?? '—'}</td>;
      })}
    </tr>
  );
}

function Table({ cols, rows }) {
  return (
    <table style={S.table}>
      <thead>
        <tr>{cols.map(c => <th key={c} style={S.th}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <Row key={i} cells={r} even={i % 2 === 0} />)}
      </tbody>
    </table>
  );
}

function bonusSummary(bonuses) {
  if (!bonuses || Object.keys(bonuses).length === 0) return '—';
  return Object.entries(bonuses).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ');
}

function statRow(item) {
  const b = item.bonuses ?? {};
  return [
    item.icon + ' ' + item.name,
    b.force  ?? 0,
    b.magie  ?? 0,
    b.vie    ?? 0,
    b.deplacement ?? 0,
    b.richesse ?? 0,
    b.destin ?? 0,
    b.armor ?? 0,
    item.passive ?? '—',
  ];
}

function cardRow(card, i) {
  const sp = card.effect?.special ?? '—';
  return [
    card.icon + ' ' + card.name,
    card.rarity,
    card.effect?.type ?? '—',
    card.effect?.bonus ?? 0,
    sp.length > 40 ? sp.slice(0, 40) + '…' : sp,
  ];
}

function monsterRow(m) {
  return [m.icon + ' ' + m.name, m.maxHp, m.attack, m.defense, m.loot];
}

const STAT_COLS = ['Nom', 'Force', 'Magie', 'Vie', 'Dépl.', 'Richesse', 'Destin', 'Armure', 'Passif'];
const CARD_COLS = ['Nom', 'Rareté', 'Type', 'Bonus', 'Spécial'];
const MON_COLS  = ['Nom', 'HP max', 'ATK', 'DEF', 'Loot'];

export default function StatsReference() {
  return (
    <div style={S.wrap}>
      <div style={S.h1}>📊 Référence — Statistiques complètes</div>

      <div style={S.h2}>Stats de base</div>
      <Table
        cols={['Stat', 'Valeur']}
        rows={Object.entries(BASE_STATS).map(([k, v]) => [k, v])}
      />

      <div style={S.h2}>Races</div>
      <Table cols={STAT_COLS} rows={RACES.map(statRow)} />

      <div style={S.h2}>Classes</div>
      <Table cols={STAT_COLS} rows={CLASSES.map(statRow)} />

      <div style={S.h2}>Spécialisations</div>
      <Table cols={STAT_COLS} rows={SPECS.map(statRow)} />

      <div style={S.h2}>Armures</div>
      <Table cols={CARD_COLS} rows={ARMOR_CARDS.map(cardRow)} />

      <div style={S.h2}>Armes physiques</div>
      <Table cols={CARD_COLS} rows={WEAPON_CARDS.map(cardRow)} />

      <div style={S.h2}>Armes magiques</div>
      <Table cols={CARD_COLS} rows={MAGIC_WEAPON_CARDS.map(cardRow)} />

      <div style={S.h2}>Objets rares</div>
      <Table cols={CARD_COLS} rows={RARE_CARDS.map(cardRow)} />

      <div style={S.h2}>Objets légendaires</div>
      <Table cols={CARD_COLS} rows={LEGENDARY_CARDS.map(cardRow)} />

      <div style={S.h2}>Bibelots</div>
      <Table cols={CARD_COLS} rows={TRINKET_CARDS.map(cardRow)} />

      <div style={S.h2}>Potions</div>
      <Table cols={CARD_COLS} rows={POTION_CARDS.map(cardRow)} />

      <div style={S.h2}>Parchemins</div>
      <Table cols={CARD_COLS} rows={SCROLL_CARDS.map(cardRow)} />

      <div style={S.h2}>Monstres — Pile 1 (facile)</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_1.map(monsterRow)} />

      <div style={S.h2}>Monstres — Pile 2 (moyen)</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_2.map(monsterRow)} />

      <div style={S.h2}>Monstres — Pile 3 (difficile)</div>
      <Table cols={MON_COLS} rows={MONSTER_PILE_3.map(monsterRow)} />
    </div>
  );
}
