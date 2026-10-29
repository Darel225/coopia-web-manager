import React, { useMemo } from 'react'
import { Map, Lightbulb } from 'lucide-react'

// Table de géoréférencement ivoirien (positionnement sur le canevas géographique)
const IVORY_COAST_LOCALITIES = {
  // District d'Abidjan & Lagunes
  Abobo: { x: 76, y: 72, region: "District d'Abidjan" },
  Attecoube: { x: 71, y: 74, region: "District d'Abidjan" },
  Yopougon: { x: 67, y: 73, region: "District d'Abidjan" },
  Cocody: { x: 79, y: 71, region: "District d'Abidjan" },
  Dabou: { x: 64, y: 75, region: 'Grands-Ponts' },

  // Boucle du Cacao & Café
  Pindikro: { x: 30, y: 40, region: 'Nawa' },
  'Soubré': { x: 48, y: 62, region: 'Nawa' },
  Bodokro: { x: 52, y: 26, region: 'Gbêkê' },
  Divo: { x: 78, y: 46, region: 'Lôh-Djiboua' },
  Man: { x: 14, y: 24, region: 'Tonkpi' },
  Daloa: { x: 38, y: 32, region: 'Haut-Sassandra' },
  Gagnoa: { x: 58, y: 52, region: 'Gôh' },
  SanPedro: { x: 42, y: 78, region: 'San-Pédro' },
  'San-Pédro': { x: 42, y: 78, region: 'San-Pédro' },
  Bouaké: { x: 56, y: 22, region: 'Gbêkê' },
  Yamoussoukro: { x: 50, y: 38, region: 'Bélier' },
  Méagui: { x: 44, y: 54, region: 'Nawa' },
  Oupoyo: { x: 46, y: 48, region: 'Nawa' },
}

// Fonction de calcul de coordonnées (Dictionnaire + Fallback déterministe pour tout nouveau village)
function getVillageCoordinates(villageName, index = 0) {
  const norm = (villageName || '').trim().toLowerCase()
  for (const [key, coords] of Object.entries(IVORY_COAST_LOCALITIES)) {
    const kNorm = key.toLowerCase()
    if (kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm)) {
      return coords
    }
  }

  // Si village inconnu (ex: un nouveau village créé lors d'un test), projection spatiale harmonieuse
  let hash = 0
  for (let i = 0; i < norm.length; i++) {
    hash = (hash << 5) - hash + norm.charCodeAt(i)
    hash |= 0
  }
  const x = 22 + (Math.abs(hash) % 58)
  const y = 20 + ((Math.abs(hash >> 3) + index * 12) % 52)
  return { x, y, region: 'Coopérative' }
}

export default function OutbreakMapSvg({
  diagnostics = [],
  selectedVillage = null,
  onSelectVillage = () => {},
}) {
    // Agrégation 100% DYNAMIQUE UNIQUEMENT des localités déclarées dans les diagnostics
  const { activeFoyers, activeCount, surveillanceCount, underControlCount, dominantFoyer } = useMemo(() => {
    const list = diagnostics || []
    const villageMap = {}

    list.forEach((d) => {
      const rawVillage = (d.village || 'Soubré').trim()
      const vKey = rawVillage.charAt(0).toUpperCase() + rawVillage.slice(1)

      if (!villageMap[vKey]) {
        villageMap[vKey] = {
          name: vKey,
          count: 0,
          critical: 0,
          treated: 0,
          planters: new Set(),
          crops: new Set(),
          diseases: new Set(),
        }
      }

      villageMap[vKey].count += 1
      if (d.planter) villageMap[vKey].planters.add(d.planter)
      if (d.crop) villageMap[vKey].crops.add(d.crop)
      if (d.title || d.disease_name) {
        villageMap[vKey].diseases.add((d.disease_name || d.title).split(' ')[0])
      }

      const isCrit =
        d.severity === 'Critique' ||
        d.status === 'ESCALATED' ||
        (d.confidence_score && d.confidence_score >= 0.9 && d.status !== 'TREATED')
      const isTreat = d.status === 'TREATED' || d.severity === 'Traité'

      if (isCrit) {
        villageMap[vKey].critical += 1
      }
      if (isTreat) {
        villageMap[vKey].treated += 1
      }
    })

    // Transformer en liste de foyers réels avec coordonnées dynamiques
    const foyers = Object.values(villageMap).map((item, idx) => {
      const coords = getVillageCoordinates(item.name, idx)
      // Règle du cluster épidémique : Foyer Actif / Critique si cluster >= 2 cas signalés
      // Un cas isolé (ex: 1 cas à Soubré, Man, Abobo) est placé en Surveillance active
      const isCritical = item.count >= 2 && item.critical > 0
      // Foyer sous contrôle si tous les cas signalés ont été traités ou résolus
      const isUnderControl = !isCritical && item.treated > 0 && item.treated >= item.count
      const status = isCritical ? 'Actif' : isUnderControl ? 'Sous contrôle' : 'Surveillance'

      return {
        ...item,
        coords,
        isCritical,
        status,
        plantersSummary: item.planters.size > 0 ? Array.from(item.planters).slice(0, 2).join(', ') : 'Planteurs coopérative',
        diseasesSummary: item.diseases.size > 0 ? Array.from(item.diseases).slice(0, 2).join(', ') : 'Sous contrôle',
      }
    })

    const actCount = foyers.filter((f) => f.status === 'Actif').length
    const survCount = foyers.filter((f) => f.status === 'Surveillance').length
    const underCount = foyers.filter((f) => f.status === 'Sous contrôle').length

    // Identifier le foyer le plus critique
    let topFoyer = foyers[0] || null
    foyers.forEach((f) => {
      if (!topFoyer || f.critical > topFoyer.critical || (f.critical === topFoyer.critical && f.count > topFoyer.count)) {
        topFoyer = f
      }
    })

    return {
      activeFoyers: foyers,
      activeCount: actCount,
      surveillanceCount: survCount,
      underControlCount: underCount,
      dominantFoyer: topFoyer,
    }
  }, [diagnostics])

  return (
    <div className="flex h-full flex-col justify-between rounded-[16px] border border-line bg-white p-5 shadow-2xs">
            {/* Header avec disposition aérée et badges anti-chevauchement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-forest-800/10 text-forest-900">
            <Map className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink truncate">Cartographie des foyers</h3>
            <p className="text-[11px] text-ink-muted truncate">Bassins déclarés sous surveillance sanitaire</p>
          </div>
        </div>

        {/* Légende en badges pills soignés avec disposition horizontale garantie */}
        <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200/80 px-2.5 py-0.5 text-red-700 whitespace-nowrap shadow-2xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626] animate-pulse" aria-hidden="true" />
            Actif ({activeCount})
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-amber-800 whitespace-nowrap shadow-2xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D97706]" aria-hidden="true" />
            Surveillance ({surveillanceCount})
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-emerald-800 whitespace-nowrap shadow-2xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
            Sous contrôle ({underControlCount})
          </span>
        </div>
      </div>

      {/* Stylized SVG Map Container */}
      <div className="relative h-[220px] w-full overflow-hidden rounded-[12px] bg-[#F6F4F0] border border-[#EBE7DF]">
        {/* SVG Road network & agricultural corridors */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 540 220"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Faint topography / agricultural fields */}
          <path
            d="M -20 180 Q 140 160 260 200 T 560 160"
            stroke="#E7E3D8"
            strokeWidth="32"
            opacity="0.45"
            fill="none"
          />

          {/* Secondary tracks (dashed) */}
          <path
            d="M 50 40 C 120 70, 160 120, 240 150 C 320 180, 420 150, 520 80"
            stroke="#CBD5D1"
            strokeWidth="1.75"
            strokeDasharray="4 4"
          />
          <path
            d="M 80 190 C 180 140, 240 90, 320 60 C 400 30, 470 50, 530 40"
            stroke="#CBD5D1"
            strokeWidth="1.75"
            strokeDasharray="4 4"
          />

          {/* Main corridor - Sage/Mint road */}
          <path
            d="M 60 230 C 120 160, 170 100, 250 50 C 310 15, 380 30, 500 -10"
            stroke="#A3C5BA"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Primary Route connecting agricultural basins */}
          <path
            d="M 80 60 C 140 90, 170 80, 220 95 C 270 110, 320 150, 390 120 C 430 100, 460 110, 490 115"
            stroke="#CBD5D1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* RENDU 100% DYNAMIQUE DE TOUS LES VILLAGES DÉTECTÉS */}
        {activeFoyers.map((foyer) => {
          const isSelected = selectedVillage && selectedVillage.toLowerCase() === foyer.name.toLowerCase()
          const isCrit = foyer.isCritical

          return (
            <div
              key={foyer.name}
              style={{
                left: `${foyer.coords.x}%`,
                top: `${foyer.coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform hover:scale-110"
              onClick={() => onSelectVillage(isSelected ? null : foyer.name)}
              title={`${foyer.name} : ${foyer.count} cas (${foyer.status}). Planteur(s) : ${foyer.plantersSummary}`}
            >
              {/* Point lumineux d'alerte */}
              <div className="relative mb-1 flex items-center justify-center">
                {isCrit ? (
                  <>
                    {/* Clignotement Radar Rouge Pulsant */}
                    <span className="absolute h-8 w-8 animate-ping rounded-full bg-[#DC2626]/35 duration-1000" />
                    <span className="h-6 w-6 rounded-full bg-[#DC2626]/25 flex items-center justify-center">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#DC2626] shadow-sm" />
                    </span>
                  </>
                ) : foyer.status === 'Surveillance' ? (
                  <>
                    {/* Impulsion Ambre Surveillance */}
                    <span className="absolute h-6 w-6 animate-pulse rounded-full bg-[#D97706]/25 duration-1000" />
                    <span className="h-5 w-5 rounded-full bg-[#D97706]/25 flex items-center justify-center">
                      <span className="h-3 w-3 rounded-full bg-[#D97706] shadow-xs" />
                    </span>
                  </>
                ) : (
                  <>
                    {/* Vert Sous Contrôle */}
                    <span className="h-4 w-4 rounded-full bg-[#059669]/20 flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#059669] shadow-xs" />
                    </span>
                  </>
                )}
              </div>

              {/* Badge de Localité */}
              <span
                className={`rounded-[6px] px-2 py-0.5 text-[10px] font-semibold transition-all shadow-xs whitespace-nowrap ${
                  isSelected
                    ? 'bg-forest-900 text-white ring-2 ring-emerald-400 font-bold scale-105'
                    : isCrit
                    ? 'bg-[#B91C1C] text-white hover:brightness-110'
                    : foyer.status === 'Surveillance' ? 'bg-[#1E293B] text-white hover:bg-forest-900' : 'bg-[#047857] text-white hover:bg-emerald-800'
                }`}
              >
                {foyer.name} ({foyer.count})
              </span>

              {/* Sous-titre maladie dominante */}
              <span className={`text-[9px] font-medium leading-none mt-0.5 ${isCrit ? 'text-[#B91C1C] font-bold' : foyer.status === 'Surveillance' ? 'text-stone-600' : 'text-emerald-700 font-semibold'}`}>
                {isCrit ? 'Alerte Critique' : foyer.status === 'Surveillance' ? (foyer.diseasesSummary || 'Surveillance') : 'Sous contrôle'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Dynamic AI Insight Box */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#F3E6B3] bg-[#FEF9E7] p-2.5 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={1.75} aria-hidden="true" />
        <p className="leading-relaxed">
          <span className="font-semibold">Lecture : </span>
          {dominantFoyer ? (
            <>
              Foyer épidémique prioritaire identifié à <strong className="text-[#854D0E]">{dominantFoyer.name}</strong> ({dominantFoyer.count} cas signalés dont {dominantFoyer.critical} critique{dominantFoyer.critical > 1 ? 's' : ''}).
            </>
          ) : (
            'Aucun foyer épidémique majeur signalé cette semaine.'
          )}
          {selectedVillage && (
            <span className="ml-1 text-emerald-800 font-semibold underline">
              Filtre actif : {selectedVillage} (cliquer pour réinitialiser).
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
