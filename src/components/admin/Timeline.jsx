import { Check, Clock } from 'lucide-react'

function formatPoids(val) {
  return (
    val.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' kg'
  )
}

export default function Timeline({ slip }) {
  if (!slip) return null

  const isValidated = slip.statut === 'Validé'
  const poidsText = `Pesé (${formatPoids(slip.poidsKg)})`

  return (
    <div className="relative space-y-5" aria-label="Étapes de traitement du bordereau">
      {/* Ligne pointillée reliant les étapes */}
      <div
        className="pointer-events-none absolute left-[11px] top-3 bottom-3 w-[1px] border-l border-dashed border-[#C9C4BA]"
        aria-hidden="true"
      />

      {/* Étape 1 : Déclaré */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-ink">Déclaré</span>
        </div>
        <span className="text-[13px] text-ink-muted">{slip.declaredTime || '11:20'}</span>
      </div>

      {/* Étape 2 : Pesé */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-ink">{poidsText}</span>
        </div>
        <span className="text-[13px] text-ink-muted">{slip.weighedTime || '11:34'}</span>
      </div>

      {/* Étape 3 : Validé */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {isValidated ? (
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
          ) : (
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D97706] text-white">
              <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          <span className="text-sm font-semibold text-ink">Validé</span>
        </div>

        {isValidated ? (
          <span className="text-[13px] text-ink-muted">
            {slip.validatedTime || '11:42'}
          </span>
        ) : (
          <span className="text-[13px] font-semibold text-[#D97706]">En cours</span>
        )}
      </div>
    </div>
  )
}
