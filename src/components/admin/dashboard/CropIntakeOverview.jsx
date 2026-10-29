import { useMemo } from 'react'
import { CheckCircle2, ShieldCheck, MapPin } from 'lucide-react'
import { useRecoltesStore, CROP_PRICING } from '../../../store/recoltesStore'

const fr = (n) =>
  Number(n || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const frInt = (n) =>
  Number(n || 0).toLocaleString('fr-FR')

export default function CropIntakeOverview({ activeCrop = 'all' }) {
  const bordereaux = useRecoltesStore((state) => state.bordereaux)

  // Calcul dynamique consolidé pour les 3 filières d'activité
  const filieresData = useMemo(() => {
    const totalTonnageKg = bordereaux.reduce((acc, s) => acc + (s.poidsKg || 0), 0)

    const buildFiliere = (id, name, regulator, regulatorShort, color, lightBg, border, defaultPrice) => {
      const slips = bordereaux.filter((s) => (s.crop || 'cacao').toLowerCase() === id)
      const tonnageKg = slips.reduce((acc, s) => acc + (s.poidsKg || 0), 0)
      const tonnage = Number((tonnageKg / 1000).toFixed(2))
      const sacs = slips.reduce((acc, s) => acc + (s.sacs || 0), 0)
      const valeur = slips.reduce((acc, s) => acc + (s.valeurFcfa || 0), 0)
      
      const valideSlips = slips.filter((s) => s.statut === 'Validé')
      const valideTonnage = Number((valideSlips.reduce((acc, s) => acc + (s.poidsKg || 0), 0) / 1000).toFixed(2))
      const pendingTonnage = Number(Math.max(0, tonnage - valideTonnage).toFixed(2))
      const sharePct = totalTonnageKg > 0 ? Number(((tonnageKg / totalTonnageKg) * 100).toFixed(1)) : 0
      const planters = new Set(slips.map((s) => s.planteur)).size

      // Agrégation par village
      const villageMap = {}
      slips.forEach((s) => {
        const v = s.village || 'Section'
        if (!villageMap[v]) {
          villageMap[v] = { name: v, tonnageKg: 0, sacs: 0, valeur: 0 }
        }
        villageMap[v].tonnageKg += s.poidsKg || 0
        villageMap[v].sacs += s.sacs || 0
        villageMap[v].valeur += s.valeurFcfa || 0
      })

      const villages = Object.values(villageMap).map((v) => ({
        name: v.name,
        tonnage: Number((v.tonnageKg / 1000).toFixed(2)),
        sacs: v.sacs,
        valeur: v.valeur,
      })).sort((a, b) => b.tonnage - a.tonnage)

      return {
        id,
        name,
        regulator,
        regulatorShort,
        color,
        lightBg,
        border,
        price: defaultPrice,
        tonnage,
        tonnageKg,
        valeur,
        sharePct,
        sacs,
        planters,
        valideTonnage,
        pendingTonnage,
        villages,
      }
    }

    return {
      cacao: buildFiliere('cacao', 'Cacao', 'Conseil Café-Cacao (CCC)', 'CCC', '#15803D', '#F0FDF4', '#BBF7D0', 1850),
      cafe: buildFiliere('cafe', 'Café Robusta', 'Conseil Café-Cacao (CCC)', 'CCC', '#854D0E', '#FEFCE8', '#FEF08A', 1000),
      anacarde: buildFiliere('anacarde', 'Anacarde / Cajou', 'Conseil Coton-Anacarde (CCA)', 'CCA', '#CA8A04', '#FFFBEB', '#FDE68A', 350),
    }
  }, [bordereaux])

  const isAll = activeCrop === 'all'
  const selectedFiliere = filieresData[activeCrop] || null

  return (
    <div className="flex flex-col justify-between h-full space-y-3 font-sans">
      {/* VUE 1 : TOUS LES PRODUITS (3 cartes professionnelles sobres) */}
      {isAll && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(filieresData).map((f) => {
            const pctValide = f.tonnage > 0 ? Math.round((f.valideTonnage / f.tonnage) * 100) : 100
            return (
              <div
                key={f.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div>
                  {/* En-tête : Titre & Badge régulateur officiel */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: f.color }}
                          aria-hidden="true"
                        />
                        <h3 className="text-[14px] font-bold text-stone-900 leading-tight">
                          {f.name}
                        </h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {f.regulatorShort}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {f.sharePct}% du tonnage global
                      </p>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[11.5px] font-bold border tabular-nums"
                      style={{
                        backgroundColor: f.lightBg,
                        color: f.color,
                        borderColor: f.border,
                      }}
                    >
                      {frInt(f.price)} FCFA/kg
                    </span>
                  </div>

                  {/* Chiffres clés Tonnage & Valeur */}
                  <div className="grid grid-cols-2 gap-2.5 my-3">
                    <div className="bg-stone-50/80 rounded-lg p-2.5 border border-stone-100">
                      <p className="text-[11px] text-stone-500 font-medium">Tonnage pesé</p>
                      <p className="text-[17px] font-bold text-stone-900 tabular-nums">
                        {fr(f.tonnage)} <span className="text-[11.5px] font-normal text-stone-500">T</span>
                      </p>
                      <p className="text-[11px] text-stone-500 tabular-nums">
                        {f.sacs} sacs réceptionnés
                      </p>
                    </div>

                    <div className="bg-stone-50/80 rounded-lg p-2.5 border border-stone-100">
                      <p className="text-[11px] text-stone-500 font-medium">Valeur garantie</p>
                      <p className="text-[17px] font-bold text-emerald-800 tabular-nums">
                        {(f.valeur / 1000000).toFixed(2)} <span className="text-[11.5px] font-normal text-stone-500">M F</span>
                      </p>
                      <p className="text-[11px] text-stone-500 tabular-nums">
                        {frInt(f.valeur)} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Barre d'état de conformité pont-bascule */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-600 font-medium">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Validé : {fr(f.valideTonnage)} T</span>
                      </span>
                      <span className="text-stone-500 tabular-nums">{pctValide}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${pctValide}%` }}
                      />
                      {f.pendingTonnage > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${100 - pctValide}%` }}
                          title={`En attente : ${fr(f.pendingTonnage)} T`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Localités de production */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11.5px] text-stone-500">
                  <span className="truncate pr-1">Bassins : <strong className="text-stone-700">{f.villages.map(v => v.name).join(', ')}</strong></span>
                  <span className="shrink-0 text-stone-600 font-medium">{f.planters} planteur{f.planters > 1 ? 's' : ''}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VUE 2 : DÉTAIL LORS D'UN FILTRE SPÉCIFIQUE */}
      {!isAll && selectedFiliere && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-stone-200 bg-stone-50/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: selectedFiliere.color }}
                />
                <h3 className="text-[15px] font-bold text-stone-900 leading-tight">
                  Filière {selectedFiliere.name}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200">
                  {selectedFiliere.regulator}
                </span>
              </div>
              <p className="text-[12px] text-stone-600 mt-1">
                Barème officiel d'État : <strong className="text-stone-900">{frInt(selectedFiliere.price)} FCFA / kg</strong> • Part de collecte : <strong>{selectedFiliere.sharePct}%</strong>
              </p>
            </div>

            <div className="flex items-center gap-5 text-[12px] tabular-nums">
              <div className="text-right">
                <p className="text-stone-500">Volume total</p>
                <p className="text-[17px] font-bold text-stone-900">{fr(selectedFiliere.tonnage)} T</p>
              </div>
              <div className="text-right pl-4 border-l border-stone-200">
                <p className="text-stone-500">Valeur totale</p>
                <p className="text-[17px] font-bold text-emerald-800">{frInt(selectedFiliere.valeur)} FCFA</p>
              </div>
            </div>
          </div>

          {/* Décomposition par localité */}
          <div className="border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-stone-50/90 border-b border-stone-200 flex justify-between items-center text-[12px] font-semibold text-stone-700">
              <span>Bassin de production</span>
              <span>Volume & Trésorerie garantie</span>
            </div>
            <div className="divide-y divide-stone-100">
              {selectedFiliere.villages.map((v) => (
                <div key={v.name} className="px-4 py-3 flex items-center justify-between text-[13px] hover:bg-stone-50/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{v.name}</span>
                    <span className="text-[11.5px] text-stone-500">({v.sacs} sacs)</span>
                  </div>
                  <div className="flex items-center gap-5 tabular-nums">
                    <span className="font-bold text-stone-900">{fr(v.tonnage)} T</span>
                    <span className="font-bold text-emerald-800">{frInt(v.valeur)} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
