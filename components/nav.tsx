"use client"
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from './theme-toggle'

export default function Nav() {
  const { data: session } = useSession()
  return (
    <nav className="w-full border-b border-primary/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-semibold text-primary">Presensi RTQ</Link>
        <Link href="/dashboard/admin" className="text-sm opacity-80 hover:text-primary">Dashboard</Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {session?.user ? (
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-white transition">Keluar</button>
        ) : (
          <Link className="text-sm px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-white transition" href="/login">Masuk</Link>
        )}
      </div>
    </nav>
  )
}
