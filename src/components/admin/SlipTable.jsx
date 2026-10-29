import Pagination from './Pagination'
import { CROP_PRICING } from '../../store/recoltesStore'

function formatPoids(val) {
  return (
    val.toLocaleString('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }) + ' kg'
  )
}

function formatFcfa(val) {
  return (
    Number(val || 0).toLocaleString('fr-FR', {
      maximumFractionDigits: 0,
    }) + ' FCFA'
  )
}

function StatusPill({ status }) {
  if (status === 'Validé') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF5E6] px-2 py-0.5 text-[11px] font-semibold text-[#1E7B45]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1E7B45]" />
        Validé
      </span>
    )
  }
  if (status === 'Rejeté') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FDE4E4] px-2 py-0.5 text-[11px] font-semibold text-[#C0262D]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C0262D]" />
        Rejeté
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDEFC8] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A00]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] animate-pulse" />
      En attente
    </span>
  )
}

function CropBadge({ crop }) {
  const c = (crop || 'cacao').toLowerCase()
  const info = CROP_PRICING[c] || CROP_PRICING.cacao

  const badgeStyles = {
    cacao: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cafe: 'bg-amber-50 text-amber-900 border-amber-200',
    anacarde: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  }

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badgeStyles[c] || badgeStyles.cacao}`}>
      {info.label}
    </span>
  )
}

export default function SlipTable({
  slips = [],
  selectedId,
  onSelectSlip,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
}) {
  return (
    <div
      id="table-slips-card"
      className="rounded-2xl border border-line bg-[#F6F3EE] shadow-[0_1px_2px_rgba(20,32,26,0.04)]"
    >
      <div className="w-full">
        <table className="w-full table-fixed border-collapse text-left" aria-label="Liste des bordereaux de récolte">
          <thead>
            <tr className="h-11 border-b border-line bg-[#F6F3EE] text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              <th scope="col" className="w-[20%] px-3 font-semibold">
                RÉF.
              </th>
              <th scope="col" className="w-[24%] px-2.5 font-semibold">
                PLANTEUR & SECTION
              </th>
              <th scope="col" className="w-[13%] px-2 font-semibold">
                FILIÈRE
              </th>
              <th scope="col" className="w-[15%] px-2 font-semibold">
                POIDS
              </th>
              <th scope="col" className="w-[16%] px-2 font-semibold">
                VALEUR
              </th>
              <th scope="col" className="w-[12%] px-2.5 text-right font-semibold">
                STATUT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {slips.length === 0 ? (
              <tr>
                <td colSpan="6" className="h-28 text-center text-sm text-ink-muted bg-white">
                  Aucun bordereau ne correspond aux critères de recherche et filtres.
                </td>
              </tr>
            ) : (
              slips.map((slip) => {
                const isSelected = slip.id === selectedId
                return (
                  <tr
                    key={slip.id}
                    id={`slip-row-${slip.id}`}
                    onClick={() => onSelectSlip(slip.id)}
                    className={`h-12 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EFECE5]'
                        : 'bg-white hover:bg-[#FAF8F4]'
                    }`}
                  >
                    {/* RÉF */}
                    <td className="px-3 font-mono text-[11px] truncate">
                      <span
                        className={
                          isSelected
                            ? 'font-bold text-forest-900 underline decoration-forest-900/40 underline-offset-2'
                            : 'font-medium text-ink-muted'
                        }
                      >
                        {slip.code}
                      </span>
                    </td>

                    {/* PLANTEUR & SECTION */}
                    <td className="px-2.5 text-xs truncate">
                      <div className="font-semibold text-ink truncate">{slip.planteur}</div>
                      <div className="text-[11px] text-ink-muted truncate">
                        {slip.village}{slip.phone ? ` • ${slip.phone}` : ''}
                      </div>
                    </td>

                    {/* FILIÈRE */}
                    <td className="px-2">
                      <CropBadge crop={slip.crop} />
                    </td>

                    {/* POIDS */}
                    <td className="px-2 text-xs">
                      <div className="font-bold text-ink">{formatPoids(slip.poidsKg)}</div>
                      {slip.sacs ? (
                        <div className="text-[10px] text-ink-muted">({slip.sacs} sacs)</div>
                      ) : null}
                    </td>

                    {/* VALEUR */}
                    <td className="px-2 text-xs font-bold text-emerald-800 font-mono truncate">
                      {formatFcfa(slip.valeurFcfa)}
                    </td>

                    {/* STATUT */}
                    <td className="px-2.5 text-right">
                      <StatusPill status={slip.statut} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de carte avec Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  )
}
