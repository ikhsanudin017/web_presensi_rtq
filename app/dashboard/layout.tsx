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
  if (role === 'ADMIN') {
    return [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Santri', href: '/dashboard/admin/santri' },
      { label: 'Ustadz/Ustadzah', href: '/dashboard/admin/ustadz' },
      { label: 'Orang Tua', href: '/dashboard/admin/orang-tua' },
      { label: 'Laporan', href: '/dashboard/admin/laporan' },
      { label: 'Pengaturan', href: '/dashboard/admin/pengaturan' },
    ]
  }
  if (role === 'USTADZ') {
    return [
      { label: 'Dashboard', href: '/dashboard/ustadz' },
      { label: 'Presensi', href: '/dashboard/ustadz/presensi' },
      { label: 'Evaluasi', href: '/dashboard/ustadz/evaluasi' },
      { label: 'Laporan', href: '/dashboard/admin/laporan' },
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
    { label: 'Dashboard', href: '/dashboard/admin' },
  ]
}

