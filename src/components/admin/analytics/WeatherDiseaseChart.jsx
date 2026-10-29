import { useState } from 'react'
import { useResizeObserver } from './useResizeObserver'
import { THRESHOLD_RAIN_SATURATION } from './constants'

/**
 * Graphique double-axe : Pluviométrie (barres bleu-gris) & Diagnostics (courbe rouge)
 * - Marge gauche calculée (56px) pour que « 200 mm » ne soit jamais coupé
 * - Barres > 100 mm en teinte plus foncée (#475569 vs #64748B)
 * - Courbe rouge 2px avec points à cœur blanc
 * - Valeurs nettes au-dessus des éléments sans unités redondantes
 * - ResizeObserver sans distorsion
 */
export default function WeatherDiseaseChart({ data }) {
  const [containerRef, dimensions] = useResizeObserver()
  const [hoveredItem, setHoveredItem] = useState(null)

  const width = dimensions.width || 600
  const height = dimensions.height || 280

  // Marges calibrées : 56px à gauche pour "200", 45px à droite pour "6 cas"
  const padLeft = 56
  const padRight = 45
  const padTop = 28
  const padBottom = 38

  const chartW = Math.max(width - padLeft - padRight, 100)
  const chartH = Math.max(height - padTop - padBottom, 100)

  // Échelles :
  // Pluviométrie (Gauche) : 0 à 200 mm
  const maxRain = 200
  const getRainY = (mm) => padTop + chartH - (mm / maxRain) * chartH

  // Diagnostics (Droite) : 0 à 8 cas
  const maxCases = 10
  const getCasesY = (c) => padTop + chartH - (c / maxCases) * chartH

  // Abscisses par mois
  const count = data?.length || 1
  const stepX = chartW / count
  const getX = (index) => padLeft + index * stepX + stepX / 2

  // Seuil 100 mm
  const thresholdY = getRainY(THRESHOLD_RAIN_SATURATION)

  // Points de la courbe
  const linePoints = (data || []).map((d, i) => `${getX(i)},${getCasesY(d.diagnostics_count || 0)}`).join(' ')

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none"
      role="img"
      aria-label="Évolution croisée de la pluviométrie mensuelle et des diagnostics phytosanitaires"
    >
      <svg
        width={width}
        height={height}
        className="block overflow-visible font-sans"
      >
        {/* Grille horizontale (basée sur les repères de pluie : 0, 50, 100, 150, 200 mm) */}
        {[0, 50, 100, 150, 200].map((mm) => {
          const y = getRainY(mm)
          return (
            <g key={`rain-y-${mm}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + chartW}
                y2={y}
                stroke="#ECE8E1"
                strokeDasharray="2 3"
                strokeWidth={1}
              />
              {/* Repère gauche (mm) */}
              <text
                x={padLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[11px] fill-slate-500 font-medium tabular-nums"
              >
                {mm}
              </text>
            </g>
          )
        })}

        {/* Repères droite (Diagnostics : 0, 2, 4, 6, 8) */}
        {[0, 2, 4, 6, 8, 10].map((c) => {
          const y = getCasesY(c)
          return (
            <text
              key={`case-y-${c}`}
              x={padLeft + chartW + 8}
              y={y + 3.5}
              textAnchor="start"
              className="text-[11px] fill-rose-600 font-medium tabular-nums"
            >
              {c}
            </text>
          )
        })}

        {/* Titres d'axes avec unités */}
        <text
          x={padLeft - 10}
          y={padTop - 12}
          textAnchor="end"
          className="text-[11px] fill-slate-600 font-medium"
        >
          Pluie (mm)
        </text>

        <text
          x={padLeft + chartW + 10}
          y={padTop - 12}
          textAnchor="start"
          className="text-[11px] fill-rose-700 font-medium"
        >
          Cas actifs
        </text>

        {/* Droite Seuil 100 mm */}
        <line
          x1={padLeft}
          y1={thresholdY}
          x2={padLeft + chartW}
          y2={thresholdY}
          stroke="#475569"
          strokeDasharray="3 3"
          strokeWidth={1.25}
        />
        {/* Libellé du seuil hors zone de courbe (placé à gauche juste au-dessus) */}
        <text
          x={padLeft + 6}
          y={thresholdY - 4}
          textAnchor="start"
          className="text-[10.5px] font-semibold fill-slate-600"
          style={{
            paintOrder: 'stroke',
            stroke: '#FFFFFF',
            strokeWidth: '3px',
          }}
        >
          Seuil saturation ({THRESHOLD_RAIN_SATURATION} mm)
        </text>

        {/* Barres de pluviométrie */}
        {data &&
          data.map((item, i) => {
            const xCenter = getX(i)
            const barWidth = Math.min(Math.max(stepX * 0.32, 26), 54)
            const barX = xCenter - barWidth / 2
            const mm = item.pluviometrie_mm ?? item.pluviometrie_moyenne_mm ?? 0
            const barY = getRainY(mm)
            const barH = padTop + chartH - barY
            const isHeavy = mm >= THRESHOLD_RAIN_SATURATION
            const barFill = isHeavy ? '#475569' : '#64748B'

            // Libellé court mois pour éviter tout chevauchement
                        const rawMois = (item.mois_nom || item.mois || '').split(' ')[0];
            let monthText = rawMois;
            if (rawMois.startsWith('Mai')) monthText = 'Mai';
            else if (rawMois.startsWith('Juin')) monthText = 'Juin';
            else if (rawMois.startsWith('Juil')) monthText = 'Juil.';
            else if (rawMois.startsWith('Ao')) monthText = 'Août';
            else if (rawMois.startsWith('Sept')) monthText = 'Sept.';
            else if (rawMois.startsWith('Oct')) monthText = 'Oct.';

            return (
              <g key={`bar-${item.mois}`}>
                {/* Barre */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barH, 0)}
                  rx={3}
                  fill={barFill}
                  className="transition-opacity hover:opacity-85 cursor-pointer"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                />

                {/* Valeur mm au-dessus de la barre */}
                <text
                  x={xCenter}
                  y={barY - 5}
                  textAnchor="middle"
                  className="text-[11px] font-semibold fill-slate-600 tabular-nums"
                >
                  {mm}
                </text>

                {/* Étiquette mois en bas */}
                <text
                  x={xCenter}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className="text-[11.5px] fill-stone-700 font-medium"
                >
                  {monthText}
                </text>
              </g>
            )
          })}

        {/* Courbe rouge (Diagnostics) */}
        {data && data.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#DC2626"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points de la courbe à cœur blanc + valeur au-dessus */}
        {data &&
          data.map((item, i) => {
            const cx = getX(i)
            const cy = getCasesY(item.diagnostics_count || 0)
            const cases = item.diagnostics_count || 0
            const isHovered = hoveredItem?.mois === item.mois

            return (
              <g
                key={`point-${item.mois}`}
                tabIndex={0}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className="cursor-pointer outline-none"
              >
                {/* Halo survol */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r={9} fill="#DC2626" fillOpacity={0.15} />
                )}

                {/* Point 5px à cœur blanc */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill="#FFFFFF"
                  stroke="#DC2626"
                  strokeWidth={2}
                />

                {/* Valeur numérique au-dessus du point */}
                {/* Badge pill anti-collision au-dessus du point */}
                <rect
                  x={cx - 10}
                  y={cy - 22}
                  width={20}
                  height={15}
                  rx={4}
                  fill="#FFFFFF"
                  stroke="#DC2626"
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={cy - 11}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-rose-700 tabular-nums"
                >
                  {cases}
                </text>
              </g>
            )
          })}
      </svg>

      {/* Infobulle interactive */}
      {hoveredItem && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-stone-200 bg-white p-2.5 shadow-md text-[12px] leading-tight"
          style={{
            left: `${Math.min(Math.max(getX(data.indexOf(hoveredItem)) - 75, 10), width - 170)}px`,
            top: '10px',
          }}
        >
          <div className="font-semibold text-stone-900 mb-1 border-b border-stone-100 pb-1">
            {hoveredItem.mois} 2026
          </div>
          <div className="flex flex-col gap-1 text-[11.5px]">
            <div className="flex justify-between items-center gap-3">
              <span className="text-slate-600">Pluviométrie :</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {hoveredItem.pluviometrie_mm} mm
              </span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-rose-700">Diagnostics :</span>
              <span className="font-semibold text-rose-700 tabular-nums">
                {hoveredItem.diagnostics_count} cas
              </span>
            </div>
            {hoveredItem.maladies && hoveredItem.maladies.length > 0 && (
              <div className="text-[11px] text-stone-500 pt-0.5">
                {hoveredItem.maladies.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
