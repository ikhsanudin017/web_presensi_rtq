import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('UNAUTHORIZED')
  return session
}

export function assertRole(session: any, roles: Array<'ADMIN' | 'USTADZ' | 'ORANG_TUA'>) {
  const role = (session.user as any)?.role
  if (!roles.includes(role)) throw new Error('FORBIDDEN')
}

