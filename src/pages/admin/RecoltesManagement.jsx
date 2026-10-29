import { useState, useMemo, useEffect } from 'react'
import { Calendar, Download, RefreshCw, Clock, Scale, Banknote, ShieldCheck, Filter } from 'lucide-react'
import { toast } from 'sonner'
import SlipTable from '../../components/admin/SlipTable'
import SlipDetailPanel from '../../components/admin/SlipDetailPanel'
import { useRecoltesStore } from '../../store/recoltesStore'

const PAGE_SIZE = 6

export default function RecoltesManagement() {
  const bordereaux = useRecoltesStore((state) => state.bordereaux)
  const selectedId = useRecoltesStore((state) => state.selectedId)
  const setSelectedId = useRecoltesStore((state) => state.setSelectedId)
  const searchQuery = useRecoltesStore((state) => state.searchQuery)
  const fetchRecoltes = useRecoltesStore((state) => state.fetchRecoltes)
  const loading = useRecoltesStore((state) => state.loading)

  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL', 'PENDING', 'APPROVED'
  const [cropFilter, setCropFilter] = useState('ALL') // 'ALL', 'cacao', 'cafe', 'anacarde'

  useEffect(() => {
    fetchRecoltes()
  }, [fetchRecoltes])

  // KPIs Opérationnels calculés en temps réel
  const stats = useMemo(() => {
    const total = bordereaux.length
    const pending = bordereaux.filter((b) => b.statut === 'En attente')
    const approved = bordereaux.filter((b) => b.statut === 'Validé')
    const totalKg = bordereaux.reduce((acc, b) => acc + (b.poidsKg || 0), 0)
    const totalBags = bordereaux.reduce((acc, b) => acc + (b.sacs || 0), 0)
    const totalValueFcfa = bordereaux.reduce((acc, b) => acc + (b.valeurFcfa || 0), 0)
    const rate = total > 0 ? Math.round((approved.length / total) * 100) : 100

    return {
      total,
      pendingCount: pending.length,
      approvedCount: approved.length,
      totalTonnes: (totalKg / 1000).toFixed(2),
      totalBags,
      totalValueFcfa,
      complianceRate: rate,
    }
  }, [bordereaux])

  // Filtrage combiné : Recherche texte + Statut + Filière
  const filteredSlips = useMemo(() => {
    return bordereaux.filter((slip) => {
      // 1. Filtre Statut
      if (statusFilter === 'PENDING' && slip.statut !== 'En attente') return false
      if (statusFilter === 'APPROVED' && slip.statut !== 'Validé') return false

      // 2. Filtre Filière
      if (cropFilter !== 'ALL' && (slip.crop || 'cacao').toLowerCase() !== cropFilter) return false

      // 3. Filtre Recherche texte (référence, planteur, village, téléphone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchCode = slip.code.toLowerCase().includes(q)
        const matchPlanteur = slip.planteur.toLowerCase().includes(q)
        const matchVillage = slip.village.toLowerCase().includes(q)
        const matchPhone = slip.phone ? slip.phone.toLowerCase().includes(q) : false
        if (!matchCode && !matchPlanteur && !matchVillage && !matchPhone) return false
      }

      return true
    })
  }, [bordereaux, statusFilter, cropFilter, searchQuery])

  // Réinitialiser la pagination lors d'un changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, cropFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredSlips.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  // Bordereaux paginés (6 par page)
  const paginatedSlips = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredSlips.slice(start, start + PAGE_SIZE)
  }, [filteredSlips, safePage])

  // Synchroniser la sélection avec la page active
  useEffect(() => {
    if (paginatedSlips.length > 0) {
      const existsOnPage = paginatedSlips.some((s) => s.id === selectedId)
      if (!existsOnPage) {
        setSelectedId(paginatedSlips[0].id)
      }
    }
  }, [paginatedSlips, selectedId, setSelectedId])

  // Bordereau sélectionné actuellement (garanti sur la page visible)
  const selectedSlip = useMemo(() => {
    const found = paginatedSlips.find((b) => b.id === selectedId)
    return found || paginatedSlips[0] || bordereaux[0]
  }, [bordereaux, selectedId, paginatedSlips])

  // Export CSV complet
  const handleExportCSV = () => {
    if (filteredSlips.length === 0) {
      toast.error('Aucun bordereau à exporter.')
      return
    }

    const headers = [
      'RÉFÉRENCE',
      'PLANTEUR',
      'TÉLÉPHONE',
      'FILIÈRE',
      'POIDS (KG)',
      'SACS',
      'PRIX UNITAIRE (FCFA)',
      'VALEUR TOTALE (FCFA)',
      'VILLAGE',
      'STATUT',
      'HEURE DÉCLARATION',
      'HEURE PESÉE',
    ]

    const rows = filteredSlips.map((s) => [
      s.code,
      `"${s.planteur.replace(/"/g, '""')}"`,
      `"${s.phone || ''}"`,
      s.crop || 'cacao',
      s.poidsKg.toFixed(2).replace('.', ','),
      s.sacs || 0,
      s.unitPrice || 0,
      s.valeurFcfa || 0,
      `"${s.village}"`,
      s.statut,
      s.declaredTime || '',
      s.weighedTime || '',
    ])

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `registre_bordereaux_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Export CSV généré avec succès', {
      description: `${filteredSlips.length} bordereaux exportés pour la campagne en cours.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5 animate-fade-in pb-8">
      {/* 1. EN-TÊTE DE PAGE & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-ink">Récoltes & Bordereaux</h1>
          <p className="text-xs text-ink-muted">Registre officiel des pesées et certification des achats bord-champ</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Synchro Neon DB */}
          <button
            id="btn-refresh-recoltes"
            type="button"
            onClick={() => fetchRecoltes()}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800/30 shadow-2xs cursor-pointer"
            title="Actualiser depuis Neon PostgreSQL"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} strokeWidth={2} />
            <span>{loading ? 'Chargement...' : 'Synchroniser'}</span>
          </button>

          {/* Campagne */}
          <button
            id="btn-campaign"
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 text-xs font-medium text-ink transition-colors hover:bg-[#F4F1EB] focus:outline-none"
          >
            <Calendar className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
            <span>Campagne 2025-2026</span>
          </button>


        </div>
      </div>

      {/* 2. 4 CARTES KPIS OPÉRATIONNELS DYNAMIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : En attente de validation */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">En Attente</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stats.pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink">{stats.pendingCount}</span>
            <span className="text-xs text-ink-muted">bordereaux</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {stats.pendingCount > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium text-amber-800">Validation pont-bascule requise</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-800">Toutes les pesées sont certifiées</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 2 : Tonnage Pesé */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Tonnage Pesé</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-forest-900">{stats.totalTonnes}</span>
            <span className="text-xs font-semibold text-forest-800">Tonnes</span>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            <strong className="text-ink font-semibold">{stats.totalBags.toLocaleString('fr-FR')}</strong> sacs de jute enregistrés
          </p>
        </div>

        {/* KPI 3 : Valeur Garantie des Achats */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Valeur Garantie</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold font-mono text-emerald-900 block truncate">
              {stats.totalValueFcfa.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800 font-medium">
            Tarifs bord-champ garantis CCC & CCA
          </p>
        </div>

        {/* KPI 4 : Taux de Conformité */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Conformité</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-900">{stats.complianceRate} %</span>
            <span className="text-xs text-ink-muted">certifiés</span>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            {stats.approvedCount} validés sur {stats.total} déclarations
          </p>
        </div>
      </div>

      {/* 3. BARRE DE FILTRES RAPIDES ÉPURÉE (Sans émoticônes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-[#FAF8F5] p-2.5 px-3.5">
        {/* Filtres par Statut */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
            Statut :
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'ALL'
                ? 'bg-forest-900 text-white shadow-2xs'
                : 'bg-white text-ink-muted hover:text-ink border border-line'
              }`}
          >
            Tous ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
          >
            En attente ({stats.pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'APPROVED'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
          >
            Validés ({stats.approvedCount})
          </button>
        </div>

        {/* Filtres par Filière */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-muted mr-1">Filière :</span>
          <button
            type="button"
            onClick={() => setCropFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'ALL'
                ? 'bg-ink text-white shadow-2xs font-semibold'
                : 'bg-white text-ink-muted hover:text-ink border border-line'
              }`}
          >
            Toutes
          </button>
          <button
            type="button"
            onClick={() => setCropFilter('cacao')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'cacao'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
          >
            Cacao
          </button>
          <button
            type="button"
            onClick={() => setCropFilter('cafe')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'cafe'
                ? 'bg-amber-800 text-white shadow-2xs font-semibold'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
          >
            Café
          </button>
          <button
            type="button"
            onClick={() => setCropFilter('anacarde')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'anacarde'
                ? 'bg-yellow-700 text-white shadow-2xs font-semibold'
                : 'bg-white text-yellow-900 hover:bg-yellow-50 border border-yellow-200'
              }`}
          >
            Anacarde
          </button>
        </div>
      </div>

      {/* 4. ZONE PRINCIPALE : TABLEAU + PANNEAU DÉTAIL */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Colonne gauche (8 col) : Carte tableau des bordereaux */}
        <div className="lg:col-span-8">
          <SlipTable
            slips={paginatedSlips}
            selectedId={selectedSlip?.id}
            onSelectSlip={(id) => setSelectedId(id)}
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredSlips.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>

        {/* Colonne droite (4 col) : Panneau Détail du bordereau */}
        <div className="lg:col-span-4">
          <SlipDetailPanel slip={selectedSlip} />
        </div>
      </div>
    </div>
  )
}
