import React, { useMemo } from 'react'
import { PieChart, Lightbulb } from 'lucide-react'

export default function PathologyDonut({
  diagnostics = [],
  selectedPathology = null,
  onSelectPathology = () => {},
}) {
  const r = 52
  const c = 2 * Math.PI * r // ~326.726

  const { segments, totalCount, dominantName, dominantPct } = useMemo(() => {
    const list = diagnostics || []
    const total = list.length

    if (total === 0) {
      return {
        segments: [],
        totalCount: 0,
        dominantName: 'Aucune pathologie',
        dominantPct: 0,
      }
    }

    const counts = {
      'pourriture': { label: 'Pourriture brune', cases: 0, color: '#B91C1C', key: 'pourriture' },
      'swollen': { label: 'Swollen Shoot', cases: 0, color: '#DC2626', key: 'swollen' },
      'mirides': { label: 'Mirides & Chenilles', cases: 0, color: '#78350F', key: 'mirides' },
      'rouille': { label: 'Rouille caféier', cases: 0, color: '#D97706', key: 'rouille' },
      'anthracnose': { label: 'Anthracnose anacardier', cases: 0, color: '#EA580C', key: 'anthracnose' },
    }

    const dynamicPalette = ['#0284C7', '#9333EA', '#0D9488', '#4F46E5', '#BE185D']
    let paletteIdx = 0

    list.forEach((d) => {
      const rawName = (d.disease_name || d.title || '').trim()
      const name = rawName.toLowerCase()
      if (name.includes('pourriture') || name.includes('phytophthora')) {
        counts['pourriture'].cases += 1
      } else if (name.includes('swollen') || name.includes('cssv')) {
        counts['swollen'].cases += 1
      } else if (name.includes('miride') || name.includes('chenille') || name.includes('sahlbergella') || name.includes('earias')) {
        counts['mirides'].cases += 1
      } else if (name.includes('rouille') || name.includes('café') || name.includes('cafe')) {
        counts['rouille'].cases += 1
      } else if (name.includes('anthracnose') || name.includes('anacard') || name.includes('cajou')) {
        counts['anthracnose'].cases += 1
      } else if (rawName) {
        const key = name.replace(/[^a-z0-9]/g, '_').slice(0, 20)
        if (!counts[key]) {
          const color = dynamicPalette[paletteIdx % dynamicPalette.length]
          paletteIdx += 1
          counts[key] = { label: rawName, cases: 1, color, key }
        } else {
          counts[key].cases += 1
        }
      }
    })

    let accumulatedOffset = 0
    let maxCases = -1
    let domName = 'Pourriture brune'
    let domPct = 0

    const segs = Object.values(counts)
      .filter((item) => item.cases > 0)
      .map((item) => {
        const pct = Math.round((item.cases / total) * 100)
        const length = (item.cases / total) * c
        const offset = -accumulatedOffset
        accumulatedOffset += length

        if (item.cases > maxCases) {
          maxCases = item.cases
          domName = item.label
          domPct = pct
        }

        return {
          ...item,
          pct,
          length,
          offset,
        }
      })

    return {
      segments: segs,
      totalCount: total,
      dominantName: domName,
      dominantPct: domPct,
    }
  }, [diagnostics, c])

  return (
    <div className="flex h-full flex-col justify-between rounded-[16px] border border-line bg-white p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-forest-800/10 text-forest-900">
            <PieChart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Répartition des pathologies</h3>
            <p className="text-[11px] text-ink-muted">Analyse spectrale des déclarations coopératives</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-900 border border-forest-200">
          {totalCount} cas enregistrés
        </span>
      </div>

      {/* Body: Donut + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative flex h-[150px] w-[150px] shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
            {segments.map((seg) => {
              const isSelected = selectedPathology === seg.key
              return (
                <circle
                  key={seg.label}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isSelected ? '24' : '20'}
                  strokeDasharray={`${seg.length} ${c}`}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onClick={() => onSelectPathology(selectedPathology === seg.key ? null : seg.key)}
                />
              )
            })}
          </svg>

          {/* Center text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[26px] font-bold leading-none text-ink">{totalCount}</span>
            <span className="mt-1 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
              TOTAL
            </span>
          </div>
        </div>

        {/* Legend with interactive click */}
        <div className="flex w-full flex-col gap-2 sm:max-w-[240px]">
          {segments.map((item) => {
            const isSelected = selectedPathology === item.key
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectPathology(selectedPathology === item.key ? null : item.key)}
                className={`flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 transition-all text-left cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-white hover:bg-stone-50 border-transparent text-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] truncate max-w-[140px]">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-right font-mono text-[11px]">
                  <span className="font-bold">{item.pct}%</span>
                  <span className="text-ink-muted">({item.cases})</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic AI Insight Box */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#F3E6B3] bg-[#FEF9E7] p-2.5 text-xs text-[#5A4A12]">
        <Lightbulb className="h-4 w-4 shrink-0 text-[#B45309]" strokeWidth={1.75} aria-hidden="true" />
        <p className="leading-relaxed">
          <span className="font-semibold">Lecture : </span>
          {totalCount > 0 ? (
            <>
              La <strong className="text-[#854D0E]">{dominantName}</strong> représente {dominantPct}% des cas signalés sur le réseau sociétaire de la coopérative.
            </>
          ) : (
            'Aucune anomalie sanitaire active signalée cette semaine.'
          )}
        </p>
      </div>
    </div>
  )
}
