import React from 'react'
import { DASHBOARD_SEMANTICS, DASHBOARD_TYPO } from './DashboardTokens'

/**
 * Pastille sémantique locale du dashboard
 * @param {'green' | 'amber' | 'red' | 'neutral'} variant
 * @param {React.ReactNode} children
 * @param {string} className
 */
export default function DashboardBadge({
  variant = 'neutral',
  children,
  className = '',
}) {
  const semantic = DASHBOARD_SEMANTICS[variant] || DASHBOARD_SEMANTICS.neutral

  return (
    <span
      className={`inline-flex items-center rounded-[6px] border px-2 py-0.5 ${DASHBOARD_TYPO.badgeText} ${semantic.bg} ${className}`}
    >
      {children}
    </span>
  )
}
