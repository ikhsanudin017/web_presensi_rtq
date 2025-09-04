import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hafalanCreateSchema } from '@/lib/validations'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { logAudit } from '@/lib/audit'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const santriId = searchParams.get('santriId') || undefined
    const where: any = {}
    if (santriId) where.santriId = santriId
    if ((session.user as any).role === 'ORANG_TUA') {
      const children = await prisma.santri.findMany({ where: { parentId: (session.user as any).id }, select: { id: true } })
      where.santriId = { in: children.map(c => c.id) }
    }
    const data = await prisma.hafalan.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const json = await req.json()
    const data = hafalanCreateSchema.parse(json)
    const hafalan = await prisma.hafalan.create({ data: {
      santriId: data.santriId,
      surah: data.surah,
      ayatMulai: data.ayatMulai,
      ayatSelesai: data.ayatSelesai,
      status: data.status,
      targetBulan: data.targetBulan ? new Date(data.targetBulan) : undefined,
      catatan: data.catatan,
      updatedBy: (session.user as any).id,
    }})
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_HAFALAN', entity: 'Hafalan', entityId: hafalan.id })
    return NextResponse.json({ hafalan })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

