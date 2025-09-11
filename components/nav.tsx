"use client"
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from './theme-toggle'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type MenuItem = { label: string; href: string }

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
function iconFor(label: string) {
  const key = label.toLowerCase()
  if (key.includes('presensi')) return <CheckIcon />
  if (key.includes('evaluasi')) return <StarIcon />
  return <DashboardIcon />
}

export default function Nav() {
  const { data: session } = useSession()
  const user = session?.user as any
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const items: MenuItem[] = useMemo(() => {
    const role = (user?.role as 'ADMIN'|'USTADZ'|'ORANG_TUA'|undefined)
    if (role === 'ORANG_TUA') return [
      { label: 'Dashboard', href: '/dashboard/orangtua' },
      { label: 'Evaluasi', href: '/dashboard/orangtua/evaluasi' },
    ]
    // default USTADZ/ADMIN
    return [
      { label: 'Dashboard', href: '/dashboard/ustadz' },
      { label: 'Presensi', href: '/dashboard/ustadz/presensi' },
      { label: 'Evaluasi', href: '/dashboard/ustadz/evaluasi' },
    ]
  }, [user?.role])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
        <nav className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Burger (mobile) */}
          <button
            className="md:hidden inline-flex items-center gap-2 px-2 py-1.5 rounded-md border text-sm"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
            Menu
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition shadow-sm"
              >
                Keluar
              </button>
            ) : (
              <Link
                className="text-sm px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition shadow-sm"
                href="/login/ustadz"
              >
                Masuk
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-r shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Presensi RTQ</div>
              <button aria-label="Tutup" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.3 6.3-1.41-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/></svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
              {items.map(it => {
                const active = pathname === it.href || pathname?.startsWith(it.href + '/')
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ' +
                      (active ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800')
                    }
                  >
                    <span>{iconFor(it.label)}</span>
                    <span className="font-medium">{it.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
