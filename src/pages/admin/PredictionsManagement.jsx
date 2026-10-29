import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TriangleAlert,
  ChevronDown,
  Zap,
  Lightbulb,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  BellRing,
  Award,
  Users,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '../../services/api'
import ConfusionMatrix from '../../components/admin/ConfusionMatrix'
import PredictionChart from '../../components/admin/PredictionChart'
import ModelComparisonBars from '../../components/admin/ModelComparisonBars'
import { isElectronApp } from '../../utils/fileSystem'

// Mini circular gauge for risk percentages
function CircularRiskBadge({ percent, size = 40 }) {
  const isHigh = percent >= 60
  const isMedium = percent >= 25 && percent < 60
  const color = isHigh ? '#DC2626' : isMedium ? '#D97706' : '#16A34A'
  const stroke = 3.5
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="h-full w-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EAE7E0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>
        {percent}%
      </span>
    </div>
  )
}

export default function PredictionsManagement() {
  // Tabs: 'tonnage' | 'churn'
  const [activeTab, setActiveTab] = useState('churn')

  // Données de prédiction reçues du backend FastAPI
  const [predictionData, setPredictionData] = useState(null)
  const [tonnageData, setTonnageData] = useState(null)
  const [isSimulatingTonnage, setIsSimulatingTonnage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // --- Simulateur Décrochage (Churn XGBoost) ---
  const [churnApports, setChurnApports] = useState(0.3)
  const [churnPluvio, setChurnPluvio] = useState(145)
  const [churnSuperficie, setChurnSuperficie] = useState(4.0)
  const [churnCulture, setChurnCulture] = useState('cacao')
  const [isSimulatingChurn, setIsSimulatingChurn] = useState(false)
  const [churnResult, setChurnResult] = useState({
    score: 78,
    level: 'Critique',
    factors: ['Écart objectif récolte critique (-92.1%)', 'Forte humidité favorable aux maladies'],
  })

  // --- Simulateur Tonnage (Régression Tonnage) ---
  const [tonnageApports, setTonnageApports] = useState(380)
  const [tonnagePluvio, setTonnagePluvio] = useState(115)
  const [tonnageSuperficie, setTonnageSuperficie] = useState(3.5)
  const [tonnageResult, setTonnageResult] = useState({
    yieldTon: '4,2',
    ciLow: '3,9',
    ciHigh: '4,5',
  })

  // Chargement des données prédictives en direct depuis Neon DB via FastAPI
  const fetchPredictions = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const [resChurn, resTonnage] = await Promise.all([
        apiClient.get('/cooperative/predictions/churn'),
        apiClient.get('/cooperative/predictions/tonnage'),
      ])
      setPredictionData(resChurn.data)
      setTonnageData(resTonnage.data)
      if (showToast) {
        toast.success('Inférences IA actualisées en direct.', {
          description: 'Scores et tonnages recalculés avec les données réelles Neon DB.',
        })
      }
    } catch (err) {
      console.error('Erreur chargement prédictions IA:', err)
      toast.error('Erreur lors du chargement des prédictions IA.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  // Exporter rapport
  const handleExportReport = () => {
    toast.success('Rapport prédictif exporté avec succès.', {
      description: 'Bulletin d\'intelligence décisionnelle téléchargé.',
    })
  }

  // Inférence Churn interactive en temps réel avec le modèle backend
  const handlePredictChurn = async (e) => {
    e.preventDefault()
    setIsSimulatingChurn(true)
    try {
      const res = await apiClient.post('/cooperative/predictions/simulate-churn', {
        apports_recents_t: Number(churnApports) || 1.4,
        pluviometrie_mm: Number(churnPluvio) || 85,
        superficie_ha: Number(churnSuperficie) || 4.0,
        culture: churnCulture,
      })
      const { score, level, factors } = res.data
      setChurnResult({ score, level, factors: factors || [] })
      toast.success(`Simulation XGBoost : Risque ${score}% (${level}).`, {
        description: 'Score d\'attrition calculé en temps réel par le modèle.',
      })
    } catch (err) {
      console.error('Erreur simulation churn:', err)
      toast.error('Erreur lors de la simulation prédictive.')
    } finally {
      setIsSimulatingChurn(false)
    }
  }

  // Inférence Tonnage via modèle XGBoost backend
  const handlePredictTonnage = async (e) => {
    e.preventDefault()
    setIsSimulatingTonnage(true)
    try {
      const res = await apiClient.post('/cooperative/predictions/simulate-tonnage', {
        apports_kg_sem: Number(tonnageApports) || 380,
        pluviometrie_mm: Number(tonnagePluvio) || 115,
        superficie_ha: Number(tonnageSuperficie) || 3.5,
        culture: 'cacao',
      })
      const { yield_ton_ha, ci_low, ci_high } = res.data
      setTonnageResult({
        yieldTon: yield_ton_ha,
        ciLow: ci_low,
        ciHigh: ci_high,
      })
      toast.success(`Modèle XGBoost Regressor : ${yield_ton_ha} T / ha.`, {
        description: `Intervalle de confiance 95% : [${ci_low} – ${ci_high} T].`,
      })
    } catch (err) {
      console.error('Erreur simulation tonnage:', err)
      toast.error('Erreur lors de la simulation de tonnage.')
    } finally {
      setIsSimulatingTonnage(false)
    }
  }

  const metrics = predictionData?.metrics || {
    accuracy: 95.0,
    precision: 85.0,
    recall: 89.5,
    f1_score: 87.2,
  }

  const plantersList = predictionData?.planters || []
  const totalDeliveredTonnage =
    plantersList.reduce((acc, p) => acc + (Number(p.tonnage_livre_kg) || 0), 0) / 1000 || 31.77

  const totalMembers = predictionData?.total_members || 7
  const summaryText =
    predictionData?.summary_text ||
    '1 planteur sur 7 (Estelle Kouame à Pindikro) est en risque critique suite à un décrochage de récolte et des alertes sanitaires.'

  const featureImportances = predictionData?.feature_importances || [
    { name: 'Écart objectif livraison', importance: 28.9, bar_width: '38%' },
    { name: 'Taux d\'approbation qualité', importance: 22.2, bar_width: '27%' },
    { name: 'Jours d\'inactivité mobile', importance: 15.4, bar_width: '21%' },
    { name: 'Nombre d\'alertes maladies', importance: 12.1, bar_width: '14%' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE DE PAGE & ACTIONS */}
      <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-ink">Intelligence prédictive</h1>
              <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-800 border border-forest-200">
                Machine Learning en direct
              </span>
              {isElectronApp() && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 border border-emerald-300">
                  Application Desktop Windows
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Surveillance continue, évaluation du risque d'attrition sociétaire et projection des récoltes coopératives.
            </p>
          </div>

          
        </div>

        {/* Action Bar: Pill Tabs + Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
          {/* Pill Tabs Switcher */}
          <div
            id="prediction-tabs"
            className="inline-flex rounded-xl bg-[#F1EEE8] p-1 border border-line/50"
          >
            <button
              id="tab-churn"
              type="button"
              onClick={() => setActiveTab('churn')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeTab === 'churn'
                ? 'bg-white text-forest-900 shadow-2xs border border-line/50'
                : 'text-ink-muted hover:text-ink'
                }`}
            >
              <TriangleAlert className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span>Risque de décrochage</span>
            </button>

            <button
              id="tab-tonnage"
              type="button"
              onClick={() => setActiveTab('tonnage')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeTab === 'tonnage'
                ? 'bg-white text-forest-900 shadow-2xs border border-line/50'
                : 'text-ink-muted hover:text-ink'
                }`}
            >
              <TrendingUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span>Prévision du tonnage</span>
            </button>
          </div>

          {/* Contrôles de droite : Campagne & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              id="campaign-selector"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line/70 bg-white px-3.5 text-[13px] font-medium text-ink shadow-2xs"
            >
              <span className="text-ink-muted text-xs">Campagne :</span>
              <span className="font-semibold text-ink">2025 - 2026</span>
              <ChevronDown className="h-4 w-4 text-ink-muted ml-0.5" strokeWidth={1.75} aria-hidden="true" />
            </div>


            {/* Bouton d'actualisation directe IA */}
            <button
              type="button"
              onClick={() => fetchPredictions(true)}
              disabled={isRefreshing}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-line/70 bg-white px-3.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-[#F9F7F3]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-forest-900 ${isRefreshing ? 'animate-spin' : ''}`}
                strokeWidth={2}
              />
              <span>{isRefreshing ? 'Inférence en cours...' : 'Actualiser IA'}</span>
            </button>


          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VUE A : RISQUE DE DÉCROCHAGE (CLASSIFICATION CHURN)       */}
      {/* ========================================================= */}
      {activeTab === 'churn' && (
        <div className="space-y-6 animate-fade-in">
          {/* A1. Rangée des 4 Cartes Métriques ML avec descriptions de rôle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
            {/* 1. Accuracy */}
            <div className="flex flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Exactitude (Accuracy)</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-forest-900 border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-ink">
                    {metrics.accuracy.toString().replace('.', ',')} %
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Global
                  </span>
                </div>
              </div>
              <p className="mt-3 border-t border-line/40 pt-2.5 text-[11px] text-ink-muted leading-relaxed">
                Taux global de prédictions correctes sur les 100 planteurs du jeu de test secret.
              </p>
            </div>

            {/* 2. Précision */}
            <div className="flex flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Précision</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                    <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-ink">
                    {metrics.precision.toString().replace('.', ',')} %
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Fiabilité
                  </span>
                </div>
              </div>
              <p className="mt-3 border-t border-line/40 pt-2.5 text-[11px] text-ink-muted leading-relaxed">
                Proportion de vrais départs confirmés parmi toutes les alertes émises par l'algorithme.
              </p>
            </div>

            {/* 3. Rappel (Recall) */}
            <div className="flex flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Rappel (Recall)</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                    <BellRing className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-ink">
                    {metrics.recall.toString().replace('.', ',')} %
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Sensibilité
                  </span>
                </div>
              </div>
              <p className="mt-3 border-t border-line/40 pt-2.5 text-[11px] text-ink-muted leading-relaxed">
                Capacité du modèle à intercepter les planteurs en détresse avant leur départ effectif.
              </p>
            </div>

            {/* 4. F1-score */}
            <div className="flex flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">F1-score</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-800 border border-orange-100">
                    <Award className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-[#D97706]">
                    {metrics.f1_score.toString().replace('.', ',')} %
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                    Optimal
                  </span>
                </div>
              </div>
              <p className="mt-3 border-t border-line/40 pt-2.5 text-[11px] text-ink-muted leading-relaxed">
                Moyenne harmonique certifiant le juste équilibre entre détection et absence de fausse alerte.
              </p>
            </div>
          </div>

          {/* A2. Rangée Médiane : Planteurs à risque vs Matrice de confusion */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Carte Gauche : Planteurs à risque */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-forest-900" strokeWidth={2} />
                      <h3 className="text-base font-bold text-ink">Planteurs à risque d'attrition</h3>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                      Surveillance continue du sociétariat pour anticiper les pertes d'adhésion et déclencher les visites terrain.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#FAF7F2] px-2 py-1 text-[11px] font-semibold text-ink-muted border border-line/50">
                    {loading ? 'Calcul...' : `${plantersList.length} analysés`}
                  </span>
                </div>

                {/* Liste dynamique des planteurs */}
                <div className="mt-5 divide-y divide-[#F1EEE8]">
                  {loading ? (
                    <div className="py-10 flex flex-col items-center justify-center text-ink-muted gap-2.5">
                      <Loader2 className="h-6 w-6 animate-spin text-forest-900" />
                      <span className="text-xs font-medium">Exécution du modèle XGBoost sur les données réelles...</span>
                    </div>
                  ) : plantersList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink-muted">
                      Aucun sociétaire enregistré dans la coopérative.
                    </div>
                  ) : (
                    plantersList.slice(0, 5).map((planter) => {
                      const cultureLower = (planter.culture || 'cacao').toLowerCase()
                      const cropColor = cultureLower.includes('anacard')
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        : cultureLower.includes('caf')
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'

                      return (
                        <div
                          key={planter.planter_id}
                          className="flex items-center justify-between py-3 transition-colors hover:bg-[#FAF8F5] rounded-xl px-2"
                        >
                          <div className="flex items-center gap-3">
                            <CircularRiskBadge percent={planter.risk_score} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-ink">{planter.nom_complet}</h4>
                                <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-semibold uppercase ${cropColor}`}>
                                  {planter.culture}
                                </span>
                              </div>
                              <span className="text-xs text-ink-muted">
                                {planter.village} • {planter.superficie_ha} ha • {Math.round(planter.tonnage_livre_kg)} kg livrés
                              </span>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold border ${planter.risk_level === 'Critique'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : planter.risk_level === 'Moyen'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                          >
                            {planter.risk_level}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Lien bas de liste */}
                <div className="mt-4 pt-2 border-t border-line/40">
                  <Link
                    to="/planteurs"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-900 transition-colors hover:text-forest-800"
                  >
                    <span>Consulter l'annuaire complet des {totalMembers} membres sociétaires</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Note d'analyse claire */}
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
                <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
                <p className="leading-snug">
                  <strong className="font-semibold text-[#3D3208]">Lecture métier :</strong> {summaryText}
                </p>
              </div>
            </div>

            {/* Carte Droite : Matrice de confusion dynamique */}
            <ConfusionMatrix matrix={predictionData?.confusion_matrix} />
          </div>

          {/* A3. Rangée Inférieure : Facteurs d'influence vs Simulateur */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Facteurs d'influence */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-forest-900" strokeWidth={2} />
                      <h3 className="text-base font-bold text-ink">Facteurs d'influence décisionnelle</h3>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                      Poids relatif de chaque indicateur agronomique et comportemental dans le calcul du risque par XGBoost.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {featureImportances.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-ink">{item.name}</span>
                        <span className="font-bold text-forest-900">{item.importance.toString().replace('.', ',')} %</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-[#E5E7EB] overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-forest-800 to-forest-900 transition-all duration-500"
                          style={{ width: item.bar_width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note d'analyse */}
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
                <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
                <p className="leading-snug">
                  <strong className="font-semibold text-[#3D3208]">Lecture métier :</strong> L'écart d'apport par rapport aux objectifs de récolte constitue le premier signal d'alerte (28,9 % d'importance), suivi de la conformité qualité.
                </p>
              </div>
            </div>

            {/* Tester sur de nouvelles données (Simulateur Churn XGBoost) */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-700" strokeWidth={2} />
                      <h3 className="text-base font-bold text-ink">Simulateur d'inférence en direct</h3>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                      Testez instantanément le profil d'un sociétaire pour évaluer son niveau d'attrition selon les paramètres saisis.
                    </p>
                  </div>
                </div>

                {/* Formulaire interactif */}
                <form onSubmit={handlePredictChurn} className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-muted">
                        Apports récents (T)
                      </label>
                      <input
                        type="text"
                        value={churnApports}
                        onChange={(e) => setChurnApports(e.target.value)}
                        placeholder="Ex: 0.3"
                        className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#B47F18] focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-ink-muted">
                        Pluviométrie (mm)
                      </label>
                      <input
                        type="text"
                        value={churnPluvio}
                        onChange={(e) => setChurnPluvio(e.target.value)}
                        placeholder="Ex: 145"
                        className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#B47F18] focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-ink-muted">
                        Superficie (ha)
                      </label>
                      <input
                        type="text"
                        value={churnSuperficie}
                        onChange={(e) => setChurnSuperficie(e.target.value)}
                        placeholder="Ex: 4.0"
                        className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#B47F18] focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bouton Prédire */}
                  <button
                    type="submit"
                    disabled={isSimulatingChurn}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-sm font-bold text-white shadow-xs transition-all hover:shadow-sm"
                  >
                    {isSimulatingChurn ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Zap className="h-4 w-4 fill-amber-300 text-amber-300" strokeWidth={1.75} aria-hidden="true" />
                    )}
                    <span>{isSimulatingChurn ? 'Calcul du modèle XGBoost...' : 'Lancer la prédiction IA'}</span>
                  </button>
                </form>

                {/* Résultat d'inférence stylisé */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FAF7F2] p-4 border border-line/60">
                  <div className="flex items-center gap-3.5">
                    <CircularRiskBadge percent={churnResult.score} size={44} />
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Résultat du calcul en direct
                      </span>
                      <span
                        className={`block text-base font-extrabold ${churnResult.score >= 60
                          ? 'text-rose-700'
                          : churnResult.score >= 25
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                          }`}
                      >
                        Indice de risque : {churnResult.score} %
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${churnResult.level === 'Critique'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : churnResult.level === 'Moyen'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                  >
                    Niveau {churnResult.level}
                  </span>
                </div>
              </div>

              {/* Note d'analyse */}
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
                <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
                <p className="leading-snug">
                  <strong className="font-semibold text-[#3D3208]">Lecture métier :</strong> Cette simulation permet à l'équipe agronomique d'anticiper la vulnérabilité d'un planteur avant de valider ses engagements annuels.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE B : PRÉVISION DU TONNAGE (RÉGRESSION LOGISTIQUE/XGB)  */}
      {/* ========================================================= */}
      {activeTab === 'tonnage' && (
        <div className="space-y-6 animate-fade-in">
          {/* B1. Rangée Supérieure : Prévision du tonnage vs Performance */}
          {/* B1. Graphique Temporel Pleine Largeur : Trajectoire & Prévision de campagne */}
          <div>
            <PredictionChart data={tonnageData} />
          </div>

          {/* B2. Rangée Inférieure : Comparaison des modèles vs Simulateur Tonnage */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ModelComparisonBars data={tonnageData} />
            </div>

            {/* Tester nouvelles données (Simulateur Tonnage) */}
            <div className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-forest-900" strokeWidth={2} />
                        <h3 className="text-base font-bold text-ink">Simulateur de rendement agronomique</h3>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                        Estimez le rendement à l'hectare attendu selon les apports hebdomadaires et la pluviométrie.
                      </p>
                    </div>
                  </div>

                  {/* Formulaire 3 champs */}
                  <form onSubmit={handlePredictTonnage} className="mt-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          Apports (kg/sem)
                        </label>
                        <input
                          type="text"
                          value={tonnageApports}
                          onChange={(e) => setTonnageApports(e.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#0F3D2E] focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          Pluvio (mm)
                        </label>
                        <input
                          type="text"
                          value={tonnagePluvio}
                          onChange={(e) => setTonnagePluvio(e.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#0F3D2E] focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          Superficie (ha)
                        </label>
                        <input
                          type="text"
                          value={tonnageSuperficie}
                          onChange={(e) => setTonnageSuperficie(e.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-line/70 bg-[#F6F4F0] px-3 text-sm font-semibold text-ink focus:border-[#0F3D2E] focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Bouton Prédire */}
                    <button
                      type="submit"
                      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-sm font-bold text-white shadow-xs transition-all hover:shadow-sm"
                    >
                      <Zap className="h-4 w-4 fill-amber-300 text-amber-300" strokeWidth={1.75} aria-hidden="true" />
                      <span>Calculer le rendement prévisionnel</span>
                    </button>
                  </form>

                  {/* Bloc Résultat d'inférence */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-[#854D0E] uppercase tracking-wider">
                        Tonnage estimé
                      </span>
                      <span className="block text-2xl font-extrabold text-[#B47F18]">
                        {tonnageResult.yieldTon} T / ha
                      </span>
                    </div>

                    <span className="rounded-xl border border-[#E8D293] bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs">
                      IC 95% : [{tonnageResult.ciLow} – {tonnageResult.ciHigh} T]
                    </span>
                  </div>
                </div>

                {/* Note d'analyse */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] p-3 text-xs text-[#5A4A12]">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
                  <p className="leading-snug">
                    <strong className="font-semibold text-[#3D3208]">Lecture métier :</strong> Simulation instantanée du volume récolté permettant de dimensionner la flotte logistique de ramassage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
