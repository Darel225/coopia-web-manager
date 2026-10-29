import { Lightbulb, ShieldCheck } from 'lucide-react'

export default function ConfusionMatrix({ matrix }) {
  // Matrice de confusion réelle issue du test XGBoost Churn
  const tp = matrix?.tp ?? 17 // Vrais Positifs (départs anticipés)
  const fn = matrix?.fn ?? 2 // Faux Négatifs (départs manqués)
  const fp = matrix?.fp ?? 3 // Faux Positifs (fausses alertes)
  const tn = matrix?.tn ?? 78 // Vrais Négatifs (fidèles bien identifiés)
  const total = tp + fn + fp + tn

  const recall = matrix?.recall_pct ?? Math.round((tp / (tp + fn)) * 100)
  const precision = matrix?.precision_pct ?? Math.round((tp / (tp + fp)) * 100)
  const accuracy = matrix?.accuracy_pct ?? Math.round(((tp + tn) / total) * 100)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Titre et description synthétique du rôle */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-forest-900" strokeWidth={2} />
              <h3 className="text-base font-bold text-ink">Matrice de Confusion (Validation Churn)</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Vérification des performances réelles du modèle XGBoost sur le jeu de test (100 planteurs).
            </p>
          </div>

          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
            Rappel : {recall}%
          </span>
        </div>

        {/* Grille 2x2 de la Matrice */}
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Vrais Positifs */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Vrais Positifs (VP)
                </span>
                <span className="rounded-md bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                  Succès
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-900">{tp}</span>
                <span className="text-xs text-emerald-700">départs prévus</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800 leading-tight">
                Planteurs en risque correctement détectés avant leur départ.
              </p>
            </div>

            {/* Faux Positifs */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  Faux Positifs (FP)
                </span>
                <span className="rounded-md bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                  Fausse alerte
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-900">{fp}</span>
                <span className="text-xs text-amber-700">alertes sans suite</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800 leading-tight">
                Planteurs alertés mais restés fidèles (coût minime pour la coopérative).
              </p>
            </div>

            {/* Faux Négatifs */}
            <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
                  Faux Négatifs (FN)
                </span>
                <span className="rounded-md bg-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-900">
                  À minimiser
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-900">{fn}</span>
                <span className="text-xs text-rose-700">départs non vus</span>
              </div>
              <p className="mt-1 text-[11px] text-rose-800 leading-tight">
                Départs manqués par le système (seulement 2 cas sur 19 réels).
              </p>
            </div>

            {/* Vrais Négatifs */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                  Vrais Négatifs (VN)
                </span>
                <span className="rounded-md bg-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-900">
                  Fidèles
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-900">{tn}</span>
                <span className="text-xs text-blue-700">membres stables</span>
              </div>
              <p className="mt-1 text-[11px] text-blue-800 leading-tight">
                Planteurs fidèles identifiés sans fausse alerte.
              </p>
            </div>
          </div>
        </div>

        {/* Métriques clés */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#FAF7F2] p-3 text-center border border-line/40">
          <div>
            <span className="block text-[10px] text-ink-muted">Exactitude (Accuracy)</span>
            <span className="text-sm font-bold text-ink">{accuracy}%</span>
          </div>
          <div className="border-x border-line/40">
            <span className="block text-[10px] text-ink-muted">Sensibilité (Recall)</span>
            <span className="text-sm font-bold text-emerald-800">{recall}%</span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted">Précision (Precision)</span>
            <span className="text-sm font-bold text-forest-900">{precision}%</span>
          </div>
        </div>
      </div>

      {/* Règle métier */}
      <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
        <p className="leading-snug">
          <strong className="font-semibold text-[#3D3208]">Règle d'arbitrage :</strong> En rétention, rater un départ (FN) coûte 5x plus cher qu'une fausse alerte (FP). C'est pourquoi nous optimisons le Rappel à 89,5%.
        </p>
      </div>
    </div>
  )
}
