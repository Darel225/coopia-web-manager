// =============================================================================
// Constantes et seuils décisionnels formalisés - Page Analytics BI & Dashboard
// Barèmes Officiels Côte d'Ivoire (Conseil Café-Cacao CCC & Conseil Coton-Anacarde CCA)
// =============================================================================

// Seuils agronomiques par filière (kg/ha)
export const THRESHOLD_CACAO_YIELD = 800 // kg/ha (seuil de rentabilité CCC Cacao)
export const THRESHOLD_CAFE_YIELD = 700  // kg/ha (seuil de rentabilité CCC Café Robusta)
export const THRESHOLD_ANACARDE_YIELD = 550 // kg/ha (seuil de rentabilité CCA Anacarde)
export const THRESHOLD_OPTIMAL_YIELD = 800 // rétrocompatibilité Cacao
export const THRESHOLD_MINIMAL_YIELD = 400 // kg/ha (seuil critique alerte churn)
export const THRESHOLD_RAIN_SATURATION = 100 // mm (seuil critique agrométéorologique)

// Barèmes officiels et configuration visuelle des filières
export const CROP_CONFIG = {
  CACAO: {
    key: 'CACAO',
    label: 'Cacao (CCC)',
    shortLabel: 'Cacao',
    regulatorShort: 'CCC',
    authority: 'Conseil Café-Cacao',
    price_kg: 1850,
    threshold_yield: 800,
    color: '#15803D',
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#166534',
    dark: '#0F3D2E',
  },
  CAFE: {
    key: 'CAFE',
    label: 'Café Robusta (CCC)',
    shortLabel: 'Café',
    regulatorShort: 'CCC',
    authority: 'Conseil Café-Cacao',
    price_kg: 1000,
    threshold_yield: 700,
    color: '#854D0E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#92400E',
    dark: '#713F12',
  },
  ANACARDE: {
    key: 'ANACARDE',
    label: 'Anacarde / Cajou (CCA)',
    shortLabel: 'Anacarde',
    regulatorShort: 'CCA',
    authority: 'Conseil Coton-Anacarde',
    price_kg: 350,
    threshold_yield: 550,
    color: '#CA8A04',
    bg: '#FEF9C3',
    border: '#FEF08A',
    text: '#854D0E',
    dark: '#A16207',
  },
  HEVEA: {
    key: 'HEVEA',
    label: 'Hévéa',
    shortLabel: 'Hévéa',
    regulatorShort: 'APROMAC',
    authority: 'Filière Hévéa',
    price_kg: 420,
    threshold_yield: 1200,
    color: '#0F766E',
    bg: '#CCFBF1',
    border: '#99F6E4',
    text: '#115E59',
    dark: '#134E4A',
  },
}

export function normalizeCropKey(raw) {
  if (!raw) return 'CACAO'
  const upper = String(raw).toUpperCase().trim()
  if (upper.includes('CAFE') || upper.includes('CAFÉ')) return 'CAFE'
  if (upper.includes('ANACARDE') || upper.includes('CAJOU')) return 'ANACARDE'
  if (upper.includes('HEVEA') || upper.includes('HÉVÉA')) return 'HEVEA'
  return 'CACAO'
}

export function getCropInfo(raw) {
  const key = normalizeCropKey(raw)
  return CROP_CONFIG[key] || CROP_CONFIG.CACAO
}

// Règle formelle des couleurs d'avancement de campagne
export const PROGRESS_THRESHOLDS = {
  HIGH: 80, // >= 80% : Bon (vert forêt)
  MEDIUM: 50, // 50% à 79% : Vigilance (ambre)
  // < 50% : Critique (rouge)
}

export function getProgressStatus(pct) {
  if (pct >= PROGRESS_THRESHOLDS.HIGH) {
    return {
      status: 'HIGH',
      barColor: '#0F3D2E',
      textColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }
  }
  if (pct >= PROGRESS_THRESHOLDS.MEDIUM) {
    return {
      status: 'MEDIUM',
      barColor: '#B45309',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  }
  return {
    status: 'LOW',
    barColor: '#B91C1C',
    textColor: 'text-rose-800',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
  }
}

// Couleurs sémantiques strictes
export const PALETTE = {
  forest: '#0F3D2E', // Vert principal de la marque
  forestSoft: '#154734',
  ink: '#14201A', // Texte quasi-noir
  inkMuted: '#6B7A72', // Gris chaud
  line: '#ECE8E1', // Filet 1px très clair
  canvas: '#FAF8F5', // Fond crème
  surface: '#FFFFFF', // Carte blanche
  // États sémantiques uniques
  good: { text: '#15803D', bg: '#DCFCE7', border: '#86EFAC', solid: '#16A34A' },
  warning: { text: '#B45309', bg: '#FEF3C7', border: '#FCD34D', solid: '#D97706' },
  danger: { text: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', solid: '#DC2626' },
  neutral: { text: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB', solid: '#9CA3AF' },
  // Pluviométrie (seule variable désaturée bleu-gris)
  rain: {
    bar: '#64748B',
    barPeak: '#475569',
    line: '#94A3B8',
    text: '#334155',
  },
}
