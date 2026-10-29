/**
 * Carte KPI décisionnelle unifiée et épurée
 * - Ligne 1 : Libellé à gauche + Badge statut à droite (ne compresse plus le chiffre)
 * - Ligne 2 : Valeur principale spacieuse et nette (sans débordement)
 * - Ligne 3 : Indicateur secondaire concis et utile
 */
export default function AnalyticsKpiCard({
  label,
  value,
  unit,
  badgeText,
  badgeVariant = 'neutral', // 'neutral' | 'good' | 'amber'
  secondaryText,
  highlightColor,
}) {
  const badgeClasses =
    badgeVariant === 'good'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : badgeVariant === 'amber'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-stone-100 text-stone-700 border-stone-200'

  return (
    <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
      {/* Ligne 1 : Libellé + Badge officiel en haut */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-100/70">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide truncate">
          {label}
        </span>
        {badgeText && (
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold border whitespace-nowrap ${badgeClasses}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Ligne 2 : Valeur principale nette et aérée */}
      <div className="flex items-baseline gap-1.5 my-2">
        <span
          className={`text-[22px] font-bold leading-none tabular-nums tracking-tight ${
            highlightColor ? highlightColor : 'text-stone-900'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11.5px] font-medium text-stone-500">
            {unit}
          </span>
        )}
      </div>

      {/* Ligne 3 : Indicateur secondaire concis */}
      {secondaryText && (
        <div className="text-[11px] font-medium text-stone-500 leading-tight truncate pt-0.5">
          {secondaryText}
        </div>
      )}
    </div>
  )
}
