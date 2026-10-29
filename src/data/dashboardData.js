// Données dynamiques de la page Dashboard pour la Campagne Principale 2025/2026 (Octobre)

export const VILLAGES_RECOLTES = [
  { village: 'Divo', tonnage: 8.26 },
  { village: 'Soubré', tonnage: 6.70 },
  { village: 'Bodokro', tonnage: 4.06 },
  { village: 'Man', tonnage: 3.95 },
  { village: 'Pindikro', tonnage: 0.30 },
]

export const DERNIERES_ACTIVITES = [
  { id: 'act-1', initiales: 'EK', couleur: '#0F3D2E', nom: 'Estelle Kouame', action: 'Pesée validée (100 kg)', heure: '13:46' },
  { id: 'act-2', initiales: 'EK', couleur: '#0F3D2E', nom: 'Estelle Kouame', action: 'Récolte déclarée : 2 sacs', heure: '18:03' },
  { id: 'act-3', initiales: 'IA', couleur: '#D97706', nom: 'Alerte IA', action: 'Maladie détectée : Pourriture brune', heure: '17:22' },
  { id: 'act-4', initiales: 'IA', couleur: '#D97706', nom: 'Alerte IA', action: 'Maladie détectée : Pourriture brune', heure: '15:07' },
]

// Campagne cacaoyère principale : Fenêtre glissante de 30 jours (du 24 Septembre au 24 Octobre 2026)
export const MOYENNE_JOURNALIERE = 0.8
export const PIC = { label: '14/10', valeur: 2.8, date: '14/10/2026' }
export const TICKS_X = ['24/09', '29/09', '04/10', '09/10', '14/10', '19/10', '24/10']

// Points clés réels de la campagne d'Octobre (indice 0 à 30, tonnes par jour)
const POINTS_CLES = [
  [0, 0.4], [3, 0.6], [5, 0.9], [8, 1.25], [11, 1.1], [14, 1.5],
  [17, 2.2], [20, 2.8], [22, 1.4], [25, 0.9], [27, 0.5], [29, 0.3], [30, 0.25],
]

function pad(n) {
  return String(n).padStart(2, '0')
}

// Génère les 30 jours glissants du 24/09 au 24/10/2026
function buildLivraisons() {
  const data = []
  for (let i = 0; i <= 30; i += 1) {
    let k = 0
    while (k < POINTS_CLES.length - 2 && POINTS_CLES[k + 1][0] < i) k += 1
    const [x0, y0] = POINTS_CLES[k]
    const [x1, y1] = POINTS_CLES[k + 1]
    const t = (i - x0) / (x1 - x0)
    const eased = (1 - Math.cos(Math.PI * t)) / 2
    const valeur = y0 + (y1 - y0) * eased
    
    // Du 24 Septembre (jour 24 à 30 de septembre) au 24 Octobre (jour 1 à 24 d'octobre)
    let label = ''
    if (i <= 6) {
      label = `${pad(24 + i)}/09`
    } else {
      label = `${pad(i - 6)}/10`
    }
    data.push({ jour: label, volume: Number(valeur.toFixed(2)) })
  }
  return data
}

export const LIVRAISONS_30J = buildLivraisons()
