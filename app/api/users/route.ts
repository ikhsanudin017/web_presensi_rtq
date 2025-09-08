import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userCreateSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { logAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { requireAuth, assertRole } from '@/lib/auth-helpers'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? ''
    const rl = rateLimit(`users:${ip}`, 20, 60_000)
    if (!rl.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

    const session = await requireAuth()
    assertRole(session, ['ADMIN'])

    const json = await req.json()
    const data = userCreateSchema.parse(json)
    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: { name: data.name, username: data.username.toLowerCase(), email: data.email.toLowerCase(), password: hashed, role: data.role, phone: data.phone }
    })
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_USER', entity: 'User', entityId: user.id, meta: { email: user.email }, ip })
    return NextResponse.json({ user })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function GET() {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ users })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
