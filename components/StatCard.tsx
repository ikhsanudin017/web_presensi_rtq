import { cn } from './utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  className?: string
}

export default function StatCard({ title, value, subtitle, icon: Icon, className }: Props) {
  return (
    <div className={cn("rounded-xl border bg-white/60 dark:bg-base-900/40 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition", className)}>
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="p-2 rounded-lg bg-primaryMuted text-primary">
            <Icon className="w-5 h-5" />
          </div>
        ) : null}
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-300">{title}</div>
          <div className="text-2xl font-semibold leading-tight">{value}</div>
          {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}
