import { Lightbulb, Target } from 'lucide-react'

export default function ScatterPlotFit({ data }) {
  const metrics = data?.metrics || { rmse: 4.8, mae: 3.6, r2: 0.91 }
  const scatterPoints = data?.scatter_points || [
    { x_reel: 3.8, y_predit: 4.0 },
    { x_reel: 7.7, y_predit: 7.8 },
    { x_reel: 5.3, y_predit: 5.6 },
    { x_reel: 2.6, y_predit: 2.8 },
    { x_reel: 5.7, y_predit: 5.4 },
    { x_reel: 5.0, y_predit: 4.9 },
    { x_reel: 2.7, y_predit: 2.8 },
    { x_reel: 2.4, y_predit: 2.6 },
    { x_reel: 4.4, y_predit: 4.3 },
    { x_reel: 5.4, y_predit: 5.1 },
    { x_reel: 6.5, y_predit: 6.6 },
    { x_reel: 4.1, y_predit: 4.4 },
    { x_reel: 6.9, y_predit: 6.5 },
    { x_reel: 4.8, y_predit: 4.8 },
    { x_reel: 7.8, y_predit: 7.1 },
  ]

  // Normalisation SVG pour le cadre 240x135
  const svgPoints = scatterPoints.map(p => {
    const xSvg = 28 + (p.x_reel / 10.0) * 190
    const ySvg = 115 - (p.y_predit / 10.0) * 95
    return { cx: Math.max(28, Math.min(220, xSvg)), cy: Math.max(15, Math.min(115, ySvg)) }
  })

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-forest-900" strokeWidth={2} />
              <h3 className="text-base font-bold text-ink">Performance et ajustement</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Évaluation dynamique des résidus calculés par le modèle XGBoost sur le jeu de test.
            </p>
          </div>
        </div>

        {/* 3 Metrics Boxes issues de l'API */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-[#F6F4F0] p-3 text-center sm:text-left border border-line/40">
            <span className="block text-[11px] font-semibold text-ink-muted">RMSE</span>
            <span className="mt-0.5 block text-base font-bold text-ink">{metrics.rmse.toString().replace('.', ',')} T</span>
            <span className="text-[10px] text-ink-muted leading-none">Écart-type résidus</span>
          </div>

          <div className="rounded-xl bg-[#F6F4F0] p-3 text-center sm:text-left border border-line/40">
            <span className="block text-[11px] font-semibold text-ink-muted">MAE</span>
            <span className="mt-0.5 block text-base font-bold text-ink">{metrics.mae.toString().replace('.', ',')} T</span>
            <span className="text-[10px] text-ink-muted leading-none">Erreur absolue moy.</span>
          </div>

          <div className="rounded-xl bg-[#FEF9E7] p-3 text-center sm:text-left border border-[#F3E6B3]">
            <span className="block text-[11px] font-semibold text-[#854D0E]">R² Score</span>
            <span className="mt-0.5 block text-base font-bold text-[#B47F18]">{metrics.r2.toString().replace('.', ',')}</span>
            <span className="text-[10px] text-[#854D0E] font-medium leading-none">91% variance expliquée</span>
          </div>
        </div>

        {/* Nuage de dispersion dynamique */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-muted">Nuage de points test ({scatterPoints.length} parcelles)</span>
          <span className="text-[11px] text-forest-800 font-medium">Diagonale d'accord parfait</span>
        </div>

        <div className="relative mt-2 h-[145px] w-full rounded-xl border border-[#EBE7E0] bg-[#FAF8F5] p-2">
          <svg className="h-full w-full" viewBox="0 0 240 135">
            <line x1="28" y1="12" x2="28" y2="115" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="28" y1="115" x2="225" y2="115" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="28" y1="115" x2="220" y2="18" stroke="#B47F18" strokeWidth="1.75" strokeDasharray="3 3" />

            {svgPoints.map((pt, i) => (
              <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#154734" opacity="0.85" />
            ))}

            <text x="16" y="65" textAnchor="middle" transform="rotate(-90 16 65)" className="text-[9px] fill-slate-500 font-medium">Prédit (T)</text>
            <text x="126" y="128" textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">Réel mesuré (T)</text>
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
        <p className="leading-snug">
          <strong className="font-semibold text-[#3D3208]">Lecture métier :</strong> Les points réels restent fortement concentrés le long de la diagonale idéale, confirmant une marge d'erreur minimale (MAE de seulement {metrics.mae.toString().replace('.', ',')} T).
        </p>
      </div>
    </div>
  )
}
