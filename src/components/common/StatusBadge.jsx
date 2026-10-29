import React from 'react'
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function StatusBadge({ status, size = 'sm', className }) {
  if (!status) return null

  const normalized = String(status).toLowerCase().trim()

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: null,
  }

  if (
    normalized.includes('valid') ||
    normalized.includes('actif') ||
    normalized.includes('sain') ||
    normalized.includes('conforme')
  ) {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    }
  } else if (
    normalized.includes('attente') ||
    normalized.includes('cours') ||
    normalized.includes('observation') ||
    normalized.includes('modéré') ||
    normalized.includes('modere')
  ) {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
    }
  } else if (
    normalized.includes('rejet') ||
    normalized.includes('critique') ||
    normalized.includes('élevé') ||
    normalized.includes('eleve') ||
    normalized.includes('hors normes')
  ) {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
    }
  } else if (
    normalized.includes('surveillance') ||
    normalized.includes('vigie') ||
    normalized.includes('moyen') ||
    normalized.includes('action')
  ) {
    config = {
      bg: 'bg-amber-100/70',
      text: 'text-amber-900',
      border: 'border-amber-300',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
    }
  }

  const Icon = config.icon

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border tracking-wide transition-colors',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size] || sizeClasses.sm,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
      <span>{status}</span>
    </span>
  )
}
