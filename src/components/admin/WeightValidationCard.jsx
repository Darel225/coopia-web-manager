import React from 'react'
import { Scale, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import { cn } from '../../utils/cn'

export default function WeightValidationCard({
  bordereau,
  onValidate,
  isValidating,
  className,
}) {
  if (!bordereau) return null

  const isCompliant = bordereau.tauxHumidite <= 8.0

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-xs transition-all',
        isCompliant ? 'border-emerald-200' : 'border-rose-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {bordereau.code}
        </span>
        <StatusBadge status={bordereau.statut} size="xs" />
      </div>

      <div className="mt-3">
        <h4 className="font-bold text-ink text-base">{bordereau.planteur.nom}</h4>
        <p className="text-xs text-ink-muted">
          {bordereau.planteur.village} • {bordereau.variete}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2">
          <span className="text-[10px] text-ink-muted uppercase">Poids</span>
          <p className="font-bold text-ink text-sm">{bordereau.poidsKg} kg</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <span className="text-[10px] text-ink-muted uppercase">Humidité</span>
          <p
            className={cn(
              'font-bold text-sm',
              isCompliant ? 'text-forest' : 'text-rose-600'
            )}
          >
            {bordereau.tauxHumidite}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <span className="text-[10px] text-ink-muted block">Montant</span>
          <span className="font-bold text-forest text-sm">
            {bordereau.montantTotal.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {bordereau.statut === 'En attente' ? (
          <Button
            variant="forest"
            size="sm"
            icon={CheckCircle}
            isLoading={isValidating}
            onClick={() => onValidate?.(bordereau)}
          >
            Valider la pesée
          </Button>
        ) : (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Validé
          </span>
        )}
      </div>
    </div>
  )
}
