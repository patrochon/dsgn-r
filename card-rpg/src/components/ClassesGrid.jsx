import './ClassesGrid.css';

/**
 * Grid of all 6 game class cards with doodle SVG illustrations.
 * Drop <ClassesGrid /> anywhere in your app.
 */
export default function ClassesGrid() {
  return (
    <div className="classes-grid">
{/* ============================
         LE BUM
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Wild tufted hair */}
          <path d="M77,58 C70,40 78,24 88,36"/>
          <path d="M91,51 C87,30 97,19 106,35"/>
          <path d="M108,55 C116,33 127,37 122,54"/>
          <path d="M74,65 C59,52 62,36 73,44"/>
          <path d="M100,52 C97,36 107,26 113,40" strokeWidth="2"/>

          {/* Head (slightly tilted) */}
          <ellipse cx="100" cy="74" rx="28" ry="26" fill="#f0ddb5"/>

          {/* Tired droopy eyes */}
          <path d="M87,69 Q90,65 93,69" strokeWidth="2"/>
          <circle cx="90" cy="72" r="2.5" fill="#1a1a2a" stroke="none"/>
          <path d="M107,69 Q110,65 113,69" strokeWidth="2"/>
          <circle cx="110" cy="72" r="2.5" fill="#1a1a2a" stroke="none"/>
          {/* Under-eye bags */}
          <path d="M87,74 Q90,76 93,74" strokeWidth="1.2"/>
          <path d="M107,74 Q110,76 113,74" strokeWidth="1.2"/>

          {/* Weary mouth */}
          <path d="M93,84 Q100,81 107,84" strokeWidth="2"/>

          {/* Stubble dots */}
          <circle cx="95" cy="89" r="1.2" fill="#1a1a2a" stroke="none"/>
          <circle cx="102" cy="91" r="1.2" fill="#1a1a2a" stroke="none"/>
          <circle cx="109" cy="89" r="1.2" fill="#1a1a2a" stroke="none"/>
          <circle cx="92" cy="87" r="1" fill="#1a1a2a" stroke="none"/>

          {/* Neck */}
          <line x1="92" y1="100" x2="92" y2="105"/>
          <line x1="108" y1="100" x2="108" y2="105"/>

          {/* SCARF (dominant red element — multiple wraps) */}
          <path d="M68,106 Q80,96 100,100 Q120,96 132,106 Q137,118 130,130 Q116,138 100,138 Q84,138 70,130 Q63,118 68,106Z"
                fill="#cc2222" stroke="#1a1a2a" strokeWidth="2.5"/>
          <path d="M71,108 Q100,103 129,108" stroke="#991111" strokeWidth="1.2" fill="none" opacity="0.7"/>
          <path d="M66,120 Q100,115 134,120" stroke="#991111" strokeWidth="1.2" fill="none" opacity="0.7"/>
          {/* Scarf dangling end */}
          <path d="M132,110 C145,124 141,152 126,174" stroke="#cc2222" strokeWidth="3" fill="none"/>
          <path d="M126,174 C120,186 114,192 118,200" stroke="#cc2222" strokeWidth="2.5" fill="none"/>

          {/* Body (baggy coat) */}
          <path d="M68,138 C54,148 50,172 52,210"/>
          <path d="M132,138 C146,148 150,172 148,210"/>
          <line x1="52" y1="210" x2="148" y2="210"/>
          {/* Lapels / open coat */}
          <path d="M88,138 L94,160 L100,153 L106,160 L112,138" strokeWidth="2"/>
          {/* Coat patches */}
          <rect x="56" y="155" width="15" height="11" rx="2" fill="#e0c870" strokeWidth="1.5" transform="rotate(-8 63 160)"/>
          <rect x="128" y="170" width="13" height="9" rx="2" fill="#e0c870" strokeWidth="1.5" transform="rotate(6 134 175)"/>

          {/* Left arm holding bindle */}
          <path d="M54,148 C40,158 36,180 40,196"/>
          {/* Bindle stick */}
          <line x1="40" y1="192" x2="84" y2="105" strokeWidth="2.2"/>
          {/* Bundle at top */}
          <circle cx="86" cy="99" r="12" fill="#c8922a" strokeWidth="2"/>
          <path d="M78,99 Q86,93 94,99" strokeWidth="1.5"/>

          {/* Right arm loose */}
          <path d="M146,148 C160,158 164,180 160,196"/>

          {/* Shoes (mismatched) */}
          <path d="M62,210 Q48,214 42,220 Q50,226 66,223 Q76,217 72,210Z" fill="#5a3010" strokeWidth="2"/>
          <path d="M138,210 Q152,214 158,220 Q150,226 134,223 Q124,217 128,210Z" fill="#3a2010" strokeWidth="2"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">🧣</span><span className="name">Le Bum</span></div>
        <p className="flavor">Maître de la débrouillardise. Il trouve toujours une sortie — ou une combine.</p>
        <div className="stats"><span className="stat">+1 Force</span></div>
      </div>
    </div>

    {/* ============================
         LE FOU
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Jester hat left point */}
          <path d="M100,62 C86,48 66,32 58,48 C54,60 62,72 76,74"/>
          <circle cx="55" cy="50" r="9" fill="#e05522" strokeWidth="2.5"/>
          {/* Jester hat right point */}
          <path d="M100,62 C114,46 136,28 144,46 C148,58 140,72 124,74"/>
          <circle cx="145" cy="48" r="9" fill="#2255cc" strokeWidth="2.5"/>
          {/* Hat band */}
          <path d="M76,74 Q100,64 124,74" stroke="#f0c20a" strokeWidth="4" fill="none"/>
          {/* Hat fill */}
          <path d="M78,76 Q100,66 122,76 L118,86 Q100,78 82,86Z" fill="#f0c20a" strokeWidth="1.5" stroke="#1a1a2a"/>

          {/* Head */}
          <ellipse cx="100" cy="100" rx="30" ry="28" fill="#f0ddb5"/>

          {/* Wide mischievous eyes */}
          <circle cx="87" cy="94" r="8" fill="white" strokeWidth="2"/>
          <circle cx="90" cy="96" r="4" fill="#1a1a2a" stroke="none"/>
          <circle cx="89" cy="93" r="1.5" fill="white" stroke="none"/>
          <circle cx="113" cy="94" r="8" fill="white" strokeWidth="2"/>
          <circle cx="116" cy="96" r="4" fill="#1a1a2a" stroke="none"/>
          <circle cx="115" cy="93" r="1.5" fill="white" stroke="none"/>
          {/* Raised eyebrow left */}
          <path d="M82,86 Q88,82 94,85" strokeWidth="2" stroke="#8b6040"/>
          {/* Normal eyebrow right (more manic) */}
          <path d="M108,84 Q114,86 120,83" strokeWidth="2" stroke="#8b6040"/>

          {/* Giant grin */}
          <path d="M78,114 Q100,132 122,114" fill="#c22222" stroke="#c22222" strokeWidth="2.5"/>
          {/* Teeth */}
          <path d="M78,114 Q100,122 122,114 Q108,118 100,120 Q92,118 78,114Z" fill="#f0ddb5" stroke="none"/>
          <line x1="89" y1="115" x2="89" y2="120" stroke="white" strokeWidth="2.2" fill="none"/>
          <line x1="100" y1="117" x2="100" y2="121" stroke="white" strokeWidth="2.2" fill="none"/>
          <line x1="111" y1="115" x2="111" y2="120" stroke="white" strokeWidth="2.2" fill="none"/>

          {/* Rosy cheeks */}
          <circle cx="74" cy="108" r="7" fill="#f0a0a0" stroke="none" opacity="0.45"/>
          <circle cx="126" cy="108" r="7" fill="#f0a0a0" stroke="none" opacity="0.45"/>

          {/* Jester collar / ruff */}
          <path d="M70,128 Q100,120 130,128 Q120,140 100,134 Q80,140 70,128Z" fill="#e05522" strokeWidth="2"/>

          {/* Body (harlequin diamonds) */}
          <path d="M70,134 C56,144 54,168 56,210"/>
          <path d="M130,134 C144,144 146,168 144,210"/>
          <line x1="56" y1="210" x2="144" y2="210"/>
          {/* Left diamond quadrant */}
          <path d="M70,148 L85,134 L100,148 L85,162Z" fill="#e05522" strokeWidth="1.5"/>
          <path d="M70,176 L85,162 L100,176 L85,190Z" fill="#2255cc" strokeWidth="1.5"/>
          {/* Right diamond quadrant */}
          <path d="M100,148 L115,134 L130,148 L115,162Z" fill="#2255cc" strokeWidth="1.5"/>
          <path d="M100,176 L115,162 L130,176 L115,190Z" fill="#e05522" strokeWidth="1.5"/>

          {/* Left arm holding playing card */}
          <path d="M56,142 C40,152 36,174 40,190"/>
          <rect x="22" y="170" width="26" height="36" rx="3" fill="white" strokeWidth="2"/>
          <text x="26" y="192" fontSize="22" fill="#c22222" stroke="none" fontFamily="serif">♦</text>
          <text x="26" y="204" fontSize="8" fill="#c22222" stroke="none">A</text>

          {/* Right arm pointing out */}
          <path d="M144,142 C158,134 172,140 174,154"/>
          <path d="M174,154 C176,164 170,172 162,167" strokeWidth="2"/>

          {/* Curly-toed shoes with bells */}
          <path d="M66,210 Q52,215 46,224 Q54,230 68,226 Q80,219 76,210Z" fill="#f0c20a" strokeWidth="2"/>
          <circle cx="47" cy="224" r="5" fill="#e05522" strokeWidth="1.5"/>
          <path d="M134,210 Q148,215 154,224 Q146,230 132,226 Q120,219 124,210Z" fill="#e05522" strokeWidth="2"/>
          <circle cx="154" cy="224" r="5" fill="#2255cc" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">🃏</span><span className="name">Le Fou</span></div>
        <p className="flavor">Imprévisible et redoutable. Ses décisions insensées deviennent des coups de génie.</p>
        <div className="stats"><span className="stat">+1 Magie</span></div>
      </div>
    </div>

    {/* ============================
         L'ALCHIMISTE
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Wild experiment hair (frazzled by fumes) */}
          <path d="M78,56 C72,38 80,24 90,36"/>
          <path d="M105,52 C110,30 122,26 120,46"/>
          <path d="M92,50 C89,32 100,22 108,38"/>
          <path d="M76,62 C63,50 66,34 76,44" strokeWidth="2"/>

          {/* Head */}
          <ellipse cx="100" cy="72" rx="28" ry="26" fill="#f0ddb5"/>

          {/* BIG ROUND GOGGLES (dominant feature) */}
          {/* Left goggle outer ring */}
          <circle cx="88" cy="68" r="13" fill="#aaddff" strokeWidth="2.5" opacity="0.82"/>
          {/* Right goggle outer ring */}
          <circle cx="112" cy="68" r="13" fill="#aaddff" strokeWidth="2.5" opacity="0.82"/>
          {/* Goggle bridge */}
          <path d="M101,68 L99,68" strokeWidth="3.5"/>
          {/* Goggle side straps */}
          <path d="M125,68 C130,68 136,63 134,57" strokeWidth="2"/>
          <path d="M75,68 C70,68 64,63 66,57" strokeWidth="2"/>
          {/* Goggle inner lens reflection */}
          <circle cx="88" cy="68" r="9" strokeWidth="1.2" opacity="0.5"/>
          <circle cx="112" cy="68" r="9" strokeWidth="1.2" opacity="0.5"/>
          {/* Eyes behind goggles */}
          <circle cx="88" cy="69" r="4.5" fill="#1a1a2a" opacity="0.75"/>
          <circle cx="112" cy="69" r="4.5" fill="#1a1a2a" opacity="0.75"/>
          <circle cx="87" cy="67" r="1.8" fill="white" stroke="none" opacity="0.6"/>
          <circle cx="111" cy="67" r="1.8" fill="white" stroke="none" opacity="0.6"/>

          {/* Focused mouth (slight smirk) */}
          <path d="M93,85 Q100,88 108,85" strokeWidth="2"/>

          {/* Lab coat */}
          <path d="M72,98 C56,108 52,138 54,210"/>
          <path d="M128,98 C144,108 148,138 146,210"/>
          <line x1="54" y1="210" x2="146" y2="210"/>
          {/* Lapels */}
          <path d="M88,98 L93,122 L100,114 L107,122 L112,98" strokeWidth="2"/>
          {/* Breast pocket with vials */}
          <rect x="56" y="120" width="18" height="18" rx="2" strokeWidth="1.5" fill="#e8e8e0"/>
          <rect x="60" y="110" width="5" height="14" rx="2.5" fill="#99ff66" strokeWidth="1.5"/>
          <rect x="67" y="108" width="5" height="16" rx="2.5" fill="#ff6666" strokeWidth="1.5"/>

          {/* Left arm (holding flask) */}
          <path d="M52,112 C38,122 34,148 36,170"/>

          {/* FLASK (right side of composition) */}
          {/* Flask neck */}
          <rect x="126" y="110" width="14" height="26" rx="3" fill="#88ddbb" strokeWidth="2.5"/>
          {/* Flask stopper */}
          <rect x="123" y="104" width="20" height="8" rx="3" fill="#7b4c2a" strokeWidth="2"/>
          {/* Flask round body */}
          <circle cx="133" cy="160" r="28" fill="#55cc88" strokeWidth="2.5" opacity="0.88"/>
          {/* Liquid inside */}
          <path d="M106,166 Q133,172 160,166 Q160,182 133,186 Q106,182 106,166Z" fill="#22aa66" stroke="none"/>
          {/* Bubble in flask */}
          <circle cx="125" cy="156" r="4" strokeWidth="1.5" opacity="0.7" fill="none"/>
          <circle cx="140" cy="148" r="3" strokeWidth="1.5" opacity="0.7" fill="none"/>
          {/* Bubbles rising above flask */}
          <circle cx="130" cy="102" r="4" strokeWidth="1.5" opacity="0.6" fill="none"/>
          <circle cx="138" cy="95" r="3" strokeWidth="1.5" opacity="0.5" fill="none"/>
          <circle cx="133" cy="86" r="2" strokeWidth="1.5" opacity="0.4" fill="none"/>
          {/* Measurement lines on flask */}
          <line x1="106" y1="162" x2="111" y2="162" strokeWidth="1.5" opacity="0.6"/>
          <line x1="106" y1="172" x2="111" y2="172" strokeWidth="1.5" opacity="0.6"/>

          {/* Right arm holding flask */}
          <path d="M128,108 C136,114 136,126 134,138" strokeWidth="2.5"/>

          {/* Shoes */}
          <path d="M64,210 Q50,214 44,221 Q52,227 66,224 Q76,217 72,210Z" fill="#4a4a5a" strokeWidth="2"/>
          <path d="M136,210 Q150,214 156,221 Q148,227 134,224 Q124,217 128,210Z" fill="#4a4a5a" strokeWidth="2"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">⚗️</span><span className="name">L'Alchimiste</span></div>
        <p className="flavor">Il transforme la matière et les corps. Ses potions guérissent… ou détruisent.</p>
        <div className="stats"><span className="stat">+3 Vie</span><span className="stat">+1 Richesse</span></div>
      </div>
    </div>

    {/* ============================
         LE MESSAGER
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Speed lines (behind figure — left side) */}
          <path d="M18,85 L55,85" strokeWidth="2" stroke="#ccc" strokeDasharray="3,3"/>
          <path d="M10,100 L48,100" strokeWidth="2.5" stroke="#bbb" strokeDasharray="4,3"/>
          <path d="M16,115 L54,115" strokeWidth="2" stroke="#ccc" strokeDasharray="3,3"/>
          <path d="M22,130 L56,130" strokeWidth="1.8" stroke="#ddd" strokeDasharray="2,3"/>

          {/* Postal cap */}
          <path d="M74,52 Q100,44 126,52 L122,62 Q100,56 78,62Z" fill="#2244aa" strokeWidth="2"/>
          <path d="M70,58 Q100,52 130,58" strokeWidth="2.5"/>
          {/* Cap brim */}
          <path d="M70,62 Q100,58 130,62 Q128,68 100,66 Q72,68 70,62Z" fill="#1a3388" strokeWidth="1.5"/>
          {/* Cap badge */}
          <circle cx="100" cy="54" r="5" fill="#f0cc44" strokeWidth="1.5"/>

          {/* Head (tilted forward — running lean) */}
          <ellipse cx="105" cy="80" rx="26" ry="24" fill="#f0ddb5" transform="rotate(-15 105 80)"/>

          {/* Eyes (focused/determined) */}
          <path d="M95,74 Q98,70 101,74" strokeWidth="2" transform="rotate(-15 98 72)"/>
          <circle cx="98" cy="76" r="2.5" fill="#1a1a2a" stroke="none"/>
          <path d="M110,70 Q113,66 116,70" strokeWidth="2" transform="rotate(-15 113 68)"/>
          <circle cx="113" cy="72" r="2.5" fill="#1a1a2a" stroke="none"/>

          {/* Determined mouth */}
          <path d="M99,88 Q106,86 112,88" strokeWidth="2" transform="rotate(-8 105 87)"/>

          {/* Motion hair wisps */}
          <path d="M82,62 C76,50 80,40 88,46" strokeWidth="2"/>
          <path d="M90,58 C86,44 94,36 100,48" strokeWidth="2"/>

          {/* Body (strongly leaned forward at ~25°) */}
          {/* Neck */}
          <path d="M98,96 C96,104 94,110 92,118" transform="rotate(-15 96 107)"/>

          {/* Torso (leaning) */}
          <path d="M80,118 C68,130 62,155 60,185" strokeWidth="2.5"/>
          <path d="M120,110 C132,120 138,148 140,185" strokeWidth="2.5"/>
          <line x1="60" y1="185" x2="140" y2="185"/>
          {/* Jacket */}
          <path d="M80,118 Q100,112 120,110" strokeWidth="2.5"/>

          {/* ENVELOPE (extended right arm — outstretched forward-right) */}
          {/* Right arm extended */}
          <path d="M120,114 C130,108 148,106 162,110"/>
          {/* Envelope body */}
          <rect x="152" y="96" width="42" height="30" rx="3" fill="white" strokeWidth="2"/>
          {/* Envelope flap */}
          <path d="M152,96 L173,112 L194,96" strokeWidth="2"/>
          {/* Envelope lines */}
          <line x1="158" y1="108" x2="188" y2="108" strokeWidth="1.2" opacity="0.5"/>
          <line x1="158" y1="114" x2="188" y2="114" strokeWidth="1.2" opacity="0.5"/>
          {/* Speed mark on envelope */}
          <path d="M162,100 L170,100" strokeWidth="1.5" stroke="#aaa"/>

          {/* Left arm pumping back */}
          <path d="M80,122 C66,116 52,118 42,126"/>

          {/* Satchel bag strap across body */}
          <path d="M118,112 C112,130 108,150 110,170" strokeWidth="2" strokeDasharray="none"/>
          <rect x="100" y="155" width="26" height="20" rx="3" fill="#8b6232" strokeWidth="2"/>
          {/* Bag clasp */}
          <path d="M108,155 L118,155" strokeWidth="2"/>

          {/* Legs (running stride) */}
          {/* Front leg */}
          <path d="M96,185 C92,195 90,205 84,215"/>
          {/* Back leg */}
          <path d="M104,185 C110,196 116,205 124,212"/>

          {/* Shoes (with speed motion lines) */}
          <path d="M74,215 Q60,218 55,225 Q62,230 76,227 Q86,221 84,215Z" fill="#2244aa" strokeWidth="2"/>
          <path d="M124,212 Q138,215 144,222 Q138,228 124,226 Q115,220 119,213Z" fill="#2244aa" strokeWidth="2"/>
          {/* Shoe motion lines */}
          <path d="M55,222 L45,222" stroke="#aaa" strokeWidth="1.5"/>
          <path d="M54,225 L42,226" stroke="#bbb" strokeWidth="1.2"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">📨</span><span className="name">Le Messager</span></div>
        <p className="flavor">Plus rapide que la rumeur. Il traverse les zones de combat sans même être vu.</p>
        <div className="stats"><span className="stat">+1 Déplacement</span></div>
      </div>
    </div>

    {/* ============================
         LE CRAVATE
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Perfectly slicked hair (neat side part) */}
          <path d="M75,56 C74,44 80,36 90,40 C85,36 86,28 95,32" strokeWidth="2"/>
          <path d="M95,44 Q100,36 108,40 Q116,44 118,56" strokeWidth="2"/>
          <path d="M75,56 Q78,48 84,46 Q90,44 96,48" strokeWidth="1.5" stroke="#555"/>
          {/* Pomade shine */}
          <path d="M92,40 Q96,37 100,40" strokeWidth="1.5" opacity="0.5"/>

          {/* Head (upright, confident) */}
          <ellipse cx="100" cy="70" rx="27" ry="26" fill="#f0ddb5"/>

          {/* Stern authoritative eyes (slightly narrowed) */}
          <path d="M86,64 Q90,60 94,64" strokeWidth="2.2"/>
          <path d="M86,66 Q90,69 94,66" strokeWidth="1.2"/>
          <circle cx="90" cy="65" r="2.5" fill="#1a1a2a" stroke="none"/>
          <path d="M106,64 Q110,60 114,64" strokeWidth="2.2"/>
          <path d="M106,66 Q110,69 114,66" strokeWidth="1.2"/>
          <circle cx="110" cy="65" r="2.5" fill="#1a1a2a" stroke="none"/>

          {/* Strong brow line */}
          <path d="M84,59 Q90,56 95,58" strokeWidth="2.2"/>
          <path d="M105,58 Q110,56 116,59" strokeWidth="2.2"/>

          {/* Firm confident mouth */}
          <path d="M92,82 L108,82" strokeWidth="2"/>
          {/* Slight jaw definition */}
          <path d="M80,78 Q82,88 90,92" strokeWidth="1.5"/>
          <path d="M120,78 Q118,88 110,92" strokeWidth="1.5"/>

          {/* Neck + shirt collar (stiff) */}
          <line x1="93" y1="96" x2="93" y2="104"/>
          <line x1="107" y1="96" x2="107" y2="104"/>
          {/* Collar points */}
          <path d="M93,104 L85,116 L100,110 L115,116 L107,104" fill="white" strokeWidth="2"/>

          {/* THE TIE (dominant, prominent, wide) */}
          <path d="M97,112 L93,124 L88,190 L100,196 L112,190 L107,124 L103,112Z"
                fill="#1a1a5a" stroke="#1a1a2a" strokeWidth="2"/>
          {/* Tie knot at top */}
          <path d="M97,112 Q100,108 103,112 Q104,116 100,118 Q96,116 97,112Z" fill="#2222aa" strokeWidth="1.5"/>
          {/* Tie stripe */}
          <line x1="95" y1="148" x2="105" y2="148" stroke="#3333cc" strokeWidth="1.5" opacity="0.6"/>
          <line x1="94" y1="162" x2="106" y2="162" stroke="#3333cc" strokeWidth="1.5" opacity="0.6"/>
          {/* Tie texture diagonal lines */}
          <path d="M91,132 L98,128" stroke="#3344bb" strokeWidth="1" opacity="0.5"/>
          <path d="M91,140 L99,135" stroke="#3344bb" strokeWidth="1" opacity="0.5"/>

          {/* Suit jacket body */}
          <path d="M72,116 C56,126 52,158 54,210"/>
          <path d="M128,116 C144,126 148,158 146,210"/>
          <line x1="54" y1="210" x2="146" y2="210"/>
          {/* Jacket lapels (sharp, professional) */}
          <path d="M85,116 L78,134 L100,124 L122,134 L115,116" strokeWidth="2"/>
          {/* Pocket square (left breast) */}
          <path d="M58,136 L72,136 L72,148 L58,148Z" strokeWidth="1.5"/>
          <path d="M62,136 Q65,130 68,136" strokeWidth="1.5" fill="white"/>
          {/* Suit button */}
          <circle cx="100" cy="128" r="2.5" fill="none" strokeWidth="1.5"/>
          <circle cx="100" cy="140" r="2.5" fill="none" strokeWidth="1.5"/>

          {/* Left arm (fist, slightly raised — intimidating pose) */}
          <path d="M56,124 C42,134 36,158 38,178"/>
          {/* Clenched fist */}
          <path d="M36,176 Q30,180 34,188 Q40,192 44,186 Q46,178 38,176Z" fill="#f0ddb5" strokeWidth="2"/>
          <path d="M38,180 L44,180" strokeWidth="1.5"/>

          {/* Right arm holding briefcase */}
          <path d="M144,124 C158,134 162,158 162,185"/>
          {/* Briefcase */}
          <rect x="148" y="178" width="34" height="26" rx="4" fill="#8b6232" strokeWidth="2.5"/>
          <rect x="158" y="170" width="14" height="10" rx="3" strokeWidth="2" fill="none"/>
          <line x1="148" y1="191" x2="182" y2="191" strokeWidth="1.5"/>
          {/* Briefcase clasp */}
          <rect x="161" y="189" width="8" height="4" rx="1" fill="#c8962a" strokeWidth="1.5"/>
          {/* Briefcase handle */}
          <path d="M161" y1="170" x2="171" y2="170" strokeWidth="2.5" fill="none"/>

          {/* Polished shoes */}
          <path d="M64,210 Q50,214 46,222 Q54,228 68,225 Q78,218 74,210Z" fill="#1a1a1a" strokeWidth="2"/>
          <path d="M136,210 Q150,214 154,222 Q146,228 132,225 Q122,218 126,210Z" fill="#1a1a1a" strokeWidth="2"/>
          {/* Shoe shine */}
          <path d="M52,216 Q56,214 60,216" stroke="white" strokeWidth="1.2" opacity="0.5"/>
          <path d="M140,216 Q144,214 148,216" stroke="white" strokeWidth="1.2" opacity="0.5"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">👔</span><span className="name">Le Cravaté</span></div>
        <p className="flavor">L'autorité incarnée. Sa seule présence intimide — et son poing confirme.</p>
        <div className="stats"><span className="stat">+2 Richesse</span></div>
      </div>
    </div>

    {/* ============================
         LE WIKI
         ============================ */}
    <div className="class-card">
      <div className="illus">
        <svg viewBox="0 0 200 220"
             stroke="#1a1a2a" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <rect width="200" height="220" fill="#f4efe6"/>

          {/* Neat tidy hair (slightly high, bookish) */}
          <path d="M74,60 C72,44 80,30 92,38 Q98,42 100,50"/>
          <path d="M100,50 Q102,42 108,38 C120,30 128,44 126,60"/>
          {/* Hair part line */}
          <path d="M100,50 L100,62" strokeWidth="1.5" stroke="#5a3a10"/>
          {/* Side bits */}
          <path d="M74,62 C70,56 68,50 72,46" strokeWidth="2"/>
          <path d="M126,62 C130,56 132,50 128,46" strokeWidth="2"/>

          {/* Head */}
          <ellipse cx="100" cy="78" rx="30" ry="28" fill="#f0ddb5"/>

          {/* GIANT ROUND GLASSES (the dominant feature) */}
          {/* Left lens (very large) */}
          <circle cx="85" cy="76" r="16" fill="#ddeeff" strokeWidth="3" opacity="0.88"/>
          {/* Right lens */}
          <circle cx="115" cy="76" r="16" fill="#ddeeff" strokeWidth="3" opacity="0.88"/>
          {/* Nose bridge */}
          <path d="M101,76 L99,76" strokeWidth="4"/>
          {/* Temple arms going to ears */}
          <path d="M131,76 C138,76 146,72 148,66" strokeWidth="2.5"/>
          <path d="M69,76 C62,76 54,72 52,66" strokeWidth="2.5"/>
          {/* Lens inner rings (thick frame detail) */}
          <circle cx="85" cy="76" r="12" strokeWidth="1.2" opacity="0.5"/>
          <circle cx="115" cy="76" r="12" strokeWidth="1.2" opacity="0.5"/>

          {/* Eyes behind glasses (big and bright) */}
          <circle cx="85" cy="77" r="5.5" fill="#1a1a2a" opacity="0.8"/>
          <circle cx="115" cy="77" r="5.5" fill="#1a1a2a" opacity="0.8"/>
          {/* Eye gleam / curious sparkle */}
          <circle cx="83" cy="75" r="2" fill="white" stroke="none" opacity="0.7"/>
          <circle cx="113" cy="75" r="2" fill="white" stroke="none" opacity="0.7"/>
          {/* Extra inner gleam */}
          <circle cx="87" cy="79" r="1" fill="white" stroke="none" opacity="0.4"/>
          <circle cx="117" cy="79" r="1" fill="white" stroke="none" opacity="0.4"/>

          {/* Slight smile (knowing, smug) */}
          <path d="M92,96 Q100,100 108,96" strokeWidth="2"/>

          {/* Neck */}
          <line x1="93" y1="106" x2="93" y2="112"/>
          <line x1="107" y1="106" x2="107" y2="112"/>

          {/* Sweater/academic vest body */}
          <path d="M70,112 C54,122 50,150 52,210"/>
          <path d="M130,112 C146,122 150,150 148,210"/>
          <line x1="52" y1="210" x2="148" y2="210"/>
          {/* V-neck collar */}
          <path d="M86,112 L100,134 L114,112" strokeWidth="2"/>
          {/* Sweater texture (horizontal ribbing) */}
          <path d="M56,140 Q100,136 144,140" strokeWidth="1.2" opacity="0.4"/>
          <path d="M55,150 Q100,146 145,150" strokeWidth="1.2" opacity="0.4"/>
          <path d="M54,160 Q100,156 146,160" strokeWidth="1.2" opacity="0.4"/>

          {/* OPEN BOOK (held out, dominant lower element) */}
          {/* Left page */}
          <path d="M34,152 C34,142 42,136 58,138 L90,140 L90,192 L58,192 C42,190 34,184 34,174Z"
                fill="white" strokeWidth="2.5"/>
          {/* Right page */}
          <path d="M166,152 C166,142 158,136 142,138 L110,140 L110,192 L142,192 C158,190 166,184 166,174Z"
                fill="white" strokeWidth="2.5"/>
          {/* Spine */}
          <path d="M90,140 Q100,136 110,140 L110,192 Q100,196 90,192Z" fill="#c8a060" strokeWidth="2"/>
          {/* Left page text lines */}
          <line x1="46" y1="150" x2="80" y2="150" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="44" y1="157" x2="82" y2="157" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="44" y1="164" x2="82" y2="164" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="44" y1="171" x2="82" y2="171" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="44" y1="178" x2="78" y2="178" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="44" y1="185" x2="74" y2="185" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          {/* Right page text lines */}
          <line x1="120" y1="150" x2="154" y2="150" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="118" y1="157" x2="156" y2="157" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="118" y1="164" x2="156" y2="164" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="118" y1="171" x2="156" y2="171" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="118" y1="178" x2="152" y2="178" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          <line x1="120" y1="185" x2="148" y2="185" strokeWidth="1.2" stroke="#888" opacity="0.6"/>
          {/* Small diagram on right page */}
          <circle cx="144" cy="163" r="6" strokeWidth="1.2" stroke="#888" opacity="0.5" fill="none"/>
          <line x1="138" y1="163" x2="150" y2="163" strokeWidth="1" stroke="#888" opacity="0.5"/>
          <line x1="144" y1="157" x2="144" y2="169" strokeWidth="1" stroke="#888" opacity="0.5"/>

          {/* Arms holding book open */}
          {/* Left arm */}
          <path d="M52,118 C40,128 34,142 34,158"/>
          {/* Right arm */}
          <path d="M148,118 C160,128 166,142 166,158"/>

          {/* Index finger raised (lecturing pose) — upper right */}
          <path d="M148,120 C158,110 170,106 172,96"/>
          <path d="M172,96 C174,88 170,82 166,86" strokeWidth="2"/>
          {/* Small "!" or annotation above finger */}
          <text x="174" y="82" fontSize="18" fill="#f0cc44" stroke="none" fontFamily="serif">!</text>

          {/* Neat shoes */}
          <path d="M62,210 Q50,214 46,222 Q54,228 68,225 Q78,218 74,210Z" fill="#4a3a2a" strokeWidth="2"/>
          <path d="M138,210 Q150,214 154,222 Q146,228 132,225 Q122,218 126,210Z" fill="#4a3a2a" strokeWidth="2"/>
        </svg>
      </div>
      <div className="body">
        <div className="top"><span className="emoji">📚</span><span className="name">L'Ancien</span></div>
        <p className="flavor">Il sait tout sur tout. La connaissance est son arme la plus tranchante.</p>
        <div className="stats"><span className="stat">+1 Destin</span></div>
      </div>
    </div>
    </div>
  );
}
