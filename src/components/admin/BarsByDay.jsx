import { BarChart3, Lightbulb } from 'lucide-react'
import Card from '../common/Card'

const DATA_7_DAYS = [
  { date: '18/02', count: 5 },
  { date: '19/02', count: 8 },
  { date: '20/02', count: 12 },
  { date: '21/02', count: 10 },
  { date: '22/02', count: 14, isPeak: true },
  { date: '23/02', count: 9 },
  { date: '24/02', count: 12 },
]

export default function BarsByDay() {
  const maxVal = Math.max(...DATA_7_DAYS.map((d) => d.count))
  const peakItem = DATA_7_DAYS.find((d) => d.count === maxVal) || DATA_7_DAYS[4]
  const total = DATA_7_DAYS.reduce((acc, curr) => acc + curr.count, 0)
  const average = Math.round(total / DATA_7_DAYS.length)

  const MAX_BAR_HEIGHT = 88 // Hauteur max de la barre en px

  return (
    <Card id="card-bars-by-day" className="p-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-forest-900" strokeWidth={1.75} aria-hidden="true" />
          <h2 className="text-sm font-semibold text-ink">Bordereaux par jour</h2>
        </div>
        <span className="text-xs text-ink-muted">7 derniers jours (18/02 - 24/02)</span>
      </div>

      {/* Graphique à barres */}
      <div
        className="mt-6 flex items-end justify-between px-4 sm:px-12"
        role="region"
        aria-label="Histogramme des bordereaux par jour"
      >
        {DATA_7_DAYS.map((item) => {
          const barHeight = Math.round((item.count / maxVal) * MAX_BAR_HEIGHT)
          const isPeak = item.isPeak || item.count === maxVal

          return (
            <div key={item.date} className="flex flex-col items-center">
              {/* Valeur au-dessus */}
              <span
                className={`mb-2 text-xs font-semibold ${
                  isPeak ? 'text-[#D97706]' : 'text-ink'
                }`}
              >
                {item.count}
              </span>

              {/* Barre */}
              <div
                className={`w-[38px] rounded-t-[6px] transition-all duration-300 ${
                  isPeak ? 'bg-[#D97706]' : 'bg-[#CBD5D1]'
                }`}
                style={{ height: `${barHeight}px` }}
              />

              {/* Date en dessous */}
              <span
                className={`mt-2.5 text-xs ${
                  isPeak ? 'font-semibold text-[#D97706]' : 'text-ink-muted'
                }`}
              >
                {item.date}
              </span>
            </div>
          )
        })}
      </div>

      {/* Filet horizontal et ligne Lecture */}
      <div className="mt-5 border-t border-line pt-3.5">
        <p className="flex items-center gap-2 text-[13px] text-ink-muted">
          <Lightbulb className="h-[13px] w-[13px] shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <span>
            <strong className="font-semibold text-ink">Lecture :</strong> Rythme moyen de {average} bordereaux par jour avec pic le {peakItem.date}.
          </span>
        </p>
      </div>
    </Card>
  )
}
