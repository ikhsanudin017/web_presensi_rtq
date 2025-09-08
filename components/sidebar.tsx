"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type MenuItem = { label: string; href: string }

export default function Sidebar({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r min-h-screen sticky top-0 p-3">
      <div className="font-semibold mb-2">Menu</div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                'px-3 py-2 rounded transition-colors ' +
                (active
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800')
              }
            >
              {it.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
