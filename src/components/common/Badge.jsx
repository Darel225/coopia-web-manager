import { cn } from '../../utils/cn'

const VARIANTS = {
  green: 'bg-[#E3ECE7] text-forest-800',
  amber: 'bg-[#FDEFC8] text-[#8A5A00]',
  red: 'bg-[#FDE4E4] text-[#C0262D]',
}

export default function Badge({ variant = 'green', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-tight',
        VARIANTS[variant] || VARIANTS.green,
        className
      )}
    >
      {children}
    </span>
  )
}
