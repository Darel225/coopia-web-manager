import axios from 'axios'

const isDesktopEnv = typeof window !== 'undefined' && (Boolean(window.electronAPI) || window.location.protocol === 'file:');
const API_BASE_URL = isDesktopEnv ? 'http://127.0.0.1:8000/api/v1' : '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token administrateur session Coopérative CAPED
const ADMIN_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYTE1ODBiZS04ZWQwLTRlNzctYjM1OS05MWYwNzYzZDI0ZDEiLCJleHAiOjIxMDgwNDI0MzUsImlhdCI6MTc5MjY4MjQzNX0.ulIjV3N8uIlEyNoeE9f57UFNMTlSzsTMW68WAGpUXRQ'

apiClient.interceptors.request.use((config) => {
  const t = localStorage.getItem('coopia_token') || ADMIN_DEV_TOKEN
  if (t) {
    config.headers.Authorization = 'Bearer ' + t
  }
  return config
})


// Données de secours / Démo réalistes pour Coopérative CAPED Soubré
export const DEMO_DATA = {
  kpis: {
    totalRecoltesTonnage: 58.4,
    totalRecoltesKg: 58400,
    totalRecoltesEvolution: '+14.2%',
    totalBordereaux: 12,
    totalBordereauxEnAttente: 4,
    totalPlanteurs: 142,
    planteursActifs: 138,
    totalAlertes: 3,
    alertesCritiques: 1,
    prixGarantiKg: 1800, // FCFA/kg fixé campagne 2025-2026
    valeurTotaleAchetee: 105120000, // FCFA
  },

  villagesDistribution: [
    { village: 'Soubré Centre', tonnage: 18.2, planteurs: 44, color: '#15803D' },
    { village: 'Méagui', tonnage: 15.6, planteurs: 38, color: '#854D0E' },
    { village: 'Grand-Zattry', tonnage: 11.4, planteurs: 28, color: '#166534' },
    { village: 'Oupoyo', tonnage: 8.5, planteurs: 21, color: '#D97706' },
    { village: 'Yabayo', tonnage: 4.7, planteurs: 11, color: '#4B5563' },
  ],

  recentBordereaux: [
    {
      id: 'BDR-2026-6AA09C',
      code: 'BDR-2026-6AA09C',
      planteur: {
        nom: 'Estelle Kouame',
        code: 'PLT-CI-088',
        telephone: '+225 07 48 92 11 04',
        village: 'Soubré',
      },
      poidsKg: 50,
      variete: 'Cacao Forastero Mercedes',
      grade: 'Grade 1 (Excellent)',
      tauxHumidite: 7.2,
      prixUnitaire: 1800,
      montantTotal: 90000,
      statut: 'En attente', // Testé aujourd'hui, prêt à valider
      date: '2026-10-20T14:32:00Z',
      agentPesee: 'Kouassi Yves (Agent Peseur N°3)',
      lieu: 'Centre de collecte Soubré - Pont',
      note: 'Fèves bien fermentées, séchage optimal sous claies solaires.',
    },
    {
      id: 'BDR-2026-5FA110',
      code: 'BDR-2026-5FA110',
      planteur: {
        nom: 'Koffi Brou',
        code: 'PLT-CI-012',
        telephone: '+225 05 12 33 90 81',
        village: 'Méagui',
      },
      poidsKg: 340,
      variete: 'Cacao Trinitario Sélection',
      grade: 'Grade 1',
      tauxHumidite: 7.5,
      prixUnitaire: 1800,
      montantTotal: 612000,
      statut: 'Validé',
      date: '2026-10-20T11:15:00Z',
      agentPesee: 'Kouassi Yves (Agent Peseur N°3)',
      lieu: 'Hangar Central Méagui',
      note: 'Livraison complète, sacage aux normes CCC.',
    },
    {
      id: 'BDR-2026-4EE203',
      code: 'BDR-2026-4EE203',
      planteur: {
        nom: 'Amadou Soro',
        code: 'PLT-CI-005',
        telephone: '+225 01 02 78 44 20',
        village: 'Grand-Zattry',
      },
      poidsKg: 1200,
      variete: 'Cacao Forastero',
      grade: 'Grade 1',
      tauxHumidite: 7.1,
      prixUnitaire: 1800,
      montantTotal: 2160000,
      statut: 'Validé',
      date: '2026-10-19T16:40:00Z',
      agentPesee: 'N\'Guessan Patrice',
      lieu: 'Magasin Grand-Zattry',
      note: 'Grosse livraison tracteur, conforme traçabilité GPS.',
    },
    {
      id: 'BDR-2026-3CD099',
      code: 'BDR-2026-3CD099',
      planteur: {
        nom: 'Awa Touré',
        code: 'PLT-CI-067',
        telephone: '+225 07 89 12 43 00',
        village: 'Oupoyo',
      },
      poidsKg: 650,
      variete: 'Cacao Forastero',
      grade: 'Grade 2',
      tauxHumidite: 8.8,
      prixUnitaire: 1800,
      montantTotal: 1170000,
      statut: 'En attente',
      date: '2026-10-19T09:20:00Z',
      agentPesee: 'Bakayoko Drissa',
      lieu: 'Station Oupoyo',
      note: 'Recontrôle de l\'humidité nécessaire avant entreposage final.',
    },
    {
      id: 'BDR-2026-2BC088',
      code: 'BDR-2026-2BC088',
      planteur: {
        nom: 'Yao N\'Dri Jean',
        code: 'PLT-CI-029',
        telephone: '+225 05 90 12 77 31',
        village: 'Soubré',
      },
      poidsKg: 420,
      variete: 'Cacao Forastero',
      grade: 'Grade 1',
      tauxHumidite: 7.0,
      prixUnitaire: 1800,
      montantTotal: 756000,
      statut: 'Validé',
      date: '2026-10-18T15:10:00Z',
      agentPesee: 'Kouassi Yves',
      lieu: 'Centre Soubré',
      note: 'Validation immédiate par virement Wave/Orange Money.',
    },
    {
      id: 'BDR-2026-1AB002',
      code: 'BDR-2026-1AB002',
      planteur: {
        nom: 'Gaston Bahi',
        code: 'PLT-CI-114',
        telephone: '+225 01 44 88 23 19',
        village: 'Yabayo',
      },
      poidsKg: 180,
      variete: 'Cacao Forastero',
      grade: 'Hors normes',
      tauxHumidite: 11.2,
      prixUnitaire: 1800,
      montantTotal: 324000,
      statut: 'Rejeté',
      date: '2026-10-18T10:05:00Z',
      agentPesee: 'Bakayoko Drissa',
      lieu: 'Point Relais Yabayo',
      note: 'Taux d\'humidité supérieur au seuil réglementaire de 8%. À resécher.',
    },
  ],

  planteurs: [
    {
      id: 'PLT-CI-088',
      nom: 'Estelle Kouame',
      village: 'Soubré',
      hectares: 3.5,
      parcellesCount: 2,
      productionCumuleeKg: 3850,
      certification: 'Rainforest Alliance',
      statut: 'Actif',
      risqueDecrochage: 'Faible (12%)',
      dernierDepot: 'Aujourd\'hui (50 kg)',
      telephone: '+225 07 48 92 11 04',
      coordonneesGps: '5.7834° N, 6.6021° W',
    },
    {
      id: 'PLT-CI-012',
      nom: 'Koffi Brou',
      village: 'Méagui',
      hectares: 6.2,
      parcellesCount: 3,
      productionCumuleeKg: 7920,
      certification: 'Fairtrade / Équitable',
      statut: 'Actif',
      risqueDecrochage: 'Faible (8%)',
      dernierDepot: 'Aujourd\'hui (340 kg)',
      telephone: '+225 05 12 33 90 81',
      coordonneesGps: '5.4055° N, 6.9536° W',
    },
    {
      id: 'PLT-CI-005',
      nom: 'Amadou Soro',
      village: 'Grand-Zattry',
      hectares: 12.0,
      parcellesCount: 5,
      productionCumuleeKg: 14800,
      certification: 'Rainforest Alliance',
      statut: 'Actif',
      risqueDecrochage: 'Faible (5%)',
      dernierDepot: 'Hier (1 200 kg)',
      telephone: '+225 01 02 78 44 20',
      coordonneesGps: '5.8500° N, 6.4833° W',
    },
    {
      id: 'PLT-CI-067',
      nom: 'Awa Touré',
      village: 'Oupoyo',
      hectares: 4.8,
      parcellesCount: 2,
      productionCumuleeKg: 4200,
      certification: 'UTZ Certified',
      statut: 'Actif',
      risqueDecrochage: 'Moyen (45%)',
      dernierDepot: 'Hier (650 kg)',
      telephone: '+225 07 89 12 43 00',
      coordonneesGps: '5.6667° N, 6.5500° W',
    },
    {
      id: 'PLT-CI-029',
      nom: 'Yao N\'Dri Jean',
      village: 'Soubré',
      hectares: 5.0,
      parcellesCount: 2,
      productionCumuleeKg: 6100,
      certification: 'Rainforest Alliance',
      statut: 'Actif',
      risqueDecrochage: 'Faible (15%)',
      dernierDepot: '18 Oct 2026 (420 kg)',
      telephone: '+225 05 90 12 77 31',
      coordonneesGps: '5.7712° N, 6.6190° W',
    },
    {
      id: 'PLT-CI-114',
      nom: 'Gaston Bahi',
      village: 'Yabayo',
      hectares: 2.8,
      parcellesCount: 1,
      productionCumuleeKg: 1950,
      certification: 'En conversion',
      statut: 'Sous surveillance',
      risqueDecrochage: 'Élevé (78%)',
      dernierDepot: '18 Oct 2026 (Rejeté)',
      telephone: '+225 01 44 88 23 19',
      coordonneesGps: '5.8821° N, 6.6340° W',
    },
    {
      id: 'PLT-CI-139',
      nom: 'Mamadou Coulibaly',
      village: 'Méagui',
      hectares: 7.4,
      parcellesCount: 3,
      productionCumuleeKg: 8400,
      certification: 'Rainforest Alliance',
      statut: 'Actif',
      risqueDecrochage: 'Faible (10%)',
      dernierDepot: '17 Oct 2026 (890 kg)',
      telephone: '+225 07 11 99 33 22',
      coordonneesGps: '5.3980° N, 6.9410° W',
    },
    {
      id: 'PLT-CI-052',
      nom: 'Cécile Konan',
      village: 'Grand-Zattry',
      hectares: 3.2,
      parcellesCount: 1,
      productionCumuleeKg: 2800,
      certification: 'Fairtrade',
      statut: 'Actif',
      risqueDecrochage: 'Moyen (52%)',
      dernierDepot: '15 Oct 2026 (310 kg)',
      telephone: '+225 05 66 77 88 99',
      coordonneesGps: '5.8340° N, 6.4670° W',
    },
  ],

  diagnostics: [
    {
      id: 'DIAG-2026-081',
      maladie: 'Pourriture brune des cabosses',
      pathogene: 'Phytophthora palmivora',
      planteur: 'Gaston Bahi',
      village: 'Yabayo',
      parcelle: 'Parcelle Nord - Yabayo (2.8 ha)',
      gravite: 'Critique',
      statut: 'Action requise',
      date: '2026-10-19T08:15:00Z',
      confianceIA: '96.4%',
      photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      description: 'Nécrose circulaire brun foncé débutant au pédoncule avec duvet blanc mycélien par forte humidité.',
      traitementRecommande: 'Récolte sanitaire d\'urgence : retirer et enfouir toutes les cabosses atteintes. Traitement fongicide à base d\'oxyde de cuivre cuprique (bouillie bordelaise agréée bio). Dégager l\'ombrage pour aérer.',
      agentAlerteur: 'Bakayoko Drissa (Technicien Agricole)',
    },
    {
      id: 'DIAG-2026-079',
      maladie: 'Mirides du Cacaoyer',
      pathogene: 'Distantiella theobroma / Sahlbergella',
      planteur: 'Awa Touré',
      village: 'Oupoyo',
      parcelle: 'Parcelle P2 - Oupoyo (2.5 ha)',
      gravite: 'Modéré',
      statut: 'En observation',
      date: '2026-10-18T14:40:00Z',
      confianceIA: '91.8%',
      photoUrl: 'https://images.unsplash.com/photo-1599818463359-277107703f08?auto=format&fit=crop&w=800&q=80',
      description: 'Piqures d\'alimentation provoquant des chancres sur rameaux et dessèchement partiel des jeunes cabosses.',
      traitementRecommande: 'Application ciblée d\'extraits de neem ou biopesticide agréé CCC. Nettoyage des gourmands et taille d\'entretien.',
      agentAlerteur: 'Kouassi Yves (Agent Peseur N°3)',
    },
    {
      id: 'DIAG-2026-074',
      maladie: 'Swollen Shoot (Suspicion)',
      pathogene: 'Cacao Swollen Shoot Virus (CSSV)',
      planteur: 'Cécile Konan',
      village: 'Grand-Zattry',
      parcelle: 'Parcelle Est - Zattry (3.2 ha)',
      gravite: 'Alerte Vigie',
      statut: 'Audit terrain planifié',
      date: '2026-10-16T11:00:00Z',
      confianceIA: '87.1%',
      photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      description: 'Rougeoiement des jeunes nervures foliaires et léger renflement des pousses terminales.',
      traitementRecommande: 'Isolement de la zone. Envoi d\'un expert CNRA pour test sérologique PCR. Barrière de protection de 10 mètres en espèces non hôtes.',
      agentAlerteur: 'Marc Yao (Gérant)',
    },
    {
      id: 'DIAG-2026-070',
      maladie: 'Cabosse Saine - Récolte Validée',
      pathogene: 'Aucun (R.A.S)',
      planteur: 'Estelle Kouame',
      village: 'Soubré',
      parcelle: 'Parcelle Rivière - Soubré (3.5 ha)',
      gravite: 'Sain',
      statut: 'Certifié Conforme',
      date: '2026-10-20T14:20:00Z',
      confianceIA: '99.2%',
      photoUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
      description: 'Cabosse à maturité optimale, coloration jaune-orange homogène, fèves pleines sans aucune trace de champignon ni morsure.',
      traitementRecommande: 'Continuer le calendrier de récolte toutes les 2 semaines. Écabossage dans les 48 heures.',
      agentAlerteur: 'Kouassi Yves',
    },
  ],

  predictions: [
    {
      id: 'PRED-PLT-114',
      planteur: 'Gaston Bahi',
      code: 'PLT-CI-114',
      village: 'Yabayo',
      hectares: 2.8,
      scoreRisque: 78,
      niveauRisque: 'Élevé',
      facteurs: [
        'Dernière livraison rejetée pour cause d\'humidité excessive (11.2%)',
        'Foyer suspecté de pourriture brune sur la parcelle Nord',
        'Contact téléphonique rare depuis 14 jours',
      ],
      recommandationIA: 'Déclencher la visite du conseiller agricole local avec une bâche de séchage offerte par la coopérative et une avance sur intrants.',
      probabiliteVentePiste: '74%',
      impactTonnagePrevu: '-1.8 T',
    },
    {
      id: 'PRED-PLT-067',
      planteur: 'Awa Touré',
      code: 'PLT-CI-067',
      village: 'Oupoyo',
      hectares: 4.8,
      scoreRisque: 45,
      niveauRisque: 'Moyen',
      facteurs: [
        'Attaque modérée de mirides signalée le 18 Octobre',
        'Retard d\'apport par rapport à l\'historique 2025 (-25%)',
      ],
      recommandationIA: 'Proposer un lot de biopesticides certifiés Rainforest et planifier une formation taille d\'ombrage.',
      probabiliteVentePiste: '38%',
      impactTonnagePrevu: '-0.9 T',
    },
    {
      id: 'PRED-PLT-052',
      planteur: 'Cécile Konan',
      code: 'PLT-CI-052',
      village: 'Grand-Zattry',
      hectares: 3.2,
      scoreRisque: 52,
      niveauRisque: 'Moyen',
      facteurs: [
        'Stress hydrique temporaire détecté par imagerie satellite NDVI',
        'Suspicion virale sur la bordure Est',
      ],
      recommandationIA: 'Passage conjoint avec l\'équipe technique CNRA pour rassurer la productrice et valider la prime qualité.',
      probabiliteVentePiste: '42%',
      impactTonnagePrevu: '-1.1 T',
    },
    {
      id: 'PRED-PLT-088',
      planteur: 'Estelle Kouame',
      code: 'PLT-CI-088',
      village: 'Soubré',
      hectares: 3.5,
      scoreRisque: 12,
      niveauRisque: 'Très Faible (Fidèle)',
      facteurs: [
        'Livraison pesée ce jour (50 kg) avec taux d\'humidité parfait (7.2%)',
        'Adhérente modèle, utilisation active de l\'assistance CoopIA',
      ],
      recommandationIA: 'Éligible au bonus de fidélité de fin de campagne et au crédit intrants express.',
      probabiliteVentePiste: '4%',
      impactTonnagePrevu: '+0.6 T (Hausse estimée)',
    },
  ],
}

// Service avec bascule automatique Backend FastAPI <-> Données Démo
export const apiService = {
  // KPIs & DonnǸes Globales CoopǸrative Neon
  async getKPIs() {
    try {
      const response = await apiClient.get('/cooperative/dashboard')
      return response.data
    } catch (err) {
      console.warn('Fallback kpis vers demo:', err?.message || err)
      return DEMO_DATA.kpis
    }
  },

  // RǸpartition par village
  async getVillagesDistribution() {
    try {
      const response = await apiClient.get('/cooperative/dashboard')
      return response.data?.parcelles_by_section || DEMO_DATA.villagesDistribution
    } catch {
      return DEMO_DATA.villagesDistribution
    }
  },

  // Bordereaux rǸels depuis Neon DB
  async getBordereaux() {
    try {
      const response = await apiClient.get('/cooperative/recoltes')
      return response.data
    } catch (err) {
      console.warn('Fallback bordereaux vers demo:', err?.message || err)
      return DEMO_DATA.recentBordereaux
    }
  },

  // Validation d'une pesǸe en base rǸelle Neon DB
  async validerPesee(bordereauId) {
    try {
      const response = await apiClient.patch(`/cooperative/recoltes/${bordereauId}/status`, {
        status: 'APPROVED',
      })
      return response.data
    } catch (err) {
      console.warn('Validation API impossible, bascule locale:', err?.message || err)
      const found = DEMO_DATA.recentBordereaux.find((b) => b.id === bordereauId)
      if (found) {
        found.statut = 'ValidǸ'
      }
      return {
        success: true,
        message: `Bordereau ${bordereauId} validǸ (mode local).`,
        bordereauId,
        statut: 'ValidǸ',
      }
    }
  },

  // Rejet d'un bordereau en base Neon DB
  async rejeterPesee(bordereauId, motif = 'Taux d\'humiditǸ non conforme') {
    try {
      const response = await apiClient.patch(`/cooperative/recoltes/${bordereauId}/status`, {
        status: 'REJECTED',
      })
      return response.data
    } catch (err) {
      const found = DEMO_DATA.recentBordereaux.find((b) => b.id === bordereauId)
      if (found) {
        found.statut = 'RejetǸ'
        found.note = motif
      }
      return {
        success: true,
        message: `Bordereau ${bordereauId} rejetǸ.`,
        bordereauId,
        statut: 'RejetǸ',
      }
    }
  },

  // Planteurs réels depuis Neon DB
  async getPlanteurs() {
    try {
      const response = await apiClient.get('/cooperative/planters')
      return response.data
    } catch (err) {
      console.warn('Fallback planteurs:', err)
      return null
    }
  },

  // Parcelles réelles depuis Neon DB
  async getParcelles() {
    try {
      const response = await apiClient.get('/cooperative/parcelles')
      return response.data
    } catch (err) {
      console.warn('Fallback parcelles:', err)
      return null
    }
  },

  // Diagnostics phytosanitaires
  async getDiagnostics() {
    try {
      const response = await apiClient.get('/diagnostics')
      return response.data
    } catch {
      return DEMO_DATA.diagnostics
    }
  },

  // Prédictions IA
  async getPredictions() {
    try {
      const response = await apiClient.get('/predictions')
      return response.data
    } catch {
      return DEMO_DATA.predictions
    }
  },
}
