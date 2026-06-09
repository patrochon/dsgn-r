import { useState, useRef } from 'react';
import MapBuilder from './MapBuilder';
import './AdminPanel.css';

// ============================================================
// PARAMETRES VISUELS DES CARTES - Facilement modifiables ici
// ============================================================
const CARD_VISUAL_DEFAULTS = {
  // Dimensions de la carte
  width: 180,           // largeur en pixels
  height: 260,          // hauteur en pixels
  borderRadius: 16,     // arrondi des coins
  // Couleurs par type de carte
  colors: {
    arme:         { bg: '#1a0a0a', border: '#8B2020', header: '#5C1010', text: '#f5d0d0' },
    armure:       { bg: '#0a1a0a', border: '#1a6b1a', header: '#0d4a0d', text: '#d0f5d0' },
    parchemin:    { bg: '#1a1600', border: '#8B7520', header: '#5C4C10', text: '#f5ecc0' },
    deplacement:  { bg: '#0a0a1a', border: '#203a8B', header: '#10205C', text: '#c0d5f5' },
    monstre:      { bg: '#1a0a1a', border: '#6b1a6b', header: '#4a0d4a', text: '#f0c0f5' },
    classe:       { bg: '#120a00', border: '#8B5010', header: '#5C3010', text: '#f5dcc0' },
    race:         { bg: '#001a1a', border: '#107a7a', header: '#0a5050', text: '#c0f0f5' },
  },
  // Typographie
  titleSize: 14,        // taille du titre en px
  descSize: 11,         // taille de la description en px
  statSize: 10,         // taille des stats en px
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

// Types de cartes disponibles
const CARD_TYPES = [
  { id: 'arme',        label: 'Arme',         icon: '⚔️',  emoji: '🗡️' },
  { id: 'armure',      label: 'Armure',       icon: '🛡️',  emoji: '🛡️' },
  { id: 'parchemin',   label: 'Parchemin',    icon: '📜',  emoji: '📜' },
  { id: 'deplacement', label: 'Deplacement',  icon: '🚶',  emoji: '🏃' },
  { id: 'monstre',     label: 'Monstre',      icon: '👹',  emoji: '💀' },
  { id: 'classe',      label: 'Classe',       icon: '⚡',  emoji: '🎖️' },
  { id: 'race',        label: 'Race',         icon: '🧬',  emoji: '🌍' },
];

// Champs par type de carte
const CARD_FIELDS = {
  arme: [
    { key: 'id',     label: 'Identifiant',  type: 'text',   placeholder: 'ex: epee_feu' },
    { key: 'name',   label: 'Nom',          type: 'text',   placeholder: 'ex: Épée de Feu' },
    { key: 'icon',   label: 'Icône/Emoji',  type: 'text',   placeholder: '⚔️' },
    { key: 'damage', label: 'Dégâts',       type: 'number', placeholder: '3' },
    { key: 'range',  label: 'Portée',       type: 'select', options: ['self','melee','back','r2','r3','aoe2'] },
    { key: 'cost',   label: 'Coût PA',      type: 'number', placeholder: '1' },
    { key: 'effect', label: 'Type d\'effet', type: 'text', placeholder: 'attack' },
    { key: 'desc',   label: 'Description',  type: 'textarea', placeholder: 'Description de la carte...' },
    { key: 'image',  label: 'Image PNG',    type: 'image',  placeholder: '' },
  ],
  armure: [
    { key: 'id',     label: 'Identifiant',  type: 'text',   placeholder: 'ex: bouclier_bois' },
    { key: 'name',   label: 'Nom',          type: 'text',   placeholder: 'ex: Bouclier de Bois' },
    { key: 'icon',   label: 'Icône/Emoji',  type: 'text',   placeholder: '🛡️' },
    { key: 'armor',  label: 'Armure',       type: 'number', placeholder: '2' },
    { key: 'cost',   label: 'Coût PA',      type: 'number', placeholder: '1' },
    { key: 'effect', label: 'Type d\'effet', type: 'text', placeholder: 'block' },
    { key: 'desc',   label: 'Description',  type: 'textarea', placeholder: 'Description de la carte...' },
    { key: 'image',  label: 'Image PNG',    type: 'image',  placeholder: '' },
  ],
  parchemin: [
    { key: 'id',      label: 'Identifiant', type: 'text',   placeholder: 'ex: soin_mineur' },
    { key: 'name',    label: 'Nom',         type: 'text',   placeholder: 'ex: Parchemin de Soin' },
    { key: 'icon',    label: 'Icône/Emoji', type: 'text',   placeholder: '📜' },
    { key: 'heal',    label: 'Soin',        type: 'number', placeholder: '3' },
    { key: 'cost',    label: 'Coût PA',     type: 'number', placeholder: '1' },
    { key: 'effect',  label: 'Type d\'effet', type: 'text', placeholder: 'heal' },
    { key: 'range',   label: 'Portée',      type: 'select', options: ['self','melee','r2','r3','aoe2'] },
    { key: 'desc',    label: 'Description', type: 'textarea', placeholder: 'Description...' },
    { key: 'image',   label: 'Image PNG',   type: 'image',  placeholder: '' },
  ],
  deplacement: [
    { key: 'id',     label: 'Identifiant',  type: 'text',   placeholder: 'ex: sprint' },
    { key: 'name',   label: 'Nom',          type: 'text',   placeholder: 'ex: Sprint' },
    { key: 'icon',   label: 'Icône/Emoji',  type: 'text',   placeholder: '🏃' },
    { key: 'move',   label: 'Cases',        type: 'number', placeholder: '2' },
    { key: 'cost',   label: 'Coût PA',      type: 'number', placeholder: '1' },
    { key: 'effect', label: 'Type d\'effet', type: 'text', placeholder: 'move' },
    { key: 'desc',   label: 'Description',  type: 'textarea', placeholder: 'Description...' },
    { key: 'image',  label: 'Image PNG',    type: 'image',  placeholder: '' },
  ],
  monstre: [
    { key: 'id',     label: 'Identifiant',  type: 'text',   placeholder: 'ex: gobelin' },
    { key: 'name',   label: 'Nom',          type: 'text',   placeholder: 'ex: Gobelin' },
    { key: 'icon',   label: 'Icône/Emoji',  type: 'text',   placeholder: '👹' },
    { key: 'hp',     label: 'PV max',       type: 'number', placeholder: '5' },
    { key: 'atk',    label: 'Attaque',      type: 'number', placeholder: '2' },
    { key: 'def',    label: 'Défense',      type: 'number', placeholder: '1' },
    { key: 'move',   label: 'Mouvement',    type: 'number', placeholder: '2' },
    { key: 'xp',     label: 'XP donné',     type: 'number', placeholder: '3' },
    { key: 'desc',   label: 'Description',  type: 'textarea', placeholder: 'Description...' },
    { key: 'image',  label: 'Image PNG',    type: 'image',  placeholder: '' },
  ],
  classe: [
    { key: 'id',      label: 'Identifiant', type: 'text',   placeholder: 'ex: guerrier' },
    { key: 'name',    label: 'Nom',         type: 'text',   placeholder: 'ex: Guerrier' },
    { key: 'icon',    label: 'Icône/Emoji', type: 'text',   placeholder: '⚔️' },
    { key: 'flavor',  label: 'Description', type: 'textarea', placeholder: 'Texte saveur...' },
    { key: 'force',   label: 'Bonus Force', type: 'number', placeholder: '0' },
    { key: 'magie',   label: 'Bonus Magie', type: 'number', placeholder: '0' },
    { key: 'vie',     label: 'Bonus Vie',   type: 'number', placeholder: '0' },
    { key: 'deplacement', label: 'Bonus Déplacement', type: 'number', placeholder: '0' },
    { key: 'passive', label: 'Passif',      type: 'text',   placeholder: 'nom_du_passif' },
    { key: 'startCards', label: 'Cartes départ', type: 'text', placeholder: 'id1,id2,id3' },
    { key: 'image',   label: 'Image PNG',   type: 'image',  placeholder: '' },
  ],
  race: [
    { key: 'id',      label: 'Identifiant', type: 'text',   placeholder: 'ex: elfe' },
    { key: 'name',    label: 'Nom',         type: 'text',   placeholder: 'ex: Elfe' },
    { key: 'icon',    label: 'Icône/Emoji', type: 'text',   placeholder: '🧝' },
    { key: 'flavor',  label: 'Description', type: 'textarea', placeholder: 'Texte saveur...' },
    { key: 'force',   label: 'Bonus Force', type: 'number', placeholder: '0' },
    { key: 'magie',   label: 'Bonus Magie', type: 'number', placeholder: '0' },
    { key: 'vie',     label: 'Bonus Vie',   type: 'number', placeholder: '0' },
    { key: 'deplacement', label: 'Bonus Déplacement', type: 'number', placeholder: '0' },
    { key: 'destin',  label: 'Bonus Destin', type: 'number', placeholder: '0' },
    { key: 'armor',   label: 'Bonus Armure', type: 'number', placeholder: '0' },
    { key: 'passive', label: 'Passif',      type: 'text',   placeholder: 'nom_du_passif' },
    { key: 'image',   label: 'Image PNG',   type: 'image',  placeholder: '' },
  ],
};

// ============================================================
// APERCU DE CARTE
// ============================================================
function CardPreview({ cardType, formData, visuals }) {
  const v = visuals;
  const col = v.colors[cardType] || v.colors.arme;
  const type = CARD_TYPES.find(t => t.id === cardType);

  return (
    <div style={{
      width: v.width,
      height: v.height,
      borderRadius: v.borderRadius,
      background: col.bg,
      border: `2px solid ${col.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: v.fontFamily,
      boxShadow: `0 0 18px ${col.border}66, inset 0 0 30px #00000066`,
      flexShrink: 0,
    }}>
      {/* En-tête */}
      <div style={{
        background: col.header,
        padding: '6px 8px',
        borderBottom: `1px solid ${col.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: v.titleSize - 2, color: col.border, fontWeight: 700 }}>
          {type?.icon} {type?.label?.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: col.text, opacity: 0.7 }}>
          {formData.cost ? `${formData.cost} PA` : ''}
        </span>
      </div>

      {/* Image */}
      <div style={{
        height: 90,
        background: formData.imageSrc ? `url(${formData.imageSrc}) center/cover no-repeat` : `${col.header}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        borderBottom: `1px solid ${col.border}44`,
      }}>
        {!formData.imageSrc && (formData.icon || type?.emoji || '?')}
      </div>

      {/* Titre */}
      <div style={{
        padding: '5px 8px 3px',
        fontSize: v.titleSize,
        fontWeight: 700,
        color: col.text,
        textAlign: 'center',
        textShadow: `0 0 8px ${col.border}`,
      }}>
        {formData.name || 'Nom de la carte'}
      </div>

      {/* Stats */}
      <div style={{
        padding: '2px 8px',
        display: 'flex',
        gap: 6,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {formData.damage && <span style={{ fontSize: v.statSize, color: '#ff8888', background: '#ff000022', borderRadius: 4, padding: '1px 5px' }}>⚔️ {formData.damage}</span>}
        {formData.armor && <span style={{ fontSize: v.statSize, color: '#88ff88', background: '#00ff0022', borderRadius: 4, padding: '1px 5px' }}>🛡 {formData.armor}</span>}
        {formData.heal && <span style={{ fontSize: v.statSize, color: '#88ffaa', background: '#00ff5522', borderRadius: 4, padding: '1px 5px' }}>💚 {formData.heal}</span>}
        {formData.move && <span style={{ fontSize: v.statSize, color: '#88aaff', background: '#0055ff22', borderRadius: 4, padding: '1px 5px' }}>🏃 {formData.move}</span>}
        {formData.hp && <span style={{ fontSize: v.statSize, color: '#ff88aa', background: '#ff005522', borderRadius: 4, padding: '1px 5px' }}>❤️ {formData.hp}</span>}
        {formData.atk && <span style={{ fontSize: v.statSize, color: '#ffaa44', background: '#ff660022', borderRadius: 4, padding: '1px 5px' }}>⚡ {formData.atk}</span>}
        {formData.range && <span style={{ fontSize: v.statSize, color: '#aaaaff', background: '#0000ff22', borderRadius: 4, padding: '1px 5px' }}>📏 {formData.range}</span>}
      </div>

      {/* Description */}
      <div style={{
        padding: '4px 8px',
        fontSize: v.descSize,
        color: col.text,
        opacity: 0.85,
        textAlign: 'center',
        flexGrow: 1,
        overflow: 'hidden',
        lineHeight: 1.4,
      }}>
        {formData.desc || formData.flavor || 'Description de la carte...'}
      </div>

      {/* Passif badge */}
      {(formData.passive || formData.bonus) && (
        <div style={{
          padding: '3px 8px',
          background: `${col.border}33`,
          borderTop: `1px solid ${col.border}44`,
          fontSize: 9,
          color: col.border,
          textAlign: 'center',
        }}>
          PASSIF: {formData.passive}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORMULAIRE D'UNE CARTE
// ============================================================
function CardForm({ cardType, formData, onChange }) {
  const fields = CARD_FIELDS[cardType] || [];
  const imageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ ...formData, imageSrc: ev.target.result, imageFile: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div className="adm-form">
      {fields.map(field => (
        <div key={field.key} className="adm-field">
          <label className="adm-label">{field.label}</label>

          {field.type === 'text' && (
            <input
              className="adm-input"
              type="text"
              placeholder={field.placeholder}
              value={formData[field.key] || ''}
              onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
            />
          )}

          {field.type === 'number' && (
            <input
              className="adm-input adm-input--num"
              type="number"
              placeholder={field.placeholder}
              value={formData[field.key] || ''}
              onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              className="adm-textarea"
              placeholder={field.placeholder}
              value={formData[field.key] || ''}
              onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
              rows={3}
            />
          )}

          {field.type === 'select' && (
            <select
              className="adm-select"
              value={formData[field.key] || ''}
              onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
            >
              <option value="">-- choisir --</option>
              {field.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {field.type === 'image' && (
            <div className="adm-image-upload">
              <button
                className="adm-btn adm-btn--upload"
                onClick={() => imageRef.current?.click()}
                type="button"
              >
                {formData.imageSrc ? '✅ Image chargée' : '📁 Choisir PNG'}
              </button>
              {formData.imageFile && (
                <span className="adm-image-name">{formData.imageFile}</span>
              )}
              <input
                ref={imageRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              {formData.imageSrc && (
                <button
                  className="adm-btn adm-btn--danger-sm"
                  onClick={() => onChange({ ...formData, imageSrc: null, imageFile: null })}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EDITEUR VISUEL
// ============================================================
function VisualEditor({ visuals, onChange }) {
  const handleColorChange = (type, key, val) => {
    onChange({
      ...visuals,
      colors: {
        ...visuals.colors,
        [type]: { ...visuals.colors[type], [key]: val },
      },
    });
  };

  return (
    <div className="adm-visual-editor">
      <h3 className="adm-section-title">🎨 Paramètres Visuels</h3>

      <div className="adm-visual-grid">
        <div className="adm-visual-block">
          <h4 className="adm-subsection">Dimensions</h4>
          <div className="adm-field">
            <label className="adm-label">Largeur (px)</label>
            <input type="number" className="adm-input adm-input--num" value={visuals.width}
              onChange={e => onChange({ ...visuals, width: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Hauteur (px)</label>
            <input type="number" className="adm-input adm-input--num" value={visuals.height}
              onChange={e => onChange({ ...visuals, height: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Arrondi coins (px)</label>
            <input type="number" className="adm-input adm-input--num" value={visuals.borderRadius}
              onChange={e => onChange({ ...visuals, borderRadius: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Taille titre (px)</label>
            <input type="number" className="adm-input adm-input--num" value={visuals.titleSize}
              onChange={e => onChange({ ...visuals, titleSize: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Taille desc (px)</label>
            <input type="number" className="adm-input adm-input--num" value={visuals.descSize}
              onChange={e => onChange({ ...visuals, descSize: Number(e.target.value) })} />
          </div>
        </div>

        {CARD_TYPES.map(ct => (
          <div key={ct.id} className="adm-visual-block">
            <h4 className="adm-subsection">{ct.icon} {ct.label}</h4>
            {['bg', 'border', 'header', 'text'].map(key => (
              <div key={key} className="adm-field adm-field--color">
                <label className="adm-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <div className="adm-color-row">
                  <input
                    type="color"
                    className="adm-color-picker"
                    value={visuals.colors[ct.id]?.[key] || '#000000'}
                    onChange={e => handleColorChange(ct.id, key, e.target.value)}
                  />
                  <input
                    type="text"
                    className="adm-input adm-input--hex"
                    value={visuals.colors[ct.id]?.[key] || '#000000'}
                    onChange={e => handleColorChange(ct.id, key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LISTE DES CARTES CREEES
// ============================================================
function CardList({ cards, onEdit, onDelete, visuals }) {
  if (!cards.length) return (
    <p style={{ color: '#555', textAlign: 'center', padding: 32 }}>
      Aucune carte créée. Utilisez le formulaire à gauche.
    </p>
  );

  return (
    <div className="adm-card-list">
      {cards.map((card, idx) => (
        <div key={idx} className="adm-card-item">
          <CardPreview cardType={card._type} formData={card} visuals={visuals} />
          <div className="adm-card-actions">
            <button className="adm-btn adm-btn--edit" onClick={() => onEdit(idx)}>✏️ Éditer</button>
            <button className="adm-btn adm-btn--danger" onClick={() => onDelete(idx)}>🗑️ Suppr.</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EXPORTEUR JSON/JS
// ============================================================
function ExportPanel({ cards }) {
  const grouped = {};
  CARD_TYPES.forEach(t => { grouped[t.id] = []; });
  cards.forEach(card => {
    const type = card._type;
    if (grouped[type]) grouped[type].push(card);
  });

  const generateJS = () => {
    let output = '// === Données exportées depuis le menu Admin Détopia ===\n\n';
    CARD_TYPES.forEach(t => {
      const items = grouped[t.id];
      if (!items.length) return;
      const varName = t.id.toUpperCase() + 'S';
      output += `export const ${varName} = [\n`;
      items.forEach(card => {
        const clean = { ...card };
        delete clean._type;
        delete clean.imageSrc;
        output += '  ' + JSON.stringify(clean, null, 2).replace(/\n/g, '\n  ') + ',\n';
      });
      output += `];\n\n`;
    });
    return output;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJS());
    alert('Code JS copié dans le presse-papiers !');
  };

  const downloadJSON = () => {
    const data = {};
    CARD_TYPES.forEach(t => { data[t.id] = grouped[t.id]; });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'detopia-cards.json';
    a.click();
  };

  const totalCards = cards.length;

  return (
    <div className="adm-export">
      <h3 className="adm-section-title">📤 Export</h3>
      <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
        {totalCards} carte(s) créée(s)
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="adm-btn adm-btn--primary" onClick={copyToClipboard}>📋 Copier JS</button>
        <button className="adm-btn adm-btn--primary" onClick={downloadJSON}>⬇️ JSON</button>
      </div>
      <div className="adm-export-summary">
        {CARD_TYPES.map(t => (
          grouped[t.id].length > 0 && (
            <div key={t.id} className="adm-export-row">
              <span>{t.icon} {t.label}</span>
              <span className="adm-badge">{grouped[t.id].length}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL ADMINPANEL
// ============================================================
export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list' | 'visual' | 'export'
  const [activeType, setActiveType] = useState('arme');
  const [formData, setFormData] = useState({});
  const [cards, setCards] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [visuals, setVisuals] = useState({ ...CARD_VISUAL_DEFAULTS });

  const handleSaveCard = () => {
    if (!formData.name) {
      alert('Le nom de la carte est obligatoire !');
      return;
    }
    const card = { ...formData, _type: activeType };
    if (editIndex !== null) {
      const updated = [...cards];
      updated[editIndex] = card;
      setCards(updated);
      setEditIndex(null);
    } else {
      setCards([...cards, card]);
    }
    setFormData({});
  };

  const handleEdit = (idx) => {
    const card = cards[idx];
    setActiveType(card._type);
    setFormData(card);
    setEditIndex(idx);
    setActiveTab('create');
  };

  const handleDelete = (idx) => {
    if (!confirm('Supprimer cette carte ?')) return;
    setCards(cards.filter((_, i) => i !== idx));
    if (editIndex === idx) { setEditIndex(null); setFormData({}); }
  };

  const handleCancel = () => {
    setFormData({});
    setEditIndex(null);
  };

  const tabs = [
    { id: 'create', label: '✨ Créer', icon: '➕' },
    { id: 'list',   label: `📦 Cartes (${cards.length})`, icon: '📦' },
    { id: 'visual', label: '🎨 Visuels', icon: '🎨' },
    { id: 'export', label: '📤 Export', icon: '📤' },
    { id: 'map',    label: '\uD83D\uDDFA\uFE0F Carte', icon: '\uD83D\uDDFA\uFE0F' },
  ];

  return (
    <div className="adm-overlay">
      <div className="adm-panel">
        {/* HEADER */}
        <div className="adm-header">
          <div className="adm-header-left">
            <span className="adm-logo">⚙️</span>
            <h2 className="adm-title">Menu Admin — Détopia</h2>
          </div>
          <button className="adm-close" onClick={onClose} title="Fermer">✕</button>
        </div>

        {/* TABS */}
        <div className="adm-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`adm-tab ${activeTab === tab.id ? 'adm-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="adm-content">

          {/* ---- ONGLET CRÉER ---- */}
          {activeTab === 'create' && (
            <div className="adm-create-layout">
              {/* Sidebar: type selector */}
              <div className="adm-type-sidebar">
                <div className="adm-sidebar-title">Type de carte</div>
                {CARD_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`adm-type-btn ${activeType === t.id ? 'adm-type-btn--active' : ''}`}
                    onClick={() => { setActiveType(t.id); setFormData({}); setEditIndex(null); }}
                  >
                    <span className="adm-type-icon">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="adm-form-area">
                <div className="adm-form-header">
                  <h3 className="adm-section-title">
                    {editIndex !== null ? '✏️ Modifier la carte' : '➕ Nouvelle carte — '}{CARD_TYPES.find(t => t.id === activeType)?.label}
                  </h3>
                  {editIndex !== null && (
                    <button className="adm-btn adm-btn--ghost" onClick={handleCancel}>Annuler l'édition</button>
                  )}
                </div>
                <CardForm cardType={activeType} formData={formData} onChange={setFormData} />
                <div className="adm-form-actions">
                  <button className="adm-btn adm-btn--primary adm-btn--lg" onClick={handleSaveCard}>
                    {editIndex !== null ? '💾 Sauvegarder' : '✅ Ajouter la carte'}
                  </button>
                  <button className="adm-btn adm-btn--ghost" onClick={handleCancel}>Réinitialiser</button>
                </div>
              </div>

              {/* Preview */}
              <div className="adm-preview-area">
                <div className="adm-sidebar-title">Aperçu</div>
                <CardPreview cardType={activeType} formData={formData} visuals={visuals} />
                <div style={{ marginTop: 12, fontSize: 11, color: '#555', textAlign: 'center' }}>
                  {visuals.width} × {visuals.height} px
                </div>
              </div>
            </div>
          )}

          {/* ---- ONGLET LISTE ---- */}
          {activeTab === 'list' && (
            <div className="adm-list-area">
              <h3 className="adm-section-title">📦 Cartes créées ({cards.length})</h3>
              <CardList cards={cards} onEdit={handleEdit} onDelete={handleDelete} visuals={visuals} />
            </div>
          )}

          {/* ---- ONGLET VISUELS ---- */}
          {activeTab === 'visual' && (
            <VisualEditor visuals={visuals} onChange={setVisuals} />
          )}

          {/* ---- ONGLET EXPORT ---- */}
          {activeTab === 'export' && (
            <ExportPanel cards={cards} />
          )}

            {/* ---- ONGLET MAP ---- */}
            {activeTab === 'map' && (
              <MapBuilder />
            )}
        </div>
      </div>
    </div>
  );
}
