import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LIVRAISONS_30J, MOYENNE_JOURNALIERE, PIC, TICKS_X } from '../../data/dashboardData'

const FOREST = '#0F3D2E'
const GOLD = '#F2B134'
const DOT_INDEXES = new Set([5, 10, 15, 20, 25, 30])

function fr(n) {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function renderDot({ cx, cy, index, key }) {
  if (!DOT_INDEXES.has(index)) return <g key={key} />
  return <circle key={key} cx={cx} cy={cy} r={3.5} fill={FOREST} stroke="#fff" strokeWidth={1.5} />
}

function PeakMarker({ cx, cy }) {
  if (cx == null || cy == null) return null
  const text = `Pic : ${fr(PIC.valeur)} T (${PIC.date})`
  const w = 168
  return (
    <g>
      <rect x={cx - w / 2} y={cy - 46} width={w} height={28} rx={10} fill="#1B1F1D" />
      <circle cx={cx - w / 2 + 14} cy={cy - 32} r={4} fill={GOLD} />
      <text x={cx - w / 2 + 26} y={cy - 28} fontSize={12} fontWeight={500} fill="#fff">
        {text}
      </text>
      <circle cx={cx} cy={cy} r={6} fill={GOLD} stroke="#fff" strokeWidth={2} />
    </g>
  )
}

function MeanLabel({ viewBox, moyenne }) {
  if (!viewBox) return null
  const moy = moyenne ?? MOYENNE_JOURNALIERE
  const w = 124
  const x = viewBox.x + viewBox.width - w - 4
  const y = viewBox.y - 28
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={6} fill="#fff" stroke="#ECE8E1" />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontSize={11} fill="#6B7A72">
        {`Moyenne : ${fr(moy)} T/j`}
      </text>
    </g>
  )
}

function Tick({ x, y, payload }) {
  const isPeak = payload.value === PIC.label
  return (
    <text
      x={x}
      y={y + 18}
      textAnchor={payload.index === 0 ? 'start' : payload.index === TICKS_X.length - 1 ? 'end' : 'middle'}
      fontSize={12}
      fontWeight={isPeak ? 700 : 400}
      fill={isPeak ? '#14201A' : '#6B7A72'}
    >
      {payload.value}
    </text>
  )
}

// Infobulle interactive complète et pédagogique au glissement du curseur
function CustomDeliveriesTooltip({ active, payload, moyenne }) {
  if (!active || !payload || !payload.length) return null
  const effMoyenne = moyenne ?? MOYENNE_JOURNALIERE
  const dataPoint = payload[0].payload
  const volume = Number(dataPoint.volume) || 0
  const isPeak = dataPoint.jour === PIC.label
  const isAboveMean = volume >= effMoyenne
  const pctDiff = Math.round(((volume - effMoyenne) / effMoyenne) * 100)
  const diffSign = pctDiff >= 0 ? `+${pctDiff}%` : `${pctDiff}%`
  const sacsEstimes = dataPoint.sacs != null ? dataPoint.sacs : Math.round((volume * 1000) / 50)
  const valeurCCC = dataPoint.valeur_fcfa != null ? dataPoint.valeur_fcfa : Math.round(volume * 1000 * 1850)

  // Calcul du libellé de date complet (ex: "14/10" -> "14 Octobre 2026")
  const parts = (dataPoint.jour || '').split('/')
  const j = parts[0]
  const m = parts[1]
  const moisNom = m === '09' ? 'Septembre' : 'Octobre'
  const dateComplete = `${j} ${moisNom} 2026`

  return (
    <div className="z-50 min-w-[220px] rounded-xl border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur-xs text-left font-sans select-none pointer-events-none transition-all">
      {/* En-tête date & badge */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
        <span className="text-[12.5px] font-bold text-stone-900">{dateComplete}</span>
        {isPeak ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
            Pic Campagne
          </span>
        ) : isAboveMean ? (
          <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-800 border border-emerald-200">
            {diffSign} vs moy.
          </span>
        ) : (
          <span className="inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[10.5px] font-medium text-stone-600">
            {diffSign} vs moy.
          </span>
        )}
      </div>

      {/* Indicateurs clés chiffrés */}
      <div className="mt-2 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11.5px] text-stone-500">Volume journalier :</span>
          <span className="text-[14px] font-bold text-stone-900 tabular-nums">
            {volume.toFixed(2).replace('.', ',')} T
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-600">
          <span>Équivalent sacs :</span>
          <span className="font-semibold text-stone-800 tabular-nums">{sacsEstimes} sacs</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-600">
          <span>Valeur bord-champ :</span>
          <span className="font-semibold text-emerald-800 tabular-nums">
            {valeurCCC.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Interprétation logistique pour le Directeur */}
      <div className="mt-2.5 border-t border-stone-100 pt-1.5 text-[10.5px] leading-tight">
        {isPeak ? (
          <span className="font-medium text-amber-800">
            Pic d'affluence : équipes de pesée mobilisées & pont-bascule sous tension.
          </span>
        ) : isAboveMean ? (
          <span className="text-emerald-700 font-medium">
            Forte affluence : magasins de stockage en activité soutenue.
          </span>
        ) : (
          <span className="text-stone-500">
            Ralentissement : transport ralenti par la météo ou écabossage au champ.
          </span>
        )}
      </div>
    </div>
  )
}

export default function DeliveriesChart({ data, moyenne, peak }) {
  const chartData = data && data.length > 0 ? data : LIVRAISONS_30J
  const chartMoyenne = moyenne ?? MOYENNE_JOURNALIERE
  const chartPeak = peak ?? PIC

  return (
    <div className="h-full w-full min-h-0" role="img" aria-label="Graphique des livraisons journalières sur 30 jours">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 38, right: 12, bottom: 0, left: 12 }}>
          <defs>
            <linearGradient id="deliveriesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FOREST} stopOpacity={0.25} />
              <stop offset="100%" stopColor={FOREST} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ECE8E1" strokeDasharray="3 5" />
          <XAxis
            dataKey="jour"
            ticks={TICKS_X}
            interval={0}
            tick={<Tick />}
            axisLine={{ stroke: '#ECE8E1' }}
            tickLine={false}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis hide domain={[0, 3.5]} />
          <ReferenceLine
            y={chartMoyenne}
            stroke="#14201A"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={<MeanLabel moyenne={chartMoyenne} />}
          />
          <ReferenceLine x={PIC.label} stroke={GOLD} strokeDasharray="4 4" />
          <Tooltip
            content={<CustomDeliveriesTooltip moyenne={chartMoyenne} />}
            cursor={{ stroke: FOREST, strokeWidth: 1.5, strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke={FOREST}
            strokeWidth={2.5}
            fill="url(#deliveriesFill)"
            dot={renderDot}
            activeDot={{ r: 5, fill: FOREST, stroke: '#FFFFFF', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <ReferenceDot x={PIC.label} y={PIC.valeur} r={6} shape={<PeakMarker />} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
