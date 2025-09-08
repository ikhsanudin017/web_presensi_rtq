import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { passwordUpdateSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { logAudit } from '@/lib/audit'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const json = await req.json()
    const { password } = passwordUpdateSchema.parse(json)
    const hashed = await bcrypt.hash(password, 10)
    const updated = await prisma.user.update({ where: { id: params.id }, data: { password: hashed } })
    await logAudit({ userId: (session.user as any).id, action: 'RESET_PASSWORD', entity: 'User', entityId: updated.id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

