import { Link2 } from 'lucide-react'

export default function ParcelMapSvg({ planter }) {
  if (!planter) return null

  const parcelles = planter.parcelles || []
  const count = parcelles.length

  return (
    <div
      className="relative flex h-[190px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B1B13]"
      role="region"
      aria-label={`Cadastre parcellaire de ${planter.nom}`}
    >
      {/* Canevas SVG Cadastre */}
      <div className="relative flex-1 w-full overflow-hidden">
        <svg
          viewBox="0 0 360 158"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full select-none"
        >
          {/* Grille cartographique subtile d'arrière-plan */}
          <defs>
            <pattern id="cadastre-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="360" height="158" fill="url(#cadastre-grid)" />

          {/* CAS 1 : UNE SEULE GRANDE PARCELLE (Amadou, Koffi, Seke, Yao, Rosine) */}
          {count <= 1 && (
            <g className="cursor-pointer transition-opacity hover:opacity-95">
              <polygon
                points="50,28 310,22 295,134 65,142"
                fill={parcelles[0]?.color || '#0F3D2E'}
                fillOpacity="0.85"
                stroke={parcelles[0]?.borderColor || '#2DD4BF'}
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />
              <circle cx="180" cy="80" r="4" fill="#22C55E" />
              <text
                x="180"
                y="64"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="700"
                letterSpacing="0.02em"
              >
                {parcelles[0]?.label || parcelles[0]?.name || `${planter.nom} • ${planter.superficie} ha`}
              </text>
              <text
                x="180"
                y="102"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontWeight="500"
              >
                Cadastre certifié • {planter.village}
              </text>
            </g>
          )}

          {/* CAS 2 : DEUX PARCELLES (Estelle Kouame) */}
          {count === 2 && (
            <>
              {/* P1 */}
              <g className="cursor-pointer transition-opacity hover:opacity-95">
                <polygon
                  points="25,32 165,22 175,132 40,140"
                  fill={parcelles[0]?.color || '#0F3D2E'}
                  fillOpacity="0.85"
                  stroke={parcelles[0]?.borderColor || '#2DD4BF'}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="100" cy="80" r="3.5" fill="#22C55E" />
                <text
                  x="100"
                  y="65"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="600"
                >
                  {parcelles[0]?.label || 'P1 • 1,50 ha'}
                </text>
              </g>

              {/* P2 */}
              <g className="cursor-pointer transition-opacity hover:opacity-95">
                <polygon
                  points="195,26 335,36 320,138 205,130"
                  fill={parcelles[1]?.color || '#7F1D1D'}
                  fillOpacity="0.85"
                  stroke={parcelles[1]?.borderColor || '#EF4444'}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="265" cy="82" r="3.5" fill="#EF4444" />
                <text
                  x="265"
                  y="67"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="600"
                >
                  {parcelles[1]?.label || 'P2 • 2,50 ha'}
                </text>
                <text
                  x="265"
                  y="98"
                  textAnchor="middle"
                  fill="#FCA5A5"
                  fontSize="9"
                  fontWeight="500"
                >
                  Alerte phytosanitaire
                </text>
              </g>
            </>
          )}

          {/* CAS 3 : TROIS PARCELLES OU PLUS */}
          {count >= 3 && (
            <>
              <g className="cursor-pointer transition-opacity hover:opacity-90">
                <polygon
                  points="20,38 116,24 124,122 36,136"
                  fill="#0F3D2E"
                  fillOpacity="0.9"
                  stroke="#2DD4BF"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="74" cy="80" r="3" fill="#22C55E" />
                <text x="74" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="500">
                  {parcelles[0]?.label || 'P1'}
                </text>
              </g>
              <g className="cursor-pointer transition-opacity hover:opacity-90">
                <polygon
                  points="142,28 234,38 218,136 148,126"
                  fill="#0F3D2E"
                  fillOpacity="0.9"
                  stroke="#2DD4BF"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="186" cy="82" r="3" fill="#22C55E" />
                <text x="186" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="500">
                  {parcelles[1]?.label || 'P2'}
                </text>
              </g>
              <g className="cursor-pointer transition-opacity hover:opacity-90">
                <polygon
                  points="250,56 338,44 346,140 260,150"
                  fill="#854D0E"
                  fillOpacity="0.8"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx="298" cy="97" r="3" fill="#FBBF24" />
                <text x="298" y="83" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="500">
                  {parcelles[2]?.label || 'P3'}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Bandeau bas du visualiseur */}
      <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/5 bg-[#050E0A] px-3">
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-[#22C55E]" strokeWidth={2} aria-hidden="true" />
          <span className="font-mono text-[11px] font-medium text-[#4ADE80]">
            {planter.gps || 'Coordonnées GPS certifiées'}
          </span>
        </div>
        <span className="text-xs font-semibold text-white/90">{planter.village}</span>
      </div>
    </div>
  )
}
