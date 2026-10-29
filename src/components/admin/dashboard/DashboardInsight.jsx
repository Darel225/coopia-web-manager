import React from 'react'
import { Lightbulb } from 'lucide-react'

/**
 * Encart "Lecture" compact pour le Dashboard
 * - Fond teinté ambre à 6%, filet fin 1px, icône trait unique, texte 12.5-13px
 */
export default function DashboardInsight({ children, className = '' }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/50 px-3 py-1.5 text-[12.5px] leading-[1.45] text-amber-950 ${className}`}
    >
      <Lightbulb
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <p className="line-clamp-2 font-normal text-stone-800">
        {children}
      </p>
    </div>
  )
}
