import React from 'react'

/**
 * Carte unifiée locale pour le Dashboard
 * - Fond blanc, bordure 1px #ECE8E1, rayon 12px, ombre très légère (2xs), padding 16px
 */
export default function DashboardCard({
  id,
  children,
  className = '',
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      id={id}
      className={`flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-3.5 sm:p-4 shadow-2xs ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
