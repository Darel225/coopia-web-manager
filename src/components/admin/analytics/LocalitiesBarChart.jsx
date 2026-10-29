import React from 'react'

/**
 * Normalisation et détection de la filière pour chaque localité
 */
function getVillageCulture(item) {
  const vName = (item.village || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const rawCult = (item.culture || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if (rawCult.includes('anacarde') || rawCult.includes('cajou') || vName.includes('attecoub')) {
    return {
      filiere: 'Anacarde',
      badge: 'Anacarde',
      color: '#CA8A04',
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    }
  }
  if (rawCult.includes('cafe') || rawCult.includes('café') || vName.includes('man')) {
    return {
      filiere: 'Café Robusta',
      badge: 'Café',
      color: '#854D0E',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  }
  return {
    filiere: 'Cacao',
    badge: 'Cacao',
    color: '#15803D',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }
}

/**
 * Barres horizontales de tonnage par localité et filière dominante
 */
export default function LocalitiesBarChart({ data }) {
  if (!data || data.length === 0) return null

  const maxTonnage = Math.max(
    ...data.map((d) => d.tonnage_tonnes ?? ((d.tonnage_total_kg ?? d.tonnage_kg ?? 0) / 1000)),
    1
  )

  return (
    <div className="flex flex-col divide-y divide-stone-100">
      {data.map((item, idx) => {
        const tonnage = item.tonnage_tonnes ?? ((item.tonnage_total_kg ?? item.tonnage_kg ?? 0) / 1000)
        const pct = Math.max((tonnage / maxTonnage) * 100, 0)
        const isCritical = (item.village === 'Pindikro' && item.culture !== 'anacarde') || tonnage < 0.5
        const cropInfo = getVillageCulture(item)
        const barColor = isCritical ? '#DC2626' : (item.color || cropInfo.color)

        return (
          <div key={`${item.village}-${cropInfo.badge}-${idx}`} className="py-2.5 flex items-center gap-3">
            <span className="w-24 shrink-0 text-[13px] font-semibold text-stone-900 truncate">
              {item.village}
            </span>
            <span className={`shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded border ${cropInfo.badgeClass}`}>
              {cropInfo.badge}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(pct, isCritical ? 2 : 1)}%`,
                  backgroundColor: barColor,
                }}
                role="progressbar"
                aria-valuenow={tonnage}
                aria-valuemin={0}
                aria-valuemax={maxTonnage}
                aria-label={`${item.village} (${cropInfo.badge}): ${tonnage.toFixed(2)} tonnes`}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-[13px] font-bold text-stone-900 tabular-nums">
              {tonnage.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-[11px] font-normal text-stone-500">T</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
