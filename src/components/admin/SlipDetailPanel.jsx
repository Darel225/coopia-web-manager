import { useState } from 'react'
import { CheckCircle2, Loader2, Phone, MapPin, User, Scale, Banknote, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Card from '../common/Card'
import Timeline from './Timeline'
import { useRecoltesStore, CROP_PRICING } from '../../store/recoltesStore'

function formatPoids(val) {
  return (
    Number(val || 0).toLocaleString('fr-FR', {
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

export default function SlipDetailPanel({ slip }) {
  const [isValidating, setIsValidating] = useState(false)
  const validateBordereau = useRecoltesStore((state) => state.validateBordereau)

  if (!slip) {
    return (
      <Card id="panel-slip-detail" className="p-5">
        <p className="text-sm text-ink-muted">Aucun bordereau sélectionné.</p>
      </Card>
    )
  }

  const isPending = slip.statut === 'En attente'
  const crop = (slip.crop || 'cacao').toLowerCase()
  const cropInfo = CROP_PRICING[crop] || CROP_PRICING.cacao

  const handleValidate = async () => {
    if (!isPending || isValidating) return

    setIsValidating(true)
    try {
      await validateBordereau(slip.id)
      toast.success(`Pesée ${slip.code} validée avec succès`, {
        description: `Lot de ${formatPoids(slip.poidsKg)} de ${slip.planteur} certifié. Valeur d'achat : ${formatFcfa(slip.valeurFcfa)}.`,
      })
    } catch (err) {
      toast.error('Erreur lors de la validation du bordereau')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card id="panel-slip-detail" className="flex flex-col justify-between gap-5 p-5">
      <div className="space-y-4">
        {/* En-tête du panneau avec référence et badges */}
        <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">Bordereau de pesée</span>
            <h2 className="font-mono text-base font-bold text-forest-900">
              {slip.codeFormatted || slip.code}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cropInfo.bg} ${cropInfo.text} ${cropInfo.border}`}>
              {cropInfo.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isPending
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'}`} />
              {slip.statut}
            </span>
          </div>
        </div>

        {/* Coordonnées Planteur */}
        <div className="rounded-xl border border-line bg-[#FAF8F5] p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-ink">
            <User className="h-3.5 w-3.5 text-forest-800 shrink-0" />
            <span className="font-semibold">{slip.planteur}</span>
          </div>
          {slip.phone && (
            <div className="flex items-center gap-2 text-ink-muted">
              <Phone className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              <span className="font-mono">{slip.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-ink-muted">
            <MapPin className="h-3.5 w-3.5 text-ink-muted shrink-0" />
            <span>Section : <strong className="text-ink font-semibold">{slip.village}</strong></span>
          </div>
        </div>

        {/* Fiche Financière & Pesée */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-emerald-700" />
              Poids net réceptionné :
            </span>
            <span className="font-bold text-ink">{formatPoids(slip.poidsKg)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Sacs pesés :</span>
            <span className="font-medium text-ink">{slip.sacs || Math.max(1, Math.round(slip.poidsKg / 50))} sacs</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Prix bord-champ garanti :</span>
            <span className="font-mono font-medium text-ink">{formatFcfa(slip.unitPrice || cropInfo.priceKg)} / kg</span>
          </div>

          <div className="border-t border-emerald-200 pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-emerald-700" />
              Montant garanti planteur :
            </span>
            <span className="font-mono text-sm font-bold text-emerald-900">
              {formatFcfa(slip.valeurFcfa)}
            </span>
          </div>
        </div>

        {/* Timeline verticale */}
        <div className="rounded-xl border border-line bg-white p-3.5">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-ink">
            <ShieldCheck className="h-4 w-4 text-forest-800" />
            <span>Traçabilité & Étapes de contrôle</span>
          </div>
          <Timeline slip={slip} />
        </div>
      </div>

      {/* Bouton d'action principal */}
      <div className="pt-2">
        <button
          id="btn-validate-slip"
          type="button"
          onClick={handleValidate}
          disabled={!isPending || isValidating}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition-all ${
            isPending
              ? 'bg-forest-900 text-white hover:bg-forest-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-900/30 active:scale-[0.99] cursor-pointer shadow-sm'
              : 'bg-emerald-700 text-white cursor-default shadow-xs'
          }`}
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>Validation en cours…</span>
            </>
          ) : isPending ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>Valider la pesée</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>Pesée validée & certifiée</span>
            </>
          )}
        </button>
      </div>
    </Card>
  )
}
