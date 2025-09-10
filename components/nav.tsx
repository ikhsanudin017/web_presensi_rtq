"use client"
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from './theme-toggle'

export default function Nav() {
  const { data: session } = useSession()
  const user = session?.user as any
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <nav className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
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
  )
}
