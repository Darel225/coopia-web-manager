import React from 'react'

/**
 * Avatar rond de 32px pour le Dashboard
 * - Initiales blanches 11px/600, contraste AA
 * - Fond vert forêt (#0F3D2E) ou ambre foncé (#B45309) pour Alerte IA
 */
export default function DashboardAvatar({ initials, bg = '#0F3D2E', className = '' }) {
  // Garantit un contraste AA strict
  const effectiveBg = bg === '#D97706' || bg === 'warning' ? '#B45309' : '#0F3D2E'

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-2xs ${className}`}
      style={{ backgroundColor: effectiveBg }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
