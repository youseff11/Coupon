// Inline SVG so it picks up the page font (Cairo) and stays sharp at any size.
const SPARKLE = 'M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z'

export default function HeroArt() {
  return (
    <svg className="hero-art-svg" viewBox="0 0 520 440" role="img" aria-label="كوبونات وأكواد خصم">
      <defs>
        <mask id="ha-ticket-1">
          <rect width="170" height="84" rx="12" fill="#fff" />
          <circle cx="52" cy="0" r="9" fill="#000" />
          <circle cx="52" cy="84" r="9" fill="#000" />
        </mask>
        <mask id="ha-ticket-2">
          <rect width="150" height="70" rx="12" fill="#fff" />
          <circle cx="105" cy="0" r="8" fill="#000" />
          <circle cx="105" cy="70" r="8" fill="#000" />
        </mask>
        <linearGradient id="ha-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Backdrop */}
      <circle cx="260" cy="215" r="195" fill="#fff" opacity=".07" />
      <circle cx="260" cy="215" r="150" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="4 8" />
      <ellipse cx="260" cy="398" rx="110" ry="12" fill="#1e1236" opacity=".35" />

      {/* Phone showing a coupon */}
      <g className="ha-float ha-float-slow">
        <rect x="175" y="50" width="170" height="335" rx="30" fill="#1e1236" />
        <rect x="185" y="60" width="150" height="315" rx="22" fill="#fff" />
        <rect x="235" y="67" width="50" height="8" rx="4" fill="#1e1236" />

        <circle cx="312" cy="102" r="13" fill="#f97316" />
        <text x="312" y="107" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">%</text>
        <rect x="232" y="94" width="64" height="7" rx="3.5" fill="#e5e7ef" />
        <rect x="254" y="106" width="42" height="6" rx="3" fill="#eef0f5" />
        <line x1="198" y1="126" x2="322" y2="126" stroke="#f1f3f8" strokeWidth="2" />

        <text x="260" y="174" textAnchor="middle" fontSize="44" fontWeight="800" fill="#6d28d9">50%</text>
        <text x="260" y="198" textAnchor="middle" fontSize="13" fontWeight="600" fill="#6b7280">خصم على طلبك</text>

        <rect x="200" y="214" width="120" height="40" rx="10" fill="#fff7ed" stroke="#f97316" strokeWidth="2" strokeDasharray="5 4" />
        <text x="260" y="240" textAnchor="middle" fontSize="16" fontWeight="800" fill="#ea580c" letterSpacing="2" direction="ltr">SAVE50</text>

        <rect x="200" y="264" width="120" height="36" rx="10" fill="#f97316" />
        <text x="260" y="287" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">انسخ الكود</text>

        <rect x="200" y="314" width="120" height="38" rx="10" fill="#f5f3ff" />
        <circle cx="304" cy="333" r="10" fill="#c4b5fd" />
        <rect x="222" y="325" width="68" height="6" rx="3" fill="#ddd6fe" />
        <rect x="240" y="336" width="50" height="5" rx="2.5" fill="#ede9fe" />
      </g>

      {/* Shopping bag */}
      <g className="ha-float ha-float-b">
        <g transform="translate(50 250)">
          <path d="M28 34 V20 a27 27 0 0 1 54 0 V34" fill="none" stroke="#ede9fe" strokeWidth="7" strokeLinecap="round" />
          <path d="M0 32 H110 L102 142 H8 Z" fill="url(#ha-bag)" />
          <path d="M0 32 H110 L109 46 H1 Z" fill="#fff" opacity=".18" />
          <circle cx="55" cy="90" r="25" fill="#fff" />
          <text x="55" y="100" textAnchor="middle" fontSize="26" fontWeight="800" fill="#6d28d9">%</text>
        </g>
      </g>

      {/* White coupon ticket */}
      <g className="ha-float ha-float-a">
        <g transform="translate(22 92) rotate(-14)">
          <g mask="url(#ha-ticket-1)">
            <rect width="170" height="84" fill="#fff" />
            <rect width="52" height="84" fill="#f97316" />
          </g>
          <line x1="52" y1="14" x2="52" y2="70" stroke="#fdba74" strokeWidth="2" strokeDasharray="4 4" />
          <text x="26" y="53" textAnchor="middle" fontSize="28" fontWeight="800" fill="#fff">%</text>
          <text x="111" y="44" textAnchor="middle" fontSize="27" fontWeight="800" fill="#6d28d9" direction="ltr">-30%</text>
          <text x="111" y="66" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6b7280">كوبون خصم</text>
        </g>
      </g>

      {/* Orange coupon ticket */}
      <g className="ha-float ha-float-c">
        <g transform="translate(352 282) rotate(10)">
          <g mask="url(#ha-ticket-2)">
            <rect width="150" height="70" fill="#f97316" />
            <rect x="105" width="45" height="70" fill="#ea580c" />
          </g>
          <line x1="105" y1="12" x2="105" y2="58" stroke="#fed7aa" strokeWidth="2" strokeDasharray="4 4" />
          <text x="53" y="37" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" direction="ltr">-20%</text>
          <text x="53" y="56" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffedd5">كود حصري</text>
          <path d="M120 35 l6 6 l11 -12" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Percent badge */}
      <g className="ha-float ha-float-b">
        <g transform="translate(418 92)">
          <circle r="38" fill="#fdba74" />
          <circle r="30" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="3 4" />
          <text y="13" textAnchor="middle" fontSize="36" fontWeight="800" fill="#7c2d12">%</text>
        </g>
      </g>

      {/* Gift box */}
      <g className="ha-float ha-float-a">
        <g transform="translate(392 170)">
          <rect y="18" width="60" height="46" rx="6" fill="#fff" />
          <rect x="-4" y="8" width="68" height="14" rx="4" fill="#ede9fe" />
          <rect x="26" y="8" width="8" height="56" fill="#f97316" />
          <ellipse cx="22" cy="3" rx="9" ry="6" fill="none" stroke="#f97316" strokeWidth="4" />
          <ellipse cx="38" cy="3" rx="9" ry="6" fill="none" stroke="#f97316" strokeWidth="4" />
        </g>
      </g>

      {/* Sparkles */}
      <g fill="#fff">
        <path className="ha-twinkle" d={SPARKLE} transform="translate(128 52)" />
        <path className="ha-twinkle ha-d1" d={SPARKLE} transform="translate(476 236) scale(.8)" />
        <path className="ha-twinkle ha-d2" d={SPARKLE} transform="translate(160 410) scale(.6)" fill="#fdba74" />
        <path className="ha-twinkle ha-d1" d={SPARKLE} transform="translate(486 30) scale(.55)" fill="#fdba74" />
        <path className="ha-twinkle ha-d2" d={SPARKLE} transform="translate(30 220) scale(.7)" />
        <circle cx="365" cy="40" r="3" opacity=".6" />
        <circle cx="40" cy="380" r="4" opacity=".4" />
        <circle cx="500" cy="400" r="3" opacity=".5" />
      </g>
    </svg>
  )
}
