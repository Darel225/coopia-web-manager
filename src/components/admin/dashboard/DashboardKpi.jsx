import React from 'react'
import { DASHBOARD_TYPO } from './DashboardTokens'
import DashboardBadge from './DashboardBadge'

/**
 * Carte KPI unifiée pour le Dashboard (hauteur calibrée 88-96px)
 * - Libellé 11.5px/600 majuscule avec tracking 0.06em
 * - Ligne de lecture valeur (26px/600) + unité (13px) + pastille sémantique
 */
export default function DashboardKpi({
  id,
  label,
  value,
  unit,
  badge,
  badgeVariant = 'neutral',
  className = '',
}) {
  return (
    <div
      id={id}
      className={`flex h-[92px] flex-col justify-between rounded-xl border border-line bg-surface p-3.5 shadow-2xs ${className}`}
    >
      {/* Ligne 1 : Libellé majuscule */}
      <span className={DASHBOARD_TYPO.kpiLabel}>
        {label}
      </span>

      {/* Ligne 2 : Valeur + Unité + Pastille */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className={DASHBOARD_TYPO.kpiValue}>
            {value}
          </span>
          {unit && (
            <span className={DASHBOARD_TYPO.kpiUnit}>
              {unit}
            </span>
          )}
        </div>

        {badge && (
          <DashboardBadge variant={badgeVariant}>
            {badge}
          </DashboardBadge>
        )}
      </div>
    </div>
  )
}
