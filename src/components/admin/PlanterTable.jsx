import { ChevronLeft, ChevronRight, Phone, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

function formatFcfa(val) {
  return (
    Number(val || 0).toLocaleString('fr-FR', {
      maximumFractionDigits: 0,
    }) + ' FCFA'
  )
}

function CropBadge({ crop }) {
  const c = (crop || 'cacao').toLowerCase()
  const badges = {
    cacao: { label: 'Cacao', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    cafe: { label: 'Café', style: 'bg-amber-50 text-amber-900 border-amber-200' },
    anacarde: { label: 'Anacarde', style: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
  }
  const info = badges[c] || badges.cacao

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${info.style}`}>
      {info.label}
    </span>
  )
}

function SanteBadge({ risque, rendement, seuil }) {
  if (risque === 'Critique') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
        Critique
      </span>
    )
  }
  if (risque === 'Modéré') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        Vigilance
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
      Élite
    </span>
  )
}

export default function PlanterTable({
  planters = [],
  selectedId,
  onSelectPlanter,
  currentPage = 1,
  totalPages = 1,
  totalItems = 6,
  pageSize = 6,
  onPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div
      id="table-planters-card"
      className="rounded-2xl border border-line bg-[#F6F3EE] shadow-[0_1px_2px_rgba(20,32,26,0.04)]"
    >
      <div className="w-full">
        <table className="w-full table-fixed border-collapse text-left" aria-label="Registre des planteurs et parcelles">
          <thead>
            <tr className="h-11 border-b border-line bg-[#F6F3EE] text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              <th scope="col" className="w-[26%] px-3.5 font-semibold">
                Planteur & Contact
              </th>
              <th scope="col" className="w-[18%] px-2 font-semibold">
                Bassin & Filière
              </th>
              <th scope="col" className="w-[16%] px-2 font-semibold">
                Superficie
              </th>
              <th scope="col" className="w-[18%] px-2 font-semibold">
                Livraisons
              </th>
              <th scope="col" className="w-[22%] px-3 text-right font-semibold">
                Santé / Risque
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {planters.length === 0 ? (
              <tr>
                <td colSpan="5" className="h-32 text-center text-sm text-ink-muted bg-white">
                  Aucun planteur ne correspond aux filtres de recherche.
                </td>
              </tr>
            ) : (
              planters.map((p) => {
                const isSelected = p.id === selectedId
                const isAlert = p.risque === 'Critique'

                return (
                  <tr
                    key={p.id}
                    id={`planter-row-${p.id}`}
                    onClick={() => onSelectPlanter(p.id)}
                    className={`h-13 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EFECE5] shadow-xs'
                        : 'bg-white hover:bg-[#FAF8F4]'
                    }`}
                  >
{/* Planteur & Contact avec Avatar Photo */}
                    <td className="px-3.5 text-xs truncate">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100 shadow-2xs">
                          {p.avatar ? (
                            <img
                              src={p.avatar}
                              alt={p.nom}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-full w-full items-center justify-center font-bold text-xs text-forest-900 bg-forest-100 ${
                              p.avatar ? 'hidden' : 'flex'
                            }`}
                          >
                            {p.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          {isSelected && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className={`font-semibold block truncate ${isSelected ? 'text-forest-900' : 'text-ink'}`}>
                            {p.nom}
                          </span>
                          {p.phone && (
                            <div className="font-mono text-[11px] text-ink-muted truncate">
                              {p.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Bassin & Filière */}
                    <td className="px-2 text-xs truncate">
                      <div className="font-medium text-ink truncate">{p.village}</div>
                      <div className="mt-0.5">
                        <CropBadge crop={p.crop} />
                      </div>
                    </td>

                    {/* Superficie & Parcelles */}
                    <td className="px-2 text-xs truncate">
                      <div className="font-bold text-ink">
                        {p.superficieDetail || p.superficie.toString().replace('.', ',')} ha
                      </div>
                      <div className="text-[10.5px] text-ink-muted truncate">
                        {p.parcellesCount || 1} parcelle{(p.parcellesCount || 1) > 1 ? 's' : ''}
                      </div>
                    </td>

                    {/* Livraisons & Rendement */}
                    <td className="px-2 text-xs truncate">
                      <div className={`font-bold ${isAlert ? 'text-red-700' : 'text-forest-900'}`}>
                        {p.livraisonsFormatted || `${p.livraisons} T`}
                        {p.totalBags ? <span className="ml-1 text-[10px] font-normal text-ink-muted">({p.totalBags} sacs)</span> : null}
                      </div>
                      <div className="text-[10.5px] text-ink-muted font-mono">
                        {p.rendement} kg/ha
                      </div>
                    </td>

                    {/* Santé / Risque */}
                    <td className="px-3 text-right">
                      <SanteBadge risque={p.risque} rendement={p.rendement} seuil={p.seuilOfficiel} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau simplifié */}
      <div className="flex items-center justify-between bg-[#F6F3EE] px-4 py-2.5 border-t border-line text-xs text-ink-muted">
        <span>
          Total : <strong className="text-ink font-semibold">{totalItems}</strong> producteurs sociétaires
        </span>
        <span className="text-[11px]">Campagne 2025-2026</span>
      </div>
    </div>
  )
}
