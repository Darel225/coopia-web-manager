import { cn } from '../../utils/cn'

export default function Avatar({ initials, bg = '#E8EAE6', size = 36, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-ink',
        className
      )}
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      {initials}
    </span>
  )
}
