import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Calcule la liste des pages à afficher (ex: 1, 2, 3...)
  const pages = []
  const maxDisplayedPages = 5
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1)
  if (endPage - startPage + 1 < maxDisplayedPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1)
  }

  for (let p = startPage; p <= endPage; p++) {
    pages.push(p)
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 bg-[#F6F3EE] px-5 py-3.5 border-t border-line"
      aria-label="Pagination des bordereaux"
    >
      <span className="text-[13px] text-ink-muted">
        Affichage {startItem}-{endItem} sur {totalItems} bordereaux
      </span>

      <div className="flex items-center gap-1.5">
        {/* Précédent */}
        <button
          id="pagination-prev"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-[8px] border border-line bg-white text-ink transition-colors ${
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-[#F4F1EB] cursor-pointer'
          }`}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {/* Boutons de pages */}
        {pages.map((p) => {
          const isActive = p === currentPage
          return (
            <button
              key={p}
              id={`pagination-page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-forest-900 text-white font-semibold'
                  : 'bg-white border border-line text-ink hover:bg-[#F4F1EB] cursor-pointer'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          )
        })}

        {/* Suivant */}
        <button
          id="pagination-next"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-[8px] border border-line bg-white text-ink transition-colors ${
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-[#F4F1EB] cursor-pointer'
          }`}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
