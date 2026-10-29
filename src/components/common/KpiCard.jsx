import Card from './Card'
import Badge from './Badge'

export default function KpiCard({ label, value, unit, badge, badgeVariant = 'green', id }) {
  return (
    <Card as="article" id={id} className="flex min-h-[110px] flex-col justify-between gap-3 p-5">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-muted">{label}</h3>
      <div className="flex items-end justify-between gap-2">
        <p className="flex items-baseline gap-1.5 text-[32px] font-semibold leading-none text-ink">
          {value}
          {unit && <span className="text-[32px] font-semibold">{unit}</span>}
        </p>
        {badge && (
          <Badge variant={badgeVariant} className="mb-0.5 shrink-0">
            {badge}
          </Badge>
        )}
      </div>
    </Card>
  )
}
