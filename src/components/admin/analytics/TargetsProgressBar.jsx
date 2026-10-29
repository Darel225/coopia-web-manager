import React from 'react'
import { getProgressStatus } from './constants'

export default function TargetsProgressBar({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-stone-100">
      {data.map((item, idx) => {
        const tonnage = item.tonnage_tonnes ?? ((item.tonnage_total_kg ?? item.tonnage_kg ?? 0) / 1000)
        const vNorm = (item.village || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const cNorm = (item.culture || '').toLowerCase()
        const isAnacarde = cNorm.includes('anacard') || vNorm.includes('attecoub')
        const defaultCible = isAnacarde ? (tonnage > 3 ? 8.0 : 2.0) : 2.5
        const cible = item.cible_tonnes || defaultCible
        const pct = item.realisation_pct ?? (cible > 0 ? Math.round((tonnage / cible) * 100) : 0)
        const { barColor, badgeBg } = getProgressStatus(pct)

        return (
          <div key={`${item.village}-${item.culture || 'cacao'}-${idx}`} className="py-2.5 flex items-center gap-3">
            <div className="w-24 shrink-0 truncate flex flex-col">
              <span className="text-[13px] font-semibold text-stone-900 truncate">
                {item.village}
              </span>
              {item.culture && (
                <span className="text-[10px] text-stone-400 font-medium capitalize">
                  {item.culture}
                </span>
              )}
            </div>

            {/* Piste et jauge fluide */}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(Math.max(pct, 2), 100)}%`,
                  backgroundColor: barColor,
                }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.village}: ${pct}% de l'objectif atteint`}
              />
            </div>

            {/* Cible et badge de pourcentage alignés */}
            <div className="w-32 shrink-0 flex items-center justify-end gap-2 text-right">
              <span className="text-[11.5px] tabular-nums text-stone-500">
                {tonnage.toLocaleString('fr-FR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })}{' '}
                / {cible.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} T
              </span>
              <span
                className={`w-12 text-center rounded px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums border ${badgeBg}`}
              >
                {pct} %
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
