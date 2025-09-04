import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { evaluasiCreateSchema } from '@/lib/validations'
import { logAudit } from '@/lib/audit'
import { sendEmail } from '@/lib/notify'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const santriId = searchParams.get('santriId') || undefined
    const role = (session.user as any).role
    const userId = (session.user as any).id

    const where: any = {}
    if (santriId) where.santriId = santriId
    if (role === 'ORANG_TUA') {
      const children = await prisma.santri.findMany({ where: { parentId: userId }, select: { id: true } })
      where.santriId = { in: children.map(c => c.id) }
    } else if (role === 'USTADZ') {
      const taught = await prisma.santri.findMany({ where: { kelas: { ustadzId: userId } }, select: { id: true } })
      where.santriId = { in: taught.map(t => t.id) }
    }

    const data = await prisma.evaluasi.findMany({ where, orderBy: { tanggal: 'desc' } })
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
    const payload = evaluasiCreateSchema.parse(json)
    const evaluasi = await prisma.evaluasi.create({ data: {
      santriId: payload.santriId,
      nilai: payload.nilai,
      catatan: payload.catatan,
      tanggal: payload.tanggal ? new Date(payload.tanggal) : undefined,
      pengujiId: (session.user as any).id,
    }})
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_EVALUASI', entity: 'Evaluasi', entityId: evaluasi.id })

    const santri = await prisma.santri.findUnique({ where: { id: evaluasi.santriId }, include: { parent: true } })
    if (santri?.parentId) {
      const message = `Evaluasi baru untuk ${santri.nama}: nilai ${evaluasi.nilai}${evaluasi.catatan ? `, catatan: ${evaluasi.catatan}` : ''}`
      await prisma.notifikasi.create({ data: { userId: santri.parentId, type: 'EVALUASI', title: 'Evaluasi Baru', message } })
      if (santri.parent?.email) await sendEmail(santri.parent.email, 'Evaluasi Hafalan', `<p>${message}</p>`)
    }

    return NextResponse.json({ evaluasi })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

