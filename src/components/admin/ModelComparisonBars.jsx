import { Lightbulb, Award } from 'lucide-react'

export default function ModelComparisonBars({ data }) {
  const models = data?.models_comparison || [
    {
      name: 'Régression Linéaire',
      rmse: 8.2,
      mae: 6.4,
      r2: 0.74,
      status: 'Baseline simple',
      isBest: false,
    },
    {
      name: 'XGBoost Regressor',
      rmse: 4.8,
      mae: 3.6,
      r2: 0.91,
      status: 'Sélectionné pour la production',
      isBest: true,
    },
  ]

  // Max RMSE pour normaliser la barre de progression (inversée : plus petite erreur = meilleure barre)
  const maxRmse = 10.0

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* En-tête avec description concise */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-forest-900" strokeWidth={2} />
              <h3 className="text-base font-bold text-ink">Comparaison des algorithmes (Benchmark IA)</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Évaluation rigoureuse des modèles candidats sur le jeu de test pour retenir l'algorithme le plus précis.
            </p>
          </div>

          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
            XGBoost Validé
          </span>
        </div>

        {/* Liste comparative des 3 modèles */}
        <div className="mt-5 space-y-4">
          {models.map((m, idx) => {
            const scorePercent = Math.max(15, Math.min(100, Math.round(((maxRmse - m.rmse) / maxRmse) * 100)))

            return (
              <div
                key={idx}
                className={`rounded-xl border p-4 transition-all ${m.isBest
                    ? 'border-emerald-300 bg-[#F4F9F6] shadow-xs'
                    : 'border-line/60 bg-[#FAFAFA]'
                  }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${m.isBest ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-gray-400'
                        }`}
                      aria-hidden="true"
                    />
                    <h4 className="text-sm font-bold text-ink">{m.name}</h4>
                  </div>

                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${m.isBest
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-200 text-ink-muted'
                      }`}
                  >
                    {m.status}
                  </span>
                </div>

                {/* Barre d'erreur normalisée */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted text-[11px]">Précision globale (R² : {(m.r2 * 100).toFixed(0)}%)</span>
                    <span className="font-bold text-ink">Erreur RMSE : {m.rmse.toFixed(1)} T</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.isBest ? 'bg-[#0F3D2E]' : 'bg-gray-400'
                        }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>

                {/* Métriques détaillées MAE et R2 */}
                <div className="mt-2.5 flex items-center gap-4 text-[11px] text-ink-muted">
                  <span>
                    MAE (erreur absolue) : <strong className="text-ink">{m.mae.toFixed(1)} T</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Coefficient R² : <strong className="text-ink">{m.r2.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Règle métier explicative */}
      <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
        <p className="leading-snug">
          <strong className="font-semibold text-[#3D3208]">Décision d'ingénierie :</strong> Le modèle XGBoost a été retenu pour sa faible marge d'erreur (RMSE 4.8 T vs 8.2 T en régression linéaire) et son excellente généralisation.
        </p>
      </div>
    </div>
  )
}
