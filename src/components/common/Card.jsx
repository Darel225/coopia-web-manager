import { cn } from '../../utils/cn'

export default function Card({ as: Tag = 'section', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-[0_1px_2px_rgba(20,32,26,0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
