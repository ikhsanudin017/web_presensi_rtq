import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { evaluasiCreateSchema } from '@/lib/validations'
import { logAudit } from '@/lib/audit'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const json = await req.json()
    const data = evaluasiCreateSchema.partial().parse(json)
    const updated = await prisma.evaluasi.update({ where: { id: params.id }, data: {
      santriId: data.santriId ?? undefined,
      nilai: data.nilai ?? undefined,
      catatan: data.catatan ?? undefined,
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
    }})
    await logAudit({ userId: (session.user as any).id, action: 'UPDATE_EVALUASI', entity: 'Evaluasi', entityId: updated.id })
    return NextResponse.json({ evaluasi: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    await prisma.evaluasi.delete({ where: { id: params.id } })
    await logAudit({ userId: (session.user as any).id, action: 'DELETE_EVALUASI', entity: 'Evaluasi', entityId: params.id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

