import { create } from 'zustand'
import { apiService } from '../services/api'

const VILLAGES = ['Soubré', 'Méagui', 'Yabayo', 'Oupoyo', 'Grand-Zattry', 'Liliyo']

// Prix officiels garantis bord-champ par filière (Campagne 2025-2026)
export const CROP_PRICING = {
  cacao: { label: 'Cacao', priceKg: 1850, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  cafe: { label: 'Café', priceKg: 1000, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  anacarde: { label: 'Anacarde', priceKg: 350, color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
}

const INITIAL_PAGE_1 = [
  {
    id: '088e7493-c8c9-45aa-bf04-2cb62b5b793d',
    code: 'BDR-2026-6AA09C',
    codeFormatted: 'BDR - 2026 - 6AA09C',
    planteur: 'Estelle Kouame',
    phone: '+225 07 48 12 34 56',
    poidsKg: 50.0,
    sacs: 1,
    crop: 'cacao',
    unitPrice: 1850,
    valeurFcfa: 92500,
    village: 'Pindikro',
    statut: 'En attente',
    declaredTime: '11:20',
    weighedTime: '11:34',
    validatedTime: null,
  },
  {
    id: '23df2bb8-57c0-443d-8408-6c08e2b1d9f7',
    code: 'BDR-2026-1ADB0E',
    codeFormatted: 'BDR - 2026 - 1ADB0E',
    planteur: 'Estelle Kouame',
    phone: '+225 07 48 12 34 56',
    poidsKg: 150.0,
    sacs: 3,
    crop: 'cacao',
    unitPrice: 1850,
    valeurFcfa: 277500,
    village: 'Pindikro',
    statut: 'En attente',
    declaredTime: '11:09',
    weighedTime: '11:22',
    validatedTime: null,
  },
  {
    id: '23d48bdb-ccce-4c10-bbe4-71de8c3fb149',
    code: 'BDR-2026-DV06',
    codeFormatted: 'BDR - 2026 - DV06',
    planteur: 'Amadou Traoré',
    phone: '+225 05 12 34 56 78',
    poidsKg: 1402.0,
    sacs: 28,
    crop: 'cacao',
    unitPrice: 1850,
    valeurFcfa: 2593700,
    village: 'Divo',
    statut: 'En attente',
    declaredTime: '10:15',
    weighedTime: '10:28',
    validatedTime: null,
  },
  {
    id: 'dcf38a58-4425-4176-ba85-82ad225ac445',
    code: 'BDR-2026-BD04',
    codeFormatted: 'BDR - 2026 - BD04',
    planteur: 'Seke Darel',
    phone: '+225 01 23 45 67 89',
    poidsKg: 1248.0,
    sacs: 25,
    crop: 'cacao',
    unitPrice: 1850,
    valeurFcfa: 2308800,
    village: 'Bodokro',
    statut: 'En attente',
    declaredTime: '09:30',
    weighedTime: '09:42',
    validatedTime: null,
  },
  {
    id: '263042f8-905c-41c9-8f63-dd0b8ea67ab8',
    code: 'BDR-2026-MN05',
    codeFormatted: 'BDR - 2026 - MN05',
    planteur: "Yao N'Guessan",
    phone: '+225 07 98 76 54 32',
    poidsKg: 703.5,
    sacs: 14,
    crop: 'cafe',
    unitPrice: 1000,
    valeurFcfa: 703500,
    village: 'Man',
    statut: 'En attente',
    declaredTime: '09:12',
    weighedTime: '09:25',
    validatedTime: null,
  },
  {
    id: 'BDR-2026-6AA04D',
    code: 'BDR-2026-6AA04D',
    codeFormatted: 'BDR - 2026 - 6AA04D',
    planteur: 'Koffi Kouamé',
    phone: '+225 05 67 89 01 23',
    poidsKg: 165.0,
    sacs: 3,
    crop: 'cacao',
    unitPrice: 1850,
    valeurFcfa: 305250,
    village: 'Soubré',
    statut: 'Validé',
    declaredTime: '08:45',
    weighedTime: '08:58',
    validatedTime: '09:05',
  },
]

const mapRecolteToSlip = (r, idx) => {
  const code = r.bordereau_ref || `BDR-2026-${(idx + 1).toString().padStart(4, '0')}`
  const codeFormatted = code.replace(/^BDR-(\d{4})-([A-Z0-9]+)$/, 'BDR - $1 - $2')
  const created = r.created_at ? new Date(r.created_at) : new Date()
  const declaredTime = `${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')}`
  const mWeighed = (created.getMinutes() + 14) % 60
  const weighedTime = `${String(created.getHours()).padStart(2, '0')}:${String(mWeighed).padStart(2, '0')}`
  const mVal = (created.getMinutes() + 22) % 60
  const validatedTime = r.status === 'APPROVED' ? `${String(created.getHours()).padStart(2, '0')}:${String(mVal).padStart(2, '0')}` : null

  const weight = Number(r.weight_kg) || 0
  const crop = (r.crop_type || 'cacao').toLowerCase()
  const pricing = CROP_PRICING[crop] || CROP_PRICING.cacao
  const unitPrice = Number(r.unit_price_fcfa) || pricing.priceKg
  const sacs = Number(r.number_of_bags) || Math.max(1, Math.round(weight / 50))
  const valeurFcfa = Number(r.valeur_totale_fcfa) || Math.round(weight * unitPrice)

  return {
    id: r.id || code,
    code,
    codeFormatted,
    planteur: r.planter_name || 'Planteur',
    phone: r.planter_phone || '+225 07 00 00 00',
    poidsKg: weight,
    sacs,
    crop,
    unitPrice,
    valeurFcfa,
    village: r.village || 'Soubré',
    statut: r.status === 'APPROVED' ? 'Validé' : (r.status === 'REJECTED' ? 'Refusé' : 'En attente'),
    declaredTime,
    weighedTime,
    validatedTime,
    raw: r,
  }
}

export const useRecoltesStore = create((set, get) => ({
  bordereaux: INITIAL_PAGE_1,
  selectedId: INITIAL_PAGE_1[0].id,
  searchQuery: '',
  loading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedId: (id) => set({ selectedId: id }),
  
  // Pending count dynamically computed from slips
  getPendingCount: () => {
    return get().bordereaux.filter((b) => b.statut === 'En attente').length
  },

  // Chargement dynamique depuis Neon DB
  fetchRecoltes: async () => {
    set({ loading: true })
    try {
      const data = await apiService.getBordereaux()
      if (Array.isArray(data) && data.length > 0) {
        const slips = data.map(mapRecolteToSlip)
        set((state) => ({
          bordereaux: slips,
          selectedId: slips.find((s) => s.id === state.selectedId)?.id || slips[0]?.id,
          loading: false,
        }))
        console.log('✅ [RecoltesStore] Bordereaux Neon chargés:', slips.length)
        return slips
      }
    } catch (err) {
      console.warn('Fallback recoltes locales:', err)
    } finally {
      set({ loading: false })
    }
  },

  // Validation immédiate avec persistance Neon PostgreSQL
  validateBordereau: async (id) => {
    const now = new Date()
    const nowFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // 1. Mise à jour optimiste immédiate dans l'UI
    set((state) => ({
      bordereaux: state.bordereaux.map((item) =>
        item.id === id || item.code === id
          ? { ...item, statut: 'Validé', validatedTime: nowFormatted }
          : item
      ),
    }))

    // 2. Persistance dans la base Neon
    try {
      await apiService.validerPesee(id)
      console.log(`✅ [RecoltesStore] Bordereau ${id} validé avec succès dans Neon DB`)
    } catch (err) {
      console.warn('Erreur validation API Neon:', err)
    }
  },
}))
