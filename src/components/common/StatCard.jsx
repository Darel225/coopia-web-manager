import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function StatCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  badge,
  accentColor = 'forest', // 'forest' | 'cacao' | 'night' | 'amber'
  className,
}) {
  const accentStyles = {
    forest: 'border-l-4 border-l-forest text-forest bg-forest/10',
    cacao: 'border-l-4 border-l-cacao text-cacao bg-cacao/10',
    night: 'border-l-4 border-l-night text-night bg-night/10',
    amber: 'border-l-4 border-l-amber-600 text-amber-700 bg-amber-50',
    rose: 'border-l-4 border-l-rose-600 text-rose-700 bg-rose-50',
  }

  const iconStyles = {
    forest: 'bg-emerald-50 text-forest border border-emerald-100',
    cacao: 'bg-amber-50 text-cacao border border-amber-200/60',
    night: 'bg-slate-100 text-slate-800 border border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-ink-muted">{unit}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105',
              iconStyles[accentColor] || iconStyles.forest
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        {subtitle && (
          <span className="text-ink-muted truncate font-medium">{subtitle}</span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold',
                trendType === 'up'
                  ? 'text-emerald-700'
                  : trendType === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-600'
              )}
            >
              {trendType === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trendType === 'down' ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : null}
              {trend}
            </span>
          )}

          {badge && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
