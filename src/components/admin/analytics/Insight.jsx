import { Compass, AlertTriangle, TrendingUp } from 'lucide-react'

/**
 * Encart d'analyse décisionnelle sobre et professionnel
 * @param {'info' | 'warning' | 'danger'} variant
 * @param {string} children
 */
export default function Insight({ variant = 'info', children }) {
  const isDanger = variant === 'danger'
  const isWarning = variant === 'warning'

  const borderClass = isDanger
    ? 'border-rose-200 bg-rose-50/50 text-rose-900'
    : isWarning
      ? 'border-amber-200/80 bg-amber-50/40 text-amber-950'
      : 'border-stone-200 bg-stone-50/70 text-stone-900'

  const iconColor = isDanger
    ? 'text-rose-600'
    : isWarning
      ? 'text-amber-700'
      : 'text-emerald-700'

  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[12px] leading-relaxed transition-colors ${borderClass}`}
    >
      <span className="mt-0.5 shrink-0">
        {isDanger ? (
          <AlertTriangle className={`h-4 w-4 ${iconColor}`} strokeWidth={1.8} aria-hidden="true" />
        ) : isWarning ? (
          <Compass className={`h-4 w-4 ${iconColor}`} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <TrendingUp className={`h-4 w-4 ${iconColor}`} strokeWidth={1.8} aria-hidden="true" />
        )}
      </span>
      <p className="font-medium text-stone-800 line-clamp-2">
        {children}
      </p>
    </div>
  )
}
