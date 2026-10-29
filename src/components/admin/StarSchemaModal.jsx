import { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Database,
  Code2,
  TableProperties,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { ANALYTICS_DATA } from '../../data/analyticsData'

export default function StarSchemaModal({ isOpen, onClose }) {
  const [activeModalTab, setActiveModalTab] = useState('schema') // 'schema' | 'dax'
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!isOpen) return null

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    toast.success('Formule DAX copiée dans le presse-papier !')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête sobre */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F3D2E] text-white">
              <Database className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-stone-900 leading-tight">
                Modèle de Données en Étoile & Formules DAX
              </h3>
              <p className="text-[12px] text-stone-500">
                Architecture décisionnelle Power BI • Modélisation dimensionnelle officielle
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Onglets modale */}
        <div className="flex border-b border-stone-200 px-6 pt-2 bg-white gap-6">
          <button
            type="button"
            onClick={() => setActiveModalTab('schema')}
            className={`flex items-center gap-2 pb-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeModalTab === 'schema'
                ? 'border-[#0F3D2E] text-[#0F3D2E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="h-4 w-4" strokeWidth={1.75} />
            <span>Schéma en Étoile (Star Schema)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('dax')}
            className={`flex items-center gap-2 pb-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeModalTab === 'dax'
                ? 'border-[#0F3D2E] text-[#0F3D2E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="h-4 w-4" strokeWidth={1.75} />
            <span>Formules DAX Officielles</span>
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeModalTab === 'schema' ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-200 text-[12.5px] text-stone-700 leading-relaxed">
                Ce modèle décisionnel en étoile relie deux <strong>tables de faits</strong> centrales (<code>Fact_Recoltes</code> et <code>Fact_Diagnostics</code>) aux <strong>dimensions</strong> du domaine agricole ivoirien et aux <strong>tables de référence</strong> exogènes (Pluviométrie historique et Cibles de production ANADER).
              </div>

              {/* Grille du schéma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fact 1 */}
                <div className="rounded-lg border border-emerald-200 bg-white p-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-emerald-900">
                      <TableProperties className="h-4 w-4 text-emerald-700" />
                      Fact_Recoltes (Fait)
                    </span>
                    <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-semibold px-2 py-0.5 tabular-nums">
                      113 sacs • 24,27 T • Multi-Filières
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1 font-mono text-[11px] text-stone-600">
                    <li className="flex justify-between">
                      <span className="font-semibold text-stone-900">PK: id</span>
                      <span className="text-stone-400">UUID</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-emerald-800">FK: user_id</span>
                      <span className="text-stone-400">→ Dim_Planteurs</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-emerald-800">FK: parcelle_id</span>
                      <span className="text-stone-400">→ Dim_Parcelles</span>
                    </li>
                    <li className="flex justify-between">
                      <span>weight_kg</span>
                      <span className="text-stone-400">DECIMAL (Poids net)</span>
                    </li>
                    <li className="flex justify-between">
                      <span>crop_type</span>
                      <span className="text-stone-400">cacao / cafe / anacarde</span>
                    </li>
                    <li className="flex justify-between">
                      <span>valeur_totale_fcfa</span>
                      <span className="text-stone-400">1850 F / 1000 F / 350 F</span>
                    </li>
                    <li className="flex justify-between">
                      <span>status</span>
                      <span className="text-stone-400">APPROVED / PENDING</span>
                    </li>
                    <li className="flex justify-between">
                      <span>harvest_date</span>
                      <span className="text-stone-400">TIMESTAMP</span>
                    </li>
                  </ul>
                </div>

                {/* Fact 2 */}
                <div className="rounded-lg border border-amber-200 bg-white p-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                      <TableProperties className="h-4 w-4 text-amber-700" />
                      Fact_Diagnostics (Fait)
                    </span>
                    <span className="rounded bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-semibold px-2 py-0.5">
                      Santé & IA
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1 font-mono text-[11.5px] text-stone-600">
                    <li className="flex justify-between">
                      <span className="font-semibold text-stone-900">PK: id</span>
                      <span className="text-stone-400">UUID</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-amber-800">FK: user_id</span>
                      <span className="text-stone-400">→ Dim_Planteurs</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-amber-800">FK: parcelle_id</span>
                      <span className="text-stone-400">→ Dim_Parcelles</span>
                    </li>
                    <li className="flex justify-between">
                      <span>disease_name</span>
                      <span className="text-stone-400">Phytophthora...</span>
                    </li>
                    <li className="flex justify-between">
                      <span>confidence_score</span>
                      <span className="text-stone-400">0.0 – 1.0</span>
                    </li>
                    <li className="flex justify-between">
                      <span>status (DETECTED/TREATED)</span>
                      <span className="text-stone-400">VARCHAR</span>
                    </li>
                  </ul>
                </div>

                {/* Dim 1 */}
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                    <span className="text-[12px] font-semibold text-stone-900">Dim_Planteurs</span>
                    <span className="text-[10px] font-medium text-stone-500">Dimension 1:N</span>
                  </div>
                  <p className="mt-2 text-[11.5px] text-stone-600">
                    <code>id (PK)</code>, <code>first_name</code>, <code>last_name</code>, <code>phone_number</code>, <code>role ('PLANTER')</code>, <code>cooperative_id (FK)</code>.
                  </p>
                </div>

                {/* Dim 2 */}
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                    <span className="text-[12px] font-semibold text-stone-900">Dim_Parcelles</span>
                    <span className="text-[10px] font-medium text-stone-500">Dimension 1:N</span>
                  </div>
                  <p className="mt-2 text-[11.5px] text-stone-600">
                    <code>id (PK)</code>, <code>user_id (FK)</code>, <code>name</code>, <code>crop_type</code>, <code>village</code>, <code>superficie (NUMERIC ha)</code>, <code>gps_coordinates (JSONB)</code>.
                  </p>
                </div>

                {/* Ref 1 */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-[12px] font-semibold text-slate-900">Ref_Meteo_Pluviometrie</span>
                    <span className="text-[10px] font-medium text-slate-600">Référence Exogène</span>
                  </div>
                  <p className="mt-2 text-[11.5px] text-slate-700 leading-relaxed">
                    Données météo Mai-Octobre 2026 : <code>village</code>, <code>mois</code>, <code>pluviometrie_mm</code>, <code>pic_pluvieux</code> (&gt;100 mm en Juin/Septembre).
                  </p>
                </div>

                {/* Ref 2 */}
                <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                    <span className="text-[12px] font-semibold text-stone-900">Ref_Cibles_Production</span>
                    <span className="text-[10px] font-medium text-stone-600">Objectifs ANADER</span>
                  </div>
                  <p className="mt-2 text-[11.5px] text-stone-700 leading-relaxed">
                    Cibles et seuils ANADER & CCC : <code>village</code>, <code>culture</code>, <code>cible_tonnes</code>, <code>seuil_agronomique_kgha (800 / 700 / 550)</code>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-[12px] text-stone-500">
                Ces 7 mesures DAX sont formulées selon les normes Power BI du Conseil du Café-Cacao pour évaluer la rentabilité et le risque.
              </p>

              {ANALYTICS_DATA.dax_formulas.map((dax, index) => (
                <div
                  key={dax.name}
                  className="rounded-lg border border-stone-200 bg-stone-50/40 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[13px] font-semibold text-stone-900">{dax.name}</h4>
                      <p className="text-[11.5px] text-stone-500">{dax.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(dax.code, index)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-white text-[11.5px] font-medium text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-md bg-[#0F3D2E] p-2.5 overflow-x-auto text-[11.5px] font-mono text-emerald-300">
                    <code>{dax.code}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de modale */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-stone-200 bg-stone-50/50 text-[12px] text-stone-500">
          <span>Coopérative CAPED • Déploiement Power BI Service & Fabric</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#0F3D2E] hover:bg-[#154734] text-white text-[12px] font-medium cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
