import { useState } from 'react'
import { Phone, MapPin, Scale, Banknote, ShieldCheck, AlertTriangle, Lightbulb, UserCheck, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Card from '../common/Card'
import ParcelMapSvg from './ParcelMapSvg'

function formatFcfa(val) {
  return (
    Number(val || 0).toLocaleString('fr-FR', {
      maximumFractionDigits: 0,
    }) + ' FCFA'
  )
}

export default function PlanterDetailPanel({ planter }) {
  const [isDispatched, setIsDispatched] = useState(false)

  if (!planter) {
    return (
      <Card id="panel-planter-detail" className="p-5">
        <p className="text-sm text-ink-muted">Aucun planteur sélectionné.</p>
      </Card>
    )
  }

  const monthlyDeliveries = planter.livraisonsMonthly || []
  const maxKg = Math.max(...monthlyDeliveries.map((m) => m.kg), 1)
  const MAX_BAR_HEIGHT = 48
  const isCritique = planter.risque === 'Critique'

  const handleDispatchAnader = () => {
    setIsDispatched(true)
    toast.success(`Mission ANADER dépêchée pour ${planter.nom}`, {
      description: `Technicien alerté pour inspection phytosanitaire à ${planter.village} (Parcelle : ${planter.parcelles?.[0]?.name || 'Principale'}).`,
    })
  }

  return (
    <Card id="panel-planter-detail" className="flex flex-col gap-4 p-5">
      {/* 1. En-tête de la fiche producteur avec Grand Avatar Photo 360° */}
      <div className="flex items-start justify-between border-b border-line pb-3">
        <div className="flex items-center gap-3.5">
          {/* Avatar Photo HD */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-emerald-600/30 bg-stone-100 shadow-sm ring-2 ring-forest-900/5">
            {planter.avatar ? (
              <img
                src={planter.avatar}
                alt={planter.nom}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`h-full w-full items-center justify-center font-bold text-base text-forest-900 bg-forest-100 ${
                planter.avatar ? 'hidden' : 'flex'
              }`}
            >
              {planter.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
              Fiche Producteur Membre
            </span>
            <h2 className="text-lg font-bold text-ink tracking-tight">
              {planter.nom}
            </h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="h-3 w-3 text-ink-muted" />
                {planter.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-ink-muted" />
                {planter.village}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="rounded-md border border-line bg-[#FAF8F5] px-2 py-0.5 text-[11px] font-semibold text-ink">
            {planter.cropLabel || planter.crop}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isCritique
                ? 'bg-red-100 text-red-900'
                : planter.risque === 'Modéré'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCritique ? 'bg-red-600 animate-pulse' : planter.risque === 'Modéré' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            />
            {planter.statutLabel || planter.risque}
          </span>
        </div>
      </div>

      {/* 2. Visualiseur Cadastral SVG centré sur la parcelle */}
      <ParcelMapSvg planter={planter} />

      {/* 3. Trio de Cartes Statistiques Clés */}
      <div className="grid grid-cols-3 gap-2">
        {/* Superficie */}
        <div className="rounded-xl border border-line bg-[#FAF8F5] p-2.5 flex flex-col justify-between">
          <span className="text-[10.5px] font-semibold text-ink-muted">Superficie</span>
          <div className="mt-1">
            <span className="text-base font-bold text-ink font-mono block">
              {planter.superficieDetail || planter.superficie} <span className="text-xs font-normal text-ink-muted">ha</span>
            </span>
            <span className="text-[10px] text-ink-muted block">
              {planter.parcellesCount || 1} parcelle{(planter.parcellesCount || 1) > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Rendement */}
        <div className="rounded-xl border border-line bg-[#FAF8F5] p-2.5 flex flex-col justify-between">
          <span className="text-[10.5px] font-semibold text-ink-muted">Rendement</span>
          <div className="mt-1">
            <span className={`text-base font-bold font-mono block ${isCritique ? 'text-red-700' : 'text-ink'}`}>
              {planter.rendement} <span className="text-[11px] font-normal text-ink-muted">kg/ha</span>
            </span>
            <span className="text-[10px] text-ink-muted block">
              Seuil : {planter.seuilOfficiel} kg
            </span>
          </div>
        </div>

        {/* Livraisons */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 flex flex-col justify-between">
          <span className="text-[10.5px] font-semibold text-emerald-900">Total Livré</span>
          <div className="mt-1">
            <span className="text-base font-bold text-forest-900 font-mono block">
              {planter.livraisonsFormatted}
            </span>
            <span className="text-[10px] text-emerald-800 font-medium block truncate">
              {formatFcfa(planter.totalValeur)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bloc Historique des Livraisons 2025/2026 */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink">Évolution des apports</h3>
          <span className="text-xs font-bold text-ink font-mono">
            Total : {planter.livraisonsTotalKg || `${planter.livraisons * 1000} kg`} ({planter.totalBags || 0} sacs)
          </span>
        </div>

        {/* Graphique en barres mensuelles */}
        <div
          className={`flex items-end ${monthlyDeliveries.length <= 3 ? "justify-around px-8" : "justify-between px-2"} pt-1 border-b border-line pb-2`}
          role="region"
          aria-label="Historique mensuel des livraisons"
        >
          {monthlyDeliveries.map((m) => {
            const barHeight = Math.max(10, Math.round((m.kg / maxKg) * MAX_BAR_HEIGHT))
            const isPeak = m.isPeak

            return (
              <div key={m.mois} className="flex flex-col items-center">
                <span
                  className={`mb-1 text-[10px] font-bold ${
                    isPeak ? 'text-forest-900' : 'text-ink-muted'
                  }`}
                >
                  {m.kg}
                </span>

                <div
                  className="w-[28px] rounded-t-[3px] transition-all duration-300"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: m.color || (isPeak ? '#0F3D2E' : '#CBD5D1'),
                  }}
                />

                <span className="mt-1 text-[10px] font-medium text-ink-muted">
                  {m.mois}
                </span>
              </div>
            )
          })}
        </div>

        {/* Encart d'analyse agronomique */}
        <div className="flex items-start gap-2 rounded-lg border border-[#F3E6B3] bg-[#FEF9E7] p-2.5 text-[11.5px] text-[#5A4A12] leading-relaxed">
          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[#854D0E] mt-0.5" strokeWidth={2} aria-hidden="true" />
          <span>
            <strong className="font-semibold text-[#854D0E]">Diagnostic :</strong> {planter.lectureIA}
          </span>
        </div>
      </div>

      {/* 5. Actions Directes Gestionnaire */}
      <div className="pt-2 flex items-center gap-2">
        <a
          href={`tel:${planter.phone}`}
          className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-line bg-white text-xs font-semibold text-ink hover:bg-[#F4F1EB] transition-colors cursor-pointer shadow-2xs"
        >
          <Phone className="h-3.5 w-3.5 text-forest-800" />
          <span>Appeler</span>
        </a>

        {isCritique && (
          <button
            type="button"
            onClick={handleDispatchAnader}
            disabled={isDispatched}
            className={`flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              isDispatched
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-red-700 text-white hover:bg-red-800'
            }`}
          >
            {isDispatched ? (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>ANADER dépêché</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Dépêcher ANADER</span>
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  )
}
