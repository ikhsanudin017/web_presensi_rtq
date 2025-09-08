import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as 'ADMIN' | 'USTADZ' | 'ORANG_TUA' | undefined
  if (role === 'USTADZ') redirect('/dashboard/ustadz')
  if (role === 'ORANG_TUA') redirect('/dashboard/orangtua')
  // default to admin
  redirect('/dashboard/admin')
}

