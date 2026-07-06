import { cn } from '../../lib/utils.js'

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        className
      )}
      {...props}
    />
  )
}
