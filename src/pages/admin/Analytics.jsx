import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  ShieldAlert,
  ChevronDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Award,
  Compass,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '../../services/api'
import { ANALYTICS_DATA } from '../../data/analyticsData'
import { useRecoltesStore } from '../../store/recoltesStore'
import StarSchemaModal from '../../components/admin/StarSchemaModal'
import CropIntakeOverview from '../../components/admin/dashboard/CropIntakeOverview'
import AnalyticsKpiCard from '../../components/admin/analytics/AnalyticsKpiCard'
import Insight from '../../components/admin/analytics/Insight'
import LocalitiesBarChart from '../../components/admin/analytics/LocalitiesBarChart'
import TargetsProgressBar from '../../components/admin/analytics/TargetsProgressBar'
import ProductivityScatter from '../../components/admin/analytics/ProductivityScatter'
import WeatherDiseaseChart from '../../components/admin/analytics/WeatherDiseaseChart'
import {
  THRESHOLD_CACAO_YIELD,
  THRESHOLD_CAFE_YIELD,
  THRESHOLD_ANACARDE_YIELD,
  getCropInfo,
  normalizeCropKey,
} from '../../components/admin/analytics/constants'

const VILLAGE_FILIERE_MAP = {
  Divo: { filiere: 'Cacao (CCC)', color: '#15803D' },
  Soubré: { filiere: 'Cacao (CCC)', color: '#15803D' },
  Bodokro: { filiere: 'Cacao (CCC)', color: '#15803D' },
  Pindikro: { filiere: 'Cacao (CCC)', color: '#15803D' },
  Man: { filiere: 'Café Robusta (CCC)', color: '#854D0E' },
  Attecoubé: { filiere: 'Anacarde (CCA)', color: '#CA8A04' },
  Attecoube: { filiere: 'Anacarde (CCA)', color: '#CA8A04' },
  Abobo: { filiere: 'Anacarde (CCA)', color: '#CA8A04' },
}

function getFoyerFiliereInfo(f) {
  if (f.filiere) {
    const isAnacarde = f.filiere.toLowerCase().includes('anacarde') || f.filiere.toLowerCase().includes('cajou')
    const isCafe = f.filiere.toLowerCase().includes('caf')
    return {
      filiere: f.filiere,
      color: isAnacarde ? '#CA8A04' : isCafe ? '#854D0E' : '#15803D',
    }
  }
  const mal = (f.maladie_dominante || '').toLowerCase()
  const v = (f.village || '').toLowerCase()
  if (mal.includes('anacard') || mal.includes('cajou') || v.includes('attecoub') || v.includes('abobo')) {
    return { filiere: 'Anacarde (CCA)', color: '#CA8A04' }
  }
  if (mal.includes('caf') || v.includes('man')) {
    return { filiere: 'Café Robusta (CCC)', color: '#854D0E' }
  }
  return VILLAGE_FILIERE_MAP[f.village] || { filiere: 'Cacao (CCC)', color: '#15803D' }
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'productivity' | 'weather' | 'churn'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [data, setData] = useState(ANALYTICS_DATA)
  const [dispatched, setDispatched] = useState({})
  const tabListRef = useRef(null)

  const [loading, setLoading] = useState(false)

  const bordereaux = useRecoltesStore((state) => state.bordereaux)
  const fetchRecoltes = useRecoltesStore((state) => state.fetchRecoltes)

  useEffect(() => {
    fetchRecoltes()
  }, [fetchRecoltes])

  // Statistiques en temps réel pour l'onglet Vue d'ensemble
  const liveOverview = useMemo(() => {
    const totalKg = bordereaux.reduce((acc, b) => acc + (b.poidsKg || 0), 0)
    const totalBags = bordereaux.reduce((acc, b) => acc + (b.sacs || 0), 0)
    const totalVal = bordereaux.reduce((acc, b) => acc + (b.valeurFcfa || 0), 0)

    const approvedSlips = bordereaux.filter((b) => b.statut === 'Validé')
    const approvedKg = approvedSlips.reduce((acc, b) => acc + (b.poidsKg || 0), 0)
    const approvedBags = approvedSlips.reduce((acc, b) => acc + (b.sacs || 0), 0)
    const approvedVal = approvedSlips.reduce((acc, b) => acc + (b.valeurFcfa || 0), 0)

    const approvedPct = totalKg > 0 ? Math.round((approvedKg / totalKg) * 100) : 100
    const resteDu = Math.max(0, totalVal - approvedVal)
    const pctPaye = totalVal > 0 ? (approvedVal / totalVal * 100).toFixed(1).replace('.', ',') : '100'

    return {
      totalTonnes: (totalKg / 1000).toFixed(2).replace('.', ','),
      totalBags: totalBags || 485,
      approvedTonnes: (approvedKg / 1000).toFixed(2).replace('.', ','),
      approvedPct,
      approvedBags: approvedBags || 388,
      totalVal: totalVal || 40033900,
      approvedVal: approvedVal || 31647350,
      resteDu,
      pctPaye,
    }
  }, [bordereaux])

  // Fetch API dynamique Neon avec protection complete
  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/cooperative/analytics')
      if (res.data) {
        console.log('✅ [CoopIA Analytics] Données Neon reçues avec succès:', res.data)
        const sw = (res.data.sanitary_weather || []).map((item) => ({
          ...item,
          pluviometrie_mm: item.pluviometrie_moyenne_mm ?? item.pluviometrie_mm ?? 0,
          mois: (item.mois || '').split(' ')[0],
        }))

        const prod = (res.data.productivity || []).map((item) => {
          const kg = item.tonnage_livre_kg ?? (item.tonnage_livre_tonnes ? Number(item.tonnage_livre_tonnes) * 1000 : 0)
          const tonnes = Number((kg / 1000).toFixed(2))
          const fullName = item.nom_complet || (item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : (item.name || 'Planteur'))
          const vNorm = (item.village || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const defaultSup = vNorm.includes('attecoub') ? 2.0 : 2.5
          const sup = item.superficie_ha && Number(item.superficie_ha) > 0 ? Number(item.superficie_ha) : defaultSup
          const rend = item.rendement_moyen_kg_ha ?? item.rendement_kg_ha ?? (sup > 0 ? Math.round(kg / sup) : 0)
          return {
            ...item,
            id: item.id || item.planter_id,
            nom_complet: fullName,
            superficie_ha: sup,
            tonnage_livre_tonnes: tonnes,
            tonnage_livre_kg: kg,
            rendement_kg_ha: rend,
          }
        })

        const TARGETS_MAP = {
          'Divo': 10.0,
          'Soubré': 8.0,
          'Bodokro': 5.5,
          'Man': 5.0,
          'Attecoubé': 2.0,
          'Attecoube': 2.0,
          'Pindikro': 2.5,
        }

        const villages = (res.data.overview?.ventilation_villages || []).map((v) => {
          const kg = v.tonnage_total_kg ?? v.tonnage_kg ?? 0
          const tonnes = Number((kg / 1000).toFixed(2))
          const cible = v.cible_tonnes ?? TARGETS_MAP[v.village] ?? Math.max(Math.round((v.superficie_ha || 2) * 2), 2.5)
          const pct = v.realisation_pct ?? (cible > 0 ? Math.min(Math.round((tonnes / cible) * 100), 100) : 0)
          return {
            ...v,
            tonnage_kg: kg,
            tonnage_tonnes: tonnes,
            cible_tonnes: cible,
            realisation_pct: pct,
          }
        })

        const churn = (res.data.churn_matrix || []).map((item) => {
          const rend = item.superficie_ha > 0 ? Math.round((item.tonnage_livre_kg || 0) / item.superficie_ha) : 0
          return {
            ...item,
            id: item.id || item.planter_id,
            rendement_kg_ha: rend,
            can_dispatch: item.risk_level === 'CRITIQUE' || (item.risk_score && item.risk_score >= 50),
          }
        })

        setData((prev) => ({
          ...prev,
          ...res.data,
          sanitary_weather: sw.length > 0 ? sw : prev.sanitary_weather,
          productivity: prod.length > 0 ? prod : prev.productivity,
          churn_matrix: churn.length > 0 ? churn : prev.churn_matrix,
          foyers_villages: (res.data.foyers_villages && res.data.foyers_villages.length > 0) ? res.data.foyers_villages : prev.foyers_villages,
          overview: {
            ...prev.overview,
            ...res.data.overview,
            filieres: (res.data.overview?.filieres && res.data.overview.filieres.length > 0) ? res.data.overview.filieres : (res.data.filieres || prev.overview.filieres),
            ventilation_villages: villages.length > 0 ? villages : prev.overview.ventilation_villages,
          },
        }))
      }
    } catch (err) {
      console.warn('⚠️ [CoopIA Analytics] Bascule mode local / demo:', err?.message || err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleDispatchDelegate = (planterName, village, actionType = 'DISPATCH_ANADER') => {
    setDispatched((prev) => ({ ...prev, [planterName]: true }))
    if (actionType === 'AUDIT_GPS') {
      toast.success(`Ordre de mission GPS généré pour ${planterName} (${village})`, {
        description: 'Audit de bornage de parcelle et vérification cadastrale notifiés au technicien.',
      })
    } else {
      toast.success(`Délégation d'urgence créée pour ${planterName} (${village})`, {
        description: 'Conseiller ANADER dépêché et proposition d’avance financière CCC initiée.',
      })
    }
  }

  // Configuration des onglets avec sémantique
  const TABS = [
    { id: 'overview', label: "1. Vue d'ensemble", icon: BarChart3 },
    { id: 'productivity', label: '2. Rendement & Superficie', icon: TrendingUp },
    { id: 'weather', label: '3. Météo & Risques', icon: CloudRain },
    { id: 'churn', label: '4. Matrice de Décrochage', icon: ShieldAlert },
  ]

  // Navigation clavier fléchée (WAI-ARIA)
  const handleTabKeyDown = (e, index) => {
    let nextIndex = null
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length
    }
    if (nextIndex !== null) {
      e.preventDefault()
      const nextTab = TABS[nextIndex]
      setActiveTab(nextTab.id)
      const btn = tabListRef.current?.querySelector(`#tab-button-${nextTab.id}`)
      btn?.focus()
    }
  }

  // Tri des foyers d'infection par niveau de gravité
  const getFoyerWeight = (niveau) => {
    const n = String(niveau || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (n.includes('ELEV')) return 3
    if (n.includes('MODER')) return 2
    return 1
  }

  const sortedFoyers = [...(data.foyers_villages || [])].sort((a, b) => {
    return getFoyerWeight(b.niveau) - getFoyerWeight(a.niveau)
  })

  // Génération 100% dynamique du texte d'analyse des tonnages
  const dynamicTonnageInsight = useMemo(() => {
    const vList = data?.overview?.ventilation_villages || []
    if (vList.length === 0) return "Collecte en cours d'initialisation sur les bassins sociétaires."

    const cacaoVillages = vList.filter((v) => (v.culture || 'cacao').toLowerCase().includes('cacao'))
    const totalCacaoKg = cacaoVillages.reduce((sum, v) => sum + (v.tonnage_total_kg || 0), 0)
    const sortedCacao = [...cacaoVillages].sort((a, b) => (b.tonnage_total_kg || 0) - (a.tonnage_total_kg || 0))
    const top2Cacao = sortedCacao.slice(0, 2)
    const top2Kg = top2Cacao.reduce((sum, v) => sum + (v.tonnage_total_kg || 0), 0)
    const top2Pct = totalCacaoKg > 0 ? Math.round((top2Kg / totalCacaoKg) * 100) : 0
    const top2Desc = top2Cacao.map((v) => `${v.village} (${((v.tonnage_total_kg || 0) / 1000).toFixed(2).replace('.', ',')} T)`).join(' et ')

    const cafeVillages = vList.filter((v) => (v.culture || '').toLowerCase().includes('caf'))
    const totalCafeT = (cafeVillages.reduce((sum, v) => sum + (v.tonnage_total_kg || 0), 0) / 1000).toFixed(2).replace('.', ',')

    const anacardeVillages = vList.filter((v) => (v.culture || '').toLowerCase().includes('anacard'))
    const totalAnacardeT = (anacardeVillages.reduce((sum, v) => sum + (v.tonnage_total_kg || 0), 0) / 1000).toFixed(2).replace('.', ',')
    const anacardeNames = anacardeVillages.map((v) => v.village).join(' et ')

    return `${top2Desc || 'Divo et Soubré'} portent ${top2Pct}% de la production Cacao ; Man apporte ${totalCafeT} T de Café Robusta et ${anacardeNames || 'Abobo et Attecoubé'} totalisent ${totalAnacardeT} T d'Anacarde.`
  }, [data?.overview?.ventilation_villages])

  // Génération 100% dynamique du texte d'analyse des cibles de collecte
  const { dynamicTargetInsight, dynamicGlobalTargetPct } = useMemo(() => {
    const vList = data?.overview?.ventilation_villages || []
    if (vList.length === 0) return { dynamicTargetInsight: "Suivi consolidé de réalisation des objectifs de campagne.", dynamicGlobalTargetPct: 81 }

    let totalTonnes = 0
    let totalCibles = 0

    const withPct = vList.map((v) => {
      const tonnage = (v.tonnage_total_kg || 0) / 1000
      const isAnacarde = (v.culture || '').toLowerCase().includes('anacard') || (v.village || '').toLowerCase().includes('attecoub')
      const cible = isAnacarde ? (tonnage > 3 ? 8.0 : 2.0) : 2.5
      totalTonnes += tonnage
      totalCibles += cible
      const pct = Math.round((tonnage / cible) * 100)
      return { ...v, pct }
    })

    const globalPct = totalCibles > 0 ? Math.round((totalTonnes / totalCibles) * 100) : 81
    const high = withPct.filter((v) => v.pct >= 80).sort((a, b) => b.pct - a.pct)
    const low = withPct.filter((v) => v.pct < 60).sort((a, b) => a.pct - b.pct)

    const highDesc = high.length > 0
      ? high.map((v) => `${v.village} (${v.pct}%)`).join(' et ') + " dépassent le cap des 80%"
      : "Progression active des collectes"

    const lowDesc = low.length > 0
      ? low.map((v) => `${v.village} (${v.pct}%)`).join(' et ') + " nécessitent un suivi renforcé du calendrier de livraison"
      : "tous les bassins respectent leurs engagements"

    return {
      dynamicTargetInsight: `${highDesc} ; ${lowDesc}.`,
      dynamicGlobalTargetPct: globalPct,
    }
  }, [data?.overview?.ventilation_villages])

  // Génération dynamique et contextuelle du message d'analyse météo & sanitaire
  const weatherInsight = useMemo(() => {
    const list = data.sanitary_weather || []
    if (list.length === 0) {
      return {
        variant: 'info',
        text: 'Données météorologiques et sanitaires en cours de synchronisation...',
      }
    }

    const latest = list[list.length - 1]
    const rawMois = (latest.mois_nom || latest.mois || '').split(' ')[0]
    let latestMonth = rawMois
    if (rawMois.startsWith('Ao')) latestMonth = 'Août'
    else if (rawMois.startsWith('Juil')) latestMonth = 'Juillet'
    else if (rawMois.startsWith('Sept')) latestMonth = 'Septembre'
    else if (rawMois.startsWith('Oct')) latestMonth = 'Octobre'
    else if (rawMois.startsWith('Nov')) latestMonth = 'Novembre'
    else if (rawMois.startsWith('Dec') || rawMois.startsWith('D')) latestMonth = 'Décembre'

    const latestCases = latest.diagnostics_count || 0

    // Mois ayant dépassé le seuil critique de saturation (> 100 mm)
    const heavyRainMonths = list.filter((m) => {
      const mm = m.pluviometrie_mm ?? m.pluviometrie_moyenne_mm ?? 0
      return mm >= 100
    })

    if (heavyRainMonths.length > 0 && latestCases >= 3) {
      const rainDesc = heavyRainMonths
        .map((m) => {
          const raw = (m.mois_nom || m.mois || '').split(' ')[0]
          let mName = raw
          if (raw.startsWith('Ao')) mName = 'Août'
          else if (raw.startsWith('Juil')) mName = 'Juillet'
          else if (raw.startsWith('Sept')) mName = 'Septembre'
          else if (raw.startsWith('Oct')) mName = 'Octobre'
          else if (raw.startsWith('Nov')) mName = 'Novembre'
          else if (raw.startsWith('Dec') || raw.startsWith('D')) mName = 'Décembre'
          const mm = Math.round(m.pluviometrie_mm ?? m.pluviometrie_moyenne_mm ?? 0)
          return `${mName} (${mm} mm)`
        })
        .join(' et ')

      return {
        variant: 'danger',
        text: `Alerte saturation pluviométrique : Les fortes précipitations de ${rainDesc} créent des conditions favorables au développement des foyers infectieux en ${latestMonth} (${latestCases} diagnostics recensés).`,
      }
    }

    if (latestCases > 0) {
      return {
        variant: 'warning',
        text: `Vigilance phytosanitaire : ${latestCases} diagnostic(s) actif(s) recensé(s) en ${latestMonth}. Poursuivre les traitements curatifs et le ramassage sanitaire des cabosses.`,
      }
    }

    return {
      variant: 'info',
      text: `Conditions météorologiques stables en ${latestMonth} (0 foyer infectieux critique). Poursuivre la surveillance de routine et le calendrier de fertilisation.`,
    }
  }, [data.sanitary_weather])

  // Filières consolidées
  const filieresList = data.overview?.filieres || ANALYTICS_DATA.overview.filieres

  return (
    <div className="min-h-full flex flex-col space-y-4 pb-12 font-sans">
      {/* 1. EN-TÊTE SOBRE ET TAILLÉ SUR MESURE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold text-stone-900 flex items-center gap-2.5 leading-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F3D2E] text-white shrink-0">
                <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              Analyses décisionnelles & BI
            </h1>

          </div>
          <p className="text-[13px] text-stone-500 mt-0.5 leading-tight">
            Pilotage stratégique de la coopérative CAPED
          </p>
        </div>

        {/* Actions compactes à droite */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-refresh-analytics"
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-[12.5px] font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Actualiser les données en direct"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} strokeWidth={2} />
            <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
          </button>

          <div
            id="campaign-selector"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-800 shadow-2xs select-none tabular-nums"
          >
            <span>Campagne 2025 - 2026</span>
          </div>

          <button
            id="btn-open-schema-modal"
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#0F3D2E] hover:bg-[#154734] px-3.5 text-[13px] font-medium text-white shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D2E]/40"
          >
            <Layers className="h-4 w-4 text-emerald-300" strokeWidth={1.75} aria-hidden="true" />
            <span>Modèle en Étoile & DAX</span>
          </button>
        </div>
      </div>

      {/* 2. ONGLETS EN SOULIGNEMENT */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Sections décisionnelles"
        className="flex border-b border-stone-200 h-10 gap-6 shrink-0 overflow-x-auto scrollbar-none"
      >
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex items-center gap-2 h-full pb-0.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:text-stone-900 ${isActive
                ? 'border-[#0F3D2E] text-[#0F3D2E]'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================================= */}
      {/* 3. ONGLET 1 : VUE D'ENSEMBLE (MULTI-FILIÈRES & VALEUR)    */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div
          id="tabpanel-overview"
          role="tabpanel"
          aria-labelledby="tab-button-overview"
          className="flex flex-col space-y-4"
        >
          {/* Rangée 1 : 4 cartes KPI consolidées en direct avec le registre des récoltes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <AnalyticsKpiCard
              label="Tonnage Récolté"
              value={liveOverview.totalTonnes}
              unit="T"
              badgeText={`${liveOverview.totalBags} sacs`}
              badgeVariant="neutral"
              secondaryText="Volume total réceptionné"
            />

            <AnalyticsKpiCard
              label="Tonnage Validé"
              value={liveOverview.approvedTonnes}
              unit="T"
              badgeText={`${liveOverview.approvedPct}% pesé`}
              badgeVariant="good"
              secondaryText={`${liveOverview.approvedBags} sacs certifiés conformes`}
              highlightColor="text-emerald-800"
            />

            <AnalyticsKpiCard
              label="Valeur Récoltes"
              value={liveOverview.totalVal.toLocaleString('fr-FR')}
              unit="FCFA"
              badgeText="Tarif CCC/CCA"
              badgeVariant="good"
              secondaryText="Valorisation garantie d'État"
            />

            <AnalyticsKpiCard
              label="Trésorerie Réglée"
              value={liveOverview.approvedVal.toLocaleString('fr-FR')}
              unit="FCFA"
              badgeText={`${liveOverview.pctPaye}% payé`}
              badgeVariant="good"
              secondaryText={liveOverview.resteDu > 0 ? `Reste dû : ${liveOverview.resteDu.toLocaleString('fr-FR')} FCFA` : '100% soldé et payé aux planteurs'}
              highlightColor="text-emerald-800"
            />
          </div>

          {/* Rangée 2 : Apports & Valorisation par Filière (Identique au Dashboard) */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-stone-100 gap-1.5">
              <div>
                <h2 className="text-[15px] font-bold text-stone-900 leading-tight">
                  Apports & Valorisation par Filière
                </h2>
                <p className="text-[12px] text-stone-500">
                  Vue consolidée des 3 filières d'activité (Cacao, Café, Anacarde)
                </p>
              </div>

              <span className="text-[11.5px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Barèmes officiels d'État
              </span>
            </div>

            <CropIntakeOverview activeCrop="all" />
          </div>

          {/* Rangée 3 : Graphiques Localités & Avancement */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
            {/* Graphique 1 : Tonnage par Localité */}
            <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs h-full">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 leading-tight">
                      Tonnage par Localité & Filière Dominante
                    </h3>
                    <p className="text-[12px] text-stone-500">{(data.overview?.ventilation_villages?.length || 6)} zones de collecte</p>
                  </div>
                </div>

                <div className="mt-2 max-h-[270px] overflow-y-auto pr-1.5 scrollbar-thin">
                  <LocalitiesBarChart data={data.overview.ventilation_villages} />
                </div>
              </div>

              {/* Encart d'analyse Insight sobre */}
              <div className="mt-2 pt-2 border-t border-stone-100">
                <Insight variant="info">{dynamicTonnageInsight}</Insight>
              </div>
            </div>

            {/* Graphique 2 : Cibles de Récolte */}
            <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs h-full">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 leading-tight">
                      Cibles de Collecte & Taux de Réalisation
                    </h3>
                    <p className="text-[12px] text-stone-500">Avancement consolidé de campagne</p>
                  </div>
                  <span className="text-[12px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {`Objectif global ${dynamicGlobalTargetPct}%`}
                  </span>
                </div>

                <div className="mt-2 max-h-[270px] overflow-y-auto pr-1.5 scrollbar-thin">
                  <TargetsProgressBar data={data.overview.ventilation_villages} />
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-100">
                <Insight variant="warning">{dynamicTargetInsight}</Insight>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ONGLET 2 : RENDEMENT & SUPERFICIE (MULTI-FILIÈRES)     */}
      {/* ========================================================= */}
      {activeTab === 'productivity' && (
        <div
          id="tabpanel-productivity"
          role="tabpanel"
          aria-labelledby="tab-button-productivity"
          className="flex flex-col space-y-4"
        >
          {/* 1. GRAPHIQUE SVG PLEINE LARGEUR (12 COLONNES) */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-stone-100 gap-1.5 shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 leading-tight">
                  Productivité : Superficie (ha) vs Tonnage (T)
                </h3>
                <p className="text-[12px] text-stone-500">
                  Seuils agronomiques officiels : Cacao (800 kg/ha), Café (700 kg/ha), Cajou (550 kg/ha)
                </p>
              </div>
            </div>

            {/* Tracé SVG mesuré avec toute la largeur disponible */}
            <div className="w-full min-h-[300px] h-[330px] relative my-2">
              <ProductivityScatter data={data.productivity} />
            </div>

            {/* Encart Insight */}
            <div className="pt-2 border-t border-stone-100 shrink-0">
              <Insight variant="info">{dynamicTonnageInsight}</Insight>
            </div>
          </div>

          {/* 2. TABLEAU DE BENCHMARKING PLEINE LARGEUR (AU-DESSOUS) */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-stone-100 gap-1.5 shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 leading-tight">
                  Benchmarking Agronomique par Planteur
                </h3>
                <p className="text-[12px] text-stone-500">
                  Comparaison du rendement réel (kg/ha) face au seuil d'État officiel de chaque filière
                </p>
              </div>
              <span className="text-[11.5px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                {(data.productivity || []).length} parcelles évaluées
              </span>
            </div>

            <div className="overflow-x-auto max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-stone-50/95 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Planteur</th>
                    <th className="py-2.5 px-3">Bassin & Filière</th>
                    <th className="py-2.5 px-3 text-center">Superficie</th>
                    <th className="py-2.5 px-3 text-right">Tonnage Livré</th>
                    <th className="py-2.5 px-3 text-right">Rendement Réel</th>
                    <th className="py-2.5 px-3 text-center">Seuil Officiel</th>
                    <th className="py-2.5 px-3 text-right">Écart / Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[13px] text-stone-700">
                  {(data.productivity || []).map((p, idx) => {
                    const crop = getCropInfo(p.culture || p.crop_type)
                    const kg = p.tonnage_livre_kg ?? (p.tonnage_livre_tonnes ? Number(p.tonnage_livre_tonnes) * 1000 : 0)
                    const tonnes = p.tonnage_livre_tonnes ?? Number((kg / 1000).toFixed(2))
                    const sup = Number(p.superficie_ha || 2.0)
                    const rend = Number(p.rendement_kg_ha ?? (sup > 0 ? Math.round(kg / sup) : 0))
                    const diffPct = Math.round(((rend - crop.threshold_yield) / crop.threshold_yield) * 100)
                    const isOptimal = rend >= crop.threshold_yield
                    const isVigilance = rend >= 400 && !isOptimal

                    return (
                      <tr key={p.id || p.planter_id || idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-stone-900 leading-snug">{p.nom_complet}</p>
                          <p className="text-[11px] text-stone-400">{p.telephone || 'Membre CAPED'}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-stone-800">{p.village}</span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                              style={{ backgroundColor: crop.bg, color: crop.text, borderColor: crop.border }}
                            >
                              {crop.shortLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums font-semibold text-stone-800">
                          {sup} ha
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-stone-900">
                          {tonnes.toFixed(2)} T
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-stone-900">
                          {rend.toLocaleString('fr-FR')} <span className="text-[11px] font-normal text-stone-500">kg/ha</span>
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums text-stone-500 text-[12px]">
                          {crop.threshold_yield} kg/ha
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isOptimal
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isVigilance
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {isOptimal ? `+${diffPct}% Optimal` : isVigilance ? `${diffPct}% Vigilance` : `${diffPct}% Critique`}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ONGLET 3 : MÉTÉO & RISQUES SANITAIRES                  */}
      {/* ========================================================= */}
      {activeTab === 'weather' && (
        <div
          id="tabpanel-weather"
          role="tabpanel"
          aria-labelledby="tab-button-weather"
          className="flex flex-col space-y-4"
        >
          {/* 1. GRAPHIQUE CORRÉLATION (PLEINE LARGEUR - 100%) */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-stone-100 gap-2 shrink-0">
              <div>
                <h3 className="text-[15px] font-semibold text-stone-900 leading-tight">
                  Corrélation : Pluviométrie vs Épidémies Phytosanitaires
                </h3>
                <p className="text-[12px] text-stone-500">
                  Précipitations mensuelles et dynamique d'apparition des maladies (Cacao, Café & Anacarde)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 text-[11.5px] font-medium shrink-0">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#64748B]" />
                  <span>Pluie (&lt; 100 mm)</span>
                </span>
                <span className="flex items-center gap-1.5 text-stone-700">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#475569]" />
                  <span>Saturation (&gt; 100 mm)</span>
                </span>
                <span className="flex items-center gap-1.5 text-stone-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                  <span>Diagnostics actifs</span>
                </span>
              </div>
            </div>

            {/* Conteneur graphique pleine largeur 300px */}
            <div className="h-[300px] w-full relative my-2">
              <WeatherDiseaseChart data={data.sanitary_weather} />
            </div>

            <div className="pt-2.5 border-t border-stone-100 shrink-0">
              <Insight variant={weatherInsight.variant}>
                {weatherInsight.text}
              </Insight>
            </div>
          </div>

          {/* 2. FOYERS ÉPIDÉMIQUES & PROTOCOLES SANITAIRES (DESCENDU EN PLEINE LARGEUR AVEC GRILLE 3 COLONNES) */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-stone-100 gap-2 shrink-0">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-stone-900 leading-tight">
                    Foyers Épidémiques & Protocoles Sanitaires
                  </h3>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
                    {sortedFoyers.length} bassins surveillés
                  </span>
                </div>
                <p className="text-[12px] text-stone-500">
                  Surveillance terrain en direct et traitements prescrits par section coopérative
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-medium text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-md">
                  Recommandations officielles ANADER & CCC
                </span>
              </div>
            </div>

            {/* Grille de cartes ergonomique (1 col mobile, 2 col tablette, 3 col desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3.5">
              {sortedFoyers.map((f, i) => {
                const info = getFoyerFiliereInfo(f)
                const isCritique = f.niveau === 'ÉLEVÉ' || f.niveau === 'ÉLEVÉ' || f.cas_actifs >= 4
                const isModere = f.niveau === 'MODÉRÉ' || f.cas_actifs > 0

                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                      isCritique
                        ? 'border-rose-200 bg-rose-50/20'
                        : isModere
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white'
                    }`}
                  >
                    {/* En-tête de carte */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-[14px]">{f.village}</span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                            style={{
                              color: info.color,
                              borderColor: `${info.color}35`,
                              backgroundColor: `${info.color}10`,
                            }}
                          >
                            {info.filiere}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold whitespace-nowrap ${f.badge_bg}`}>
                        {f.niveau} ({f.cas_actifs} cas)
                      </span>
                    </div>

                    {/* Détail pathogène & protocole d'action */}
                    <div className="space-y-1.5 text-[12px]">
                      <p className="text-stone-800">
                        <span className="font-semibold text-stone-900">Pathogène dominant :</span>{' '}
                        <span className={f.cas_actifs > 0 ? 'font-semibold text-rose-700' : 'text-stone-600'}>
                          {f.maladie_dominante}
                        </span>
                      </p>
                      <p className="text-stone-600 text-[11.5px] leading-relaxed">
                        <span className="font-semibold text-stone-900">Action requise :</span> {f.actions}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ONGLET 4 : MATRICE DE DÉCROCHAGE (ANTI-CHURN PLANTEURS)*/}
      {/* ========================================================= */}
      {activeTab === 'churn' && (
        <div
          id="tabpanel-churn"
          role="tabpanel"
          aria-labelledby="tab-button-churn"
          className="flex-1 min-h-0 flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-2xs"
        >
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-stone-100 gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-stone-900 leading-tight">
                  Matrice de Décrochage & Risques d'Attrition Planteurs
                </h3>
                <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                  Algorithme Prédictif Anti-Fuite
                </span>
              </div>
              <p className="text-[12px] text-stone-500">
                Pondération des écarts de production et des seuils agronomiques spécifiques à chaque filière
              </p>
            </div>

            <div className="rounded-lg bg-rose-50 border border-rose-200/70 px-2.5 py-1 text-[11.5px] text-rose-900 font-semibold flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" strokeWidth={1.75} />
              <span>1 Producteur en Risque Critique (Estelle Kouame)</span>
            </div>
          </div>

          {/* Tableau pleine largeur */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-2">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-stone-50/90 backdrop-blur-xs text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Score Risque</th>
                  <th className="py-2.5 px-3">Planteur & Filière</th>
                  <th className="py-2.5 px-3">Superficie & Tonnage</th>
                  <th className="py-2.5 px-3">Facteurs d'Influence Clés</th>
                  <th className="py-2.5 px-3 text-right">Action Décisionnelle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[13px] text-stone-700">
                {data.churn_matrix.map((p) => {
                  const crop = getCropInfo(p.culture || p.crop_type)
                  const isCritical = p.risk_level === 'CRITIQUE'
                  const isModerate = p.risk_level === 'MODÉRÉ'
                  const hasDispatched = dispatched[p.nom_complet]

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${isCritical ? 'bg-rose-50/30 hover:bg-rose-50/50' : isModerate ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-stone-50/60'
                        }`}
                    >
                      {/* Score Risque */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[15px] font-bold tabular-nums text-stone-900 w-10">
                            {p.risk_score} %
                          </span>
                          <div className="h-1.5 w-16 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${p.risk_score}%`,
                                backgroundColor: isCritical ? '#DC2626' : isModerate ? '#D97706' : '#15803D',
                              }}
                            />
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10.5px] font-bold border ${p.badge_color}`}
                          >
                            {p.risk_level}
                          </span>
                        </div>
                      </td>

                      {/* Planteur & Filière */}
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-stone-900 leading-snug">{p.nom_complet}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11.5px] text-stone-500">{p.village}</span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: crop.bg, color: crop.text }}
                          >
                            {crop.icon} {crop.shortLabel}
                          </span>
                        </div>
                      </td>

                      {/* Superficie & Tonnage */}
                      <td className="py-2.5 px-3 tabular-nums">
                        <p className="font-semibold text-stone-900">
                          {p.superficie_ha} ha • {p.tonnage_livre_kg ? (p.tonnage_livre_kg / 1000).toFixed(2) : 0} T
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Rendement : {p.rendement_kg_ha || 0} kg/ha (seuil {crop.threshold_yield})
                        </p>
                      </td>

                      {/* Facteurs d'influence */}
                      <td className="py-2.5 px-3">
                        <ul className="space-y-0.5">
                          {(p.facteurs_influence || []).slice(0, 2).map((f, fi) => (
                            <li key={fi} className="text-[11.5px] text-stone-600 flex items-start gap-1">
                              <span className="text-stone-400">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Action préventive */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {isCritical ? (
                          <button
                            type="button"
                            onClick={() => handleDispatchDelegate(p.nom_complet, p.village, 'DISPATCH_ANADER')}
                            disabled={hasDispatched}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-2xs transition-all cursor-pointer ${hasDispatched
                              ? 'bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                              }`}
                          >
                            <Zap className="h-3 w-3" />
                            <span>{hasDispatched ? 'Délégué ANADER en route' : 'Dépêcher ANADER & Avance CCC'}</span>
                          </button>
                        ) : isModerate ? (
                          <button
                            type="button"
                            onClick={() => handleDispatchDelegate(p.nom_complet, p.village, 'AUDIT_GPS')}
                            disabled={hasDispatched}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-2xs transition-all cursor-pointer ${hasDispatched
                              ? 'bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                              }`}
                          >
                            <Compass className="h-3 w-3" />
                            <span>{hasDispatched ? 'Audit GPS planifié' : 'Déclencher audit GPS'}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Adhérent fidèle</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DU MODÈLE EN ÉTOILE & FORMULES DAX */}
      <StarSchemaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        daxFormulas={data.dax_formulas}
      />
    </div>
  )
}
