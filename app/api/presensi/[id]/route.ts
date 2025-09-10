import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { presensiCreateSchema } from '@/lib/validations'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { logAudit } from '@/lib/audit'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const json = await req.json()
    const data = presensiCreateSchema.partial().parse(json)

    // If USTADZ, restrict to updating own-created records
    const userId = (session.user as any).id as string

    const updated = await prisma.presensi.update({
      where: { id: params.id },
      data: {
        santriId: data.santriId ?? undefined,
        status: data.status ?? undefined,
        catatan: data.catatan ?? undefined,
        fotoUrl: data.fotoUrl ?? undefined,
      },
    })
    await logAudit({ userId, action: 'UPDATE_PRESENSI', entity: 'Presensi', entityId: updated.id })
    return NextResponse.json({ presensi: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const userId = (session.user as any).id as string
    await prisma.presensi.delete({ where: { id: params.id } })
    await logAudit({ userId, action: 'DELETE_PRESENSI', entity: 'Presensi', entityId: params.id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
