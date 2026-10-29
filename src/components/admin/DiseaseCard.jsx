import imgDefaultFallback from '../../assets/diagnostics/pourriture_brune.jpg'
import React from 'react'
import { Truck, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function DiseaseCard({
  id,
  image,
  title,
  severity, // 'Critique' | 'Modérée' | 'Traité'
  planter,
  village,
  parcelle,
  boxLabel,
  botLabel,
  boxStyle = { top: '16%', left: '16%', width: '60%', height: '62%' },
  status = 'DETECTED',
  fallbackImage = imgDefaultFallback,
  onOpenModal = () => {},
}) {
  const isCritical = severity === 'Critique'
  const isDispatched = status === 'DISPATCHED' || status === 'TREATED'

  return (
    <div
      id={`disease-card-${id}`}
      className="flex flex-col justify-between rounded-[16px] border border-line bg-white p-4 shadow-2xs transition-all hover:shadow-md hover:border-[#CBD5D1] group"
    >
      <div>
        {/* Photo Container with AI Bounding Box */}
        <div
          className="relative h-[190px] w-full overflow-hidden rounded-[12px] bg-slate-900 cursor-pointer"
          onClick={onOpenModal}
          title="Cliquer pour afficher la fiche d'intervention complète"
        >
          <img
            src={image || fallbackImage || imgDefaultFallback}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const targetFallback = fallbackImage || imgDefaultFallback
              if (e.target.src !== targetFallback) {
                e.target.src = targetFallback
              }
            }}
          />

          {/* AI Bounding Box Detection */}
          <div
            className={`pointer-events-none absolute border-2 border-dashed ${
              isCritical ? 'border-[#DC2626]' : 'border-[#D97706]'
            }`}
            style={boxStyle}
          >
            {/* Top Tag attached to detection box */}
            <span
              className={`absolute -top-3.5 left-0 rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs ${
                isCritical ? 'bg-[#DC2626]' : 'bg-[#D97706]'
              }`}
            >
              {boxLabel}
            </span>
          </div>

          {/* Bottom Dark Gradient Banner */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/90">
              {botLabel}
            </span>
            {isDispatched && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Agronome assigné
              </span>
            )}
          </div>
        </div>

        {/* Title & Severity Badge */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <h4
            className="text-[14px] font-bold text-ink leading-tight cursor-pointer hover:text-forest-800"
            onClick={onOpenModal}
          >
            {title}
          </h4>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isDispatched
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isCritical
                ? 'bg-[#FEE2E2] text-[#B91C1C] border border-red-200'
                : 'bg-[#FEF3C7] text-[#B45309] border border-amber-200'
            }`}
          >
            {isDispatched ? 'En cours' : severity}
          </span>
        </div>

        {/* Planter & Village & Parcelle */}
        <p className="mt-1 text-xs text-ink-muted">
          <strong className="text-ink">{planter}</strong> • {village}
        </p>
        <p className="text-[11px] text-stone-600 mt-0.5">
          Parcelle : {parcelle || 'Principale'}
        </p>
      </div>

      {/* Action Button: Dépêcher un agronome */}
      <button
        id={`btn-dispatch-${id}`}
        type="button"
        onClick={onOpenModal}
        className={`mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[12px] font-semibold shadow-2xs transition-all active:scale-[0.99] ${
          isDispatched
            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
            : 'bg-forest-900 text-white hover:bg-forest-800'
        }`}
      >
        <Truck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        <span>{isDispatched ? 'Agronome dépêché (Voir suivi)' : 'Dépêcher un agronome'}</span>
      </button>
    </div>
  )
}
