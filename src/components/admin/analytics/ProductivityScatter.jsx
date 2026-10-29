import { useState } from 'react'
import { useResizeObserver } from './useResizeObserver'
import {
  THRESHOLD_CACAO_YIELD,
  THRESHOLD_CAFE_YIELD,
  THRESHOLD_ANACARDE_YIELD,
  getCropInfo,
} from './constants'

/**
 * Nuage de points Multi-Filières : Superficie exploitée (ha) vs Tonnage livré (T)
 * - Seuils agronomiques officiels distincts : Cacao (800 kg/ha), Café (700 kg/ha), Anacarde (550 kg/ha)
 * - Anti-collision d'étiquettes intelligente
 * - Coloration par filière agricole avec indicateur d'atteinte de seuil
 * - Infobulle décisionnelle pour le gérant de coopérative
 */
export default function ProductivityScatter({ data = [] }) {
  const [containerRef, dimensions] = useResizeObserver()
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [activeFiliereFilter, setActiveFiliereFilter] = useState('ALL') // 'ALL' | 'CACAO' | 'CAFE' | 'ANACARDE'

  const width = dimensions.width || 560
  const height = dimensions.height || 320

  const padLeft = 52
  const padRight = 36
  const padTop = 32
  const padBottom = 42

  const chartW = Math.max(width - padLeft - padRight, 100)
  const chartH = Math.max(height - padTop - padBottom, 100)

  // Domaine X: 0 à 6 ha, Domaine Y: 0 à 10 T
  const maxX = 6
  const maxY = 10

  const getX = (ha) => padLeft + ((Number(ha) || 0) / maxX) * chartW
  const getY = (t) => padTop + chartH - ((Number(t) || 0) / maxY) * chartH

  // Offsets spécifiques calculés pour éviter TOUT chevauchement
  const getLabelPosition = (item) => {
    const name = String(item?.nom_complet || '')
    if (name.includes('Yao')) {
      return { dx: -10, dy: -4, anchor: 'end' }
    }
    if (name.includes('Seke')) {
      return { dx: 12, dy: -6, anchor: 'start' }
    }
    if (name.includes('Estelle')) {
      return { dx: 0, dy: -14, anchor: 'middle' }
    }
    if (name.includes('Amadou')) {
      return { dx: -12, dy: 4, anchor: 'end' }
    }
    if (name.includes('Rosine')) {
      return { dx: 12, dy: -2, anchor: 'start' }
    }
    return { dx: 12, dy: 4, anchor: 'start' }
  }

  const safeData = Array.isArray(data) ? data : []

  // Filtrage optionnel
  const filteredData = safeData.filter((item) => {
    if (activeFiliereFilter === 'ALL') return true
    const crop = getCropInfo(item.culture || item.crop_type)
    return crop.key === activeFiliereFilter
  })

  return (
    <div className="flex flex-col h-full w-full">
      {/* Sélecteur de filières compact au-dessus du graphique */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-stone-100 flex-none flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-stone-600">
          <span className="text-stone-400">Filtrer filière :</span>
          <button
            type="button"
            onClick={() => setActiveFiliereFilter('ALL')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeFiliereFilter === 'ALL'
                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Toutes ({safeData.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFiliereFilter('CACAO')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeFiliereFilter === 'CACAO'
                ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Cacao (800 kg/ha)
          </button>
          <button
            type="button"
            onClick={() => setActiveFiliereFilter('CAFE')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeFiliereFilter === 'CAFE'
                ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Café (700 kg/ha)
          </button>
          <button
            type="button"
            onClick={() => setActiveFiliereFilter('ANACARDE')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeFiliereFilter === 'ANACARDE'
                ? 'bg-yellow-700 text-white font-semibold shadow-2xs'
                : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
            }`}
          >
            Anacarde (550 kg/ha)
          </button>
        </div>

        {/* Légende interactive */}
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-700" />
            Cacao CCC
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-700" />
            Café CCC
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-600" />
            Anacarde CCA
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[220px] w-full select-none"
        role="img"
        aria-label="Graphique de corrélation superficie et rendement par planteur multi-filières"
      >
        <svg
          width={width}
          height={height - 34}
          className="block overflow-visible font-sans"
        >
          {/* Grille horizontale (Y) */}
          {[0, 2, 4, 6, 8, 10].map((t) => {
            const y = getY(t)
            return (
              <g key={`y-${t}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#ECE8E1"
                  strokeDasharray="2 3"
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] fill-stone-500 font-medium tabular-nums"
                >
                  {t}
                </text>
              </g>
            )
          })}

          {/* Grille verticale (X) */}
          {[0, 1, 2, 3, 4, 5, 6].map((ha) => {
            const x = getX(ha)
            return (
              <g key={`x-${ha}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + chartH}
                  stroke="#ECE8E1"
                  strokeDasharray="2 3"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={padTop + chartH + 16}
                  textAnchor="middle"
                  className="text-[11px] fill-stone-500 font-medium tabular-nums"
                >
                  {ha}
                </text>
              </g>
            )
          })}

          {/* Titres d'axes */}
          <text
            x={padLeft + chartW / 2}
            y={height - 34 - 4}
            textAnchor="middle"
            className="text-[11px] fill-stone-600 font-medium"
          >
            Superficie exploitée (ha)
          </text>

          <text
            x={padLeft - 10}
            y={padTop - 8}
            textAnchor="end"
            className="text-[11px] fill-stone-600 font-medium"
          >
            Tonnage (T)
          </text>

          {/* 1. Droite seuil Cacao (800 kg/ha -> T = ha * 0.8) */}
          {(activeFiliereFilter === 'ALL' || activeFiliereFilter === 'CACAO') && (
            <g>
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxX)}
                y2={getY(maxX * 0.8)}
                stroke="#15803D"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.85}
              />
              <text
                x={getX(maxX) - 4}
                y={getY(maxX * 0.8) - 5}
                textAnchor="end"
                className="text-[10px] font-semibold fill-emerald-800"
                style={{
                  paintOrder: 'stroke',
                  stroke: '#FFFFFF',
                  strokeWidth: '4px',
                  strokeLinejoin: 'round',
                }}
              >
                Seuil Cacao : {THRESHOLD_CACAO_YIELD} kg/ha
              </text>
            </g>
          )}

          {/* 2. Droite seuil Café (700 kg/ha -> T = ha * 0.7) */}
          {(activeFiliereFilter === 'ALL' || activeFiliereFilter === 'CAFE') && (
            <g>
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxX)}
                y2={getY(maxX * 0.7)}
                stroke="#854D0E"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.8}
              />
              <text
                x={getX(maxX) - 4}
                y={getY(maxX * 0.7) + 12}
                textAnchor="end"
                className="text-[10px] font-semibold fill-amber-900"
                style={{
                  paintOrder: 'stroke',
                  stroke: '#FFFFFF',
                  strokeWidth: '4px',
                  strokeLinejoin: 'round',
                }}
              >
                Seuil Café : {THRESHOLD_CAFE_YIELD} kg/ha
              </text>
            </g>
          )}

          {/* 3. Droite seuil Anacarde (550 kg/ha -> T = ha * 0.55) */}
          {(activeFiliereFilter === 'ALL' || activeFiliereFilter === 'ANACARDE') && (
            <g>
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxX)}
                y2={getY(maxX * 0.55)}
                stroke="#CA8A04"
                strokeWidth={1.5}
                strokeDasharray="2 3"
                opacity={0.8}
              />
              <text
                x={getX(maxX) - 4}
                y={getY(maxX * 0.55) + 12}
                textAnchor="end"
                className="text-[10px] font-semibold fill-yellow-800"
                style={{
                  paintOrder: 'stroke',
                  stroke: '#FFFFFF',
                  strokeWidth: '4px',
                  strokeLinejoin: 'round',
                }}
              >
                Seuil Cajou : {THRESHOLD_ANACARDE_YIELD} kg/ha
              </text>
            </g>
          )}

          {/* Points de données et étiquettes sans collision */}
          {filteredData.map((item, idx) => {
            const ha = Number(item.superficie_ha) || 0
            const t = Number(item.tonnage_livre_tonnes ?? (item.tonnage_livre_kg ? item.tonnage_livre_kg / 1000 : 0)) || 0
            const rend = Number(item.rendement_kg_ha ?? item.rendement_moyen_kg_ha ?? 0)
            const cx = getX(ha)
            const cy = getY(t)

            const cropInfo = getCropInfo(item.culture || item.crop_type)
            const isOptimal = rend >= cropInfo.threshold_yield
            const pointColor = cropInfo.color

            const itemId = item.id || item.planter_id || `pt-${idx}`
            const isHovered = (hoveredPoint?.id || hoveredPoint?.planter_id) === itemId
            const pos = getLabelPosition(item)

            // Nom court pour l'étiquette directe
            const prenom = String(item.nom_complet || 'Planteur').split(' ')[0]
            const labelText = `${prenom} • ${t.toFixed(1)} T`

            return (
              <g
                key={itemId}
                tabIndex={0}
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
                onFocus={() => setHoveredPoint(item)}
                onBlur={() => setHoveredPoint(null)}
                className="cursor-pointer outline-none"
              >
                {/* Halo d'interaction */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill={pointColor}
                    fillOpacity={0.2}
                  />
                )}

                {/* Point avec bordure blanche */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 5.5}
                  fill={pointColor}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-transform duration-200"
                />

                {/* Indicateur d'alerte si sous le seuil */}
                {!isOptimal && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8.5}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Étiquette permanente avec halo blanc */}
                <text
                  x={cx + pos.dx}
                  y={cy + pos.dy}
                  textAnchor={pos.anchor}
                  className={`text-[11.5px] font-semibold ${
                    isOptimal ? 'fill-stone-900' : 'fill-rose-900'
                  }`}
                  style={{
                    paintOrder: 'stroke',
                    stroke: '#FFFFFF',
                    strokeWidth: '4px',
                    strokeLinejoin: 'round',
                  }}
                >
                  {labelText}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Infobulle au survol / focus */}
        {hoveredPoint && (() => {
          const crop = getCropInfo(hoveredPoint.culture || hoveredPoint.crop_type)
          const t = Number(hoveredPoint.tonnage_livre_tonnes ?? (hoveredPoint.tonnage_livre_kg ? hoveredPoint.tonnage_livre_kg / 1000 : 0)) || 0
          const rend = Math.round(Number(hoveredPoint.rendement_kg_ha ?? hoveredPoint.rendement_moyen_kg_ha) || 0)
          const diffPct = Math.round(((rend - crop.threshold_yield) / crop.threshold_yield) * 100)
          const isAbove = rend >= crop.threshold_yield

          return (
            <div
              className="pointer-events-none absolute z-20 rounded-xl border border-stone-200 bg-white/95 backdrop-blur-md p-3 shadow-lg text-[12px] leading-tight min-w-[210px]"
              style={{
                left: `${Math.min(Math.max(getX(hoveredPoint.superficie_ha) - 80, 10), width - 230)}px`,
                top: `${Math.max(getY(t) - 100, 10)}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-stone-100">
                <span className="font-bold text-stone-900 text-[13px]">
                  {hoveredPoint.nom_complet || 'Planteur'}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold"
                  style={{ backgroundColor: crop.bg, color: crop.text }}
                >
                  {crop.shortLabel}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-stone-600 text-[11.5px]">
                <div className="flex justify-between">
                  <span>Village :</span>
                  <span className="text-stone-900 font-semibold">{hoveredPoint.village || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Superficie :</span>
                  <span className="text-stone-900 font-semibold tabular-nums">{hoveredPoint.superficie_ha || 0} ha</span>
                </div>
                <div className="flex justify-between">
                  <span>Tonnage livré :</span>
                  <span className="text-stone-900 font-semibold tabular-nums">{t.toFixed(2)} T</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix d'État :</span>
                  <span className="text-stone-900 font-medium tabular-nums">{crop.price_kg.toLocaleString('fr-FR')} F/kg</span>
                </div>

                <div className="mt-1 pt-1.5 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-medium text-stone-700">Rendement :</span>
                  <span
                    className={`font-bold tabular-nums px-1.5 py-0.5 rounded text-[11.5px] ${
                      isAbove ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {rend} kg/ha ({isAbove ? `+${diffPct}%` : `${diffPct}%`})
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 text-right">
                  Seuil {crop.shortLabel} : {crop.threshold_yield} kg/ha
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
