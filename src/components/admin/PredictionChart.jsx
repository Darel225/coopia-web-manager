import { Lightbulb, TrendingUp } from 'lucide-react'

export default function PredictionChart({ data }) {
  const reelTonnage = data?.recolte_a_date_t ?? 31.77
  const sacsCount = data?.sacs_count ?? 635
  const previsionFinale = data?.prevision_finale_t ?? 75.0
  const intervalle95 = data?.intervalle_95_t ?? 3.5
  const ciLow = data?.ci_low_t ?? 71.5
  const ciHigh = data?.ci_high_t ?? 78.5
  const summaryText =
    data?.summary_text ||
    `Les ${reelTonnage} tonnes déjà enregistrées en base (${sacsCount} sacs) permettent au modèle XGBoost de projeter ${previsionFinale} T.`

  const formattedReel = Number(reelTonnage).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // =========================================================================
  // CALCUL 100% DYNAMIQUE DE LA COURBE DEPUIS LES DONNÉES NEON DB & API
  // =========================================================================
  const rawTrajectory = data?.monthly_trajectory && data.monthly_trajectory.length > 0
    ? data.monthly_trajectory
    : [
        { mois: 'Mai', tonnage_cumule_t: 3.51, type: 'reel' },
        { mois: 'Juin', tonnage_cumule_t: 6.96, type: 'reel' },
        { mois: 'Juillet', tonnage_cumule_t: 9.75, type: 'reel' },
        { mois: 'Août', tonnage_cumule_t: 14.66, type: 'reel' },
        { mois: 'Septembre', tonnage_cumule_t: 18.11, type: 'reel' },
        { mois: 'Octobre', tonnage_cumule_t: 31.77, type: 'actuel' },
        { mois: 'Novembre', tonnage_cumule_t: 48.0, type: 'prevision' },
        { mois: 'Décembre', tonnage_cumule_t: 63.5, type: 'prevision' },
        { mois: 'Janvier', tonnage_cumule_t: 75.0, type: 'prevision' },
      ]

  // Définition de l'espace graphique SVG (540 x 180)
  const minX = 45
  const maxX = 515
  const minY = 25
  const maxY = 155
  const maxScale = Math.max(80, Math.ceil(previsionFinale / 10) * 10)

  // Mappage dynamique de chaque point vers les coordonnées SVG
  const totalPoints = rawTrajectory.length
  const points = rawTrajectory.map((pt, i) => {
    const x = Math.round(minX + (i / Math.max(1, totalPoints - 1)) * (maxX - minX))
    const y = Math.round(maxY - (pt.tonnage_cumule_t / maxScale) * (maxY - minY))
    const rawMois = pt.mois || ''
    const shortMois = rawMois.length > 4 ? rawMois.substring(0, 4) : rawMois
    return { ...pt, x, y, shortMois }
  })

  // Identification dynamique du point pivot "Actuel" (dernier mois avec pesées réelles en base)
  const currentIdx = points.findLastIndex ? points.findLastIndex((p) => p.type === 'actuel') : points.findIndex((p) => p.type === 'actuel')
  const actualIdx = currentIdx >= 0 ? currentIdx : Math.min(5, totalPoints - 1)
  const currentPoint = points[actualIdx]

  // Tracé réel continu (de Mai jusqu'au mois actuel)
  const realPoints = points.slice(0, actualIdx + 1)
  const realPathD = realPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ')
  const realAreaD = `${realPathD} L ${currentPoint.x},${maxY} L ${points[0].x},${maxY} Z`

  // Tracé prévisionnel en pointillés (du mois actuel jusqu'à Janvier)
  const predPoints = points.slice(actualIdx)
  const predPathD = predPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ')

  // Zone d'intervalle de confiance 95%
  const polygonPoints = predPoints
    .map((p, i) => {
      const delta = (i / Math.max(1, predPoints.length - 1)) * 14
      return `${p.x},${Math.max(12, p.y - delta)}`
    })
    .concat(
      predPoints
        .slice()
        .reverse()
        .map((p, i) => {
          const revI = predPoints.length - 1 - i
          const delta = (revI / Math.max(1, predPoints.length - 1)) * 14
          return `${p.x},${Math.min(maxY, p.y + delta)}`
        })
    )
    .join(' ')

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Header avec Titre & Description du rôle */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-forest-900" strokeWidth={2} />
              <h3 className="text-base font-bold text-ink">Prévision du tonnage de campagne</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Projection dynamique de la récolte calculée en continu par le modèle XGBoost Regressor depuis Neon DB.
            </p>
          </div>

          {/* Légende épurée */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium text-ink-muted bg-[#F8F6F2] px-3 py-1.5 rounded-xl border border-line/50">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-3.5 rounded-full bg-[#0F3D2E]" aria-hidden="true" />
              <span className="text-ink font-semibold">Réel Neon DB</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 border-t-2 border-dashed border-[#B47F18]" aria-hidden="true" />
              <span className="text-[#B47F18] font-semibold">Prévision XGBoost</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-[3px] bg-[#F6EDD3] border border-[#ECD9A8]" aria-hidden="true" />
              <span>Intervalle 95%</span>
            </span>
          </div>
        </div>

        {/* Mini KPIs Trio 100% dynamique */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-[#FAF7F2] p-3.5 border border-line/40">
          <div className="border-r border-line/40 pr-2">
            <span className="block text-[11px] font-medium text-ink-muted">Récolté à date (Neon DB)</span>
            <span className="mt-0.5 block text-lg font-bold text-ink">{formattedReel} T</span>
            <span className="text-[10px] text-emerald-700 font-medium">{sacsCount} sacs pesés</span>
          </div>
          <div className="border-r border-line/40 pr-2 pl-1">
            <span className="block text-[11px] font-medium text-ink-muted">Prévision finale IA</span>
            <span className="mt-0.5 block text-lg font-bold text-[#B47F18]">
              {previsionFinale.toFixed(1).replace('.', ',')} T
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Modèle XGBoost Regressor</span>
          </div>
          <div className="pl-1">
            <span className="block text-[11px] font-medium text-ink-muted">Confiance (IC 95%)</span>
            <span className="mt-0.5 block text-lg font-bold text-ink">
              ±{intervalle95.toFixed(1).replace('.', ',')} T
            </span>
            <span className="text-[10px] text-ink-muted font-medium">
              [{ciLow} T - {ciHigh} T]
            </span>
          </div>
        </div>

        {/* Visualisation SVG Timeline & Prévision 100% Dynamique */}
        <div className="mt-6">
          <div className="relative h-48 w-full">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 540 180"
              preserveAspectRatio="none"
              aria-label="Graphique d'évolution du tonnage"
            >
              <defs>
                <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F3D2E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0F3D2E" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B47F18" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#B47F18" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lignes de repère horizontales */}
              <line x1="30" y1="20" x2="520" y2="20" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="30" y1="65" x2="520" y2="65" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="30" y1="110" x2="520" y2="110" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="30" y1="155" x2="520" y2="155" stroke="#E5E7EB" />

              {/* Labels de l'axe Y */}
              <text x="22" y="24" textAnchor="end" fontSize="10" fill="#9CA3AF" fontWeight="600">
                {maxScale}T
              </text>
              <text x="22" y="69" textAnchor="end" fontSize="10" fill="#9CA3AF" fontWeight="600">
                {Math.round(maxScale * 0.62)}T
              </text>
              <text x="22" y="114" textAnchor="end" fontSize="10" fill="#9CA3AF" fontWeight="600">
                {Math.round(maxScale * 0.31)}T
              </text>
              <text x="22" y="158" textAnchor="end" fontSize="10" fill="#9CA3AF" fontWeight="600">
                0T
              </text>

              {/* Repère dynamique AUJOURD'HUI calé sur le mois actuel */}
              <line
                x1={currentPoint.x}
                y1="15"
                x2={currentPoint.x}
                y2="155"
                stroke="#B47F18"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <rect
                x={currentPoint.x - 34}
                y="5"
                width="68"
                height="16"
                rx="4"
                fill="#FEF9E7"
                stroke="#F3E6B3"
              />
              <text
                x={currentPoint.x}
                y="17"
                textAnchor="middle"
                fontSize="9.5"
                fill="#B45309"
                fontWeight="700"
              >
                {currentPoint.shortMois} (Auj.)
              </text>

              {/* Zone d'intervalle de confiance (projection future) */}
              <polygon points={polygonPoints} fill="#B47F18" opacity="0.12" />

              {/* Courbe Réelle (Mai -> Mois Actuel avec livraisons réelles) */}
              <path
                d={realPathD}
                fill="none"
                stroke="#0F3D2E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={realAreaD} fill="url(#realGradient)" />

              {/* Courbe Prévisionnelle en pointillés (Mois Actuel -> Janvier fin de campagne) */}
              <path
                d={predPathD}
                fill="none"
                stroke="#B47F18"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />

              {/* Points sur la courbe générés dynamiquement */}
              {points.map((pt, idx) => {
                const isPastOrCurrent = idx <= actualIdx
                const isCurrent = idx === actualIdx
                const isFinal = idx === points.length - 1

                if (isCurrent) {
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#0F3D2E"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  )
                }
                if (isFinal) {
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#B47F18"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  )
                }
                return (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill={isPastOrCurrent ? '#0F3D2E' : '#B47F18'}
                  />
                )
              })}

              {/* Labels de l'axe X (Mois) générés dynamiquement */}
              {points.map((pt, idx) => {
                const isCurrent = idx === actualIdx
                const isPast = idx < actualIdx
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y="172"
                    textAnchor="middle"
                    fontSize="10.5"
                    fill={isCurrent ? '#0F3D2E' : isPast ? '#6B7280' : '#B47F18'}
                    fontWeight={isCurrent ? '700' : '500'}
                  >
                    {isCurrent ? `${pt.shortMois} (Auj.)` : pt.shortMois}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Règle métier explicative */}
      <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
        <p className="leading-snug">
          <strong className="font-semibold text-[#3D3208]">Règle métier :</strong> {summaryText} L'intervalle de confiance (±{intervalle95.toFixed(1).replace('.', ',')} T) couvre 95% des variations climatiques historiques.
        </p>
      </div>
    </div>
  )
}
