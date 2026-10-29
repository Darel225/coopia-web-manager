import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer'

  const variants = {
    primary:
      'bg-forest hover:bg-forest-dark text-white shadow-xs focus-visible:ring-forest',
    forest:
      'bg-forest hover:bg-forest-dark text-white shadow-xs focus-visible:ring-forest',
    cacao:
      'bg-cacao hover:bg-amber-900 text-white shadow-xs focus-visible:ring-cacao',
    secondary:
      'bg-white hover:bg-slate-50 text-ink border border-slate-300 shadow-xs focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-100 text-ink border border-slate-300 focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-ink-muted hover:text-ink focus-visible:ring-slate-300',
    night:
      'bg-night hover:bg-night-soft text-white shadow-xs focus-visible:ring-night',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
    lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
    icon: 'h-9 w-9 p-0 justify-center',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 shrink-0" />}
        </>
      )}
    </button>
  )
}
