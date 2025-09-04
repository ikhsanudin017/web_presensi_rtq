import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { santriCreateSchema } from '@/lib/validations'
import { logAudit } from '@/lib/audit'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const santri = await prisma.santri.findUnique({ where: { id: params.id } })
    if (!santri) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((session.user as any).role === 'ORANG_TUA' && santri.parentId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ santri })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const json = await req.json()
    const data = santriCreateSchema.partial().parse(json)
    const updated = await prisma.santri.update({ where: { id: params.id }, data: {
      nama: data.nama ?? undefined,
      nis: data.nis ?? undefined,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      alamat: data.alamat ?? undefined,
      parentId: data.parentId,
      kelasId: data.kelasId,
    } })
    await logAudit({ userId: (session.user as any).id, action: 'UPDATE_SANTRI', entity: 'Santri', entityId: updated.id })
    return NextResponse.json({ santri: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const deleted = await prisma.santri.delete({ where: { id: params.id } })
    await logAudit({ userId: (session.user as any).id, action: 'DELETE_SANTRI', entity: 'Santri', entityId: deleted.id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

