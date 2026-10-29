import imgDefaultFallback from '../../assets/diagnostics/pourriture_brune.jpg'
import React, { useState } from 'react'
import { Truck, AlertTriangle, ShieldCheck, Calendar, UserCheck, CheckCircle2 } from 'lucide-react'
import Modal from '../common/Modal'
import { toast } from 'sonner'

export default function DispatchModal({
  isOpen,
  onClose,
  diagnostic,
  onConfirmDispatch = () => {},
}) {
  const [technician, setTechnician] = useState('Kouamé N\'Dri (Chef de zone Soubré/Pindikro)')
  const [timing, setTiming] = useState('Sous 24 heures (Priorité Haute)')
  const [loading, setLoading] = useState(false)

  if (!diagnostic) return null

  const isCritical = diagnostic.severity === 'Critique' || diagnostic.status === 'ESCALATED'

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onConfirmDispatch(diagnostic.id, technician)
      toast.success(`Ordre de mission émis pour ${diagnostic.planter}`, {
        description: `Technicien assigné : ${technician}. Intervention programmée à ${diagnostic.village}.`,
      })
      onClose()
    }, 600)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ordre de Mission Phytosanitaire ANADER"
      description="Déploiement rapide d'un technicien certifié et mise en quarantaine de la parcelle"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-ink">
        {/* Résumé de l'alerte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-line bg-stone-50/70 p-4">
          {/* Photo & Bounding Box */}
          <div className="relative h-44 w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-700">
            <img
              src={diagnostic.image}
              alt={diagnostic.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = imgDefaultFallback
              }}
            />
            <div
              className="pointer-events-none absolute border-2 border-dashed border-[#DC2626]"
              style={diagnostic.boxStyle || { top: '15%', left: '15%', width: '60%', height: '60%' }}
            >
              <span className="absolute -top-3 left-0 rounded-[3px] bg-[#DC2626] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                {diagnostic.boxLabel || 'Pathologie détectée'}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2">
              <span className="text-[11px] font-medium text-white/95">
                {diagnostic.title}
              </span>
            </div>
          </div>

          {/* Détails du producteur et parcelle */}
          <div className="flex flex-col justify-between text-xs space-y-2">
            <div>
              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                Producteur Sociétaire
              </span>
              <p className="text-sm font-bold text-ink">{diagnostic.planter}</p>
              <p className="text-ink-muted">
                Bassin : <strong className="text-ink">{diagnostic.village}</strong>
              </p>
              <p className="text-ink-muted">
                Parcelle : <strong className="text-ink">{diagnostic.parcelle || 'Parcelle Principale'}</strong>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                Niveau d'Urgence Sanitaire
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {diagnostic.severity || 'Critique'}
                </span>
                <span className="text-[11px] text-ink-muted">
                  Indice de certitude : <strong>{Math.round((diagnostic.confidence_score || 0.95) * 100)}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription technique officielle */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Prescription Technique Officielle ANADER / CCC</span>
          </div>
          <p className="leading-relaxed text-[11px] text-emerald-900/90 italic">
            "{diagnostic.recommended_action || "Récolte sanitaire immédiate des cabosses atteintes, enfouissement sous chaux vive, et pulvérisation ciblée de fongicide homologué CCC sous canopée aérée."}"
          </p>
        </div>

        {/* Formulaire d'affectation */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Technicien Agronome de Zone (ANADER)
            </label>
            <div className="relative">
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-forest-800 focus:outline-none"
              >
                <option value="Kouamé N'Dri (Chef de zone Soubré/Pindikro)">
                  Kouamé N'Dri — Chef de zone Soubré / Pindikro (Disponible)
                </option>
                <option value="Touré Bakary (Spécialiste Phytopathologie)">
                  Touré Bakary — Spécialiste Phytopathologie & Traitements CCC
                </option>
                <option value="Koné Alassane (Agent de vulgarisation local)">
                  Koné Alassane — Conseiller agricole de proximité
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Échéance d'intervention sur site
            </label>
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-forest-800 focus:outline-none"
            >
              <option value="Sous 24 heures (Priorité Haute)">Sous 24 heures (Urgence Quarantaine)</option>
              <option value="Sous 48 heures">Sous 48 heures (Protocole standard)</option>
              <option value="Intervention programmée semaine prochaine">Intervention planifiée de routine</option>
            </select>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-stone-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800 shadow-2xs"
          >
            <Truck className="h-4 w-4" />
            <span>{loading ? 'Émission en cours...' : "Confirmer l'Ordre de Mission"}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
