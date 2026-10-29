import { Lightbulb } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function InsightNote({ children, className }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-[#F3E6B3] bg-[#FEF9E7] px-4 py-3 text-[13px] leading-relaxed text-[#5A4A12]',
        className
      )}
    >
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
