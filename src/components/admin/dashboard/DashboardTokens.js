// =============================================================================
// Jetons typographiques, dimensionnels et chromatiques locaux - Page Dashboard
// =============================================================================

export const DASHBOARD_TYPO = {
  // Titre principal
  pageTitle: 'text-[22px] font-semibold text-ink leading-tight',
  // Titre de carte
  cardTitle: 'text-[14px] font-semibold text-ink leading-tight',
  // Sous-titre ou légende
  cardSubtitle: 'text-[12px] font-normal text-ink-muted leading-tight',
  // Libellé de KPI
  kpiLabel: 'text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted leading-tight',
  // Valeur KPI principale
  kpiValue: 'text-[26px] font-semibold leading-none tabular-nums text-ink',
  // Unité KPI
  kpiUnit: 'text-[13px] font-normal text-ink-muted',
  // Texte courant et cellules
  bodyText: 'text-[13px] font-normal text-ink leading-[1.45]',
  // Badges et pastilles
  badgeText: 'text-[11px] font-semibold leading-none',
  // Axes de graphiques
  chartAxis: 'text-[11px] font-medium text-ink-muted',
  // Étiquettes de données
  chartDataLabel: 'text-[11.5px] font-medium tabular-nums',
}

// Sémantique chromatique unique (vert = bon/positif, ambre = en cours/vigilance, rouge = à traiter/critique, gris = neutre)
export const DASHBOARD_SEMANTICS = {
  green: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    dot: 'bg-emerald-600',
    solid: '#0F3D2E',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200/60',
    dot: 'bg-amber-600',
    solid: '#B45309',
  },
  red: {
    bg: 'bg-rose-50 text-rose-800 border-rose-200/60',
    dot: 'bg-rose-600',
    solid: '#B91C1C',
  },
  neutral: {
    bg: 'bg-stone-100 text-stone-700 border-stone-200/60',
    dot: 'bg-stone-500',
    solid: '#6B7A72',
  },
}
