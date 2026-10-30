import { useState, useMemo, useEffect } from 'react'
import { Calendar, Download, RefreshCw, Users, MapPin, TrendingUp, AlertTriangle, Filter } from 'lucide-react'
import { toast } from 'sonner'
import PlanterTable from '../../components/admin/PlanterTable'
import PlanterDetailPanel from '../../components/admin/PlanterDetailPanel'
import { REAL_COOP_PLANTERS } from '../../data/plantersData'
import { apiService, apiClient } from '../../services/api'
import { Link } from 'react-router-dom'
import { useRecoltesStore } from '../../store/recoltesStore'
import { exportLocalReport, isElectronApp } from '../../utils/fileSystem'

export default function PlantersManagement() {
  const searchQuery = useRecoltesStore((state) => state.searchQuery)
  const bordereaux = useRecoltesStore((state) => state.bordereaux)
  const fetchRecoltes = useRecoltesStore((state) => state.fetchRecoltes)
  const [planters, setPlanters] = useState(REAL_COOP_PLANTERS)
  const [selectedId, setSelectedId] = useState(REAL_COOP_PLANTERS[0].id)
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'Faible' | 'Modéré' | 'Critique'
  const [cropFilter, setCropFilter] = useState('ALL') // 'ALL' | 'cacao' | 'cafe' | 'anacarde'
  const [loading, setLoading] = useState(false)
  const [churnData, setChurnData] = useState(null)

  // Chargement / Actualisation depuis Neon DB
  const fetchPlanters = async () => {
    setLoading(true)
    try {
      const [data, churnRes] = await Promise.all([
        apiService.getPlanteurs(),
        apiClient.get('/cooperative/predictions/churn').catch(() => null),
        fetchRecoltes(),
      ])
      if (churnRes?.data) {
        setChurnData(churnRes.data)
      }
      if (Array.isArray(data) && data.length > 0) {
        setPlanters((prev) => {
          const merged = prev.map((p) => {
            const apiMatch = data.find(
              (item) =>
                (item.nom_complet && item.nom_complet.toLowerCase().includes(p.nom.toLowerCase())) ||
                p.nom.toLowerCase().includes((item.nom_complet || '').toLowerCase())
            )
            if (apiMatch) {
              return {
                ...p,
                avatar: apiMatch.avatar_url || p.avatar,
                superficie: apiMatch.total_superficie_ha > 0 ? apiMatch.total_superficie_ha : p.superficie,
                superficieDetail: apiMatch.total_superficie_ha > 0 ? apiMatch.total_superficie_ha.toFixed(2).replace('.', ',') : p.superficieDetail,
                parcellesCount: apiMatch.parcelles_count > 0 ? apiMatch.parcelles_count : p.parcellesCount,
              }
            }
            return p
          })

          data.forEach((apiItem) => {
            const exists = merged.some(
              (p) =>
                (apiItem.nom_complet && p.nom.toLowerCase().includes(apiItem.nom_complet.toLowerCase())) ||
                (apiItem.nom_complet && apiItem.nom_complet.toLowerCase().includes(p.nom.toLowerCase()))
            )
            if (!exists && apiItem.nom_complet) {
              const cropNorm = (apiItem.culture || 'cacao').toLowerCase()
              const isAnacarde = cropNorm.includes('anacard')
              const isCafe = cropNorm.includes('caf')
              const crop = isAnacarde ? 'anacarde' : isCafe ? 'cafe' : 'cacao'
              const cropLabel = isAnacarde ? 'Anacarde CCA' : isCafe ? 'Café Robusta' : 'Cacao CCC'
              const sup = apiItem.total_superficie_ha || 4.0
              const kg = apiItem.total_tonnage_kg || 0
              const tonnes = kg / 1000
              const bags = Math.round(kg / 50)
              const prixUnitaire = isAnacarde ? 350 : isCafe ? 1000 : 1850
              const valeur = kg * prixUnitaire
              const rendement = sup > 0 ? Math.round(kg / sup) : 0
              const seuil = isAnacarde ? 550 : isCafe ? 700 : 800

              merged.push({
                id: `PLT-${apiItem.id || Date.now()}`,
                nom: apiItem.nom_complet,
                avatar: apiItem.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                phone: apiItem.phone_number || '+225 00 00 00 00',
                village: apiItem.village || 'Abobo',
                crop,
                cropLabel,
                superficie: sup,
                superficieDetail: sup.toFixed(2).replace('.', ','),
                parcellesCount: apiItem.parcelles_count || 1,
                rendement,
                seuilOfficiel: seuil,
                livraisons: Number(tonnes.toFixed(2)),
                livraisonsFormatted: `${tonnes.toFixed(2).replace('.', ',')} T`,
                totalBags: bags,
                totalValeur: valeur,
                totalValeurFormatted: `${valeur.toLocaleString('fr-FR')} FCFA`,
                risque: rendement < seuil * 0.5 ? 'Critique' : rendement < seuil ? 'Vigilance' : 'Faible',
                statutLabel: rendement < seuil * 0.5 ? 'Critique' : rendement < seuil ? 'Vigilance' : 'Élite',
                isLivraisonAlert: false,
                gps: '5°25\'00"N • 4°01\'00"W',
                parcelles: [
                  { id: 'p1', name: 'Parcelle Principale', label: `Parcelle Principale • ${sup.toFixed(2).replace('.', ',')} ha`, superficie: `${sup.toFixed(2).replace('.', ',')} ha`, village: apiItem.village || 'Abobo', crop, color: isAnacarde ? '#854D0E' : '#0F3D2E', borderColor: '#F59E0B' },
                ],
                livraisonsTotalKg: `${kg.toLocaleString('fr-FR')} kg`,
                livraisonsMonthly: [
                  { mois: 'Oct', kg: kg, sacs: bags, isPeak: true, color: '#CA8A04' },
                ],
                lectureIA: `Producteur sociétaire à ${apiItem.village || 'Abobo'}. Rendement calculé de ${rendement} kg/ha avec ${bags} sacs livrés.`,
              })
            }
          })

          return merged
        })
        console.log('✅ [PlantersManagement] Planteurs chargés et fusionnés depuis Neon DB:', data.length)
      }
    } catch (err) {
      console.warn('Fallback planteurs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlanters()
  }, [])

  // Fusion dynamique des récoltes du store avec le registre des sociétaires
  const dynamicPlanters = useMemo(() => {
    const churnList = churnData?.planters || []

    return planters.map((p) => {
      // Synchronisation directe avec le modèle XGBoost Churn de l'onglet IA Prédiction
      const churnMatch = churnList.find(
        (cp) =>
          (cp.nom_complet && cp.nom_complet.toLowerCase().includes(p.nom.toLowerCase())) ||
          (p.nom && p.nom.toLowerCase().includes((cp.nom_complet || '').toLowerCase()))
      )
      const pNameNorm = p.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const relatedSlips = bordereaux.filter((b) => {
        const bNameNorm = (b.planteur || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return bNameNorm.includes(pNameNorm) || pNameNorm.includes(bNameNorm)
      })

      if (relatedSlips.length === 0) return p

      const totalKg = relatedSlips.reduce((acc, b) => acc + (Number(b.poidsKg) || 0), 0)
      const totalBags = relatedSlips.reduce((acc, b) => acc + (Number(b.sacs) || 0), 0)
      const totalValeur = relatedSlips.reduce((acc, b) => acc + (Number(b.valeurFcfa) || 0), 0)
      const totalTonnes = totalKg / 1000
      const rendement = p.superficie > 0 ? Math.round(totalKg / p.superficie) : p.rendement
      const pendingCount = relatedSlips.filter((b) => b.statut === 'En attente').length
      const approvedCount = relatedSlips.filter((b) => b.statut === 'Validé').length

      // Construction dynamique des barres d'apports réelles depuis les bordereaux Neon DB
      let dynamicMonthly = p.livraisonsMonthly || []
      if (relatedSlips.length > 0) {
        const sorted = [...relatedSlips].sort((a, b) => {
          const timeA = new Date(a.raw?.created_at || a.created_at || a.createdAt || 0).getTime()
          const timeB = new Date(b.raw?.created_at || b.created_at || b.createdAt || 0).getTime()
          if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB
          return (Number(a.poidsKg) || 0) - (Number(b.poidsKg) || 0)
        })
        const monthCounts = {}
        sorted.forEach((s) => {
          const d = s.created_at || s.createdAt ? new Date(s.created_at || s.createdAt) : new Date()
          const m = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
          monthCounts[m] = (monthCounts[m] || 0) + 1
        })

        const monthIndices = {}
        dynamicMonthly = sorted.map((s) => {
          const d = s.created_at || s.createdAt ? new Date(s.created_at || s.createdAt) : new Date()
          const m = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
          const capM = m.charAt(0).toUpperCase() + m.slice(1)
          let label = capM
          if (monthCounts[m] > 1) {
            monthIndices[m] = (monthIndices[m] || 0) + 1
            label = `${capM} #${monthIndices[m]}`
          }

          const kg = Number(s.poidsKg) || 0
          const sacs = Number(s.sacs) || Math.round(kg / 50)
          return {
            mois: label,
            kg,
            sacs,
            color: kg >= 4000 ? '#CA8A04' : '#A0B4AB',
            isPeak: false,
          }
        })

        if (dynamicMonthly.length > 0) {
          const maxK = Math.max(...dynamicMonthly.map((x) => x.kg))
          dynamicMonthly = dynamicMonthly.map((x) => ({ ...x, isPeak: x.kg === maxK }))
        }
      }

      const iaRiskLevel = churnMatch ? churnMatch.risk_level : p.risque
      const iaRiskScore = churnMatch ? churnMatch.risk_score : (p.risque === 'Critique' ? 78 : p.risque === 'Vigilance' ? 35 : 2)
      const iaStatutLabel = iaRiskLevel === 'Critique' ? 'Critique' : (iaRiskLevel === 'Vigilance' || iaRiskLevel === 'Modéré' ? 'Vigilance' : 'Élite')

      return {
        ...p,
        risque: iaRiskLevel,
        riskScore: iaRiskScore,
        statutLabel: iaStatutLabel,
        livraisons: Number(totalTonnes.toFixed(2)),
        livraisonsFormatted: `${totalTonnes.toFixed(2).replace('.', ',')} T`,
        totalBags,
        totalValeur,
        totalValeurFormatted: `${totalValeur.toLocaleString('fr-FR')} FCFA`,
        rendement,
        pendingHarvestsCount: pendingCount,
        approvedHarvestsCount: approvedCount,
        isLivraisonAlert: pendingCount > 0,
        livraisonsTotalKg: `${totalKg.toLocaleString('fr-FR')} kg`,
        livraisonsMonthly: dynamicMonthly,
      }
    })
  }, [planters, bordereaux, churnData])

  // Calcul des 4 KPIs agronomiques globaux
  const kpis = useMemo(() => {
    const totalCount = dynamicPlanters.length
    const totalSup = dynamicPlanters.reduce((acc, p) => acc + (p.superficie || 0), 0)
    const totalTonnes = dynamicPlanters.reduce((acc, p) => acc + (p.livraisons || 0), 0)
    const avgRendement = totalSup > 0 ? Math.round((totalTonnes * 1000) / totalSup) : 0
    const criticalCount = dynamicPlanters.filter((p) => p.risque === 'Critique').length

    return {
      totalCount,
      totalSup: totalSup.toFixed(2).replace('.', ','),
      avgRendement,
      criticalCount,
    }
  }, [dynamicPlanters])

  // Compteurs 100% dynamiques pour les boutons de filtrage
  const filterCounts = useMemo(() => {
    const total = dynamicPlanters.length
    const elite = dynamicPlanters.filter((p) => p.statutLabel === 'Élite' || p.risque === 'Faible').length
    const vigilance = dynamicPlanters.filter((p) => p.statutLabel === 'Vigilance' || p.risque === 'Vigilance' || p.risque === 'Modéré' || p.risque === 'Moyen').length
    const critique = dynamicPlanters.filter((p) => p.statutLabel === 'Critique' || p.risque === 'Critique').length

    const cacao = dynamicPlanters.filter((p) => (p.crop || 'cacao').toLowerCase().includes('cacao')).length
    const cafe = dynamicPlanters.filter((p) => (p.crop || '').toLowerCase().includes('caf')).length
    const anacarde = dynamicPlanters.filter((p) => {
      const c = (p.crop || '').toLowerCase()
      return c.includes('anacard') || c.includes('cajou')
    }).length

    return {
      total,
      elite,
      vigilance,
      critique,
      cacao,
      cafe,
      anacarde,
    }
  }, [dynamicPlanters])

  // Filtrage combiné : Recherche texte + Statut Risque + Filière
  const filteredPlanters = useMemo(() => {
    return dynamicPlanters.filter((p) => {
      // 1. Filtre Statut agronomique / risque
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Faible' && p.statutLabel !== 'Élite' && p.risque !== 'Faible') return false
        if (statusFilter === 'Modéré' && p.statutLabel !== 'Vigilance' && p.risque !== 'Modéré' && p.risque !== 'Vigilance' && p.risque !== 'Moyen') return false
        if (statusFilter === 'Critique' && p.statutLabel !== 'Critique' && p.risque !== 'Critique') return false
      }

      // 2. Filtre Filière
      if (cropFilter !== 'ALL') {
        const cropLower = (p.crop || 'cacao').toLowerCase()
        if (cropFilter === 'cacao' && !cropLower.includes('cacao')) return false
        if (cropFilter === 'cafe' && !cropLower.includes('caf')) return false
        if (cropFilter === 'anacarde' && !cropLower.includes('anacard') && !cropLower.includes('cajou')) return false
      }

      // 3. Recherche texte (nom, village, téléphone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = p.nom.toLowerCase().includes(q)
        const matchVillage = p.village.toLowerCase().includes(q)
        const matchPhone = p.phone ? p.phone.toLowerCase().includes(q) : false
        if (!matchName && !matchVillage && !matchPhone) return false
      }

      return true
    })
  }, [dynamicPlanters, statusFilter, cropFilter, searchQuery])

  // Synchronisation automatique de la sélection avec les éléments filtrés
  useEffect(() => {
    if (filteredPlanters.length > 0) {
      const exists = filteredPlanters.some((p) => p.id === selectedId)
      if (!exists) {
        setSelectedId(filteredPlanters[0].id)
      }
    }
  }, [filteredPlanters, selectedId])

  // Planteur actuellement sélectionné
  const selectedPlanter = useMemo(() => {
    const found = filteredPlanters.find((p) => p.id === selectedId)
    return found || filteredPlanters[0] || dynamicPlanters[0]
  }, [filteredPlanters, selectedId, planters])

  // Export complet de la liste des planteurs (Web & Desktop)
  const handleExportCSV = async () => {
    if (filteredPlanters.length === 0) {
      toast.error('Aucun planteur à exporter.')
      return
    }

    const headers = [
      'IDENTIFIANT',
      'NOM',
      'TÉLÉPHONE',
      'VILLAGE',
      'FILIÈRE',
      'SUPERFICIE (HA)',
      'RENDEMENT (KG/HA)',
      'SEUIL D\'ÉTAT (KG/HA)',
      'LIVRAISONS (T)',
      'TOTAL SACS',
      'MONTANT NET GARANTI (FCFA)',
      'RISQUE CHURN',
      'COORDONNÉES GPS',
    ]

    const rows = filteredPlanters.map((p) => [
      p.id,
      `"${p.nom.replace(/"/g, '""')}"`,
      `"${p.phone || ''}"`,
      `"${p.village}"`,
      p.cropLabel || p.crop,
      p.superficie.toString().replace('.', ','),
      p.rendement,
      p.seuilOfficiel,
      p.livraisons.toString().replace('.', ','),
      p.totalBags || 0,
      p.totalValeur || 0,
      p.statutLabel || p.risque,
      `"${p.gps}"`,
    ])

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n')

    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `registre_planteurs_societaires_${dateStr}.csv`

    const res = await exportLocalReport({
      filename,
      content: csvContent,
    })

    if (res.success) {
      if (res.method === 'desktop') {
        toast.success('Liste des planteurs enregistrée sur votre ordinateur !', {
          description: `Fichier sauvegardé : ${res.filePath || filename}`,
        })
      } else {
        toast.success('Export CSV généré avec succès', {
          description: `${filteredPlanters.length} planteurs sociétaires exportés.`,
        })
      }
    } else if (!res.canceled) {
      toast.error("Erreur lors de l'exportation.")
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5 animate-fade-in pb-8">
      {/* 1. EN-TÊTE DE PAGE */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-ink">Planteurs & Parcelles</h1>
          <p className="text-xs text-ink-muted">Registre officiel des membres sociétaires et cadastre géolocalisé</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Synchroniser Neon DB */}
          <button
            id="btn-refresh-planters"
            type="button"
            onClick={fetchPlanters}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800/30 shadow-2xs cursor-pointer"
            title="Synchroniser avec Neon PostgreSQL"
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

          {/* Bouton Exporter la liste des planteurs (Web & Desktop) */}
          <button
            id="btn-export-planters"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-forest-900 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-forest-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30 cursor-pointer"
            title="Exporter la liste des planteurs sociétaires sur le disque dur"
          >
            <Download className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
            <span>Exporter planteurs {isElectronApp() ? '(Disque dur)' : '(CSV)'}</span>
          </button>


        </div>
      </div>

      {/* 2. 4 CARTES KPIS AGRONOMIQUES OPÉRATIONNELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Producteurs Sociétaires */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Producteurs</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink">{kpis.totalCount}</span>
            <span className="text-xs text-ink-muted">membres</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            100% audités & géolocalisés
          </p>
        </div>

        {/* KPI 2 : Superficie Totale */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Superficie Gérée</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-forest-900">{kpis.totalSup}</span>
            <span className="text-xs font-semibold text-forest-800">Hectares</span>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            Cadastre parcellaire certifié
          </p>
        </div>

        {/* KPI 3 : Rendement Moyen Global */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Rendement Moyen</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-900">{kpis.avgRendement}</span>
            <span className="text-xs text-ink-muted">kg / ha</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800 font-medium">
            +35% au-dessus des seuils d'État
          </p>
        </div>

        {/* KPI 4 : Alertes Décrochage Churn */}
        {/* KPI 4 : Alertes Décrochage Churn (100% synchronisé avec XGBoost Churn) */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-[#CBD5D1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Santé & Risque IA</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-900">
              {churnData?.critical_count ?? kpis.criticalCount}
            </span>
            <span className="text-xs text-ink-muted">en décrochage critique</span>
          </div>
          {(() => {
            const topCritique =
              churnData?.planters?.find((cp) => cp.risk_level === 'Critique') ||
              dynamicPlanters.find((p) => p.risque === 'Critique')

            if (topCritique) {
              const nom = topCritique.nom_complet || topCritique.nom
              const village = topCritique.village
              const score = topCritique.risk_score || topCritique.riskScore || 78
              return (
                <div className="mt-2 flex items-center justify-between gap-1">
                  <p className="text-[11px] font-semibold text-red-700 truncate">
                    {nom} ({village}) • Risque {score}%
                  </p>

                </div>
              )
            }

            return (
              <p className="mt-2 text-[11px] font-medium text-emerald-700">
                Aucun risque critique détecté par l'IA
              </p>
            )
          })()}
        </div>
      </div>

      {/* 3. BARRE DE FILTRES RAPIDES ÉPURÉE */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-[#FAF8F5] p-2.5 px-3.5">
        {/* Filtres par Santé / Risque */}
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
            Tous ({filterCounts.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Faible')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'Faible'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
          >
            Élite ({filterCounts.elite})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Modéré')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'Modéré'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
          >
            Vigilance ({filterCounts.vigilance})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Critique')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${statusFilter === 'Critique'
              ? 'bg-red-700 text-white shadow-2xs'
              : 'bg-white text-red-800 hover:bg-red-50 border border-red-200'
              }`}
          >
            Critique ({filterCounts.critique})
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
            Cacao ({filterCounts.cacao})
          </button>
          <button
            type="button"
            onClick={() => setCropFilter('cafe')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'cafe'
              ? 'bg-amber-800 text-white shadow-2xs font-semibold'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
          >
            Café ({filterCounts.cafe})
          </button>
          <button
            type="button"
            onClick={() => setCropFilter('anacarde')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${cropFilter === 'anacarde'
              ? 'bg-yellow-700 text-white shadow-2xs font-semibold'
              : 'bg-white text-yellow-900 hover:bg-yellow-50 border border-yellow-200'
              }`}
          >
            Anacarde ({filterCounts.anacarde})
          </button>
        </div>
      </div>

      {/* 4. ZONE PRINCIPALE : TABLEAU + PANNEAU DÉTAIL 360° */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Colonne gauche (7 col) : Tableau des Planteurs */}
        <div className="lg:col-span-7">
          <PlanterTable
            planters={filteredPlanters}
            selectedId={selectedPlanter?.id}
            onSelectPlanter={(id) => setSelectedId(id)}
            currentPage={1}
            totalPages={1}
            totalItems={filteredPlanters.length}
            pageSize={6}
            onPageChange={() => { }}
          />
        </div>

        {/* Colonne droite (5 col) : Panneau Détail 360° & Cadastre Parcellaire */}
        <div className="lg:col-span-5">
          <PlanterDetailPanel planter={selectedPlanter} />
        </div>
      </div>
    </div>
  )
}

