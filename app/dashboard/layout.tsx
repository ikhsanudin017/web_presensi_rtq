import Sidebar, { type MenuItem } from '@/components/sidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as 'ADMIN' | 'USTADZ' | 'ORANG_TUA' | undefined

  const items: MenuItem[] = buildMenu(role)

  return (
    <div className="min-h-screen flex">
      <Sidebar items={items} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function buildMenu(role?: 'ADMIN' | 'USTADZ' | 'ORANG_TUA'): MenuItem[] {
  if (role === 'USTADZ' || role === 'ADMIN') {
    return [
      { label: 'Dashboard', href: '/dashboard/ustadz' },
      { label: 'Presensi', href: '/dashboard/ustadz/presensi' },
      { label: 'Evaluasi', href: '/dashboard/ustadz/evaluasi' },
    ]
  }
  if (role === 'ORANG_TUA') {
    return [
      { label: 'Dashboard', href: '/dashboard/orangtua' },
      { label: 'Evaluasi', href: '/dashboard/orangtua/evaluasi' },
    ]
  }
  // default if not logged in
  return [
    { label: 'Dashboard', href: '/dashboard/ustadz' },
  ]
}
