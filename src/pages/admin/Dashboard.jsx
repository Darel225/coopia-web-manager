import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Download, RefreshCw, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, apiService } from '../../services/api'
import { useRecoltesStore } from '../../store/recoltesStore'
import { DERNIERES_ACTIVITES } from '../../data/dashboardData'
import DashboardCard from '../../components/admin/dashboard/DashboardCard'
import DashboardKpi from '../../components/admin/dashboard/DashboardKpi'
import CropIntakeOverview from '../../components/admin/dashboard/CropIntakeOverview'
import { DASHBOARD_TYPO } from '../../components/admin/dashboard/DashboardTokens'

const fr = (n) =>
  Number(n || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// Normalisation professionnelle sans emojis
const normalizeCrop = (cropStr, villageName) => {
  const v = (villageName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const c = (cropStr || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if (c.includes('anacarde') || c.includes('cajou') || v.includes('attecoub') || v.includes('abobo')) {
    return { id: 'anacarde', label: 'Anacarde', badge: 'Anacarde', color: '#CA8A04', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
  }
  if (c.includes('cafe') || c.includes('caf') || v.includes('man')) {
    return { id: 'cafe', label: 'Café Robusta', badge: 'Café', color: '#854D0E', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' }
  }
  return { id: 'cacao', label: 'Cacao', badge: 'Cacao', color: '#15803D', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
}

const REAL_VILLAGES_FALLBACK = [
  { village: 'Divo', tonnage: 8.26, cropId: 'cacao', cropLabel: 'Cacao', color: '#15803D', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { village: 'Abobo', tonnage: 7.50, cropId: 'anacarde', cropLabel: 'Anacarde', color: '#CA8A04', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { village: 'Soubré', tonnage: 6.70, cropId: 'cacao', cropLabel: 'Cacao', color: '#15803D', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { village: 'Bodokro', tonnage: 4.06, cropId: 'cacao', cropLabel: 'Cacao', color: '#15803D', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { village: 'Man', tonnage: 3.95, cropId: 'cafe', cropLabel: 'Café', color: '#854D0E', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { village: 'Attecoubé', tonnage: 1.00, cropId: 'anacarde', cropLabel: 'Anacarde', color: '#CA8A04', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { village: 'Pindikro', tonnage: 0.30, cropId: 'cacao', cropLabel: 'Cacao', color: '#15803D', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
]

// Filtres de sélection sobres sans emojis
const CROP_FILTERS = [
  { id: 'all', label: 'Tous produits', dotColor: '#57534E', badge: '24,27 T' },
  { id: 'cacao', label: 'Cacao CCC', dotColor: '#15803D', badge: '19,31 T' },
  { id: 'cafe', label: 'Café Robusta', dotColor: '#854D0E', badge: '3,95 T' },
  { id: 'anacarde', label: 'Anacarde CCA', dotColor: '#CA8A04', badge: '1,00 T' },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [kpiData, setKpiData] = useState(null)
  const [villagesList, setVillagesList] = useState(REAL_VILLAGES_FALLBACK)
  const [activeCrop, setActiveCrop] = useState('all')

  const bordereaux = useRecoltesStore((state) => state.bordereaux)
  const fetchRecoltes = useRecoltesStore((state) => state.fetchRecoltes)

  useEffect(() => {
    fetchRecoltes()
  }, [fetchRecoltes])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const data = await apiService.getKPIs()
      if (data) {
        setKpiData(data)
      }

      // Synchronisation directe des localités depuis l'API
      const analyticsRes = await apiClient.get('/cooperative/analytics')
      if (analyticsRes.data?.overview?.ventilation_villages?.length > 0) {
        const vList = analyticsRes.data.overview.ventilation_villages.map((v) => {
          const cropInfo = normalizeCrop(v.culture, v.village)
          return {
            village: v.village === 'Attecoube' ? 'Attecoubé' : v.village === 'Soubre' ? 'Soubré' : v.village,
            tonnage: Number(((v.tonnage_total_kg || 0) / 1000).toFixed(2)),
            cropId: cropInfo.id,
            cropLabel: cropInfo.badge,
            color: cropInfo.color,
            badgeClass: cropInfo.badgeClass,
          }
        })
        setVillagesList(vList)
      }
    } catch (err) {
      console.warn('⚠️ Fetch KPIs dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Filtrage dynamique des villages selon la filière sélectionnée
  const filteredVillages = villagesList.filter((v) => {
    if (activeCrop === 'all') return true
    return v.cropId === activeCrop
  })

  const maxTonnage = Math.max(...filteredVillages.map((v) => v.tonnage), 1)

  // Métriques KPI consolidées en temps réel selon la filière active
  const liveStats = useMemo(() => {
    const totalKg = bordereaux.reduce((acc, b) => acc + (b.poidsKg || 0), 0)
    const totalBags = bordereaux.reduce((acc, b) => acc + (b.sacs || 0), 0)

    const byCrop = (cId) => {
      const s = bordereaux.filter((b) => (b.crop || 'cacao').toLowerCase() === cId)
      return {
        tonnes: (s.reduce((acc, b) => acc + (b.poidsKg || 0), 0) / 1000).toFixed(2).replace('.', ','),
        bags: s.reduce((acc, b) => acc + (b.sacs || 0), 0),
        planters: new Set(s.map((b) => b.planteur)).size,
      }
    }

    return {
      all: {
        tonnes: (totalKg / 1000).toFixed(2).replace('.', ','),
        bags: totalBags,
        planters: new Set(bordereaux.map((b) => b.planteur)).size,
      },
      cacao: byCrop('cacao'),
      cafe: byCrop('cafe'),
      anacarde: byCrop('anacarde'),
    }
  }, [bordereaux])

  let kpiTonnage = liveStats.all.tonnes
  let kpiTonnageBadge = '+14.2%'
  let kpiSacs = String(liveStats.all.bags || 485)
  let kpiSacsBadge = 'En cours'
  let kpiPlanteurs = String(liveStats.all.planters || 6)
  let kpiPlanteursBadge = '100% géolocalisés'
  let kpiAlertes = String(kpiData?.total_alerts_count || kpiData?.active_alerts_count || 12)
  let kpiAlertesBadge = 'À traiter'

  if (activeCrop === 'cacao') {
    kpiTonnage = liveStats.cacao.tonnes
    kpiTonnageBadge = '72.2% vol.'
    kpiSacs = String(liveStats.cacao.bags || 386)
    kpiSacsBadge = '1 850 F/kg CCC'
    kpiPlanteurs = String(liveStats.cacao.planters || 4)
    kpiPlanteursBadge = 'Divo, Soubré...'
    kpiAlertes = String(kpiData?.alerts_by_crop?.cacao ?? 10)
    kpiAlertesBadge = 'Pourriture & Swollen'
  } else if (activeCrop === 'cafe') {
    kpiTonnage = liveStats.cafe.tonnes
    kpiTonnageBadge = '14.8% vol.'
    kpiSacs = String(liveStats.cafe.bags || 79)
    kpiSacsBadge = '1 000 F/kg CCC'
    kpiPlanteurs = String(liveStats.cafe.planters || 1)
    kpiPlanteursBadge = 'Man'
    kpiAlertes = String(kpiData?.alerts_by_crop?.cafe ?? 1)
    kpiAlertesBadge = 'Rouille orangée'
  } else if (activeCrop === 'anacarde') {
    kpiTonnage = liveStats.anacarde.tonnes
    kpiTonnageBadge = '13.1% vol.'
    kpiSacs = String(liveStats.anacarde.bags || 170)
    kpiSacsBadge = '350 F/kg CCA'
    kpiPlanteurs = String(liveStats.anacarde.planters || 2)
    kpiPlanteursBadge = 'Abobo, Attecoubé'
    kpiAlertes = String(kpiData?.alerts_by_crop?.anacarde ?? 1)
    kpiAlertesBadge = 'Anthracnose'
  }

  // Formatage professionnel du registre des activités récentes
  const activitiesList = (kpiData?.recent_activities && kpiData.recent_activities.length > 0)
    ? kpiData.recent_activities.slice(0, 5).map((a, i) => {
        const timeStr = a.created_at
          ? new Date(a.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : '11:20'
        const planterFullName = a.planter_name || (a.first_name ? `${a.first_name} ${a.last_name || ''}`.trim() : 'Planteur')
        const isValidation = (a.title || '').toLowerCase().includes('valid')
        const isWarning = a.type === 'DISEASE_WARNING' || (a.title || '').toLowerCase().includes('alert')
        const cleanTitle = (a.title || '')
          .replace(/\.0 kg/g, ' kg')
          .replace(/1000 kg/g, '1 000 kg')

        return {
          id: a.id || `act-${i}`,
          nom: isWarning ? 'Contrôle agronomique' : planterFullName,
          action: cleanTitle,
          detail: a.subtitle || 'Bordereau homologué au registre central',
          heure: timeStr,
          statusBadge: isValidation ? 'Validé' : isWarning ? 'Alerte' : 'Pesée',
          badgeClass: isValidation
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isWarning
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-stone-100 text-stone-700 border-stone-200',
          isValidation,
          isWarning,
        }
      })
    : [
        {
          id: 'act-1',
          nom: 'Estelle Kouame',
          village: 'Soubré',
          action: 'Pesée validée • 25 sacs (1 250 kg)',
          detail: 'BDR-2026-042B • Cacao CCC Grade 1 certifié',
          heure: '15:18',
          statusBadge: 'Validé',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          isValidation: true,
        },
        {
          id: 'act-2',
          nom: 'Rosine Kouadio',
          village: 'Attecoubé',
          action: 'Pesée homologuée • 20 sacs (1 000 kg)',
          detail: 'BDR-2026-03D0 • Anacarde CCA certifié',
          heure: '14:45',
          statusBadge: 'Validé',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          isValidation: true,
        },
        {
          id: 'act-3',
          nom: 'Mamadou Traoré',
          village: 'Man',
          action: 'Réception fèves • 16 sacs (800 kg)',
          detail: 'BDR-2026-1ADB • Café Robusta CCC en cours de calibrage',
          heure: '13:30',
          statusBadge: 'En attente',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          isValidation: false,
        },
        {
          id: 'act-4',
          nom: 'Amadou Soro',
          village: 'Grand-Zattry',
          action: 'Pesée validée • 24 sacs (1 200 kg)',
          detail: 'BDR-2026-4EE2 • Taux d\'humidité 7.1%',
          heure: '11:15',
          statusBadge: 'Validé',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          isValidation: true,
        },
        {
          id: 'act-5',
          nom: 'Yao N\'Dri Jean',
          village: 'Divo',
          action: 'Pesée validée • 8 sacs (400 kg)',
          detail: 'BDR-2026-2BC0 • Virement trésorerie initié',
          heure: '09:40',
          statusBadge: 'Validé',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          isValidation: true,
        },
      ]

  return (
    <div className="min-h-full flex flex-col space-y-4 pb-12 font-sans">
      {/* 1. EN-TÊTE SOBRE AVEC FILTRES DE FILIÈRE SANS EMOJIS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={DASHBOARD_TYPO.pageTitle}>
            Tableau de bord
          </h1>
          <p className="text-[13px] text-stone-500 mt-0.5">
            Coopérative agricole CAPED • Campagne 2025-2026
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filtres de sélection épurés et professionnels */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/80 p-0.5 text-[12.5px] font-medium shadow-2xs">
            {[
    { id: 'all', label: 'Tous produits', dotColor: '#57534E', badge: `${liveStats.all.tonnes} T` },
    { id: 'cacao', label: 'Cacao CCC', dotColor: '#15803D', badge: `${liveStats.cacao.tonnes} T` },
    { id: 'cafe', label: 'Café Robusta', dotColor: '#854D0E', badge: `${liveStats.cafe.tonnes} T` },
    { id: 'anacarde', label: 'Anacarde CCA', dotColor: '#CA8A04', badge: `${liveStats.anacarde.tonnes} T` },
  ].map((f) => {
              const isActive = activeCrop === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveCrop(f.id)
                    toast.info(`Filtre actif : ${f.label}`)
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer ${isActive
                      ? 'bg-white text-stone-900 font-bold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                    }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: f.dotColor }}
                    aria-hidden="true"
                  />
                  <span>{f.label}</span>
                  <span className={`text-[10.5px] px-1.5 py-0.2 rounded font-semibold ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-stone-400'
                    }`}>
                    {f.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bouton Actualiser */}
          <button
            id="btn-refresh-dashboard"
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-[12.5px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Actualiser les données"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`}
              strokeWidth={2}
            />
            <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
          </button>

        </div>
      </div>

      {/* 2. LES 4 CARTES KPI DYNAMIQUES */}
      <section
        aria-label="Indicateurs clés"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <DashboardKpi
          id="kpi-cacao"
          label={activeCrop === 'all' ? 'Tonnage récolté' : `Tonnage ${activeCrop.toUpperCase()}`}
          value={kpiTonnage}
          unit="T"
          badge={kpiTonnageBadge}
          badgeVariant="green"
        />
        <DashboardKpi
          id="kpi-bordereaux"
          label="Sacs enregistrés"
          value={kpiSacs}
          badge={kpiSacsBadge}
          badgeVariant="amber"
        />
        <DashboardKpi
          id="kpi-planteurs"
          label="Producteurs audités"
          value={kpiPlanteurs}
          badge={kpiPlanteursBadge}
          badgeVariant="green"
        />
        <DashboardKpi
          id="kpi-alertes"
          label="Alertes sanitaires"
          value={kpiAlertes}
          badge={kpiAlertesBadge}
          badgeVariant={kpiAlertes === '0' ? 'green' : 'red'}
        />
      </section>

      {/* 3. SECTION APPORTS & VALORISATION PAR FILIÈRE : PLEINE LARGEUR (100%) */}
      <DashboardCard
        id="card-bilan-filieres"
        className="p-4 sm:p-5 flex flex-col justify-between shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-stone-100 gap-1.5">
          <div>
            <h2 className="text-[15px] font-bold text-stone-900 leading-tight">
              Apports & Valorisation par Filière
            </h2>
            <p className="text-[12px] text-stone-500">
              {activeCrop === 'all'
                ? 'Vue consolidée des 3 filières d\'activité (Cacao, Café, Anacarde)'
                : `Détail de la filière ${activeCrop.toUpperCase()} et répartition par bassin`}
            </p>
          </div>

          <span className="text-[11.5px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Barèmes officiels d'État
          </span>
        </div>

        {/* Composant des 3 filières étalé sur toute la largeur */}
        <CropIntakeOverview activeCrop={activeCrop} villages={filteredVillages} />
      </DashboardCard>

      {/* 4. RANGÉE INFÉRIEURE : RÉCOLTES PAR LOCALITÉ & DERNIÈRES ACTIVITÉS AU MÊME NIVEAU */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Colonne Gauche (7 colonnes sur 12) : Récoltes par localité */}
        <div className="lg:col-span-7 flex flex-col">
          <DashboardCard
            id="card-villages"
            className="p-4 sm:p-5 flex flex-col justify-between h-full shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-stone-100">
                <div>
                  <h2 className="text-[15px] font-bold text-stone-900 leading-tight">
                    Récoltes par localité
                  </h2>
                  <p className="text-[12px] text-stone-500">
                    Volumes collectés par bassin de production
                  </p>
                </div>
                <span className="text-[12px] text-stone-600 font-medium">
                  {filteredVillages.length} localité{filteredVillages.length > 1 ? 's' : ''} active{filteredVillages.length > 1 ? 's' : ''}
                </span>
              </div>

              <ul className="divide-y divide-stone-100 max-h-[280px] overflow-y-auto pr-1.5 scrollbar-thin">
                {filteredVillages.map((v) => {
                  const isCritical = v.village === 'Pindikro' || v.tonnage < 0.5
                  const barColor = isCritical ? '#DC2626' : (v.color || '#0F3D2E')
                  const pct = Math.max((v.tonnage / maxTonnage) * 100, 0)

                  return (
                    <li key={`${v.village}-${v.cropId}-${v.tonnage}`} className="py-2.5 flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[13px] font-semibold text-stone-900 truncate">
                        {v.village}
                      </span>
                      <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded border ${v.badgeClass || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                        {v.cropLabel}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, isCritical ? 2 : 1)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right text-[13px] font-bold text-stone-900 tabular-nums">
                        {fr(v.tonnage)} <span className="text-[11.5px] font-normal text-stone-500">T</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="pt-2 border-t border-stone-100 mt-2 text-[11px] text-stone-400 text-right">
              Mise à jour en continu pont-bascule
            </div>
          </DashboardCard>
        </div>

        {/* Colonne Droite (5 colonnes sur 12) : Dernières activités au même niveau */}
        <div className="lg:col-span-5 flex flex-col">
          <DashboardCard
            id="card-activites"
            className="p-4 sm:p-5 flex flex-col justify-between h-full shadow-2xs"
          >
            <div>
              <div className="pb-2.5 mb-2 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-stone-900 leading-tight">
                    Dernières activités
                  </h2>
                  <p className="text-[12px] text-stone-500">
                    Registre des réceptions & pesées récentes
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Flux direct
                </span>
              </div>

              {/* Flux d'opérations */}
              <div className="divide-y divide-stone-100">
                {activitiesList.map((a) => (
                  <div
                    key={a.id}
                    className="py-2.5 flex items-start gap-2.5 hover:bg-stone-50/70 transition-colors rounded-lg px-1.5"
                  >
                    {/* Icône de statut */}
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        a.isValidation
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : a.isWarning
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                      aria-hidden="true"
                    >
                      {a.isValidation ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : a.isWarning ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <p className="text-[12.5px] font-bold text-stone-900 truncate">
                            {a.nom}
                          </p>
                          {a.village && (
                            <span className="text-[10px] text-stone-500 font-medium px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200 shrink-0">
                              {a.village}
                            </span>
                          )}
                        </div>
                        <time className="shrink-0 text-[11px] tabular-nums text-stone-400 font-medium">
                          {a.heure}
                        </time>
                      </div>

                      <p className="text-[11.5px] font-medium text-stone-800 line-clamp-1 mt-0.5">
                        {a.action}
                      </p>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[10.5px] text-stone-500 truncate">
                          {a.detail}
                        </p>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${a.badgeClass || 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {a.statusBadge || 'Validé'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pied de carte discret */}
            <div className="pt-2 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] text-stone-500">
              <span>5 dernières réceptions homologuées</span>
              <span className="font-medium text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer inline-flex items-center gap-1">
                <span>Registre complet</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
