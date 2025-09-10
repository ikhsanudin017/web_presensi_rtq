"use client"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export type MenuItem = { label: string; href: string }

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16l4-4h10a2 2 0 002-2V6l-6-4z" />
    </svg>
  )
}

function iconFor(label: string): ReactNode {
  const key = label.toLowerCase()
  if (key.includes('presensi')) return <CheckIcon />
  if (key.includes('evaluasi')) return <StarIcon />
  if (key.includes('laporan')) return <ReportIcon />
  return <DashboardIcon />
}

export default function Sidebar({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r min-h-screen sticky top-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="flex-1 flex flex-col gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 rounded-lg p-2 hover:bg-primaryMuted/60 transition-colors">
          <Image src="/rtq-logo.png" alt="RTQ" width={32} height={32} className="rounded shadow-sm" />
          <div className="leading-tight">
            <div className="font-semibold">Presensi RTQ</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">Rumah Tahfizh Quran</div>
          </div>
        </Link>

        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">Menu</div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const isRootDashboard = /\/dashboard\/(ustadz|orangtua)$/.test(it.href)
            const active = pathname === it.href || (!isRootDashboard && pathname?.startsWith(it.href + '/'))
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ' +
                  (active
                    ? 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-sm ring-1 ring-primary/20'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
                }
              >
                <span className="opacity-90 group-hover:opacity-100">
                  {iconFor(it.label)}
                </span>
                <span className="font-medium tracking-tight">{it.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto text-xs text-gray-400 px-1">
          © {new Date().getFullYear()} RTQ
        </div>
      </div>
    </aside>
  )
}
